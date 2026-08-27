const labels = ['Opaco', 'Reativo', 'Repetível', 'Gerenciado', 'Adaptativo'] as const;

type CapabilitySummary = { id?: string; label: string; level: number; confidence: number; coverage?: number };

export class TeamClassification {
  private constructor(
    public readonly level: number,
    public readonly label: typeof labels[number],
    public readonly limitingCapabilities: string[],
  ) {}

  static from(capabilities: CapabilitySummary[]): TeamClassification {
    const supported = capabilities.filter((capability) => capability.confidence >= .25 && (capability.coverage ?? 1) >= 1);
    if (!supported.length) return TeamClassification.at(0, ['Evidência insuficiente']);
    const level = Math.floor(Math.min(...supported.map((capability) => capability.level)));
    const limitingCapabilities = supported
      .filter((capability) => Math.floor(capability.level) === level)
      .map((capability) => capability.label);
    return TeamClassification.at(level, limitingCapabilities);
  }

  static at(level: number, limitingCapabilities: string[]): TeamClassification {
    const normalized = Math.max(0, Math.min(4, Math.floor(level)));
    return new TeamClassification(normalized, labels[normalized]!, [...new Set(limitingCapabilities)]);
  }

  constrainedBy(children: TeamClassification[]): TeamClassification {
    const weakest = children.filter((child) => child.level < this.level);
    if (!weakest.length) return this;
    const level = Math.min(...weakest.map((child) => child.level));
    return TeamClassification.at(level, weakest.filter((child) => child.level === level).flatMap((child) => child.limitingCapabilities));
  }
}
