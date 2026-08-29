import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defineInterventionCatalog, GroupRecommendationEngine, type GroupSignal, type InterventionDefinition } from '../src/modules/inference/domain/group-recommendation-engine.js';

const tooling: InterventionDefinition = {
  title: 'Feedback técnico insuficiente', intervention: 'Reduza duração e instabilidade do feedback.',
  cause: 'O retorno automatizado não sustenta decisões frequentes.',
  action: 'Meça o fluxo e estabilize a verificação que mais interrompe integrações.',
  owner: 'Liderança técnica com engenharia e plataforma',
  metric: 'p95 do tempo até feedback e taxa de execuções instáveis', reviewHorizon: 'duas semanas',
  successCriterion: 'redução mensurável da espera sem aumento de escapes',
  evidencePatterns: ['tooling-gap', 'slow-feedback'], contradictionPatterns: ['fast-reliable-feedback'],
  foundation: { source: 'Continuous Delivery', principle: 'Feedback cedo', why: 'A espera até o retorno interrompe a decisão.' },
};
const catalog: Record<string, InterventionDefinition> = {
  'tooling-gap': tooling,
  'process-gap': { ...tooling, title: 'Política amplia o lote', cause: 'Uma regra de processo obriga o trabalho a aguardar.', evidencePatterns: ['process-gap'], contradictionPatterns: ['risk-proportional-flow'] },
};

function evidence(pattern: string, participantId: string, overrides: Partial<GroupSignal> = {}): GroupSignal {
  return { participantId, profile: 'engineering', detailCapability: 'continuous-integration', pattern, weight: -1, layer: 'system', constraint: 'tooling', ...overrides };
}

test('padrões de melhoria contínua não compartilham o mesmo parágrafo de causa', () => {
  const catalog = defineInterventionCatalog({
    'acoes-perdem-dono': { title: 'Ações perdem dono', intervention: 'Limite a retro.', foundation: { source: 'Melhoria contínua', principle: 'Dono e efeito', why: 'x' } },
    'entregas-consomem': { title: 'Entregas consomem melhoria', intervention: 'Pare uma iniciativa.', foundation: { source: 'Melhoria contínua', principle: 'Dono e efeito', why: 'x' } },
  });
  assert.notEqual(catalog['acoes-perdem-dono']!.cause, catalog['entregas-consomem']!.cause);
  assert.match(catalog['acoes-perdem-dono']!.cause, /ações perdem dono/i);
  assert.match(catalog['entregas-consomem']!.cause, /entregas consomem melhoria/i);
});

test('padrão de integração descreve a restrição, não o balde de melhoria contínua', () => {
  const catalog = defineInterventionCatalog({
    'mudanca-isolada': { title: 'Mudanças permanecem isoladas', intervention: 'Integre no mesmo dia.', foundation: { source: 'Continuous Delivery', principle: 'Lote pequeno', why: 'x' } },
  });
  assert.doesNotMatch(catalog['mudanca-isolada']!.cause, /ciclo de melhoria/);
  assert.equal(catalog['mudanca-isolada']!.guidance?.solutionKind, 'practice');
  assert.match(catalog['mudanca-isolada']!.guidance?.solutionClass ?? '', /tronco/i);
  assert.doesNotMatch(catalog['mudanca-isolada']!.metric, /registre a recorrência/);
});

test('palavra incidental não escolhe métrica de outra família', () => {
  const catalog = defineInterventionCatalog({
    'seguranca-depende-de-reconhecimento-e-especialista': {
      title: 'Segurança depende de reconhecimento e especialista',
      intervention: 'Torne orientação e verificação acessíveis no fluxo.',
      foundation: { source: 'Qualidade no fluxo', principle: 'Risco entra cedo', why: 'O risco precisa alterar a construção.' },
    },
  });
  const item = catalog['seguranca-depende-de-reconhecimento-e-especialista']!;
  assert.doesNotMatch(item.metric, /decisões de reconhecimento|ciclo de reconhecimento/);
  assert.match(item.metric, /feedback|risco|verificação/);
});

test('catálogo não publica recomendação sem contrato causal explícito', () => {
  const incomplete = defineInterventionCatalog({
    'padrao-sem-contrato': {
      title: 'Um efeito foi observado', intervention: 'Faça alguma coisa.',
      foundation: { source: 'Melhoria contínua', principle: 'Revisar', why: 'Ainda genérico.' },
    },
  });
  const engine = new GroupRecommendationEngine(incomplete);
  assert.deepEqual(engine.rank([
    evidence('padrao-sem-contrato', 'a'), evidence('padrao-sem-contrato', 'b'), evidence('padrao-sem-contrato', 'c'),
  ], 3), []);
});

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

test('não usa coocorrência não causal para alterar o posterior', () => {
  const engine = new GroupRecommendationEngine(catalog);
  const base = engine.rank([evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b')], { total: 4, applicableByCapability: { 'continuous-integration': 4 } })[0]!;
  const unrelated = engine.rank([
    evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b'),
    evidence('unrelated-problem', 'a', { layer: 'outcome' }), evidence('unrelated-problem', 'b', { layer: 'practice' }),
  ], { total: 4, applicableByCapability: { 'continuous-integration': 4 } })[0]!;
  assert.equal(unrelated.confidence, base.confidence);
  assert.ok(base.confidence <= .95);
});

test('somente uma contradição pareada reduz a confiança da recomendação relacionada', () => {
  const engine = new GroupRecommendationEngine(catalog);
  const baseSignals = [evidence('tooling-gap', 'a'), evidence('tooling-gap', 'b')];
  const consistent = engine.rank(baseSignals, 3)[0]!;
  const unrelatedPositive = engine.rank([...baseSignals, evidence('healthy-code', 'a', { weight: 2, layer: 'outcome', constraint: 'none' })], 3)[0]!;
  const contradicted = engine.rank([...baseSignals, evidence('fast-reliable-feedback', 'a', { weight: 2, layer: 'outcome', constraint: 'none' })], 3)[0];
  assert.equal(unrelatedPositive.confidence, consistent.confidence);
  assert.equal(contradicted, undefined, 'contradição forte deve suprimir prescrição abaixo de 50%');
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
  assert.equal(recommendation.solutionCapability, 'Capacidade coletiva para reduzir feedback técnico insuficiente');
  assert.equal(recommendation.solutionReadiness.stage, 'not-demonstrated');
});
