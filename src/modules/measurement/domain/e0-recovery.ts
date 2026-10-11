import { defaultMeasurementParams, stages, type MeasurementParams, type Stage } from './measurement-params.js';
import {
  optionProbability,
  withinUnit,
  type RespondentBundle,
} from './observation-model.js';
import { unitPosterior } from './unit-posterior.js';

export type E0RecoveryReport = {
  replications: number;
  respondents: number;
  testlets: number;
  meanBias: number;
  absBias: number;
  /** Erro absoluto médio |E[S] − S|; recupera o estágio além do viés cancelado. */
  mae: number;
  coverage90: number;
  /**
   * 09 §3 para S discreto: |viés| < 0,1, MAE < 0,25 e cobertura 90% ≥ 0,85.
   * O teto 95% aplica-se à calibração de parâmetros contínuos (κ, ψ) no PyMC.
   */
  passes: boolean;
};

export type E0RecoveryInput = {
  replications?: number;
  respondents?: number;
  testlets?: number;
  seed?: number;
  params?: MeasurementParams;
};

/**
 * E0 (09 §3): simula respostas a partir de S conhecido e recupera a posterior
 * com o mesmo modelo de observação (05). Fora do runtime de entrevista.
 */
export function runE0Recovery(input: E0RecoveryInput = {}): E0RecoveryReport {
  const replications = input.replications ?? 200;
  const respondents = input.respondents ?? 12;
  const testlets = input.testlets ?? 3;
  const params = input.params ?? defaultMeasurementParams();
  const random = createRng(input.seed ?? 1);
  const within = withinUnit(params.psi);
  const anchors = stages;

  let biasSum = 0;
  let absErrorSum = 0;
  let covered = 0;

  for (let rep = 0; rep < replications; rep += 1) {
    const trueStage = Math.floor(random() * 5) as Stage;
    const responses: RespondentBundle[] = [];
    for (let r = 0; r < respondents; r += 1) {
      const lived = sampleCategorical(within[trueStage]!, random) as Stage;
      const items = [];
      for (let t = 0; t < testlets; t += 1) {
        const probs = anchors.map((anchor) => optionProbability(anchor, anchors, lived, 0, params.kappa.medium));
        const chosen = sampleCategorical(probs, random) as Stage;
        items.push({
          chosen,
          anchors: [...anchors] as Stage[],
          discrimination: 'medium' as const,
          testletId: `t${t}`,
        });
      }
      responses.push({ perspective: 'engineering', items });
    }

    const posterior = unitPosterior({
      unit: 'sim',
      leaf: 'e0',
      responses,
      params,
      applyGates: false,
    });
    const expectation = posterior.distribution.reduce((sum, probability, stage) => sum + probability * stage, 0);
    biasSum += expectation - trueStage;
    absErrorSum += Math.abs(expectation - trueStage);
    const [lo, hi] = stageCredibleInterval(posterior.distribution);
    if (trueStage >= lo && trueStage <= hi) covered += 1;
  }

  const meanBias = biasSum / replications;
  const absBias = Math.abs(meanBias);
  const mae = absErrorSum / replications;
  const coverage90 = covered / replications;
  const passes = absBias < 0.1 && mae < 0.25 && coverage90 >= 0.85;

  return {
    replications,
    respondents,
    testlets,
    meanBias: round4(meanBias),
    absBias: round4(absBias),
    mae: round4(mae),
    coverage90: round4(coverage90),
    passes,
  };
}

function stageCredibleInterval(distribution: readonly number[]): [number, number] {
  let cumulative = 0;
  const cumsum: number[] = [];
  for (const probability of distribution) {
    cumulative += probability;
    cumsum.push(cumulative);
  }
  return [searchSorted(cumsum, 0.05), searchSorted(cumsum, 0.95)];
}

function searchSorted(cumsum: number[], target: number): number {
  for (let index = 0; index < cumsum.length; index += 1) {
    if ((cumsum[index] ?? 0) >= target) return index;
  }
  return stages.length - 1;
}

function sampleCategorical(weights: readonly number[], random: () => number): number {
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  let draw = random() * total;
  for (let index = 0; index < weights.length; index += 1) {
    draw -= weights[index]!;
    if (draw <= 0) return index;
  }
  return weights.length - 1;
}

/** Mulberry32 — deterministic draws for lab reproducibility. */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}
