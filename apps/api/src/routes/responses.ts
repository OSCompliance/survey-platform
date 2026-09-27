import { Hono } from 'hono';
import { requireAuth, recordAudit } from '../middleware/auth';
import type { Env } from '../types';

const responses = new Hono<{ Bindings: Env }>();

responses.use('*', requireAuth);

interface ResponseInput {
  clientUuid?: string;
  studyId?: string;
  district?: string;
  religion?: string;
  subCommunity?: string;
  reservationCategory?: string;
  schemesApplied?: string[];
  womenWorkingCount?: string;
  womenWorkTypes?: string[];
  notes?: string;
}

function validate(body: ResponseInput): string | null {
  if (!body.studyId) return 'studyId is required';
  if (!body.district) return 'district is required';
  if (!body.religion) return 'religion is required';
  return null;
}

responses.get('/', async (c) => {
  const studyId = c.req.query('studyId');
  const district = c.req.query('district');
  const religion = c.req.query('religion');
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query('pageSize') ?? '25', 10)));

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (studyId) {
    clauses.push('study_id = ?');
    params.push(studyId);
  }
  if (district) {
    clauses.push('district = ?');
    params.push(district);
  }
  if (religion) {
    clauses.push('religion = ?');
    params.push(religion);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM responses ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM responses ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(...params, pageSize, (page - 1) * pageSize)
    .all();

  return c.json({
    responses: results,
    pagination: { page, pageSize, total: countRow?.total ?? 0 },
  });
});

responses.post('/', async (c) => {
  const body = await c.req.json<ResponseInput>().catch(() => ({} as ResponseInput));
  const error = validate(body);
  if (error) return c.json({ error }, 400);

  const id = crypto.randomUUID();
  const clientUuid = body.clientUuid ?? crypto.randomUUID();
  const user = c.get('user');

  const existing = await c.env.DB.prepare('SELECT id FROM responses WHERE client_uuid = ?').bind(clientUuid).first();
  if (existing) {
    // Idempotent resubmission (e.g. a retried request): return success without duplicating.
    return c.json({ id: (existing as { id: string }).id, deduplicated: true }, 200);
  }

  await c.env.DB.prepare(
    `INSERT INTO responses (id, study_id, client_uuid, source, submitted_by_user_id, district, religion, sub_community, reservation_category, schemes_applied, women_working_count, women_work_types, notes)
     VALUES (?, ?, ?, 'staff', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      body.studyId,
      clientUuid,
      user.id,
      body.district,
      body.religion,
      body.subCommunity ?? null,
      body.reservationCategory ?? null,
      JSON.stringify(body.schemesApplied ?? []),
      body.womenWorkingCount ?? null,
      JSON.stringify(body.womenWorkTypes ?? []),
      body.notes ?? null,
    )
    .run();

  await recordAudit(c.env.DB, { userId: user.id, action: 'response_created', entity: 'response', entityId: id, metadata: { studyId: body.studyId, source: 'staff' } });

  return c.json({ id }, 201);
});

responses.get('/export.csv', async (c) => {
  const studyId = c.req.query('studyId');
  const clauses = studyId ? 'WHERE study_id = ?' : '';
  const stmt = studyId
    ? c.env.DB.prepare(`SELECT * FROM responses ${clauses} ORDER BY created_at DESC`).bind(studyId)
    : c.env.DB.prepare(`SELECT * FROM responses ORDER BY created_at DESC`);
  const { results } = await stmt.all();

  const header = [
    'id', 'study_id', 'source', 'district', 'religion', 'sub_community',
    'reservation_category', 'schemes_applied', 'women_working_count', 'women_work_types', 'created_at',
  ];
  const rows = (results as Record<string, unknown>[]).map((r) =>
    header.map((h) => JSON.stringify(r[h] ?? '')).join(','),
  );
  const csv = [header.join(','), ...rows].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="responses${studyId ? `-${studyId}` : ''}.csv"`,
    },
  });
});

export default responses;
