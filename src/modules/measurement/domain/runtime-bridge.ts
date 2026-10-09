import { defaultMeasurementParams, type MeasurementParams } from './measurement-params.js';
import type { RespondentBundle } from './observation-model.js';
import { publishUnitReading, type PublicationDecision, type Publishability } from './publication-rule.js';
import { unitPosterior, type UnitPosterior } from './unit-posterior.js';

export type LeafPublication = {
  publishable: Publishability;
  index: number;
  band: [number, number];
  coverage: number;
  reason?: string;
};

export type LeafMeasurement = {
  posterior: UnitPosterior;
  decision: PublicationDecision;
  publication: LeafPublication;
};

/** Mede uma folha a partir de pacotes de respondentes (05 §3–§6). */
export function measureLeafFromBundles(input: {
  unit: string;
  leaf: string;
  responses: RespondentBundle[];
  params?: MeasurementParams;
  deltas?: Record<string, number>;
  applyGates?: boolean;
  coverage: number;
  singleLens?: boolean;
}): LeafMeasurement {
  const posterior = unitPosterior({
    unit: input.unit,
    leaf: input.leaf,
    responses: input.responses,
    params: input.params ?? defaultMeasurementParams(),
    ...(input.deltas ? { deltas: input.deltas } : {}),
    ...(input.applyGates !== undefined ? { applyGates: input.applyGates } : {}),
  });
  const decision = publishUnitReading({
    posterior,
    respondents: posterior.respondents,
    testlets: posterior.testlets,
    perspectives: posterior.perspectives,
    coverage: input.coverage,
    ...(input.singleLens !== undefined ? { singleLens: input.singleLens } : {}),
  });
  return {
    posterior,
    decision,
    publication: toLeafPublication(decision, posterior, input.coverage),
  };
}

export function toLeafPublication(
  decision: PublicationDecision,
  posterior: UnitPosterior,
  coverage: number,
): LeafPublication {
  if (decision.publishable === 'published') {
    return {
      publishable: 'published',
      index: posterior.index,
      band: posterior.interval90,
      coverage,
    };
  }
  const reason = decision.publishable === 'observed-imprecise'
    ? 'Faixa larga demais para publicar índice.'
    : decision.reasons[0] === 'respondents-below-5'
      ? 'Menos de 5 respondentes neste recorte.'
      : decision.reasons[0] === 'testlets-below-2'
        ? 'Menos de 2 testlets distintos.'
        : decision.reasons[0] === 'perspectives-below-2'
          ? 'Menos de 2 perspectivas elegíveis.'
          : 'Ainda não há amostra suficiente para publicar índice.';
  return {
    publishable: decision.publishable,
    index: posterior.index,
    band: posterior.interval90,
    coverage,
    reason,
  };
}
