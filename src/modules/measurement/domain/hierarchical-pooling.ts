import type { StageDistribution } from './measurement-params.js';

/** π_u(S) = ω · P_mãe(S) + (1 − ω) · Uniforme(S) */
export function pooledPrior(mother: StageDistribution | number[], omega: number): StageDistribution {
  const weight = Math.min(1, Math.max(0, omega));
  const uniform = 0.2;
  const mixed = mother.map((value) => weight * value + (1 - weight) * uniform);
  const total = mixed.reduce((sum, value) => sum + value, 0) || 1;
  return mixed.map((value) => value / total) as unknown as StageDistribution;
}
