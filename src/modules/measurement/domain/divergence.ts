import type { StageDistribution } from './measurement-params.js';

/** P(|S_a − S_b| ≥ threshold) over the product of two stage posteriors. */
export function divergenceProbability(
  a: StageDistribution,
  b: StageDistribution,
  threshold: number,
): number {
  let total = 0;
  for (let i = 0; i < 5; i += 1) {
    for (let j = 0; j < 5; j += 1) {
      if (Math.abs(i - j) >= threshold) {
        total += (a[i] ?? 0) * (b[j] ?? 0);
      }
    }
  }
  return total;
}
