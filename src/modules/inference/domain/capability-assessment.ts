export type CapabilityEvidence = { participantId: string; pattern: string; weight: number };
export type CredibleInterval = { lower: number; upper: number };
export type OrganizationalPrior = { level: number; strength: number };

export class CapabilityAssessment {
  private constructor(
    public readonly level: number,
    public readonly confidence: number,
    public readonly evidence: number,
    public readonly observers: number,
    public readonly interval: CredibleInterval,
    public readonly hasContradiction: boolean,
  ) {}

  static from(weights: number[]): CapabilityAssessment {
    return this.fromEvidence(weights.map((weight, index) => ({ participantId: `observer-${index}`, pattern: `pattern-${index}`, weight })));
  }

  static fromEvidence(evidence: CapabilityEvidence[], prior?: OrganizationalPrior): CapabilityAssessment {
    if (!evidence.length) return new CapabilityAssessment(0, 0, 0, 0, { lower: 0, upper: 4 }, false);
    const byObserver = groupBy(evidence, (item) => item.participantId);
    const observerScores = [...byObserver.values()].map((items) => mean(items.map((item) => ordinalLevel(item.weight))));
    const localLevel = mean(observerScores);
    const priorStrength = prior ? Math.max(0, prior.strength) : 0;
    const level = round((localLevel * observerScores.length + (prior?.level ?? 0) * priorStrength) / (observerScores.length + priorStrength));
    const positiveObservers = observerScores.filter((value) => value > 2).length;
    const negativeObservers = observerScores.filter((value) => value < 2).length;
    const hasContradiction = positiveObservers > 0 && negativeObservers > 0;
    const agreement = hasContradiction ? Math.max(.2, Math.abs(positiveObservers - negativeObservers) / observerScores.length) : 1;
    const alpha = .5 + priorStrength * (prior?.level ?? 0) / 4 + observerScores.reduce((sum, value) => sum + value / 4, 0);
    const beta = .5 + priorStrength * (1 - (prior?.level ?? 0) / 4) + observerScores.reduce((sum, value) => sum + 1 - value / 4, 0);
    const interval = betaInterval(alpha, beta);
    const observerSupport = Math.min(1, observerScores.length / 5);
    const patternSupport = Math.min(1, new Set(evidence.map((item) => item.pattern)).size / 3);
    const precision = Math.max(0, 1 - (interval.upper - interval.lower) / 4);
    const confidence = roundConfidence((.55 * observerSupport + .25 * patternSupport + .2 * precision) * agreement);
    return new CapabilityAssessment(level, confidence, evidence.length, observerScores.length, interval, hasContradiction);
  }
}

function ordinalLevel(weight: number): number {
  if (weight <= -2) return 0;
  if (weight === -1) return 1;
  if (weight === 0) return 2;
  if (weight === 1) return 3;
  return 4;
}
function betaInterval(alpha: number, beta: number): CredibleInterval {
  const meanValue = alpha / (alpha + beta);
  const variance = alpha * beta / ((alpha + beta) ** 2 * (alpha + beta + 1));
  const margin = 1.645 * Math.sqrt(variance);
  return { lower: round(clamp((meanValue - margin) * 4, 0, 4)), upper: round(clamp((meanValue + margin) * 4, 0, 4)) };
}
function groupBy<T, K>(values: T[], keyOf: (value: T) => K): Map<K, T[]> {
  const grouped = new Map<K, T[]>();
  for (const value of values) {
    const key = keyOf(value);
    grouped.set(key, [...(grouped.get(key) ?? []), value]);
  }
  return grouped;
}

function mean(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function roundConfidence(value: number): number {
  return Math.round(clamp(value, 0, 1) * 20) / 20;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
