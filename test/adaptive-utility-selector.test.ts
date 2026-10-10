import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BayesianInferenceEngine } from '../src/modules/inference/domain/bayesian-inference-engine.js';
import { DiagnosticModel } from '../src/modules/inference/domain/diagnostic-model.js';
import {
  AdaptiveQuestionSelector,
  type QuestionCandidate,
  type UnitSelectionState,
} from '../src/modules/inference/domain/adaptive-question-selector.js';

const model = DiagnosticModel.create({
  version: 'utility-v1',
  families: [{
    id: 'late-integration',
    capability: 'continuous-integration',
    hypotheses: [
      { id: 'tooling', label: 'Feedback', prior: 0.4 },
      { id: 'process', label: 'Política', prior: 0.4 },
      { id: 'unknown', label: 'Desconhecido', prior: 0.2 },
    ],
    evidence: [
      { pattern: 'slow-feedback', group: 'feedback', likelihoods: { tooling: 0.9, process: 0.15, unknown: 0.35 } },
    ],
  }],
});

const discriminating = [
  { probability: 0.5, likelihoods: { tooling: 0.9, process: 0.1, unknown: 0.4 } },
  { probability: 0.5, likelihoods: { tooling: 0.1, process: 0.9, unknown: 0.4 } },
];
const weak = [
  { probability: 0.5, likelihoods: { tooling: 0.55, process: 0.45, unknown: 0.4 } },
  { probability: 0.5, likelihoods: { tooling: 0.45, process: 0.55, unknown: 0.4 } },
];

function candidate(partial: Partial<QuestionCandidate> & { id: string }): QuestionCandidate {
  return {
    cost: 0.2,
    coverage: 0,
    validationNeed: 0,
    outcomes: discriminating,
    minutes: 1,
    leafId: 'continuous-integration',
    testletId: partial.id,
    ...partial,
  };
}

test('utilidade é bits por minuto; item mais lento perde com o mesmo ganho', () => {
  const posterior = new BayesianInferenceEngine().infer(model, [])[0]!;
  const selected = new AdaptiveQuestionSelector().select(posterior, [
    candidate({ id: 'fast', minutes: 1, outcomes: discriminating }),
    candidate({ id: 'slow', minutes: 4, outcomes: discriminating }),
  ]);
  assert.equal(selected?.id, 'fast');
  assert.ok((selected?.utility ?? 0) > 0);
  assert.ok(Math.abs((selected?.utility ?? 0) - (selected!.informationGain / 1)) < 1e-9);
});

test('restrição de repetição exclui o testlet já respondido', () => {
  const posterior = new BayesianInferenceEngine().infer(model, [])[0]!;
  const selected = new AdaptiveQuestionSelector().select(posterior, [
    candidate({ id: 'repeated', testletId: 't1', outcomes: discriminating }),
    candidate({ id: 'fresh', testletId: 't2', outcomes: weak }),
  ], { answeredTestlets: new Set(['t1']) });
  assert.equal(selected?.id, 'fresh');
});

test('folhas com menos de 2 testlets restringem o conjunto candidato', () => {
  const posterior = new BayesianInferenceEngine().infer(model, [])[0]!;
  const state: UnitSelectionState = {
    leafCoverage: {
      'continuous-integration': { testlets: 0, perspectives: 0 },
      'work-management': { testlets: 3, perspectives: 2 },
    },
  };
  const selected = new AdaptiveQuestionSelector().select(posterior, [
    candidate({ id: 'covered', leafId: 'work-management', outcomes: discriminating, minutes: 1 }),
    candidate({ id: 'sparse', leafId: 'continuous-integration', outcomes: weak, minutes: 1 }),
  ], state);
  assert.equal(selected?.id, 'sparse');
  assert.match(selected!.reasons.join(' '), /cobertura|testlet|folha/i);
});

test('para quando a melhor utilidade fica abaixo de 0,01 bit/min', () => {
  const posterior = new BayesianInferenceEngine().infer(model, [])[0]!;
  const selected = new AdaptiveQuestionSelector().select(posterior, [
    candidate({
      id: 'noise',
      minutes: 10,
      outcomes: [{ probability: 1, likelihoods: { tooling: 0.5, process: 0.5, unknown: 0.5 } }],
    }),
  ]);
  assert.equal(selected, undefined);
});

test('simulador de unidade: cobertura matricial sem violar restrições', () => {
  const leaves = ['ci', 'wm', 'rel', 'plan', 'ops', 'own'];
  const perspectives = ['engineering', 'management', 'platform'];
  const coverage = Object.fromEntries(leaves.map((leaf) => [leaf, { testlets: 0, perspectives: new Set<string>() }]));
  let totalMinutes = 0;
  const violations: string[] = [];

  for (let respondent = 0; respondent < 10; respondent += 1) {
    const perspective = perspectives[respondent % perspectives.length]!;
    let remaining = 15;
    const recentLeaves: string[] = [];
    const answeredTestlets = new Set<string>();
    let probes = 0;
    while (remaining > 0 && probes < 5) {
      const posterior = new BayesianInferenceEngine().infer(model, respondent > 0 ? ['slow-feedback'] : [])[0]!;
      const candidates = leaves.flatMap((leaf) => [0, 1, 2].map((slot) => candidate({
        id: `${leaf}-r${respondent}-s${slot}`,
        leafId: leaf,
        testletId: `${leaf}-t${slot}`,
        minutes: 1.2,
        outcomes: slot === 0 ? discriminating : weak,
      })));
      const selected = new AdaptiveQuestionSelector().select(posterior, candidates, {
        leafCoverage: Object.fromEntries(Object.entries(coverage).map(([leaf, value]) => [leaf, {
          testlets: value.testlets,
          perspectives: value.perspectives.size,
        }])),
        answeredTestlets,
        recentLeafIds: recentLeaves,
        remainingMinutes: remaining,
        perspective,
      });
      if (!selected) break;
      if (answeredTestlets.has(selected.testletId ?? selected.id)) violations.push('repetition');
      if ((selected.minutes ?? 1) > remaining) violations.push('budget');
      if (recentLeaves.length >= 2 && selected.leafId === recentLeaves.at(-1) && selected.leafId === recentLeaves.at(-2)) {
        violations.push('leaf-streak');
      }
      answeredTestlets.add(selected.testletId ?? selected.id);
      const leaf = coverage[selected.leafId!]!;
      leaf.testlets += 1;
      leaf.perspectives.add(perspective);
      recentLeaves.push(selected.leafId!);
      if (recentLeaves.length > 2) recentLeaves.shift();
      remaining -= selected.minutes ?? 1;
      totalMinutes += selected.minutes ?? 1;
      probes += 1;
    }
  }

  assert.deepEqual(violations, []);
  for (const leaf of leaves) {
    assert.ok(coverage[leaf]!.testlets >= 2, `${leaf} testlets`);
    assert.ok(coverage[leaf]!.perspectives.size >= 2, `${leaf} perspectives`);
  }
  assert.ok(totalMinutes / 10 <= 18, `média ${totalMinutes / 10} min`);
});
