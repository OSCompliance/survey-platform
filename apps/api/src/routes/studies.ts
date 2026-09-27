import { Hono, type Context } from 'hono';
import { requireAuth, requireRole, recordAudit } from '../middleware/auth';
import type { Env, StudyRow } from '../types';

type AppContext = Context<{ Bindings: Env }>;

const studies = new Hono<{ Bindings: Env }>();

studies.use('*', requireAuth);

studies.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT s.*, u.name as owner_name,
       (SELECT COUNT(*) FROM responses r WHERE r.study_id = s.id) as response_count
     FROM studies s JOIN users u ON u.id = s.owner_user_id
     ORDER BY s.created_at DESC`,
  ).all();
  return c.json({ studies: results });
});

studies.get('/:id', async (c) => {
  const id = c.req.param('id');
  const study = await c.env.DB.prepare(
    `SELECT s.*, u.name as owner_name FROM studies s JOIN users u ON u.id = s.owner_user_id WHERE s.id = ?`,
  )
    .bind(id)
    .first<StudyRow & { owner_name: string }>();
  if (!study) return c.json({ error: 'Study not found' }, 404);
  return c.json({ study });
});

interface CreateStudyBody {
  title?: string;
  studyType?: StudyRow['study_type'];
  status?: StudyRow['status'];
  description?: string;
  leadName?: string;
  output?: string;
  budgetInr?: number;
  isPublicCollectionEnabled?: boolean;
}

studies.post('/', requireRole('admin', 'researcher'), async (c) => {
  const body = await c.req.json<CreateStudyBody>().catch(() => ({}) as CreateStudyBody);

  if (!body.title || !body.studyType) {
    return c.json({ error: 'title and studyType are required' }, 400);
  }

  const id = crypto.randomUUID();
  const user = c.get('user');

  await c.env.DB.prepare(
    `INSERT INTO studies (id, title, study_type, status, description, lead_name, output, budget_inr, is_public_collection_enabled, owner_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      body.title,
      body.studyType,
      body.status ?? 'planning',
      body.description ?? null,
      body.leadName ?? null,
      body.output ?? null,
      body.budgetInr ?? null,
      body.isPublicCollectionEnabled ? 1 : 0,
      user.id,
    )
    .run();

  await recordAudit(c.env.DB, { userId: user.id, action: 'study_created', entity: 'study', entityId: id, metadata: { title: body.title } });

  return c.json({ id }, 201);
});

async function assertCanEdit(c: AppContext, studyId: string): Promise<StudyRow | Response> {
  const study = await c.env.DB.prepare('SELECT * FROM studies WHERE id = ?').bind(studyId).first<StudyRow>();
  if (!study) return c.json({ error: 'Study not found' }, 404);
  const user = c.get('user');
  if (user.role !== 'admin' && study.owner_user_id !== user.id) {
    return c.json({ error: 'Only the study owner or an admin can modify this study' }, 403);
  }
  return study;
}

studies.patch('/:id', requireRole('admin', 'researcher'), async (c) => {
  const id = c.req.param('id');
  const studyOrResponse = await assertCanEdit(c, id);
  if (studyOrResponse instanceof Response) return studyOrResponse;

  type UpdateStudyBody = Partial<{
    title: string;
    status: StudyRow['status'];
    description: string;
    leadName: string;
    output: string;
    budgetInr: number;
    isPublicCollectionEnabled: boolean;
  }>;
  const body = await c.req.json<UpdateStudyBody>().catch(() => ({}) as UpdateStudyBody);

  const study = studyOrResponse as StudyRow;
  await c.env.DB.prepare(
    `UPDATE studies SET title = ?, status = ?, description = ?, lead_name = ?, output = ?, budget_inr = ?, is_public_collection_enabled = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      body.title ?? study.title,
      body.status ?? study.status,
      body.description ?? study.description,
      body.leadName ?? study.lead_name,
      body.output ?? study.output,
      body.budgetInr ?? study.budget_inr,
      body.isPublicCollectionEnabled === undefined ? study.is_public_collection_enabled : body.isPublicCollectionEnabled ? 1 : 0,
      id,
    )
    .run();

  await recordAudit(c.env.DB, { userId: c.get('user').id, action: 'study_updated', entity: 'study', entityId: id, metadata: body });

  return c.json({ ok: true });
});

studies.delete('/:id', requireRole('admin', 'researcher'), async (c) => {
  const id = c.req.param('id');
  const studyOrResponse = await assertCanEdit(c, id);
  if (studyOrResponse instanceof Response) return studyOrResponse;

  await c.env.DB.prepare('DELETE FROM responses WHERE study_id = ?').bind(id).run();
  await c.env.DB.prepare('DELETE FROM studies WHERE id = ?').bind(id).run();

  await recordAudit(c.env.DB, { userId: c.get('user').id, action: 'study_deleted', entity: 'study', entityId: id });

  return c.json({ ok: true });
});

export default studies;
