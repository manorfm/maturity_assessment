import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';

test('API cria projeto e administra lote sem expor tokens no resumo', async () => {
  const db = createDatabase(':memory:');
  const app = await createApp(db);
  const created = await app.inject({
    method: 'POST', url: '/api/projects',
    payload: { name: 'Tribo Digital', hierarchy: ['Empresa/Time A'] },
  });
  assert.equal(created.statusCode, 201);
  const project = created.json<{ publicId: string; adminToken: string }>();
  const authorization = `Bearer ${project.adminToken}`;

  const unauthorized = await app.inject({ method: 'GET', url: `/api/projects/${project.publicId}` });
  assert.equal(unauthorized.statusCode, 404);

  const summary = await app.inject({ method: 'GET', url: `/api/projects/${project.publicId}`, headers: { authorization } });
  assert.equal(summary.statusCode, 200);
  const unitId = summary.json<{ units: Array<{ id: string }> }>().units.at(-1)!.id;
  const batch = await app.inject({
    method: 'POST', url: `/api/projects/${project.publicId}/invitation-batches`, headers: { authorization },
    payload: { unitId, profile: 'quality', quantity: 2 },
  });
  assert.equal(batch.statusCode, 201);
  const issued = batch.json<{ batchId: string; invitationLinks: string[] }>();
  assert.equal(issued.invitationLinks.length, 2);

  const afterIssue = await app.inject({ method: 'GET', url: `/api/projects/${project.publicId}`, headers: { authorization } });
  assert.equal(afterIssue.statusCode, 200);
  assert.doesNotMatch(afterIssue.body, /invitationLinks|token_hash|adminToken/);

  const revoked = await app.inject({ method: 'POST', url: `/api/projects/${project.publicId}/invitation-batches/${issued.batchId}/revoke`, headers: { authorization } });
  assert.equal(revoked.statusCode, 200);
  assert.equal(revoked.json<{ revoked: number }>().revoked, 2);
  await app.close();
});

test('API retorna erros JSON universais sem detalhes internos', async () => {
  const app = await createApp(createDatabase(':memory:'));
  const response = await app.inject({ method: 'POST', url: '/api/projects', payload: { name: '', hierarchy: [] } });
  assert.equal(response.statusCode, 422);
  const body = response.json<{ error: { code: string; message: string; requestId: string } }>();
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.requestId);
  assert.doesNotMatch(response.body, /stack|SQL|DomainValidationError/);

  const missingBody = await app.inject({ method: 'POST', url: '/api/projects' });
  assert.equal(missingBody.statusCode, 422);
  assert.equal(missingBody.json<{ error: { code: string } }>().error.code, 'VALIDATION_ERROR');

  const malformed = await app.inject({
    method: 'POST', url: '/api/projects', headers: { 'content-type': 'application/json' }, payload: '{"name":',
  });
  assert.equal(malformed.statusCode, 400);
  assert.equal(malformed.json<{ error: { code: string } }>().error.code, 'REQUEST_ERROR');
  assert.doesNotMatch(malformed.body, /Unexpected|JSON|stack/);
  await app.close();
});
