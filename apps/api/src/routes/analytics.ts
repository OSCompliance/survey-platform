import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Env } from '../types';

const analytics = new Hono<{ Bindings: Env }>();

analytics.use('*', requireAuth);

// Cheap in-memory cache per Worker isolate. This is what backs the frontend's
// 15-second polling loop: most polls within the cache window are answered
// without touching D1 at all. See README "Real-time behavior" for the
// upgrade path (Durable Objects + WebSockets) if push-based updates are
// ever required.
const cache = new Map<string, { expires: number; body: unknown }>();
const CACHE_TTL_MS = 10_000;

function cacheKey(prefix: string, c: { req: { query: (k: string) => string | undefined } }) {
  return `${prefix}:${c.req.query('studyId') ?? 'all'}`;
}

analytics.get('/summary', async (c) => {
  const studyId = c.req.query('studyId');
  const key = cacheKey('summary', c);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return c.json(cached.body);
  }

  const studyFilter = studyId ? 'WHERE study_id = ?' : '';
  const bind = studyId ? [studyId] : [];

  const totals = await c.env.DB.prepare(
    `SELECT
       COUNT(*) as households,
       COUNT(DISTINCT district) as districts
     FROM responses ${studyFilter}`,
  )
    .bind(...bind)
    .first<{ households: number; districts: number }>();

  const { results: districtDistribution } = await c.env.DB.prepare(
    `SELECT district, COUNT(*) as count FROM responses ${studyFilter} GROUP BY district ORDER BY count DESC`,
  )
    .bind(...bind)
    .all();

  const { results: religionTotals } = await c.env.DB.prepare(
    `SELECT religion, COUNT(*) as total FROM responses ${studyFilter} GROUP BY religion`,
  )
    .bind(...bind)
    .all<{ religion: string; total: number }>();

  const schemeFilter = studyId ? 'WHERE r.study_id = ?' : '';
  const { results: schemeCounts } = await c.env.DB.prepare(
    `SELECT r.religion as religion, je.value as scheme, COUNT(*) as cnt
     FROM responses r, json_each(r.schemes_applied) je
     ${schemeFilter}
     GROUP BY r.religion, je.value`,
  )
    .bind(...bind)
    .all<{ religion: string; scheme: string; cnt: number }>();

  const totalsByReligion = new Map((religionTotals as { religion: string; total: number }[]).map((r) => [r.religion, r.total]));
  const schemeUptake = (schemeCounts as { religion: string; scheme: string; cnt: number }[]).map((row) => ({
    religion: row.religion,
    scheme: row.scheme,
    count: row.cnt,
    percentage: totalsByReligion.get(row.religion)
      ? Math.round((row.cnt / (totalsByReligion.get(row.religion) as number)) * 1000) / 10
      : 0,
  }));

  const body = {
    totals: { households: totals?.households ?? 0, districts: totals?.districts ?? 0 },
    districtDistribution,
    schemeUptake,
    generatedAt: new Date().toISOString(),
  };

  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, body });
  return c.json(body);
});

analytics.get('/gap', async (c) => {
  const studyId = c.req.query('studyId');
  const scheme = c.req.query('scheme');
  if (!scheme) return c.json({ error: 'scheme query parameter is required' }, 400);

  const studyFilter = studyId ? 'AND study_id = ?' : '';
  const bind = studyId ? [scheme, studyId] : [scheme];

  const { results } = await c.env.DB.prepare(
    `SELECT sub_community,
       COUNT(*) as total,
       SUM(CASE WHEN EXISTS (SELECT 1 FROM json_each(schemes_applied) je WHERE je.value = ?) THEN 1 ELSE 0 END) as uptake
     FROM responses
     WHERE sub_community IS NOT NULL ${studyFilter}
     GROUP BY sub_community
     HAVING total > 0
     ORDER BY sub_community`,
  )
    .bind(...bind)
    .all<{ sub_community: string; total: number; uptake: number }>();

  const rows = results as { sub_community: string; total: number; uptake: number }[];
  const overallTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const overallUptake = rows.reduce((sum, r) => sum + r.uptake, 0);
  const overallPct = overallTotal ? (overallUptake / overallTotal) * 100 : 0;

  const gap = rows
    .map((r) => {
      const pct = r.total ? (r.uptake / r.total) * 100 : 0;
      return {
        subCommunity: r.sub_community,
        uptakePct: Math.round(pct * 10) / 10,
        gapPp: Math.round((pct - overallPct) * 10) / 10,
        sampleSize: r.total,
      };
    })
    .sort((a, b) => a.gapPp - b.gapPp);

  return c.json({ scheme, overallUptakePct: Math.round(overallPct * 10) / 10, gap });
});

export default analytics;
