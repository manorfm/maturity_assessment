export class CapabilityAssessment {
  private constructor(
    public readonly level: number,
    public readonly confidence: number,
    public readonly evidence: number,
    public readonly hasContradiction: boolean,
  ) {}

  static from(weights: number[]): CapabilityAssessment {
    const evidence = weights.length;
    if (!evidence) return new CapabilityAssessment(0, 0, 0, false);
    const positive = weights.filter((weight) => weight > 0).length;
    const negative = weights.filter((weight) => weight < 0).length;
    const hasContradiction = positive > 0 && negative > 0;
    const directionalAgreement = hasContradiction
      ? Math.max(0.25, Math.abs(positive - negative) / (positive + negative))
      : 1;
    const average = weights.reduce((total, weight) => total + weight, 0) / evidence;
    return new CapabilityAssessment(
      clamp(Number((2 + average).toFixed(2)), 0, 4),
      Number((Math.min(1, evidence / 4) * directionalAgreement).toFixed(2)),
      evidence,
      hasContradiction,
    );
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
