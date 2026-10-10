import { CAUSAL_CATALOG_VERSION, causalCatalog } from './causal-catalog.js';
import { symptomIdForPattern, type CausalFamily } from './causal-family.js';
import type { DiagnosticPosterior, EvidenceObservation, HypothesisPosterior } from './bayesian-inference-engine.js';
import { entropy } from './bayesian-inference-engine.js';
import { inferNoisyOr, type NoisyOrCause, type NoisyOrSymptom, type SymptomCount } from './noisy-or.js';

export type CausalFamilyResult = {
  familyId: string;
  capability: string;
  modelVersion: string;
  posteriors: Record<string, number>;
  hypotheses: HypothesisPosterior[];
  evidenceUsed: string[];
  ignoredEvidence: string[];
  explanation: string[];
};

/**
 * Inferência causal por enumeração 2^K com noisy-OR e beta-binomial (05 §8).
 * Consome todos os sintomas observados — sem a regra "uma evidência por grupo".
 */
export class CausalInferenceEngine {
  inferFamily(family: CausalFamily, observations: Record<string, SymptomCount>): CausalFamilyResult {
    const causes: NoisyOrCause[] = family.causes.map((cause) => ({ id: cause.id, prior: cause.prior }));
    const symptoms: NoisyOrSymptom[] = family.symptoms.map((symptom) => ({
      id: symptom.id,
      leak: symptom.leak,
      strengthByCause: symptom.lambda,
    }));
    const posteriors = inferNoisyOr(causes, symptoms, observations, family.reporting);
    const evidenceUsed = Object.keys(observations).filter((id) => family.symptoms.some((symptom) => symptom.id === id));
    const hypotheses: HypothesisPosterior[] = family.causes
      .map((cause) => ({
        id: cause.id,
        label: cause.label,
        prior: cause.prior,
        probability: posteriors[cause.id] ?? 0,
      }))
      .sort((left, right) => right.probability - left.probability);
    return {
      familyId: family.id,
      capability: family.capability,
      modelVersion: CAUSAL_CATALOG_VERSION,
      posteriors,
      hypotheses,
      evidenceUsed,
      ignoredEvidence: [],
      explanation: [
        `Noisy-OR ${CAUSAL_CATALOG_VERSION} · ${family.provenance.rationale}`,
        ...evidenceUsed.map((id) => {
          const count = observations[id]!;
          return `Sintoma ${id}: ${count.present} de ${count.total} observadores aplicáveis.`;
        }),
      ],
    };
  }

  inferFromPatterns(
    family: CausalFamily,
    observations: Array<{ pattern: string; support: number; applicablePopulation: number }>,
  ): CausalFamilyResult {
    const counts: Record<string, SymptomCount> = {};
    for (const observation of observations) {
      const symptomId = symptomIdForPattern(family, observation.pattern);
      if (!symptomId) continue;
      const current = counts[symptomId] ?? { present: 0, total: 0 };
      current.present += observation.support;
      current.total += observation.applicablePopulation;
      counts[symptomId] = current;
    }
    return this.inferFamily(family, counts);
  }

  inferCatalog(observations: EvidenceObservation[]): DiagnosticPosterior[] {
    return causalCatalog.flatMap((family) => {
      const mapped = observations
        .map((observation) => ({
          pattern: observation.pattern,
          support: observation.support,
          applicablePopulation: observation.applicablePopulation,
          symptomId: symptomIdForPattern(family, observation.pattern),
        }))
        .filter((item) => item.symptomId);
      if (!mapped.length) return [];
      const result = this.inferFromPatterns(family, mapped);
      const support = Math.max(...mapped.map((item) => item.support));
      const applicable = Math.max(...mapped.map((item) => item.applicablePopulation));
      return [{
        familyId: result.familyId,
        capability: result.capability,
        modelVersion: result.modelVersion,
        hypotheses: result.hypotheses,
        entropy: entropy(result.hypotheses.map((item) => item.probability)),
        evidenceUsed: result.evidenceUsed,
        ignoredEvidence: result.ignoredEvidence,
        explanation: result.explanation,
        observability: Math.min(1, mapped.length / family.symptoms.length),
        population: { support, applicable, profiles: 0, layers: 0 },
      } satisfies DiagnosticPosterior];
    });
  }
}
