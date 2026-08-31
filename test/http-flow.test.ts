import assert from 'node:assert/strict';
import { writeFileSync, rmSync } from 'node:fs';
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
  const firstRespond = await app.inject({ method: 'GET', url: `/respond/${resumeToken}` });
  assert.equal(firstRespond.statusCode, 200);
  assert.match(firstRespond.body, /minuto/);
  assert.match(firstRespond.body, /Guarde este endereço para retomar/);
  assert.match(invitationPage.body, /guarde o endereço depois do primeiro acesso/);
  assert.match(dashboard.body, /Próxima decisão/);
  assert.match(dashboard.body, /Instrumento e calibração/);
  assert.match(dashboard.body, /Revisão cognitiva do instrumento/);
  assert.match(dashboard.body, /Preflight do piloto inicial/);
  assert.match(dashboard.body, /Ainda faltam 8 convites/);
  const review = await app.inject({
    method: 'POST', url: `${managementUrl}/item-reviews`,
    payload: { nodeKey: 'urgent-change', profile: 'engineering', comprehensionOk: 'yes', interpretationMatch: 'yes', optionFit: 'yes', optionOverlap: 'no', retrievalDifficulty: 'no', goldOptionBias: 'no', visibilityExitUsed: 'yes' },
  });
  assert.equal(review.statusCode, 302);
  assert.equal(Number((db.prepare('SELECT COUNT(*) total FROM item_reviews').get() as { total: number }).total), 1);
  assert.equal((db.prepare('PRAGMA table_info(item_reviews)').all() as Array<{ name: string }>).some((column) => column.name === 'participation_id'), false);
  const batch = db.prepare('SELECT id FROM invitation_batches ORDER BY rowid DESC LIMIT 1').get() as { id: string };
  const batchDashboard = await app.inject({ method: 'GET', url: managementUrl });
  assert.match(batchDashboard.body, /Lotes de convites/);
  assert.match(batchDashboard.body, /Revogar links disponíveis/);
  assert.match(batchDashboard.body, /Ainda faltam 6 convites/);
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
    participations.answer(resumeToken, node.id === 'respondent-context' ? 'quality' : node.id === 'work-context' ? 'cannot-observe' : node.options[0]!.id);
  }
  const completed = await app.inject({ method: 'GET', url: `/respond/${resumeToken}` });
  assert.equal(completed.statusCode, 200);
  assert.doesNotMatch(completed.body, /name="optionId"/);
  assert.match(completed.body, /não são exibidos novamente/);
  db.prepare('UPDATE projects SET minimum_group_size = 1').run();
  const report = await app.inject({ method: 'GET', url: managementUrl });
  assert.match(report.body, /Mapa de contraste das capacidades observadas/);
  assert.match(report.body, /Diagnóstico/);
  assert.match(report.body, /Próxima decisão/);
  assert.match(report.body, /Instrumento e calibração/);
  assert.match(report.body, /Calibração do modelo/);
  assert.match(report.body, /posterior exibido permanece provisório/);
  assert.match(report.body, /Elo limitante/);
  assert.match(report.body, /Consistência do comportamento no elo limitante/);
  assert.doesNotMatch(report.body, /Risco gerencial/);
  assert.doesNotMatch(report.body, /Resumo executivo/);
  assert.match(report.body, /class="radar-point radar-status-/);
  assert.ok(report.body.indexOf('O que está acontecendo') < report.body.indexOf('Consistência do comportamento no elo limitante'));
  assert.ok(report.body.indexOf('Mapa de contraste') < report.body.indexOf('Gerar convites individuais'));
  const capabilityUrl = report.body.match(/href="([^"]+\/capabilities\/[^"]+)"/)?.[1];
  assert.ok(capabilityUrl);
  const capability = await app.inject({ method: 'GET', url: capabilityUrl });
  assert.match(capability.body, /Faixa compatível com as evidências/);
  assert.match(capability.body, /pessoas e \d+ sinais agregados/);
  assert.match(capability.body, /Ver evidências da avaliação/);
  assert.match(capability.body, /Aprofundar|Problemas e correções|evidência/i);
  assert.match(capability.body, /aria-label="Navegação da capacidade"/);
  assert.match(capability.body, /Voltar<\/a>/);
  await app.close();
});

test('piloto inicial conclui oito jornadas em uma unidade sem alegar calibração', async () => {
  const db = createDatabase(':memory:');
  const app = await createApp(db);
  const created = await app.inject({ method: 'POST', url: '/projects', payload: { name: 'Piloto oito', hierarchy: 'Empresa/Squad Piloto' } });
  const managementUrl = created.headers.location!;
  const unit = db.prepare("SELECT id FROM organization_units WHERE path = 'Empresa/Squad Piloto'").get() as { id: string };
  const invitationPage = await app.inject({ method: 'POST', url: `${managementUrl}/invitations`, payload: { unitId: unit.id, count: '8' } });
  const tokens = [...invitationPage.body.matchAll(/\/invite\/([A-Za-z0-9_-]+)/g)].map((match) => match[1]!);
  assert.equal(tokens.length, 8);

  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  const pilotProfiles = ['management', 'product', 'quality', 'engineering', 'platform', 'architecture', 'security', 'data'];
  for (const [index, token] of tokens.entries()) {
    const claimed = await app.inject({ method: 'GET', url: `/invite/${token}` });
    const resumeToken = claimed.headers.location!.split('/').at(-1)!;
    while (participations.find(resumeToken)?.status === 'in_progress') {
      const current = participations.find(resumeToken)!;
      const node = catalog.getNode(current.graph_version, current.current_node)!;
      participations.answer(resumeToken, node.id === 'respondent-context' ? pilotProfiles[index]! : node.id === 'work-context' ? 'cannot-observe' : node.options[0]!.id);
    }
  }

  const dashboard = await app.inject({ method: 'GET', url: managementUrl });
  assert.match(dashboard.body, /Coleta inicial concluída/);
  assert.match(dashboard.body, /8 de 8 convites ativos · 8 respostas concluídas/);
  assert.match(dashboard.body, /não calibra probabilidades/i);
  assert.match(dashboard.body, /Calibração bloqueada/);
  assert.match(dashboard.body, /Diagnóstico/);
  await app.close();
});

test('índice do showcase só existe quando o guia gerado está disponível', async () => {
  const previous = process.env.SHOWCASE_GUIDE;
  const guidePath = '/private/tmp/maturity-assessment-showcase-http.html';
  try {
    delete process.env.SHOWCASE_GUIDE;
    const app = await createApp(createDatabase(':memory:'));
    const missing = await app.inject({ method: 'GET', url: '/showcase' });
    assert.equal(missing.statusCode, 404);
    await app.close();

    writeFileSync(guidePath, '<html lang="pt-BR"><body><h1>Índice de inspeção</h1></body></html>');
    process.env.SHOWCASE_GUIDE = guidePath;
    const withGuide = await createApp(createDatabase(':memory:'));
    const served = await withGuide.inject({ method: 'GET', url: '/showcase' });
    assert.equal(served.statusCode, 200);
    assert.match(served.headers['content-type'] ?? '', /text\/html/);
    assert.match(served.body, /Índice de inspeção/);
    await withGuide.close();
  } finally {
    rmSync(guidePath, { force: true });
    if (previous === undefined) delete process.env.SHOWCASE_GUIDE;
    else process.env.SHOWCASE_GUIDE = previous;
  }
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
