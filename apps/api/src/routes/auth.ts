import { Hono } from 'hono';
import { hashPassword, signJwt, verifyPassword } from '../lib/crypto';
import { requireAuth, recordAudit } from '../middleware/auth';
import type { Env, UserRow } from '../types';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => ({}) as { email?: string; password?: string });
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>();
  if (!user || !user.is_active) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!valid) {
    await recordAudit(c.env.DB, { userId: user.id, action: 'login_failed', entity: 'user', entityId: user.id });
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await signJwt({ sub: user.id, email: user.email, name: user.name, role: user.role }, c.env.JWT_SECRET);

  await c.env.DB.prepare('UPDATE users SET last_login_at = datetime(\'now\') WHERE id = ?').bind(user.id).run();
  await recordAudit(c.env.DB, { userId: user.id, action: 'login_succeeded', entity: 'user', entityId: user.id });

  return c.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

auth.get('/me', requireAuth, async (c) => {
  return c.json({ user: c.get('user') });
});

auth.post('/change-password', requireAuth, async (c) => {
  const body = await c.req
    .json<{ currentPassword?: string; newPassword?: string }>()
    .catch(() => ({}) as { currentPassword?: string; newPassword?: string });
  if (!body.currentPassword || !body.newPassword || body.newPassword.length < 10) {
    return c.json({ error: 'A current password and a new password of at least 10 characters are required' }, 400);
  }

  const authedUser = c.get('user');
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(authedUser.id).first<UserRow>();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const valid = await verifyPassword(body.currentPassword, user.password_salt, user.password_hash);
  if (!valid) return c.json({ error: 'Current password is incorrect' }, 401);

  const { generateSalt } = await import('../lib/crypto');
  const newSalt = generateSalt();
  const newHash = await hashPassword(body.newPassword, newSalt);

  await c.env.DB.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?')
    .bind(newHash, newSalt, user.id)
    .run();

  await recordAudit(c.env.DB, { userId: user.id, action: 'password_changed', entity: 'user', entityId: user.id });

  return c.json({ ok: true });
});

export default auth;
