import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GroupRecommendationEngine, type GroupSignal, type InterventionDefinition } from '../src/modules/inference/domain/group-recommendation-engine.js';

const tooling: InterventionDefinition = {
  title: 'Feedback técnico insuficiente', intervention: 'Reduza duração e instabilidade do feedback.',
  cause: 'O retorno automatizado não sustenta decisões frequentes.',
  action: 'Meça o fluxo e estabilize a verificação que mais interrompe integrações.',
  owner: 'Liderança técnica com engenharia e plataforma',
  metric: 'p95 do tempo até feedback e taxa de execuções instáveis', reviewHorizon: 'duas semanas',
  successCriterion: 'redução mensurável da espera sem aumento de escapes',
  evidencePatterns: ['tooling-gap', 'slow-feedback'], contradictionPatterns: ['fast-reliable-feedback'],
};
const catalog: Record<string, InterventionDefinition> = {
  'tooling-gap': tooling,
  'process-gap': { ...tooling, title: 'Política amplia o lote', cause: 'Uma regra de processo obriga o trabalho a aguardar.', evidencePatterns: ['process-gap'], contradictionPatterns: ['risk-proportional-flow'] },
};

function evidence(pattern: string, participantId: string, overrides: Partial<GroupSignal> = {}): GroupSignal {
  return { participantId, profile: 'engineering', detailCapability: 'continuous-integration', pattern, weight: -1, layer: 'system', constraint: 'tooling', ...overrides };
}

test('usa somente a população capaz de observar a intervenção', () => {
  const recommendation = new GroupRecommendationEngine(catalog).rank([
    evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b'), evidence('tooling-gap', 'c'),
  ], { total: 10, applicableByCapability: { 'continuous-integration': 3 } })[0]!;
  assert.equal(recommendation.support, 1);
  assert.equal(recommendation.evidence.applicablePopulation, 3);
  assert.match(recommendation.reasons[0]!, /3 de 3 jornadas aplicáveis/);
});

test('não publica recomendação para uma coorte aplicável identificável', () => {
  const recommendations = new GroupRecommendationEngine(catalog).rank([
    evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b'),
  ], { total: 10, applicableByCapability: { 'continuous-integration': 2 } });
  assert.deepEqual(recommendations, []);
});

test('não concede confiança gratuita nem usa coocorrência não causal', () => {
  const engine = new GroupRecommendationEngine(catalog);
  const base = engine.rank([evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b')], { total: 4, applicableByCapability: { 'continuous-integration': 4 } })[0]!;
  const unrelated = engine.rank([
    evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b'),
    evidence('unrelated-problem', 'a', { layer: 'outcome' }), evidence('unrelated-problem', 'b', { layer: 'practice' }),
  ], { total: 4, applicableByCapability: { 'continuous-integration': 4 } })[0]!;
  assert.equal(unrelated.confidence, base.confidence);
  assert.ok(base.confidence < .7);
});

test('somente uma contradição pareada reduz a confiança da recomendação relacionada', () => {
  const engine = new GroupRecommendationEngine(catalog);
  const baseSignals = [evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b')];
  const consistent = engine.rank(baseSignals, 3)[0]!;
  const unrelatedPositive = engine.rank([...baseSignals, evidence('healthy-code', 'a', { weight: 2, layer: 'outcome', constraint: 'none' })], 3)[0]!;
  const contradicted = engine.rank([...baseSignals, evidence('fast-reliable-feedback', 'a', { weight: 2, layer: 'outcome', constraint: 'none' })], 3)[0]!;
  assert.equal(unrelatedPositive.confidence, consistent.confidence);
  assert.ok(contradicted.confidence < consistent.confidence);
  assert.equal(contradicted.evidence.contradictingParticipants, 1);
});

test('triangulação específica por camada e perfil aumenta confiança', () => {
  const engine = new GroupRecommendationEngine(catalog);
  const isolated = engine.rank([evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b')], 3)[0]!;
  const corroborated = engine.rank([
    evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b'), evidence('slow-feedback', 'c', { profile: 'platform', layer: 'outcome' }),
  ], 3)[0]!;
  assert.ok(corroborated.confidence > isolated.confidence);
  assert.deepEqual(corroborated.evidence.profiles.sort(), ['engineering', 'platform']);
  assert.deepEqual(corroborated.evidence.layers.sort(), ['outcome', 'system']);
});

test('publica experimento executável e confiança sem falsa precisão', () => {
  const recommendation = new GroupRecommendationEngine(catalog).rank([
    evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b'), evidence('slow-feedback', 'c'),
  ], 3)[0]!;
  assert.equal((recommendation.confidence * 100) % 5, 0);
  assert.equal(recommendation.experiment.owner, tooling.owner);
  assert.equal(recommendation.experiment.metric, tooling.metric);
  assert.equal(recommendation.experiment.reviewHorizon, tooling.reviewHorizon);
  assert.equal(recommendation.experiment.successCriterion, tooling.successCriterion);
});
