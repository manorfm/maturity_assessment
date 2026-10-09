export type ReadinessBand = 'ready' | 'near' | 'not-ready';

export type PrerequisitePosterior = {
  id: string;
  label: string;
  essential: boolean;
  probability: number;
};

export type ReadinessAssessment = {
  probability: number;
  comfort: number;
  band: ReadinessBand;
  bottleneckId?: string;
  premature: boolean;
  missing: string[];
};

export function assessReadiness(input: {
  prerequisites: PrerequisitePosterior[];
  technicalPhase?: number;
}): ReadinessAssessment {
  const essential = input.prerequisites.filter((item) => item.essential);
  const comfort = input.prerequisites.filter((item) => !item.essential);
  const probability = round2(essential.reduce((product, item) => product * item.probability, 1));
  const comfortMean = comfort.length
    ? comfort.reduce((sum, item) => sum + item.probability, 0) / comfort.length
    : 1;
  const bottleneck = [...essential].sort((left, right) => left.probability - right.probability)[0];
  const premature = (input.technicalPhase ?? 0) >= 3 && essential.some((item) => item.probability < 0.3);
  const band: ReadinessBand = probability >= 0.6 ? 'ready' : probability >= 0.25 ? 'near' : 'not-ready';
  return {
    probability,
    comfort: round2(probability * comfortMean),
    band,
    ...(bottleneck ? { bottleneckId: bottleneck.id } : {}),
    premature,
    missing: essential.filter((item) => item.probability < 0.7).map((item) => item.label),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export const chaosEngineeringExample: PrerequisitePosterior[] = [
  { id: 'observability', label: 'Observabilidade', essential: true, probability: 0.35 },
  { id: 'steady-state', label: 'Estado estável', essential: true, probability: 0.2 },
  { id: 'incident-response', label: 'Resposta a incidentes', essential: true, probability: 0.7 },
  { id: 'rollback', label: 'Reversão', essential: true, probability: 0.5 },
  { id: 'learning', label: 'Aprendizado com incidentes', essential: true, probability: 0.4 },
];
