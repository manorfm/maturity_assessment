import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BayesianInferenceEngine } from '../src/modules/inference/domain/bayesian-inference-engine.js';
import { DiagnosticModel } from '../src/modules/inference/domain/diagnostic-model.js';
import { AdaptiveQuestionSelector } from '../src/modules/inference/domain/adaptive-question-selector.js';
import { preferredProbeIds } from '../src/modules/inference/domain/reinforcement-routing.js';

const model = DiagnosticModel.create({
  version: 'reinforcement-routing',
  families: [{
    id: 'late-integration',
    capability: 'continuous-integration',
    hypotheses: [
      { id: 'tooling', label: 'Feedback ferramental', prior: .4 },
      { id: 'process', label: 'Política de lote', prior: .4 },
      { id: 'unknown', label: 'Causa ainda não discriminada', prior: .2 },
    ],
    evidence: [
      { pattern: 'slow-feedback', group: 'feedback-speed', likelihoods: { tooling: .9, process: .15, unknown: .35 } },
    ],
  }],
});

test('fato de inception prefere o probe que amarra lote ou fronteira', () => {
  const preferred = preferredProbeIds(['fonte-nao-confiavel']);
  assert.ok(preferred.includes('batch-or-frontier'));
  assert.ok(preferred.includes('delivery-cause'));
  assert.ok(!preferred.includes('quality-risk-strategy'));
});

test('priorização sem foco prefere discriminar gestão tática da organizacional', () => {
  assert.deepEqual(preferredProbeIds(['prioridade-sem-foco']), ['priority-containment']);
});

test('war room prefere o fio de clima e o lado técnico', () => {
  const preferred = preferredProbeIds(['war-room-como-gestao']);
  assert.ok(preferred.includes('war-room-thread'));
  assert.ok(preferred.includes('incident-remediation'));
  assert.ok(preferred.includes('delivery-cause'));
  assert.ok(preferred.includes('blocked-cause'));
});

test('seletor prefere o probe que confirma ou mata hipótese já reforçada', () => {
  const posterior = new BayesianInferenceEngine().infer(model, [])[0]!;
  const discriminating = [
    { probability: .5, likelihoods: { tooling: .9, process: .1, unknown: .4 } },
    { probability: .5, likelihoods: { tooling: .1, process: .9, unknown: .4 } },
  ];
  const weaker = [
    { probability: .5, likelihoods: { tooling: .7, process: .3, unknown: .4 } },
    { probability: .5, likelihoods: { tooling: .3, process: .7, unknown: .4 } },
  ];
  const candidates = [
    { id: 'loose-axis', cost: .2, coverage: 0, validationNeed: 0, outcomes: discriminating },
    { id: 'batch-or-frontier', cost: .2, coverage: 0, validationNeed: 0, outcomes: weaker },
  ];
  assert.equal(new AdaptiveQuestionSelector().select(posterior, candidates)?.id, 'loose-axis');
  const selected = new AdaptiveQuestionSelector().select(posterior, candidates, { preferredIds: preferredProbeIds(['fonte-nao-confiavel']) });
  assert.equal(selected?.id, 'batch-or-frontier');
  assert.match(selected!.reasons.join(' '), /já reforçada/i);
});
