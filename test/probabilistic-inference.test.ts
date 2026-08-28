import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BayesianInferenceEngine } from '../src/modules/inference/domain/bayesian-inference-engine.js';
import { DiagnosticModel } from '../src/modules/inference/domain/diagnostic-model.js';
import { AdaptiveQuestionSelector } from '../src/modules/inference/domain/adaptive-question-selector.js';
import { ProbabilisticRecommendationEngine } from '../src/modules/inference/domain/probabilistic-recommendation-engine.js';
import { CalibrationMetrics } from '../src/modules/inference/domain/calibration-metrics.js';

const model = DiagnosticModel.create({
  version: 'test-v1',
  families: [{
    id: 'late-integration', capability: 'continuous-integration',
    hypotheses: [
      { id: 'tooling', label: 'Feedback ferramental', prior: .4 },
      { id: 'process', label: 'Política de lote', prior: .4 },
      { id: 'unknown', label: 'Causa ainda não discriminada', prior: .2 },
    ],
    evidence: [
      { pattern: 'slow-feedback', group: 'feedback-speed', likelihoods: { tooling: .9, process: .15, unknown: .35 } },
      { pattern: 'pipeline-flaky', group: 'feedback-speed', likelihoods: { tooling: .8, process: .25, unknown: .4 } },
      { pattern: 'mandatory-gate', group: 'policy', likelihoods: { tooling: .15, process: .9, unknown: .4 } },
      { pattern: 'fast-feedback', group: 'feedback-outcome', likelihoods: { tooling: .1, process: .65, unknown: .4 } },
    ],
  }],
});

test('posterior é normalizado e explica cada atualização', () => {
  const result = new BayesianInferenceEngine().infer(model, ['slow-feedback'])[0]!;
  assert.ok(Math.abs(result.hypotheses.reduce((sum, item) => sum + item.probability, 0) - 1) < 1e-9);
  assert.equal(result.hypotheses[0]?.id, 'tooling');
  assert.deepEqual(result.evidenceUsed, ['slow-feedback']);
  assert.match(result.explanation[0]!, /prior/i);
});

test('evidências correlacionadas do mesmo grupo não são contadas duas vezes', () => {
  const engine = new BayesianInferenceEngine();
  const one = engine.infer(model, ['slow-feedback'])[0]!;
  const duplicated = engine.infer(model, ['slow-feedback', 'pipeline-flaky'])[0]!;
  assert.deepEqual(duplicated.hypotheses, one.hypotheses);
  assert.deepEqual(duplicated.ignoredEvidence, ['pipeline-flaky']);
});

test('posterior populacional distingue ocorrência isolada de comportamento recorrente', () => {
  const engine = new BayesianInferenceEngine();
  const isolated = engine.infer(model, [{ pattern: 'slow-feedback', support: 1, applicablePopulation: 10, profiles: ['engineering'], layers: ['system'] }])[0]!;
  const recurrent = engine.infer(model, [{ pattern: 'slow-feedback', support: 8, applicablePopulation: 10, profiles: ['engineering', 'platform'], layers: ['system', 'outcome'] }])[0]!;
  const tooling = (result: typeof isolated) => result.hypotheses.find((item) => item.id === 'tooling')!.probability;

  assert.ok(tooling(recurrent) > tooling(isolated));
  assert.equal(recurrent.population?.support, 8);
  assert.equal(recurrent.population?.applicable, 10);
  assert.ok(recurrent.observability > isolated.observability);
});

test('suporte publicado usa a opção da causa, não o sintoma do nó pai', () => {
  const catalogFamily = DiagnosticModel.create({
    version: 'cause-population',
    families: [{
      id: 'learning:causa-melhoria-sem-capacidade', capability: 'organizational-learning',
      hypotheses: [
        { id: 'causa-melhoria-sem-capacidade', label: 'Sem capacidade', prior: .5 },
        { id: 'unknown', label: 'Evidência insuficiente', prior: .5 },
      ],
      evidence: [
        { pattern: 'causa-melhoria-sem-capacidade', group: 'cause:causa-melhoria-sem-capacidade', likelihoods: { 'causa-melhoria-sem-capacidade': .9, unknown: .25 } },
        { pattern: 'retrospectiva-sem-fechamento', group: 'symptom:parent', likelihoods: { 'causa-melhoria-sem-capacidade': .6, unknown: .45 } },
      ],
    }],
  });
  const result = new BayesianInferenceEngine().infer(catalogFamily, [
    { pattern: 'retrospectiva-sem-fechamento', support: 7, applicablePopulation: 7, profiles: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], layers: ['practice'] },
    { pattern: 'causa-melhoria-sem-capacidade', support: 2, applicablePopulation: 7, profiles: ['a', 'b'], layers: ['system'] },
  ])[0]!;
  assert.equal(result.population?.support, 2);
  assert.equal(result.population?.applicable, 7);
});

test('ausência de uma evidência não é convertida em evidência negativa', () => {
  const withoutObservation = new BayesianInferenceEngine().infer(model, [])[0]!;
  assert.deepEqual(withoutObservation.hypotheses.map((item) => item.probability), model.families[0]!.hypotheses.map((item) => item.prior).sort((left, right) => right - left));
});

test('contradição específica reduz somente a hipótese relacionada', () => {
  const engine = new BayesianInferenceEngine();
  const supported = engine.infer(model, ['slow-feedback'])[0]!;
  const contradicted = engine.infer(model, ['slow-feedback', 'fast-feedback'])[0]!;
  const probability = (result: typeof supported, id: string) => result.hypotheses.find((item) => item.id === id)!.probability;
  assert.ok(probability(contradicted, 'tooling') < probability(supported, 'tooling'));
  assert.ok(probability(contradicted, 'process') > probability(supported, 'process'));
});

test('seleciona a pergunta com maior ganho esperado de informação', () => {
  const posterior = new BayesianInferenceEngine().infer(model, [])[0]!;
  const selected = new AdaptiveQuestionSelector().select(posterior, [
    { id: 'generic', cost: .2, coverage: 0, validationNeed: 0, outcomes: [{ probability: 1, likelihoods: { tooling: .5, process: .5, unknown: .5 } }] },
    { id: 'discriminator', cost: .2, coverage: 0, validationNeed: 0, outcomes: [
      { probability: .5, likelihoods: { tooling: .9, process: .1, unknown: .4 } },
      { probability: .5, likelihoods: { tooling: .1, process: .9, unknown: .4 } },
    ] },
  ]);
  assert.equal(selected?.id, 'discriminator');
  assert.ok(selected!.informationGain > 0);
});

test('seleção pré-piloto evita repetição quando o ganho causal é equivalente', () => {
  const posterior = new BayesianInferenceEngine().infer(model, [])[0]!;
  const outcome = [{ probability: 1, likelihoods: { tooling: .5, process: .5 } }];
  const selected = new AdaptiveQuestionSelector().select(posterior, [
    { id: 'repeated', cost: .2, coverage: .5, validationNeed: .5, causalValue: .5, perspectiveBalance: .5, repetitionRisk: 1, outcomes: outcome },
    { id: 'fresh', cost: .2, coverage: .5, validationNeed: .5, causalValue: .5, perspectiveBalance: .5, repetitionRisk: 0, outcomes: outcome },
  ]);
  assert.equal(selected?.id, 'fresh');
});

test('prescreve somente com posterior e pré-requisitos suficientes', () => {
  const recommender = new ProbabilisticRecommendationEngine([{
    id: 'stabilize-pipeline', hypothesisId: 'tooling', title: 'Estabilizar feedback', action: 'Corrigir a verificação mais instável.',
    prerequisites: ['pipeline-owned'], owner: 'Engenharia e plataforma', metric: 'p95 do feedback', reviewHorizon: 'duas semanas', successCriterion: 'p95 menor sem escapes',
  }]);
  const posterior = new BayesianInferenceEngine().infer(model, ['slow-feedback'])[0]!;
  assert.equal(recommender.recommend(posterior, new Set()).length, 0);
  assert.equal(recommender.recommend(posterior, new Set(['pipeline-owned']))[0]?.id, 'stabilize-pipeline');
});

test('calcula métricas de calibração somente a partir de rótulos externos', () => {
  const report = CalibrationMetrics.evaluate([
    { confidence: .9, outcome: 1 }, { confidence: .8, outcome: 1 },
    { confidence: .7, outcome: 0 }, { confidence: .2, outcome: 0 },
  ]);
  assert.equal(report.sampleSize, 4);
  assert.ok(report.brierScore > 0 && report.brierScore < 1);
  assert.equal(report.precision, 2 / 3);
  assert.equal(report.recall, 1);
  assert.ok(report.expectedCalibrationError >= 0);
});
