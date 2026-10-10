import { capabilityLeafIds } from './capability-taxonomy.js';

export type LeafCoverageCounts = { testlets: number; perspectives: number };

export type UnitObservation = {
  leafId: string;
  testletId: string;
  profile: string;
};

/**
 * Cobertura matricial da unidade (06 §4): testlets e perspectivas distintos por folha.
 * Inicializa as 29 folhas elegíveis em zero.
 */
export function buildUnitLeafCoverage(observations: readonly UnitObservation[]): Record<string, LeafCoverageCounts> {
  const testlets = new Map<string, Set<string>>();
  const perspectives = new Map<string, Set<string>>();
  for (const leafId of capabilityLeafIds) {
    testlets.set(leafId, new Set());
    perspectives.set(leafId, new Set());
  }
  for (const observation of observations) {
    if (!testlets.has(observation.leafId)) continue;
    testlets.get(observation.leafId)!.add(observation.testletId);
    perspectives.get(observation.leafId)!.add(observation.profile);
  }
  return Object.fromEntries(capabilityLeafIds.map((leafId) => [leafId, {
    testlets: testlets.get(leafId)!.size,
    perspectives: perspectives.get(leafId)!.size,
  }]));
}

/** Próxima vinheta do rodízio: a menos pedida na unidade (empate → ordem estável). */
export function nextVignetteInRotation(
  vignetteIds: readonly string[],
  askCounts: Record<string, number>,
): string | undefined {
  if (!vignetteIds.length) return undefined;
  return [...vignetteIds].sort((left, right) => {
    const leftCount = askCounts[left] ?? 0;
    const rightCount = askCounts[right] ?? 0;
    return leftCount - rightCount || left.localeCompare(right);
  })[0];
}
