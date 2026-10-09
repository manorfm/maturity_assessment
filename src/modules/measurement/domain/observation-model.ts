import { stages, type Discrimination, type MeasurementParams, type Stage, type StageDistribution } from './measurement-params.js';

export type TestletItem = {
  chosen: Stage;
  anchors: Stage[];
  discrimination: Discrimination;
};

export type RespondentBundle = {
  perspective: string;
  items: TestletItem[];
};

/** Multinomial logit: P(chosen | lived state e, severity δ). */
export function optionProbability(chosen: Stage, anchors: Stage[], lived: Stage, delta: number, kappa: number): number {
  const utilities = anchors.map((anchor) => -kappa * Math.abs(anchor - (lived + delta)));
  const max = Math.max(...utilities);
  const weights = utilities.map((utility) => Math.exp(utility - max));
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const index = anchors.indexOf(chosen);
  return (weights[index] ?? 0) / total;
}

/** P(e | S): heterogeneidade dentro da unidade. */
export function withinUnit(psi: number): number[][] {
  return stages.map((stage) => {
    const row = stages.map((lived) => Math.exp(-psi * Math.abs(lived - stage)));
    const total = row.reduce((sum, value) => sum + value, 0) || 1;
    return row.map((value) => value / total);
  });
}

/** L_j(S) para um respondente: Σ_e P(e|S) · Π_testlets P(resposta|e). */
export function respondentLikelihood(items: TestletItem[], delta: number, params: MeasurementParams): number[] {
  const livedLikelihood = stages.map((lived) => items.reduce((product, item) => (
    product * optionProbability(item.chosen, item.anchors, lived, delta, params.kappa[item.discrimination])
  ), 1));
  const within = withinUnit(params.psi);
  return stages.map((stage) => within[stage]!.reduce((sum, weight, lived) => sum + weight * livedLikelihood[lived]!, 0));
}

export function normalizeDistribution(values: number[]): StageDistribution {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  return values.map((value) => value / total) as unknown as StageDistribution;
}
