import type { StageDistribution } from './measurement-params.js';

export const CHANGE_PUBLICATION_THRESHOLD = 0.8;

export type StageChange = 'improved' | 'regressed' | 'stable' | 'uncertain';

export type ChangeAssessment = {
  pImprove: number;
  pRegress: number;
  pStable: number;
  change: StageChange;
  threshold: number;
};

/**
 * P(melhora) = Σ_{a < b} P_t1(a) · P_t2(b) (05 §9).
 * Publica melhora/piora/estável só com probabilidade ≥ 0,8.
 */
export function probabilityOfImprovement(previous: StageDistribution, current: StageDistribution): number {
  let total = 0;
  for (let a = 0; a <= 4; a += 1) {
    for (let b = 0; b <= 4; b += 1) {
      if (a < b) total += previous[a]! * current[b]!;
    }
  }
  return roundProb(total);
}

export function probabilityOfRegression(previous: StageDistribution, current: StageDistribution): number {
  let total = 0;
  for (let a = 0; a <= 4; a += 1) {
    for (let b = 0; b <= 4; b += 1) {
      if (a > b) total += previous[a]! * current[b]!;
    }
  }
  return roundProb(total);
}

/** P(|S_t2 − S_t1| < 1) nos estágios inteiros 0–4 = massa na diagonal (16 §5.1). */
export function probabilityOfStability(previous: StageDistribution, current: StageDistribution): number {
  let total = 0;
  for (let a = 0; a <= 4; a += 1) {
    total += previous[a]! * current[a]!;
  }
  return roundProb(total);
}

export function assessStageChange(
  previous: StageDistribution,
  current: StageDistribution,
  threshold = CHANGE_PUBLICATION_THRESHOLD,
): ChangeAssessment {
  const pImprove = probabilityOfImprovement(previous, current);
  const pRegress = probabilityOfRegression(previous, current);
  const pStable = probabilityOfStability(previous, current);
  const change: StageChange = pImprove >= threshold
    ? 'improved'
    : pRegress >= threshold
      ? 'regressed'
      : pStable >= threshold
        ? 'stable'
        : 'uncertain';
  return { pImprove, pRegress, pStable, change, threshold };
}

function roundProb(value: number): number {
  return Number(value.toFixed(4));
}
