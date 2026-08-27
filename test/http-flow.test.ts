import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';

test('criação de projeto usa editor visual para uma hierarquia livre', async () => {
  const app = await createApp(createDatabase(':memory:'));
  const response = await app.inject({ method: 'GET', url: '/projects/new' });
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /data-hierarchy-editor/);
  assert.match(response.body, /Adicionar unidade abaixo/);
  assert.match(response.body, /type="hidden" name="hierarchy"/);
  assert.doesNotMatch(response.body, /textarea[^>]+name="hierarchy"/);
  const scripts = [...response.body.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length > 0);
  scripts.forEach((match) => assert.doesNotThrow(() => new vm.Script(match[1]!)));
  await app.close();
});

test('fluxo HTTP cria projeto e protege convite reutilizado', async () => {
  const db = createDatabase(':memory:');
  const app = await createApp(db);
  const created = await app.inject({ method: 'POST', url: '/projects', payload: { name: 'Tribo', hierarchy: 'Empresa/Time A' } });
  assert.equal(created.statusCode, 302);
  const managementUrl = created.headers.location!;
  const [, , publicId, , adminSecret] = managementUrl.split('/');
  const accessed = await app.inject({ method: 'POST', url: '/projects/access', payload: { publicId, adminSecret } });
  assert.equal(accessed.headers.location, managementUrl);
  const dashboard = await app.inject({ method: 'GET', url: managementUrl });
  assert.equal(dashboard.statusCode, 200);
  assert.match(dashboard.body, /Gerar convites individuais/);

  const unit = db.prepare("SELECT id FROM organization_units WHERE path = 'Empresa/Time A'").get() as { id: string };
  const invitationPage = await app.inject({ method: 'POST', url: `${managementUrl}/invitations`, payload: { unitId: unit.id, count: '2' } });
  assert.match(invitationPage.body, /Copiar todos os links/);
  const token = invitationPage.body.match(/\/invite\/([A-Za-z0-9_-]+)/)?.[1];
  assert.ok(token);
  const first = await app.inject({ method: 'GET', url: `/invite/${token}` });
  assert.equal(first.statusCode, 302);
  assert.match(first.headers.location!, /^\/respond\//);
  const resumeToken = first.headers.location!.split('/').at(-1)!;
  const batch = db.prepare('SELECT id FROM invitation_batches ORDER BY rowid DESC LIMIT 1').get() as { id: string };
  const batchDashboard = await app.inject({ method: 'GET', url: managementUrl });
  assert.match(batchDashboard.body, /Lotes de convites/);
  assert.match(batchDashboard.body, /Revogar links disponíveis/);
  const revoked = await app.inject({ method: 'POST', url: `${managementUrl}/invitation-batches/${batch.id}/revoke` });
  assert.equal(revoked.statusCode, 302);
  const reissued = await app.inject({ method: 'POST', url: `${managementUrl}/invitation-batches/${batch.id}/reissue` });
  assert.equal(reissued.statusCode, 200);
  assert.match(reissued.body, /Distribua um link por pessoa/);
  const repeated = await app.inject({ method: 'GET', url: `/invite/${token}` });
  assert.equal(repeated.statusCode, 200);
  assert.doesNotMatch(repeated.body, /name="optionId"/);
  assert.match(repeated.body, /Nenhuma resposta ou resultado/);

  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  while (participations.find(resumeToken)?.status === 'in_progress') {
    const current = participations.find(resumeToken)!;
    const node = catalog.getNode(current.graph_version, current.current_node)!;
    participations.answer(resumeToken, node.id === 'respondent-context' ? 'quality' : node.options[0]!.id);
  }
  const completed = await app.inject({ method: 'GET', url: `/respond/${resumeToken}` });
  assert.equal(completed.statusCode, 200);
  assert.doesNotMatch(completed.body, /name="optionId"/);
  assert.match(completed.body, /não são exibidos novamente/);
  db.prepare('UPDATE projects SET minimum_group_size = 1').run();
  const report = await app.inject({ method: 'GET', url: managementUrl });
  assert.match(report.body, /Radar interativo das capacidades observadas/);
  assert.match(report.body, /class="radar-point"/);
  assert.match(report.body, /class="radar-unassessed"/);
  const capabilityUrl = report.body.match(/href="([^"]+\/capabilities\/[^"]+)"/)?.[1];
  assert.ok(capabilityUrl);
  const capability = await app.inject({ method: 'GET', url: capabilityUrl });
  assert.match(capability.body, /Confiança \d+%/);
  assert.match(capability.body, /Aprofundar|Problemas e correções|evidência/i);
  assert.match(capability.body, /aria-label="Navegação da capacidade"/);
  assert.match(capability.body, /Voltar<\/a>/);
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
