import { stages, type MeasurementParams, type StageDistribution } from './measurement-params.js';
import {
  normalizeDistribution,
  respondentLikelihood,
  type RespondentBundle,
} from './observation-model.js';

export type UnitPosterior = {
  unit: string;
  leaf: string;
  distribution: StageDistribution;
  index: number;
  interval90: [number, number];
  testlets: number;
  perspectives: number;
  respondents: number;
  gatesApplied: { gamma3: boolean; gamma4: boolean };
};

export function unitPosterior(input: {
  unit: string;
  leaf: string;
  responses: RespondentBundle[];
  params: MeasurementParams;
  deltas?: Record<string, number>;
  prior?: StageDistribution;
  /** When false, skip layer gates (matches anexo-B §5.1 prototype numbers). Default true. */
  applyGates?: boolean;
}): UnitPosterior {
  const prior = [...(input.prior ?? [0.2, 0.2, 0.2, 0.2, 0.2])];
  let post = prior;
  for (const respondent of input.responses) {
    const delta = input.deltas?.[respondent.perspective] ?? 0;
    const likelihood = respondentLikelihood(respondent.items, delta, input.params);
    post = post.map((value, stage) => value * likelihood[stage]!) as number[];
  }

  const highest = Math.max(0, ...input.responses.flatMap((respondent) => respondent.items.map((item) => item.chosen)));
  const applyGates = input.applyGates !== false;
  const gamma3 = applyGates && highest < 3;
  const gamma4 = applyGates && highest < 4;
  if (gamma3) post[3] = (post[3] ?? 0) * input.params.gates.gamma3;
  if (gamma4) post[4] = (post[4] ?? 0) * input.params.gates.gamma4;

  const distribution = normalizeDistribution(post);
  const expectation = distribution.reduce((sum, probability, stage) => sum + probability * stage, 0);
  const testlets = distinctTestlets(input.responses);
  const perspectives = new Set(input.responses.map((respondent) => respondent.perspective)).size;
  return {
    unit: input.unit,
    leaf: input.leaf,
    distribution,
    index: Math.round((expectation / 4) * 100),
    interval90: credibleInterval(distribution),
    testlets,
    perspectives,
    respondents: input.responses.length,
    gatesApplied: { gamma3, gamma4 },
  };
}

function distinctTestlets(responses: RespondentBundle[]): number {
  const keys = new Set<string>();
  for (const respondent of responses) {
    respondent.items.forEach((item, index) => {
      keys.add(item.testletId ?? `${item.discrimination}:${[...item.anchors].sort((a, b) => a - b).join(',')}:${index}`);
    });
  }
  return keys.size;
}

/** Quantis 5% e 95% de S em pontos percentuais (passos de 25). */
function credibleInterval(distribution: StageDistribution): [number, number] {
  let cumulative = 0;
  const cumsum: number[] = [];
  for (const probability of distribution) {
    cumulative += probability;
    cumsum.push(cumulative);
  }
  const lower = searchSorted(cumsum, 0.05);
  const upper = searchSorted(cumsum, 0.95);
  return [lower * 25, upper * 25];
}

function searchSorted(cumsum: number[], target: number): number {
  for (let index = 0; index < cumsum.length; index += 1) {
    if ((cumsum[index] ?? 0) >= target) return index;
  }
  return stages.length - 1;
}
