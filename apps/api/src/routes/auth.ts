import { Hono } from 'hono';
import { hashPassword, signJwt, verifyPassword } from '../lib/crypto';
import { requireAuth, recordAudit } from '../middleware/auth';
import type { Env, UserRow } from '../types';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/signup', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; name?: string; role?: string }>().catch(() => ({}) as { email?: string; password?: string; name?: string; role?: string });
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const name = body.name?.trim();
  const role = body.role?.toLowerCase();

  if (!email || !password || !name) {
    return c.json({ error: 'Email, password, and name are required' }, 400);
  }

  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }

  if (!['analyst', 'researcher'].includes(role || '')) {
    return c.json({ error: 'Role must be "analyst" or "researcher"' }, 400);
  }

  // Check if user already exists
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  // Generate salt and hash password
  const { generateSalt } = await import('../lib/crypto');
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  // Create new user
  const userId = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, password_hash, password_salt, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, datetime(\'now\'))'
  )
    .bind(userId, email, name, hash, salt, role)
    .run();

  // Generate JWT token
  const token = await signJwt({ sub: userId, email, name, role }, c.env.JWT_SECRET);

  // Audit log
  await recordAudit(c.env.DB, { userId, action: 'user_created_self_signup', entity: 'user', entityId: userId });

  return c.json(
    {
      token,
      user: { id: userId, email, name, role },
    },
    201
  );
});

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
