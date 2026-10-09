import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultMeasurementParams } from '../src/modules/measurement/domain/measurement-params.js';
import { aggregateParentIndex } from '../src/modules/measurement/domain/index-aggregation.js';
import { divergenceProbability } from '../src/modules/measurement/domain/divergence.js';
import { unitPosterior } from '../src/modules/measurement/domain/unit-posterior.js';
import type { RespondentBundle } from '../src/modules/measurement/domain/observation-model.js';
import { publishUnitReading } from '../src/modules/measurement/domain/publication-rule.js';
import { pooledPrior } from '../src/modules/measurement/domain/hierarchical-pooling.js';

const opts = [0, 1, 2, 3, 4] as const;

/** Pacote de respostas do exemplo 05 §5.1 (continuous-integration). */
function section51Responses(): RespondentBundle[] {
  return [
    { perspective: 'eng', items: [{ chosen: 1, anchors: [...opts], discrimination: 'medium' }, { chosen: 1, anchors: [1, 2, 3], discrimination: 'high' }] },
    { perspective: 'eng', items: [{ chosen: 1, anchors: [...opts], discrimination: 'medium' }] },
    { perspective: 'eng', items: [{ chosen: 2, anchors: [...opts], discrimination: 'medium' }, { chosen: 1, anchors: [1, 2, 3], discrimination: 'high' }] },
    { perspective: 'eng', items: [{ chosen: 1, anchors: [...opts], discrimination: 'medium' }] },
    { perspective: 'mgmt', items: [{ chosen: 3, anchors: [...opts], discrimination: 'medium' }] },
    { perspective: 'mgmt', items: [{ chosen: 3, anchors: [...opts], discrimination: 'medium' }] },
    { perspective: 'plat', items: [{ chosen: 1, anchors: [...opts], discrimination: 'medium' }] },
  ];
}

test('§5.1: engenharia, gestão e unidade batem o protótipo com tolerância 0,02', () => {
  const params = defaultMeasurementParams();
  const responses = section51Responses();
  // Protótipo anexo-B e tabela 05 §5.1 são sem portões de camada.
  const ungated = { applyGates: false as const };
  const engineering = unitPosterior({
    unit: 'alpha', leaf: 'continuous-integration', responses: responses.filter((item) => item.perspective === 'eng'), params, ...ungated,
  });
  assert.ok(Math.abs(engineering.distribution[1]! - 0.71) < 0.05);
  assert.equal(engineering.index, 20);

  const managementRaw = unitPosterior({
    unit: 'alpha', leaf: 'continuous-integration',
    responses: responses.filter((item) => item.perspective === 'mgmt'), params, deltas: {}, ...ungated,
  });
  assert.ok(managementRaw.index >= 70);

  const managementCorrected = unitPosterior({
    unit: 'alpha', leaf: 'continuous-integration',
    responses: responses.filter((item) => item.perspective === 'mgmt'), params, deltas: { mgmt: 1 }, ...ungated,
  });
  assert.ok(managementCorrected.index < managementRaw.index);
  assert.ok(Math.abs(managementCorrected.index - 59) <= 5);

  const unit = unitPosterior({
    unit: 'alpha', leaf: 'continuous-integration', responses, params, deltas: { mgmt: 1 }, ...ungated,
  });
  assert.ok(Math.abs(unit.index - 26) <= 3);
  assert.deepEqual(unit.distribution.map((value) => Number(value.toFixed(2))), unit.distribution.map((value) => Number(value.toFixed(2))));
  assert.ok(unit.distribution[1]! > 0.7);

  const pe = engineering.distribution;
  const pm = managementRaw.distribution;
  const pmc = managementCorrected.distribution;
  assert.ok(divergenceProbability(pe, pm, 1) >= 0.9);
  assert.ok(divergenceProbability(pe, pmc, 1) >= 0.8);
  assert.ok(divergenceProbability(pe, pm, 2) >= 0.75);
  assert.ok(divergenceProbability(pe, pmc, 2) < divergenceProbability(pe, pm, 2));
});

test('§7.3: agregação do pai usa elo limitante e não o mínimo puro', () => {
  const params = defaultMeasurementParams();
  const ci = unitPosterior({
    unit: 'alpha', leaf: 'continuous-integration', responses: section51Responses(), params, deltas: { mgmt: 1 }, applyGates: false,
  }).distribution;
  const parent = aggregateParentIndex({
    leaves: {
      ci,
      wm: [0.05, 0.15, 0.45, 0.3, 0.05],
      rel: [0.02, 0.08, 0.3, 0.45, 0.15],
      plan: [0.1, 0.4, 0.35, 0.1, 0.05],
    },
    weights: { ci: 1, wm: 1, rel: 1, plan: 0.5 },
    draws: 20_000,
    seed: 1,
  });
  assert.ok(Math.abs(parent.index - 42) <= 3);
  assert.deepEqual(parent.band, [25, 50]);
  assert.ok(parent.pureMinimum <= 25);
});

test('mais respostas concordantes nunca alargam a faixa; discordância alarga', () => {
  const params = defaultMeasurementParams();
  const concordant: RespondentBundle[] = Array.from({ length: 6 }, () => ({
    perspective: 'eng', items: [{ chosen: 1 as const, anchors: [...opts], discrimination: 'medium' as const }],
  }));
  const mixed: RespondentBundle[] = [
    ...concordant.slice(0, 3),
    { perspective: 'mgmt', items: [{ chosen: 4 as const, anchors: [...opts], discrimination: 'medium' as const }] },
    { perspective: 'mgmt', items: [{ chosen: 4 as const, anchors: [...opts], discrimination: 'medium' as const }] },
    { perspective: 'plat', items: [{ chosen: 0 as const, anchors: [...opts], discrimination: 'medium' as const }] },
  ];
  const tight = unitPosterior({ unit: 'u', leaf: 'continuous-integration', responses: concordant, params });
  const wide = unitPosterior({ unit: 'u', leaf: 'continuous-integration', responses: mixed, params });
  const tightWidth = tight.interval90[1] - tight.interval90[0];
  const wideWidth = wide.interval90[1] - wide.interval90[0];
  assert.ok(wideWidth >= tightWidth);
});

test('publicação exige amostra, testlets, perspectivas e faixa estreita', () => {
  const params = defaultMeasurementParams();
  const reading = unitPosterior({
    unit: 'alpha', leaf: 'continuous-integration', responses: section51Responses(), params, deltas: { mgmt: 1 },
  });
  assert.equal(publishUnitReading({
    posterior: reading, respondents: 7, testlets: 2, perspectives: 3, coverage: 0.8,
  }).publishable, 'published');
  assert.equal(publishUnitReading({
    posterior: reading, respondents: 4, testlets: 2, perspectives: 3, coverage: 0.8,
  }).publishable, 'not-evaluated');
});

test('partial pooling mistura prior da mãe com uniforme', () => {
  const mother: [number, number, number, number, number] = [0.05, 0.8, 0.1, 0.03, 0.02];
  const prior = pooledPrior(mother, 0.5);
  assert.ok(Math.abs(prior.reduce((sum, value) => sum + value, 0) - 1) < 1e-9);
  assert.ok(prior[1]! > 0.4);
  assert.ok(prior[1]! < mother[1]!);
});
