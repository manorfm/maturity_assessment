import { defaultMeasurementParams, type MeasurementParams, type StageDistribution } from './measurement-params.js';
import type { RespondentBundle } from './observation-model.js';
import { unitPosterior, type UnitPosterior } from './unit-posterior.js';

/** π_u(S) = ω · P_mãe(S) + (1 − ω) · Uniforme(S) */
export function pooledPrior(mother: StageDistribution | number[], omega: number): StageDistribution {
  const weight = Math.min(1, Math.max(0, omega));
  const uniform = 0.2;
  const mixed = mother.map((value) => weight * value + (1 - weight) * uniform);
  const total = mixed.reduce((sum, value) => sum + value, 0) || 1;
  return mixed.map((value) => value / total) as unknown as StageDistribution;
}

export type UnitNode = { id: string; parentId: string | null };

/**
 * Mede cada unidade com prior da mãe (05 §7.1).
 * P_mãe usa respostas do restante da subárvore da mãe (sem a própria unidade).
 * Unidade sem mãe ou sem irmãos responde com prior uniforme.
 */
export function measureLeafAcrossUnits(input: {
  leaf: string;
  units: UnitNode[];
  responsesByUnit: Record<string, RespondentBundle[]>;
  omega: number;
  params?: MeasurementParams;
}): Map<string, UnitPosterior> {
  const params = input.params ?? defaultMeasurementParams();
  const byParent = new Map<string | null, string[]>();
  for (const unit of input.units) {
    byParent.set(unit.parentId, [...(byParent.get(unit.parentId) ?? []), unit.id]);
  }
  const result = new Map<string, UnitPosterior>();
  for (const unit of input.units) {
    const responses = input.responsesByUnit[unit.id] ?? [];
    if (!responses.length) continue;
    const motherId = unit.parentId;
    const siblings = motherId === null
      ? []
      : (byParent.get(motherId) ?? []).filter((id) => id !== unit.id);
    const motherResponses = siblings.flatMap((id) => input.responsesByUnit[id] ?? []);
    const prior = motherResponses.length
      ? pooledPrior(
        unitPosterior({
          unit: motherId ?? 'mother',
          leaf: input.leaf,
          responses: motherResponses,
          params,
        }).distribution,
        input.omega,
      )
      : undefined;
    result.set(unit.id, unitPosterior({
      unit: unit.id,
      leaf: input.leaf,
      responses,
      params,
      ...(prior ? { prior } : {}),
    }));
  }
  return result;
}

/** Distribuição unimodal centrada no índice (%) para agregar folhas já pooling. */
export function peakedDistribution(indexPercent: number): StageDistribution {
  const mode = Math.max(0, Math.min(4, Math.round(indexPercent / 25)));
  const raw = [0, 1, 2, 3, 4].map((stage) => Math.exp(-1.2 * Math.abs(stage - mode)));
  const total = raw.reduce((sum, value) => sum + value, 0) || 1;
  return raw.map((value) => value / total) as unknown as StageDistribution;
}
