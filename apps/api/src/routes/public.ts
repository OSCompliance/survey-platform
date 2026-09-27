import { Hono } from 'hono';
import { recordAudit } from '../middleware/auth';
import type { Env, StudyRow } from '../types';

const publicRoutes = new Hono<{ Bindings: Env }>();

async function verifyTurnstile(token: string | undefined, secretKey: string | undefined, remoteIp: string | undefined): Promise<boolean> {
  if (!secretKey) return true; // not configured (local/dev)
  if (!token) return false;

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteIp) formData.append('remoteip', remoteIp);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  const outcome = await res.json<{ success: boolean }>();
  return outcome.success;
}

// GET /api/public/studies/:id — minimal, non-sensitive metadata so the public
// survey page can show a study title without exposing internal fields.
publicRoutes.get('/studies/:id', async (c) => {
  const id = c.req.param('id');
  const study = await c.env.DB.prepare(
    'SELECT id, title, description, is_public_collection_enabled FROM studies WHERE id = ?',
  )
    .bind(id)
    .first<Pick<StudyRow, 'id' | 'title' | 'description' | 'is_public_collection_enabled'>>();

  if (!study || !study.is_public_collection_enabled) {
    return c.json({ error: 'This study is not accepting public submissions' }, 404);
  }
  return c.json({ study: { id: study.id, title: study.title, description: study.description } });
});

interface PublicResponseInput {
  clientUuid?: string;
  district?: string;
  religion?: string;
  subCommunity?: string;
  reservationCategory?: string;
  schemesApplied?: string[];
  womenWorkingCount?: string;
  womenWorkTypes?: string[];
  turnstileToken?: string;
}

publicRoutes.post('/responses/:studyId', async (c) => {
  const studyId = c.req.param('studyId');
  const study = await c.env.DB.prepare('SELECT * FROM studies WHERE id = ?').bind(studyId).first<StudyRow>();

  if (!study || !study.is_public_collection_enabled) {
    return c.json({ error: 'This study is not accepting public submissions' }, 404);
  }

  const body = await c.req.json<PublicResponseInput>().catch(() => ({} as PublicResponseInput));

  if (c.env.TURNSTILE_ENFORCED === 'true') {
    const ip = c.req.header('CF-Connecting-IP') ?? undefined;
    const verified = await verifyTurnstile(body.turnstileToken, c.env.TURNSTILE_SECRET_KEY, ip);
    if (!verified) {
      return c.json({ error: 'Verification failed, please try again' }, 400);
    }
  }

  if (!body.district || !body.religion) {
    return c.json({ error: 'district and religion are required' }, 400);
  }

  const clientUuid = body.clientUuid ?? crypto.randomUUID();
  const existing = await c.env.DB.prepare('SELECT id FROM responses WHERE client_uuid = ?').bind(clientUuid).first();
  if (existing) {
    return c.json({ id: (existing as { id: string }).id, deduplicated: true }, 200);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO responses (id, study_id, client_uuid, source, submitted_by_user_id, district, religion, sub_community, reservation_category, schemes_applied, women_working_count, women_work_types)
     VALUES (?, ?, ?, 'public', NULL, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      studyId,
      clientUuid,
      body.district,
      body.religion,
      body.subCommunity ?? null,
      body.reservationCategory ?? null,
      JSON.stringify(body.schemesApplied ?? []),
      body.womenWorkingCount ?? null,
      JSON.stringify(body.womenWorkTypes ?? []),
    )
    .run();

  await recordAudit(c.env.DB, { userId: null, action: 'response_created', entity: 'response', entityId: id, metadata: { studyId, source: 'public' } });

  return c.json({ id }, 201);
});

export default publicRoutes;
