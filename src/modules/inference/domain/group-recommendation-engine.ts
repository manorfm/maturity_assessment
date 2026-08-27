export type EvidenceLayer = 'knowledge' | 'practice' | 'consistency' | 'system' | 'outcome';
export type ConstraintKind = 'none' | 'knowledge' | 'process' | 'tooling' | 'access' | 'architecture' | 'organization' | 'governance' | 'culture';

export type GroupSignal = {
  participantId: string;
  detailCapability: string;
  pattern: string;
  weight: number;
  layer: EvidenceLayer;
  constraint: ConstraintKind;
};

export type InterventionDefinition = { title: string; intervention: string };
export type RankedIntervention = InterventionDefinition & {
  kind: 'correction' | 'evolution';
  detailCapability: string;
  pattern: string;
  constraint: ConstraintKind;
  support: number;
  confidence: number;
  reasons: string[];
};

export class GroupRecommendationEngine {
  constructor(
    private readonly correctionCatalog: Record<string, InterventionDefinition>,
    private readonly evolutionCatalog: Record<string, InterventionDefinition> = {},
  ) {}

  rank(signals: GroupSignal[], population: number): RankedIntervention[] {
    const byCapability = groupBy(signals, (signal) => signal.detailCapability);
    return [...byCapability.values()].flatMap((capabilitySignals) => this.rankCapability(capabilitySignals, population));
  }

  private rankCapability(signals: GroupSignal[], population: number): RankedIntervention[] {
    const minimumSupport = Math.max(2, Math.ceil(population * .2));
    const byParticipant = groupBy(signals, (signal) => signal.participantId);
    const candidatesSignals = signals.filter((signal) => signal.weight < 0
      ? this.correctionCatalog[signal.pattern]
      : signal.weight < 2 && this.evolutionCatalog[signal.pattern]);
    const negative = candidatesSignals.filter((signal) => signal.weight < 0);
    const dominantConstraint: ConstraintKind = mode(negative.map((signal) => signal.constraint).filter((constraint) => constraint !== 'none')) ?? 'none';
    const layerBreadth = new Set(signals.map((signal) => signal.layer)).size / 5;
    const candidates = groupBy(candidatesSignals, (signal) => signal.pattern);

    return [...candidates].flatMap(([pattern, patternSignals]) => {
      const participants = new Set(patternSignals.map((signal) => signal.participantId));
      if (participants.size < minimumSupport) return [];
      const kind: RankedIntervention['kind'] = patternSignals[0]!.weight < 0 ? 'correction' : 'evolution';
      const definition = kind === 'correction' ? this.correctionCatalog[pattern] : this.evolutionCatalog[pattern];
      const cooccurrence = [...participants].filter((participantId) => new Set((byParticipant.get(participantId) ?? []).filter((signal) => signal.weight < 0).map((signal) => signal.pattern)).size > 1).length / participants.size;
      const contradiction = kind === 'correction'
        ? [...participants].filter((participantId) => (byParticipant.get(participantId) ?? []).some((signal) => signal.weight > 0)).length / participants.size
        : 0;
      const constraint: ConstraintKind = mode(patternSignals.map((signal) => signal.constraint).filter((item) => item !== 'none')) ?? 'none';
      const constraintAlignment = dominantConstraint === 'none' || constraint === dominantConstraint ? 1 : 0;
      const support = participants.size / Math.max(1, population);
      const confidence = clamp(.4 * support + .25 * cooccurrence + .2 * constraintAlignment + .15 * layerBreadth - .2 * contradiction);
      const reasons = [
        `Padrão observado em ${participants.size} de ${population} participações elegíveis.`,
        ...(cooccurrence > 0 ? [`Coocorrência com outros sinais em ${Math.round(cooccurrence * 100)}% das jornadas afetadas.`] : []),
        ...(contradiction > 0 ? [`Sinais positivos contradizem o padrão em ${Math.round(contradiction * 100)}% das jornadas afetadas.`] : []),
        `Evidências distribuídas por ${new Set(signals.map((signal) => signal.layer)).size} camada(s).`,
        ...(constraint !== 'none' ? [`Restrição dominante: ${constraint}.`] : []),
      ];
      return [{ kind, detailCapability: patternSignals[0]!.detailCapability, pattern, constraint, support, confidence, reasons, ...definition! }];
    }).sort((left, right) => right.confidence - left.confidence || right.support - left.support || left.pattern.localeCompare(right.pattern)).slice(0, 3);
  }
}

function mode<T extends string>(values: T[]): T | undefined {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].sort((left, right) => right[1] - left[1])[0]?.[0];
}

function groupBy<T, K>(values: T[], keyOf: (value: T) => K): Map<K, T[]> {
  const grouped = new Map<K, T[]>();
  for (const value of values) {
    const key = keyOf(value);
    grouped.set(key, [...(grouped.get(key) ?? []), value]);
  }
  return grouped;
}

function clamp(value: number): number {
  return Number(Math.max(0, Math.min(1, value)).toFixed(2));
}
