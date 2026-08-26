import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { graph, GRAPH_VERSION } from '../src/modules/catalog/assessment-graph.js';
import { CatalogService, validateGraphDefinition } from '../src/modules/catalog/catalog-service.js';

test('convite é consumido uma vez e não mantém vínculo com a participação', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const created = projects.create('Piloto', 'Empresa/Tribo/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;

  const first = invitations.claim(token!);
  assert.notEqual(first, 'invalid');
  assert.notEqual(first, 'used');
  assert.equal(invitations.claim(token!), 'used');

  const invitationColumns = db.prepare('PRAGMA table_info(invitations)').all() as Array<{ name: string }>;
  assert.equal(invitationColumns.some((column) => column.name === 'participation_id'), false);
  assert.equal((db.prepare('SELECT COUNT(*) total FROM participations').get() as { total: number }).total, 1);
});

test('relatório respeita limiar e encontra padrão agregado', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const inference = new InferenceService(db);
  const created = projects.create('Piloto', 'Empresa/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const tokens = invitations.createBatch(String(project.id), unit.id, 5).tokens;

  for (const token of tokens) {
    const claimed = invitations.claim(token);
    assert.equal(typeof claimed, 'object');
    const resumeToken = (claimed as { resumeToken: string }).resumeToken;
    while (participations.find(resumeToken)?.status === 'in_progress') {
      const current = participations.find(resumeToken)!;
      const node = new CatalogService(db).getNode(current.graph_version, current.current_node)!;
      const option = node.id === 'respondent-context' ? 'engineering' : node.id === 'shared-change' ? 'before-release' : node.options[0]!.id;
      participations.answer(resumeToken, option);
    }
  }

  const report = inference.report(String(project.id), 5);
  assert.equal(report.completed, 5);
  assert.equal(report.findings.some((finding) => finding.pattern === 'integracao-tardia'), true);
  assert.equal(report.capabilities.some((capability) => capability.id === 'engenharia' && capability.level >= 0 && capability.level <= 4), true);
  assert.equal(report.scopes.some((item) => item.path === 'Empresa/Time A'), true);
  assert.ok(report.scopes.find((item) => item.path === 'Empresa/Time A')!.capabilities.length > 0);
});

test('grafo publicado é persistido e ramifica conforme a resposta', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  assert.equal((db.prepare('SELECT COUNT(*) total FROM assessment_nodes').get() as { total: number }).total, graph.length);
  assert.ok(graph.length >= 15, 'a entrevista deve cobrir o SDLC além de um questionário raso');
  assert.deepEqual(graph[0]!.options.map((option) => option.id), ['management', 'product', 'quality', 'engineering', 'platform']);
  assert.equal(graph[0]!.options.every((option) => option.signals.length === 0), true);
  assert.ok((db.prepare('SELECT COUNT(*) total FROM assessment_edges WHERE option_key IS NOT NULL').get() as { total: number }).total >= 4);

  const created = projects.create('Piloto', 'Empresa/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };
  participations.answer(claimed.resumeToken, 'quality');
  assert.equal(participations.find(claimed.resumeToken)?.profile, 'quality');
  participations.answer(claimed.resumeToken, 'replan-together');
  participations.answer(claimed.resumeToken, 'continuous');
  participations.answer(claimed.resumeToken, 'test-queue');
  const current = participations.find(claimed.resumeToken)!;
  assert.equal(current.current_node, 'quality-probe');
  assert.equal(catalog.getNode(current.graph_version, current.current_node)?.type, 'probe');
});

test('entrega aprofunda sinais maduros e investiga bloqueio após integração frágil', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'ready-to-release', 'small-automated'), 'integration-cadence');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'integration-cadence', 'integrated-daily'), 'release-control');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'integration-cadence', 'isolated-days'), 'delivery-cause');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'delivery-cause', 'tooling-gap'), 'release-control');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'release-validation', 'bypass-under-pressure'), 'degradation');
});

test('incidente aprofunda roteamento diagnóstico e correção sem premiar ferramenta', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'degradation', 'impact-change'), 'incident-intake');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'incident-triage', 'risk-classified'), 'incident-diagnosis');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'incident-triage', 'relationship-escalation'), 'incident-routing-cause');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'incident-diagnosis', 'direct-runtime-access'), 'diagnostic-cause');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'diagnostic-cause', 'telemetry-gap'), 'incident-remediation');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'incident-remediation', 'reproducible-change'), 'recurrence');
  const management = catalog.getNode(GRAPH_VERSION, 'incident-intake', 'management')!;
  const engineering = catalog.getNode(GRAPH_VERSION, 'incident-intake', 'engineering')!;
  assert.notEqual(management.scenario, engineering.scenario);
  assert.deepEqual(management.options.map((option) => option.id), engineering.options.map((option) => option.id));
});

test('fluxo de trabalho investiga objetivo bloqueio e decisão antes da construção', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'recent-need', 'small-evidence'), 'iteration-purpose');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'blocked-work', 'team-resolves'), 'decision-context');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'blocked-work', 'waiting-external'), 'blocked-cause');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'blocked-cause', 'permission-policy'), 'decision-context');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'decision-context', 'options-recorded'), 'change-verification');
});

test('aprendizado gera sinais cruzados e compartilhamento aprofunda apenas quando aplicável', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  const reflection = catalog.getNode(GRAPH_VERSION, 'improvement-loop')!;
  const sustained = reflection.options.find((option) => option.id === 'owned-and-verified')!;
  assert.deepEqual(new Set(sustained.signals.map((signal) => signal.capability)), new Set(['aprendizado', 'organizacao', 'fluxo']));
  const context = catalog.getNode(GRAPH_VERSION, 'shared-surface-context')!;
  assert.equal(context.options.every((option) => option.signals.length === 0), true);
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'shared-surface-context', 'single-owner'), 'team-health');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'shared-surface-context', 'multiple-teams'), 'shared-surface-risk');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'shared-surface-risk', 'overwritten-change'), 'shared-surface-cause');
});

test('validador rejeita ciclos e nós inalcançáveis antes da publicação', () => {
  const node = (id: string) => ({ id, title: id, scenario: id, prompt: id, options: [{ id: 'ok', label: 'ok', signals: [] }] });
  assert.throws(() => validateGraphDefinition([node('a'), node('b')], [{ from: 'a', to: 'a' }], 'a'), /cycle/);
  assert.throws(() => validateGraphDefinition([node('a'), node('b')], [], 'a'), /unreachable/);
});

test('catálogo adapta o cenário ao perfil sem alterar a capacidade avaliada', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  const management = catalog.getNode(GRAPH_VERSION, 'urgent-change', 'management')!;
  const quality = catalog.getNode(GRAPH_VERSION, 'urgent-change', 'quality')!;
  assert.notEqual(management.scenario, quality.scenario);
  assert.deepEqual(management.options.map((option) => option.id), quality.options.map((option) => option.id));
});

test('triangulação só compara perfis elegíveis e detecta perspectivas divergentes', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const inference = new InferenceService(db);
  const created = projects.create('Perspectivas', 'Empresa/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const complete = (token: string, firstOption: string, profile: 'management' | 'engineering') => {
    const claimed = invitations.claim(token) as { resumeToken: string };
    while (participations.find(claimed.resumeToken)?.status === 'in_progress') {
      const current = participations.find(claimed.resumeToken)!;
      const node = new CatalogService(db).getNode(current.graph_version, current.current_node, current.profile)!;
      const option = node.id === 'respondent-context' ? profile
        : node.id === 'urgent-change' ? firstOption
        : node.id === 'recent-need' && firstOption === 'add-to-sprint' ? 'defined-then-built'
        : node.id === 'iteration-purpose' && firstOption === 'add-to-sprint' ? 'fill-capacity'
        : node.id === 'blocked-work' && firstOption === 'add-to-sprint' ? 'waiting-external'
        : node.options[0]!.id;
      participations.answer(claimed.resumeToken, option);
    }
  };
  invitations.createBatch(String(project.id), unit.id, 5).tokens.forEach((token) => complete(token, 'replan-together', 'management'));
  invitations.createBatch(String(project.id), unit.id, 4).tokens.forEach((token) => complete(token, 'add-to-sprint', 'engineering'));
  assert.deepEqual(inference.report(String(project.id), 5).perspectiveGaps, []);

  invitations.createBatch(String(project.id), unit.id, 1).tokens.forEach((token) => complete(token, 'add-to-sprint', 'engineering'));
  const gaps = inference.report(String(project.id), 5).perspectiveGaps;
  assert.equal(gaps.some((gap) => gap.capability === 'fluxo'), true);
});

test('suprime toda a cadeia quando uma partição irmã é pequena', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const inference = new InferenceService(db);
  const created = projects.create('Estrutura', 'Empresa/Time A\nEmpresa/Time B');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const units = projects.listUnits(String(project.id));
  const timeA = units.find((unit) => unit.path === 'Empresa/Time A')!;
  const timeB = units.find((unit) => unit.path === 'Empresa/Time B')!;

  const complete = (token: string, constrained = false) => {
    const claimed = invitations.claim(token) as { resumeToken: string };
    while (participations.find(claimed.resumeToken)?.status === 'in_progress') {
      const current = participations.find(claimed.resumeToken)!;
      const node = new CatalogService(db).getNode(current.graph_version, current.current_node)!;
      participations.answer(claimed.resumeToken, constrained && node.id === 'improvement-loop' ? 'ceremony-report' : node.options[0]!.id);
    }
  };
  invitations.createBatch(String(project.id), timeA.id, 5).tokens.forEach((token) => complete(token));
  invitations.createBatch(String(project.id), timeB.id, 1).tokens.forEach((token) => complete(token, true));
  assert.deepEqual(inference.report(String(project.id), 5).scopes, []);

  invitations.createBatch(String(project.id), timeB.id, 4).tokens.forEach((token) => complete(token, true));
  const report = inference.report(String(project.id), 5);
  const paths = report.scopes.map((scope) => scope.path);
  assert.deepEqual(paths, ['Empresa', 'Empresa/Time A', 'Empresa/Time B']);
  const timeBClassification = report.scopes.find((scope) => scope.path === 'Empresa/Time B')!.classification;
  assert.equal(report.classification!.level, timeBClassification.level);
});
