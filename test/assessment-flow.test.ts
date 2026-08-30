import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { AdaptiveJourneyService } from '../src/modules/assessments/adaptive-journey-service.js';
import { InferenceService, evolutionCatalog, interventionCatalog } from '../src/modules/inference/inference-service.js';
import { edges, graph, GRAPH_VERSION, profileIds, estimateRemainingMinutes, estimateRemainingScenarios } from '../src/modules/catalog/assessment-graph.js';
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

test('resultado sem efeito no portfólio discrimina operating model e funding antes de recomendar', () => {
  const symptom = graph.find((node) => node.id === 'product-outcome-evidence')!;
  const cause = graph.find((node) => node.id === 'product-operating-model-cause')!;
  assert.ok(symptom);
  assert.equal(cause.type, 'probe');
  assert.deepEqual(cause.options.filter((option) => option.signals.length).map((option) => option.signals[0]?.constraint), ['governance', 'organization', 'priority', 'incentive']);
  assert.ok(edges.some((edge) => edge.from === symptom.id && edge.optionId === 'delivery-accepted' && edge.to === cause.id));
  assert.ok(edges.some((edge) => edge.from === symptom.id && edge.optionId === 'next-demand' && edge.to === cause.id));
  assert.ok(edges.some((edge) => edge.from === cause.id && edge.to === 'technical-stewardship'));
});

test('jornada de plataforma separa descoberta, acesso, adequação e aprendizado de adoção', () => {
  const entry = graph.find((node) => node.id === 'platform-path-to-capability')!;
  const adoption = graph.find((node) => node.id === 'platform-path-adoption')!;
  const learning = graph.find((node) => node.id === 'platform-path-learning')!;
  assert.ok(adoption);
  assert.ok(learning);
  assert.deepEqual(new Set(entry.options.flatMap((option) => option.signals.map((signal) => signal.pattern))), new Set([
    'caminho-suportado-ate-capacidade', 'caminho-desconhecido', 'caminho-conhecido-inacessivel',
    'capacidade-nova-por-ticket-heroi', 'documentacao-substitui-caminho',
  ]));
  assert.deepEqual(new Set(adoption.options.flatMap((option) => option.signals.map((signal) => signal.pattern))), new Set([
    'caminho-atende-caso-comum', 'caminho-inadequado-ao-caso', 'caminho-depende-de-ajuda-recorrente',
    'caminhos-equivalentes-fragmentados', 'excecao-controlada-com-retorno',
  ]));
  assert.ok(edges.some((edge) => edge.from === entry.id && edge.optionId === 'supported-path' && edge.to === adoption.id));
  assert.ok(edges.some((edge) => edge.from === adoption.id && edge.to === learning.id));
});

test('jornada de segurança separa obrigação legítima de governança compensatória', () => {
  const finding = graph.find((node) => node.id === 'security-after-finding')!;
  const control = graph.find((node) => node.id === 'security-control-decision')!;
  const learning = graph.find((node) => node.id === 'security-control-learning')!;
  assert.ok(control);
  assert.ok(learning);
  assert.deepEqual(new Set(control.options.flatMap((option) => option.signals.map((signal) => signal.pattern))), new Set([
    'obrigacao-com-evidencia-e-segregacao', 'controle-contextual-ao-risco',
    'governanca-compensa-feedback-tecnico', 'governanca-compensa-ownership',
    'segregacao-por-fila-manual', 'aprovacao-sem-evidencia-decisoria',
  ]));
  assert.ok(edges.some((edge) => edge.from === finding.id && edge.to === control.id));
  assert.ok(edges.some((edge) => edge.from === control.id && edge.to === learning.id));
});

test('convites pertencem somente às folhas de uma hierarquia livre', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const created = projects.create('Estrutura livre', 'Empresa/Área/Célula A\nEmpresa/Área/Célula B');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const units = projects.listUnits(String(project.id));
  const area = units.find((unit) => unit.path === 'Empresa/Área')!;
  const cell = units.find((unit) => unit.path === 'Empresa/Área/Célula A')!;

  assert.throws(() => invitations.createBatch(String(project.id), area.id, 1), /unidade final/i);
  assert.equal(invitations.createBatch(String(project.id), cell.id, 1).tokens.length, 1);
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
  assert.equal(report.calibration.gate, 'blocked');
  assert.equal(report.calibration.labeledCases, 0);
  assert.equal(report.findings.some((finding) => finding.pattern === 'integracao-tardia'), true);
  assert.equal(report.capabilityGroups.some((group) => group.id === 'engineering-quality'), true);
  assert.equal(report.capabilityGroups.some((group) => group.id === 'architecture-evolution' && group.children.length > 0), true);
  assert.equal(report.capabilityGroups.length, 8);
  const engineeringArea = report.areas.find((area) => area.id === 'delivery-flow');
  assert.ok(engineeringArea);
  assert.equal(engineeringArea.label, 'Fluxo de entrega');
  assert.equal(engineeringArea.problems.some((problem) => problem.pattern === 'integracao-tardia'), true);
  assert.equal(engineeringArea.problems.every((problem) => problem.correction.length > 0), true);
  assert.equal(report.capabilities.some((capability) => capability.id === 'continuous-integration' && capability.level >= 0 && capability.level <= 4), true);
  assert.equal(report.scopes.some((item) => item.path === 'Empresa/Time A'), true);
  assert.ok(report.scopes.find((item) => item.path === 'Empresa/Time A')!.capabilities.length > 0);
  assert.ok(report.scopes.find((item) => item.path === 'Empresa/Time A')!.areas.length > 0);
  assert.equal(report.findings.every((finding) => finding.foundation.source.length > 0 && finding.foundation.why.length > 0), true);
  assert.equal(report.previousMeasurement, null);
  assert.equal(Number((db.prepare('SELECT COUNT(*) total FROM diagnostic_snapshots WHERE project_id = ?').get(String(project.id)) as { total: number }).total), 1);
  assert.ok(Number((db.prepare('SELECT COUNT(*) total FROM transformation_experiments WHERE project_id = ?').get(String(project.id)) as { total: number }).total) >= 1);
  inference.report(String(project.id), 5);
  assert.equal(Number((db.prepare('SELECT COUNT(*) total FROM diagnostic_snapshots WHERE project_id = ?').get(String(project.id)) as { total: number }).total), 1);
  db.prepare('INSERT INTO diagnostic_snapshots (id, project_id, unit_id, completed, captured_at, patterns_json) VALUES (?, ?, NULL, ?, ?, ?)')
    .run('previous-snapshot', String(project.id), 5, '2026-01-01T00:00:00.000Z', JSON.stringify({ 'integracao-tardia': 0 }));
  const compared = inference.report(String(project.id), 5);
  assert.ok(compared.previousMeasurement);
  assert.equal(compared.previousMeasurement!.patternDeltas.some((delta) => delta.pattern === 'integracao-tardia' && delta.previous === 0 && delta.current > 0), true);
});

test('grafo publicado é persistido e ramifica conforme a resposta', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  assert.equal((db.prepare('SELECT COUNT(*) total FROM assessment_nodes').get() as { total: number }).total, graph.length);
  assert.ok(graph.length >= 15, 'a entrevista deve cobrir o SDLC além de um questionário raso');
  assert.deepEqual(graph[0]!.options.map((option) => option.id), profileIds);
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

test('seletor adaptativo não duplica o aprofundamento já escolhido pelo grafo declarativo', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  const created = projects.create('Adaptativo', 'Empresa/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };

  while (participations.find(claimed.resumeToken)?.current_node !== 'integration-cadence') {
    const current = participations.find(claimed.resumeToken)!;
    const node = catalog.getNode(current.graph_version, current.current_node, current.profile)!;
    participations.answer(claimed.resumeToken, node.id === 'respondent-context' ? 'engineering' : node.options[0]!.id);
  }
  participations.answer(claimed.resumeToken, 'isolated-days');
  const participation = participations.find(claimed.resumeToken)!;
  assert.ok(db.prepare("SELECT 1 FROM evidence_likelihoods WHERE pattern = 'mudanca-isolada'").get());
  assert.ok(db.prepare("SELECT 1 FROM question_observations WHERE node_key = 'delivery-cause' AND applicability_patterns_json LIKE '%mudanca-isolada%'").get());
  const selected = new AdaptiveJourneyService(db).selectAfterTerminal(participation.id, participation.profile, participation.graph_version);
  assert.equal(selected, undefined);
  assert.equal(participation.current_node, 'delivery-cause');
});

test('entrega aprofunda sinais maduros e investiga bloqueio após integração frágil', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'ready-to-release', 'small-automated'), 'integration-cadence');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'integration-cadence', 'integrated-daily'), 'release-control');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'integration-cadence', 'isolated-days'), 'delivery-cause');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'delivery-cause', 'tooling-gap'), 'release-control');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'release-validation', 'bypass-under-pressure'), 'degradation');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'leadership-enablement', 'system-owner', 'management'), 'management-portfolio');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'leadership-enablement', 'system-owner', 'quality'), 'quality-risk-strategy');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'leadership-enablement', 'system-owner', 'platform'), 'platform-cloud-reliability');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'leadership-enablement', 'system-owner', 'architecture'), 'architecture-language');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'leadership-enablement', 'system-owner', 'security'), 'security-threat-in-change');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'leadership-enablement', 'system-owner', 'data'), 'data-meaning');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'leadership-enablement', 'system-owner', 'design'), 'design-in-change');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'management-safety', 'risk-changes-decision'), 'management-cognitive-load');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'architecture-language', 'shared-language'), 'architecture-wait');
  assert.equal(catalog.nextNode(GRAPH_VERSION, 'platform-cloud-sustainability', 'continuous-guardrails'), 'platform-path-to-capability');
});

test('estima o restante da entrevista sem contar probes opcionais', () => {
  assert.equal(estimateRemainingScenarios('platform-path-to-capability', 'platform'), 3);
  assert.equal(estimateRemainingScenarios('architecture-wait', 'architecture'), 1);
  assert.ok(estimateRemainingScenarios('leadership-enablement', 'architecture') >= 3);
  assert.ok(estimateRemainingScenarios('respondent-context') >= 40);
  assert.ok(estimateRemainingMinutes('respondent-context') >= 25);
  assert.ok(estimateRemainingScenarios('respondent-context', 'architecture') > estimateRemainingScenarios('leadership-enablement', 'architecture'));
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

test('catálogo publicado persiste efeitos explícitos e rejeita folhas sem cobertura', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const signal = db.prepare("SELECT detail_capabilities, evidence_layer, constraint_kind FROM assessment_signals WHERE graph_version = ? LIMIT 1").get(GRAPH_VERSION) as { detail_capabilities: string; evidence_layer: string; constraint_kind: string };
  assert.ok(JSON.parse(signal.detail_capabilities).length > 0);
  assert.ok(signal.evidence_layer.length > 0);
  assert.ok(signal.constraint_kind.length > 0);
  const model = db.prepare('SELECT version, policy_json FROM inference_model_versions LIMIT 1').get() as { version: string; policy_json: string };
  assert.match(model.version, /bayesian-v4/);
  assert.equal(JSON.parse(model.policy_json).recommendationThreshold, .7);
  assert.ok(Number((db.prepare('SELECT COUNT(*) total FROM diagnostic_hypotheses').get() as { total: number }).total) > 0);
  const oversizedFamily = db.prepare('SELECT family_key, COUNT(*) total FROM diagnostic_hypotheses GROUP BY family_key HAVING total > 2 LIMIT 1').get();
  assert.equal(oversizedFamily, undefined, 'causas simultâneas não devem competir em uma família categórica gigante');
  assert.equal(Number((db.prepare('SELECT COUNT(*) total FROM question_observations').get() as { total: number }).total), graph.length);
  const deliveryApplicability = db.prepare("SELECT applicability_patterns_json FROM question_observations WHERE node_key = 'delivery-cause'").get() as { applicability_patterns_json: string };
  assert.deepEqual(new Set(JSON.parse(deliveryApplicability.applicability_patterns_json) as string[]), new Set(['mudanca-isolada', 'integracao-por-janela']));
  const withoutCloudEfficiency = graph.map((node) => ({ ...node, options: node.options.map((option) => ({ ...option, signals: option.signals.filter((item) => !item.details?.includes('cloud-efficiency')) })) }));
  assert.throws(() => validateGraphDefinition(withoutCloudEfficiency, edges, graph[0]!.id), /cloud-efficiency/);
});

test('todo sinal medido declara metadados e possui tratamento quando não é adaptativo', () => {
  const signals = graph.flatMap((node) => node.options.flatMap((option) => option.signals));
  assert.equal(signals.length, 279);
  for (const signal of signals) {
    assert.ok(signal.details.length > 0, signal.pattern);
    assert.ok(signal.layer, signal.pattern);
    assert.ok(signal.constraint, signal.pattern);
    if (signal.weight < 0) assert.ok(interventionCatalog[signal.pattern], `correção ausente: ${signal.pattern}`);
    if (signal.weight >= 0 && signal.weight < 2) assert.ok(evolutionCatalog[signal.pattern], `evolução ausente: ${signal.pattern}`);
  }
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
        : node.id === 'product-outcome-evidence' && firstOption === 'add-to-sprint' ? 'delivery-accepted'
        : node.id === 'data-contract-change' && firstOption === 'add-to-sprint' ? 'coordinated-migration'
        : node.options[0]!.id;
      participations.answer(claimed.resumeToken, option);
    }
  };
  invitations.createBatch(String(project.id), unit.id, 5).tokens.forEach((token) => complete(token, 'replan-together', 'management'));
  invitations.createBatch(String(project.id), unit.id, 4).tokens.forEach((token) => complete(token, 'add-to-sprint', 'engineering'));
  assert.deepEqual(inference.report(String(project.id), 5).perspectiveGaps, []);

  invitations.createBatch(String(project.id), unit.id, 1).tokens.forEach((token) => complete(token, 'add-to-sprint', 'engineering'));
  const gaps = inference.report(String(project.id), 5).perspectiveGaps;
  assert.equal(gaps.some((gap) => gap.capability === 'work-management'), true);
  assert.equal(gaps.some((gap) => /capacidade “Fluxo de trabalho”/.test(gap.title)), true);
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
