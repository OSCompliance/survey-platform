import { Hono } from 'hono';
import { generateSalt, hashPassword } from '../lib/crypto';
import { requireAuth, requireRole, recordAudit } from '../middleware/auth';
import type { Env, Role, UserRow } from '../types';

const users = new Hono<{ Bindings: Env }>();

users.use('*', requireAuth, requireRole('admin'));

users.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, email, name, role, is_active, created_at, last_login_at FROM users ORDER BY created_at DESC',
  ).all();
  return c.json({ users: results });
});

users.post('/', async (c) => {
  type CreateUserBody = { email?: string; name?: string; role?: Role; password?: string };
  const body = await c.req.json<CreateUserBody>().catch(() => ({}) as CreateUserBody);
  const email = body.email?.trim().toLowerCase();
  const { name, role, password } = body;

  if (!email || !name || !role || !password) {
    return c.json({ error: 'email, name, role, and password are required' }, 400);
  }
  if (!['admin', 'researcher', 'analyst'].includes(role)) {
    return c.json({ error: 'role must be admin, researcher, or analyst' }, 400);
  }
  if (password.length < 10) {
    return c.json({ error: 'Password must be at least 10 characters' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) {
    return c.json({ error: 'A user with this email already exists' }, 409);
  }

  const id = crypto.randomUUID();
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, role, password_hash, password_salt) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(id, email, name, role, hash, salt)
    .run();

  await recordAudit(c.env.DB, { userId: c.get('user').id, action: 'user_created', entity: 'user', entityId: id, metadata: { email, role } });

  return c.json({ user: { id, email, name, role } }, 201);
});

users.patch('/:id', async (c) => {
  const id = c.req.param('id');
  type UpdateUserBody = { name?: string; role?: Role; isActive?: boolean };
  const body = await c.req.json<UpdateUserBody>().catch(() => ({}) as UpdateUserBody);

  const existing = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>();
  if (!existing) return c.json({ error: 'User not found' }, 404);

  const name = body.name ?? existing.name;
  const role = body.role ?? existing.role;
  const isActive = body.isActive === undefined ? existing.is_active : body.isActive ? 1 : 0;

  await c.env.DB.prepare('UPDATE users SET name = ?, role = ?, is_active = ? WHERE id = ?')
    .bind(name, role, isActive, id)
    .run();

  await recordAudit(c.env.DB, { userId: c.get('user').id, action: 'user_updated', entity: 'user', entityId: id, metadata: body });

  return c.json({ ok: true });
});

export default users;
