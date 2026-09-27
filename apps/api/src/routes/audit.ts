import { Hono } from 'hono';
import { requireAuth, requireRole } from '../middleware/auth';
import type { Env } from '../types';

const audit = new Hono<{ Bindings: Env }>();

audit.use('*', requireAuth, requireRole('admin'));

audit.get('/', async (c) => {
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query('pageSize') ?? '50', 10)));

  const { results } = await c.env.DB.prepare(
    `SELECT a.*, u.name as user_name, u.email as user_email
     FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(pageSize, (page - 1) * pageSize)
    .all();

  return c.json({ entries: results, page, pageSize });
});

export default audit;
