import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';

test('fluxo HTTP cria projeto e protege convite reutilizado', async () => {
  const db = createDatabase(':memory:');
  const app = await createApp(db);
  const created = await app.inject({ method: 'POST', url: '/projects', payload: { name: 'Tribo', hierarchy: 'Empresa/Time A' } });
  assert.equal(created.statusCode, 302);
  const managementUrl = created.headers.location!;
  const dashboard = await app.inject({ method: 'GET', url: managementUrl });
  assert.equal(dashboard.statusCode, 200);
  assert.match(dashboard.body, /Gerar convites individuais/);

  const unit = db.prepare("SELECT id FROM organization_units WHERE path = 'Empresa/Time A'").get() as { id: string };
  const invitationPage = await app.inject({ method: 'POST', url: `${managementUrl}/invitations`, payload: { unitId: unit.id, profile: 'quality', count: '1' } });
  const token = invitationPage.body.match(/\/invite\/([A-Za-z0-9_-]+)/)?.[1];
  assert.ok(token);
  const first = await app.inject({ method: 'GET', url: `/invite/${token}` });
  assert.equal(first.statusCode, 302);
  assert.match(first.headers.location!, /^\/respond\//);
  const resumeToken = first.headers.location!.split('/').at(-1)!;
  const repeated = await app.inject({ method: 'GET', url: `/invite/${token}` });
  assert.equal(repeated.statusCode, 200);
  assert.doesNotMatch(repeated.body, /name="optionId"/);
  assert.match(repeated.body, /Nenhuma resposta ou resultado/);

  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  while (participations.find(resumeToken)?.status === 'in_progress') {
    const current = participations.find(resumeToken)!;
    const node = catalog.getNode(current.graph_version, current.current_node)!;
    participations.answer(resumeToken, node.options[0]!.id);
  }
  const completed = await app.inject({ method: 'GET', url: `/respond/${resumeToken}` });
  assert.equal(completed.statusCode, 200);
  assert.doesNotMatch(completed.body, /name="optionId"/);
  assert.match(completed.body, /não são exibidos novamente/);
  await app.close();
});

test('erros de validação usam resposta universal sem detalhes internos', async () => {
  const db = createDatabase(':memory:');
  const app = await createApp(db);
  const response = await app.inject({ method: 'POST', url: '/projects', payload: { name: ' ', hierarchy: 'Empresa//Time' } });
  assert.equal(response.statusCode, 422);
  assert.match(response.body, /Não foi possível validar os dados/);
  assert.doesNotMatch(response.body, /SQL|stack|DomainValidationError/);
  await app.close();
});
