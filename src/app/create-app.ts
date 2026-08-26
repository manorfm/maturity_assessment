import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import type { Database } from '../shared/database.js';
import { registerProjectRoutes } from '../modules/projects/project-routes.js';
import { registerAssessmentRoutes } from '../modules/assessments/assessment-routes.js';
import { configureErrorHandling } from './error-handling.js';
import { registerProjectApiRoutes } from '../modules/projects/project-api-routes.js';

export async function createApp(db: Database) {
  const app = Fastify({ logger: { redact: ['req.url', 'request.url', 'req.headers.authorization', 'request.headers.authorization'] } });
  await app.register(formbody);
  app.addHook('onSend', async (_request, reply, payload) => {
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Cache-Control', 'no-store');
    return payload;
  });
  configureErrorHandling(app);
  registerProjectRoutes(app, db);
  registerProjectApiRoutes(app, db);
  registerAssessmentRoutes(app, db);
  app.get('/health', async () => ({ status: 'ok' }));
  return app;
}
