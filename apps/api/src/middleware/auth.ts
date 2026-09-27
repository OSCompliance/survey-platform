import { createMiddleware } from 'hono/factory';
import { verifyJwt } from '../lib/crypto';
import type { AuthUser, Env, Role } from '../types';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export const requireAuth = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or malformed Authorization header' }, 401);
  }
  const token = authHeader.slice('Bearer '.length);
  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }
  c.set('user', {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role as Role,
  });
  await next();
});

export function requireRole(...roles: Role[]) {
  return createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Forbidden: insufficient role for this action' }, 403);
    }
    await next();
  });
}

export async function recordAudit(
  db: D1Database,
  entry: { userId: string | null; action: string; entity: string; entityId?: string | null; metadata?: unknown },
) {
  await db
    .prepare(
      `INSERT INTO audit_log (id, user_id, action, entity, entity_id, metadata) VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      entry.userId,
      entry.action,
      entry.entity,
      entry.entityId ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
    )
    .run();
}
