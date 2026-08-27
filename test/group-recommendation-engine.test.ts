import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GroupRecommendationEngine, type GroupSignal } from '../src/modules/inference/domain/group-recommendation-engine.js';

const catalog = {
  'tooling-gap': { title: 'Feedback técnico insuficiente', intervention: 'Reduza duração e instabilidade do feedback.' },
  'process-gap': { title: 'Política amplia o lote', intervention: 'Crie um caminho proporcional ao risco.' },
};
const evolutionCatalog = {
  'controlled-exception': { title: 'Exceção ainda depende de reconciliação', intervention: 'Transforme o caminho emergencial em capacidade segura e repetível.' },
};

function evidence(pattern: string, constraint: GroupSignal['constraint'], participantId: string): GroupSignal {
  return { participantId, detailCapability: 'continuous-integration', pattern, weight: -1, layer: 'system', constraint };
}

test('grupos com a mesma nota recebem recomendações diferentes conforme a causa coletiva', () => {
  const engine = new GroupRecommendationEngine(catalog);
  const toolingGroup = [evidence('tooling-gap', 'tooling', 'a'), evidence('tooling-gap', 'tooling', 'b'), evidence('process-gap', 'process', 'c')];
  const processGroup = [evidence('process-gap', 'process', 'a'), evidence('process-gap', 'process', 'b'), evidence('tooling-gap', 'tooling', 'c')];

  assert.equal(toolingGroup.reduce((sum, item) => sum + item.weight, 0), processGroup.reduce((sum, item) => sum + item.weight, 0));
  assert.equal(engine.rank(toolingGroup, 3)[0]?.pattern, 'tooling-gap');
  assert.equal(engine.rank(processGroup, 3)[0]?.pattern, 'process-gap');
});

test('coocorrência e camadas independentes aumentam a confiança da intervenção', () => {
  const engine = new GroupRecommendationEngine(catalog);
  const isolated = engine.rank([evidence('tooling-gap', 'tooling', 'a'), evidence('tooling-gap', 'tooling', 'b')], 3)[0]!;
  const corroboratedSignals: GroupSignal[] = [
    evidence('tooling-gap', 'tooling', 'a'), evidence('tooling-gap', 'tooling', 'b'),
    { ...evidence('process-gap', 'tooling', 'a'), layer: 'practice' },
    { ...evidence('process-gap', 'tooling', 'b'), layer: 'outcome' },
  ];
  const corroborated = engine.rank(corroboratedSignals, 3)[0]!;
  assert.ok(corroborated.confidence > isolated.confidence);
  assert.ok(corroborated.reasons.some((reason) => /coocorr/i.test(reason)));
});

test('contradição na mesma jornada reduz a confiança sem apagar o problema coletivo', () => {
  const engine = new GroupRecommendationEngine(catalog);
  const base = [evidence('tooling-gap', 'tooling', 'a'), evidence('tooling-gap', 'tooling', 'b')];
  const consistent = engine.rank(base, 3)[0]!;
  const contradictory = engine.rank([...base, { ...evidence('healthy-feedback', 'none', 'a'), weight: 2, layer: 'outcome' }], 3)[0]!;
  assert.ok(contradictory.confidence < consistent.confidence);
  assert.ok(contradictory.reasons.some((reason) => /contradiz/i.test(reason)));
});

test('capacidade forte abaixo de quatro recebe recomendação de evolução', () => {
  const engine = new GroupRecommendationEngine(catalog, evolutionCatalog);
  const signals: GroupSignal[] = ['a', 'b', 'c'].map((participantId) => ({
    participantId, detailCapability: 'enabling-governance', pattern: 'controlled-exception',
    weight: 1, layer: 'consistency', constraint: 'none',
  }));
  const recommendation = engine.rank(signals, 3)[0]!;
  assert.equal(recommendation.kind, 'evolution');
  assert.match(recommendation.intervention, /caminho emergencial/i);
});
