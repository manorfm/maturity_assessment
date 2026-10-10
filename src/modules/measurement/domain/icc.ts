/**
 * Concordância e força do clima (05 §10, 09 §4).
 * ICC(1) alimenta ω do partial pooling; ICC(2) orienta k recomendado.
 */

/** ICC(2) = k · ICC(1) / (1 + (k − 1) · ICC(1)) */
export function icc2(icc1: number, respondentsPerUnit: number): number {
  const rho = clamp01(icc1);
  const k = Math.max(1, respondentsPerUnit);
  return (k * rho) / (1 + (k - 1) * rho);
}

/** Menor k inteiro com ICC(2) ≥ alvo (padrão 0,70). */
export function respondentsForIcc2(icc1: number, target = 0.7): number {
  const rho = clamp01(icc1);
  if (rho <= 0) return Number.POSITIVE_INFINITY;
  if (rho >= target) return 1;
  return Math.ceil((target * (1 - rho)) / (rho * (1 - target)));
}

/**
 * ICC(1) one-way (Bliese, 2000) a partir de escores por unidade.
 * Cada grupo é a lista de escores dos respondentes da unidade.
 */
export function estimateIcc1(groups: ReadonlyArray<ReadonlyArray<number>>): number {
  const usable = groups.filter((group) => group.length >= 1);
  if (usable.length < 2) return 0;
  const n = usable.reduce((sum, group) => sum + group.length, 0);
  const grand = usable.reduce((sum, group) => sum + group.reduce((a, b) => a + b, 0), 0) / n;
  let ssb = 0;
  let ssw = 0;
  for (const group of usable) {
    const mean = group.reduce((a, b) => a + b, 0) / group.length;
    ssb += group.length * (mean - grand) ** 2;
    for (const value of group) ssw += (value - mean) ** 2;
  }
  const dfb = usable.length - 1;
  const dfw = n - usable.length;
  if (dfb < 1 || dfw < 1) return 0;
  const msb = ssb / dfb;
  const msw = ssw / dfw;
  const kBar = n / usable.length;
  if (msb + (kBar - 1) * msw <= 0) return 0;
  return clamp01((msb - msw) / (msb + (kBar - 1) * msw));
}

/**
 * ω do prior da mãe (05 §7.1): ICC alto → unidades distintas → pooling fraco.
 * ω = 1 − ICC(1), limitado a (0, 1).
 */
export function omegaFromIcc1(icc1: number): number {
  return clamp01(1 - clamp01(icc1));
}

export function omegaForLeaf(
  params: { poolingDefault: number; pooling?: Record<string, number> },
  leafId: string,
): number {
  const specific = params.pooling?.[leafId];
  if (specific === undefined) return params.poolingDefault;
  return clamp01(specific);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
