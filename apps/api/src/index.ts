import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import studyRoutes from './routes/studies';
import responseRoutes from './routes/responses';
import publicRoutes from './routes/public';
import analyticsRoutes from './routes/analytics';
import auditRoutes from './routes/audit';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  const allowed = c.env.CORS_ALLOWED_ORIGINS.split(',').map((s) => s.trim());
  return cors({
    origin: (origin) => (allowed.includes(origin) || allowed.includes('*') ? origin : allowed[0]),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })(c, next);
});

app.get('/api/health', (c) => c.json({ ok: true, service: 'survey-platform-api' }));

app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/studies', studyRoutes);
app.route('/api/responses', responseRoutes);
app.route('/api/public', publicRoutes);
app.route('/api/analytics', analyticsRoutes);
app.route('/api/audit', auditRoutes);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
