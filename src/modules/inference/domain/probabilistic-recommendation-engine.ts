import type { DiagnosticPosterior } from './bayesian-inference-engine.js';

export type ProbabilisticIntervention = { id: string; hypothesisId: string; title: string; action: string; prerequisites: string[]; incompatibleContexts?: string[]; owner: string; metric: string; reviewHorizon: string; successCriterion: string };
export type ProbabilisticRecommendation = ProbabilisticIntervention & { confidence: number; status: 'recommended' | 'validate'; missingPrerequisites: string[] };

export class ProbabilisticRecommendationEngine {
  constructor(private readonly interventions: ProbabilisticIntervention[]) {}

  recommend(posterior: DiagnosticPosterior, availablePrerequisites: Set<string>, contexts: Set<string> = new Set()): ProbabilisticRecommendation[] {
    return this.interventions.flatMap((intervention) => {
      const hypothesis = posterior.hypotheses.find((item) => item.id === intervention.hypothesisId);
      if (!hypothesis || hypothesis.probability < .5 || intervention.incompatibleContexts?.some((item) => contexts.has(item))) return [];
      const missingPrerequisites = intervention.prerequisites.filter((item) => !availablePrerequisites.has(item));
      if (missingPrerequisites.length) return [];
      const status: ProbabilisticRecommendation['status'] = hypothesis.probability >= .7 ? 'recommended' : 'validate';
      return [{ ...intervention, confidence: hypothesis.probability, status, missingPrerequisites }];
    }).sort((left, right) => right.confidence - left.confidence || left.id.localeCompare(right.id));
  }
}
