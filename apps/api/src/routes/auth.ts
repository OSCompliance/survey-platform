import { Hono } from 'hono';
import { hashPassword, signJwt, verifyPassword } from '../lib/crypto';
import { requireAuth, recordAudit } from '../middleware/auth';
import type { Env, UserRow } from '../types';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/signup', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string; name?: string; role?: string }>().catch(() => ({} as unknown as { email?: string; password?: string; name?: string; role?: string }));
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

  if (!['admin', 'analyst', 'researcher'].includes(role || '')) {
    return c.json({ error: 'Role must be "admin", "analyst", or "researcher"' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();
  if (existing) {
    return c.json({ error: 'Email already registered' }, 409);
  }

  const { generateSalt } = await import('../lib/crypto');
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  const userId = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, name, password_hash, password_salt, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, datetime("now"))'
  )
    .bind(userId, email, name, hash, salt, role)
    .run();

  const token = await signJwt({ sub: userId, email, name, role }, c.env.JWT_SECRET);
  await recordAudit(c.env.DB, { userId, action: 'user_created_self_signup', entity: 'user', entityId: userId });

  return c.json({ token, user: { id: userId, email, name, role } }, 201);
});

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>().catch(() => ({} as unknown as { email?: string; password?: string }));
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>();
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const isValid = await
