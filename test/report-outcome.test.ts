import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CapabilityBranch } from '../src/modules/inference/domain/capability-taxonomy.js';
import { decideReportOutcome, distinctiveScopes, uniqueConfirmedCauses, uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';

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

test('nota alta e coerente preserva a prática', () => {
  const outcome = decideReportOutcome({
    classification: { level: 4, label: 'Adaptativo', limitingCapabilities: ['Estratégia de qualidade'] },
    branches: [leaf('quality-strategy', 'Estratégia de qualidade', 4)],
    findings: [],
  });
  assert.equal(outcome.kind, 'preserve');
  assert.match(outcome.nextStepBody, /não acrescente intervenção/i);
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
