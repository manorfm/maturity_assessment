import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CapabilityBranch } from '../src/modules/inference/domain/capability-taxonomy.js';
import { decideReportOutcome, distinctiveScopes, findingScopeOccurrences, uniqueConfirmedCauses, uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';

const leaf = (id: string, label: string, level: number, extras: Partial<CapabilityBranch> = {}): CapabilityBranch => ({
  id, label, level, confidence: extras.confidence ?? .8, evidence: 8, hasContradiction: extras.hasContradiction ?? false,
  assessed: extras.assessed ?? true, coverage: 1, children: [], observers: 7, interval: { lower: level, upper: level }, ...extras,
});

test('um padrão cruzado vira um único finding com folhas afetadas', () => {
  const unique = uniqueFindingsByPattern([
    { kind: 'correction', pattern: 'causa-verificacao-concorrente', detailCapability: 'quality-strategy', title: 'Feedback tardio', cause: '', intervention: 'A', confidence: .8, priority: .6 },
    { kind: 'correction', pattern: 'causa-verificacao-concorrente', detailCapability: 'continuous-integration', title: 'Feedback tardio', cause: '', intervention: 'A', confidence: .8, priority: .9 },
  ]);
  assert.equal(unique.length, 1);
  assert.equal(unique[0]!.detailCapability, 'continuous-integration');
  assert.deepEqual(unique[0]!.affectedCapabilities, ['quality-strategy', 'continuous-integration']);
});

test('causas confirmadas não se repetem por folha', () => {
  const unique = uniqueConfirmedCauses([
    { pattern: 'causa-melhoria-sem-capacidade', label: 'Entregas consomem melhoria', capability: 'organizational-learning', probability: .9, support: 7, applicable: 7, profiles: 7 },
    { pattern: 'causa-melhoria-sem-capacidade', label: 'Entregas consomem melhoria', capability: 'portfolio-management', probability: .95, support: 7, applicable: 7, profiles: 7 },
  ]);
  assert.equal(unique.length, 1);
  assert.equal(unique[0]!.capability, 'portfolio-management');
});

test('mapa por estrutura omite o pai que só duplica o filho único', () => {
  const scopes = distinctiveScopes([
    { path: 'Produto', classification: { level: 1 } },
    { path: 'Produto/Time', classification: { level: 1 } },
  ], 1);
  assert.equal(scopes.length, 0);
});

test('mapa por estrutura omite a raiz única que duplica a visão global', () => {
  const scopes = distinctiveScopes([
    { path: 'Empresa', classification: { level: 0 } },
    { path: 'Empresa/Squad Alfa', classification: { level: 0 } },
    { path: 'Empresa/Squad Beta', classification: { level: 1 } },
  ], 0);
  assert.deepEqual(scopes.map((scope) => scope.path), ['Empresa/Squad Alfa', 'Empresa/Squad Beta']);
});

test('escopo do finding considera somente unidades finais elegíveis', () => {
  const finding = (pattern: string) => ({ kind: 'correction' as const, pattern, detailCapability: 'collaboration', title: pattern, cause: '', intervention: '', confidence: .9, priority: .9 });
  const occurrences = findingScopeOccurrences([
    { path: 'Empresa', findings: [finding('transversal'), finding('somente-pai')] },
    { path: 'Empresa/Squad Alfa', findings: [finding('transversal'), finding('local')] },
    { path: 'Empresa/Squad Beta', findings: [finding('transversal')] },
  ]);
  assert.deepEqual(occurrences.find((item) => item.pattern === 'local')?.scopePaths, ['Empresa/Squad Alfa']);
  assert.equal(occurrences.find((item) => item.pattern === 'transversal')?.eligibleScopeCount, 2);
  assert.equal(occurrences.some((item) => item.pattern === 'somente-pai'), false);
});

test('nota alta e coerente preserva a prática', () => {
  const outcome = decideReportOutcome({
    classification: { level: 4, label: 'Adaptativo', limitingCapabilities: ['Estratégia de qualidade'] },
    branches: [leaf('quality-strategy', 'Estratégia de qualidade', 4)],
    findings: [],
  });
  assert.equal(outcome.kind, 'preserve');
  assert.match(outcome.nextStepBody, /não acrescente intervenção/i);
});

test('limitador baixo sem padrão amarrado declara fragilidade dispersa', () => {
  const outcome = decideReportOutcome({
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Descoberta e validação'] },
    branches: [leaf('discovery-validation', 'Descoberta e validação', 1)],
    findings: [],
  });
  assert.equal(outcome.kind, 'discriminate');
  assert.match(outcome.reading, /dispersas/i);
  assert.match(outcome.reading, /não inventa uma causa/i);
});

test('limitador baixo sem causa vira coleta, não vazio', () => {
  const outcome = decideReportOutcome({
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Descoberta e validação'] },
    branches: [
      leaf('discovery-validation', 'Descoberta e validação', 1),
      leaf('portfolio-management', 'Gestão de portfólio', 2.2),
    ],
    findings: [{ kind: 'correction', pattern: 'causa-melhoria-sem-capacidade', detailCapability: 'portfolio-management', title: 'Entregas consomem melhoria', cause: '', intervention: 'Pare uma iniciativa', confidence: .9, priority: .9 }],
  });
  assert.equal(outcome.kind, 'discriminate');
  assert.equal(outcome.limiterLabel, 'Descoberta e validação');
  assert.match(outcome.nextStepBody, /Descoberta e validação/);
  assert.equal(outcome.finding, undefined);
});

test('contradição no limitador não receita várias frentes', () => {
  const outcome = decideReportOutcome({
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Aprendizado e adaptação'] },
    branches: [leaf('organizational-learning', 'Aprendizado e adaptação', 1.7, { hasContradiction: true, confidence: .4 })],
    findings: [
      { kind: 'correction', pattern: 'retrospectiva-sem-fechamento', detailCapability: 'organizational-learning', title: 'Ações perdem dono', cause: '', intervention: 'Limite a retro', confidence: .9, priority: .9 },
      { kind: 'correction', pattern: 'automacao-sem-feedback', detailCapability: 'organizational-learning', title: 'Automação lenta', cause: '', intervention: 'Meça a pipeline', confidence: .9, priority: .8 },
    ],
  });
  assert.equal(outcome.kind, 'discriminate');
  assert.equal(outcome.finding, undefined);
  assert.match(outcome.nextStepBody, /sem abrir várias frentes/);
});

test('causa no limitador vira um experimento', () => {
  const outcome = decideReportOutcome({
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Gestão de portfólio'] },
    branches: [leaf('portfolio-management', 'Gestão de portfólio', 1)],
    findings: [{ kind: 'correction', pattern: 'causa-melhoria-sem-capacidade', detailCapability: 'portfolio-management', title: 'Entregas consomem melhoria', cause: 'Falta capacidade', intervention: 'Pare uma iniciativa', confidence: .9, priority: .9, experiment: { action: 'Pare uma iniciativa pequena', owner: 'Fluxo', metric: 'espera', reviewHorizon: '30 dias', successCriterion: 'recorrência cai' } }],
  });
  assert.equal(outcome.kind, 'correct');
  assert.equal(outcome.finding?.pattern, 'causa-melhoria-sem-capacidade');
  assert.match(outcome.nextStepBody, /Pare uma iniciativa pequena/);
});

test('finding sem mecanismo discriminado preserva o problema mas não prescreve solução', () => {
  const finding = {
    kind: 'correction' as const, pattern: 'mudanca-isolada', detailCapability: 'continuous-integration',
    title: 'Mudanças permanecem isoladas', cause: 'Ainda competem várias causas.', intervention: 'Adotar trunk-based.', confidence: .9, priority: .9,
    mechanism: 'undetermined' as const, containment: 'undetermined' as const,
    prescription: { status: 'investigate' as const, reason: 'Ainda falta discriminar mecanismo e contenção.' },
  };
  const result = decideReportOutcome({
    classification: { level: 0, label: 'Opaco', limitingCapabilities: ['Integração contínua'] },
    branches: [leaf('continuous-integration', 'Integração contínua', 0)], findings: [finding],
  });
  assert.equal(result.kind, 'discriminate');
  assert.equal(result.finding?.pattern, 'mudanca-isolada');
  assert.match(result.nextStepBody, /mecanismo|contenção/i);
  assert.doesNotMatch(result.nextStepBody, /trunk-based/i);
});

test('folha de cloud contraditória não vence integração com finding no mesmo piso', () => {
  const outcome = decideReportOutcome({
    classification: { level: 0, label: 'Opaco', limitingCapabilities: ['Confiabilidade de infraestrutura', 'Integração contínua'] },
    branches: [
      leaf('continuous-integration', 'Integração contínua', 0),
      leaf('cloud-reliability', 'Confiabilidade de infraestrutura', 0, { hasContradiction: true, confidence: .3 }),
    ],
    findings: [{ kind: 'correction', pattern: 'mudanca-isolada', detailCapability: 'continuous-integration', title: 'Mudanças permanecem isoladas', cause: '', intervention: 'Integre no mesmo dia', confidence: .9, priority: .9 }],
  });
  assert.equal(outcome.limiterLabel, 'Integração contínua');
  assert.equal(outcome.kind, 'correct');
});

test('divergência de perspectiva é o finding do home, não uma folha aleatória', () => {
  const outcome = decideReportOutcome({
    classification: { level: 0, label: 'Opaco', limitingCapabilities: ['Capacidade técnica'] },
    branches: [leaf('technical-capability', 'Capacidade técnica', 0.4)],
    findings: [{ kind: 'correction', pattern: 'seguranca-depende-de-reconhecimento-e-especialista', detailCapability: 'technical-capability', title: 'Segurança depende de especialista', cause: '', intervention: 'Codifique o risco', confidence: .9, priority: .9 }],
    perspectiveGaps: [{ title: 'Perspectivas divergem sobre aprendizado', capability: 'aprendizado' }],
  });
  assert.equal(outcome.kind, 'discriminate');
  assert.match(outcome.nextStepTitle, /divergência/i);
  assert.match(outcome.nextStepBody, /lentes|perspectiva/i);
  assert.equal(outcome.finding, undefined);
});

test('divergência suspende prescrição no detalhamento afetado', () => {
  const outcome = decideReportOutcome({
    classification: { level: 0, label: 'Opaco', limitingCapabilities: ['Competência técnica'] },
    branches: [leaf('technical-capability', 'Competência técnica', 0.4)],
    findings: [{ kind: 'correction', pattern: 'seguranca-depende-de-reconhecimento-e-especialista', detailCapability: 'technical-capability', title: 'Segurança depende de especialista', cause: '', intervention: 'Codifique o risco', confidence: .9, priority: .9 }],
    perspectiveGaps: [{ title: 'Perspectivas divergem sobre competência técnica', capability: 'technical-capability' }],
    focusId: 'technical-capability',
  });
  assert.equal(outcome.kind, 'discriminate');
  assert.equal(outcome.finding, undefined);
  assert.match(outcome.reading, /hipótese candidata/i);
});

test('divergência de outra capacidade não contamina o detalhamento', () => {
  const outcome = decideReportOutcome({
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Competência técnica'] },
    branches: [
      leaf('technical-capability', 'Competências necessárias entram no fluxo', 1),
      leaf('organizational-learning', 'Aprendizado e adaptação', 1),
    ],
    findings: [{ kind: 'correction', pattern: 'seguranca-depende-de-reconhecimento-e-especialista', detailCapability: 'technical-capability', title: 'Segurança depende de especialista', cause: '', intervention: 'Codifique o risco', confidence: .9, priority: .9 }],
    perspectiveGaps: [{ title: 'Perspectivas divergem sobre aprendizado', capability: 'organizational-learning' }],
    focusId: 'technical-capability',
  });
  assert.equal(outcome.kind, 'correct');
  assert.equal(outcome.finding?.detailCapability, 'technical-capability');
});

test('investigação sem causa descreve incerteza sem encaixar o nome em frase artificial', () => {
  const outcome = decideReportOutcome({
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Impacto pode ser investigado'] },
    branches: [leaf('observability-practice', 'Impacto pode ser investigado', 1)],
    findings: [],
    focusId: 'observability-practice',
  });
  assert.equal(outcome.kind, 'discriminate');
  assert.match(outcome.reading, /as respostas|os relatos/i);
  assert.match(outcome.reading, /telemetria|acesso|conhecimento/i);
  assert.doesNotMatch(outcome.reading, /Impacto pode ser investigado está em/i);
  assert.match(outcome.nextStepBody, /incidente|mudança|evento/i);
});

test('preservação nomeia comportamento e sinal de regressão do recorte', () => {
  const outcome = decideReportOutcome({
    classification: { level: 4, label: 'Adaptativo', limitingCapabilities: ['Operação e confiabilidade'] },
    branches: [leaf('reliability-practice', 'Confiabilidade altera decisões', 4)],
    findings: [],
    focusId: 'reliability-practice',
  });
  assert.equal(outcome.kind, 'preserve');
  assert.match(outcome.reading, /Confiabilidade altera decisões/);
  assert.match(outcome.nextStepBody, /regressão|deixar de|voltar/i);
});

test('ramo adaptativo não herda discriminar de um neto de cloud', () => {
  const outcome = decideReportOutcome({
    classification: { level: 3, label: 'Gerenciado', limitingCapabilities: ['Governança habilitadora'] },
    branches: [{
      ...leaf('operations-platform', 'Operação, confiabilidade e plataforma', 4),
      children: [
        leaf('reliability-practice', 'Confiabilidade', 4),
        leaf('cloud-reliability', 'Confiabilidade de infraestrutura', 4, { hasContradiction: true, confidence: .3 }),
      ],
    }],
    findings: [],
    focusId: 'operations-platform',
  });
  assert.equal(outcome.kind, 'preserve');
});

test('página da folha usa o estágio da folha, não o rótulo global', () => {
  const outcome = decideReportOutcome({
    classification: { level: 0, label: 'Opaco', limitingCapabilities: ['Integração contínua'] },
    branches: [leaf('sdlc-automation', 'Feedback técnico repetível', 1)],
    findings: [{ kind: 'correction', pattern: 'causa-ferramental-feedback', detailCapability: 'sdlc-automation', title: 'O retorno não sustenta integração', cause: '', intervention: 'Meça o retorno', confidence: .9, priority: .9 }],
    focusId: 'sdlc-automation',
  });
  assert.equal(outcome.kind, 'correct');
  assert.match(outcome.reading, /reativo/i);
  assert.doesNotMatch(outcome.reading, /opaco/i);
});
