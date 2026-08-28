import { entropy, type DiagnosticPosterior } from './bayesian-inference-engine.js';

export type QuestionOutcome = { probability: number; likelihoods: Record<string, number> };
export type QuestionCandidate = { id: string; cost: number; coverage: number; validationNeed: number; causalValue?: number; perspectiveBalance?: number; repetitionRisk?: number; outcomes: QuestionOutcome[] };
export type RankedQuestion = QuestionCandidate & { informationGain: number; score: number; reasons: string[] };

export class AdaptiveQuestionSelector {
  select(posterior: DiagnosticPosterior, candidates: QuestionCandidate[]): RankedQuestion | undefined {
    return candidates.map((candidate) => this.rank(posterior, candidate))
      .sort((left, right) => right.score - left.score || right.informationGain - left.informationGain || left.id.localeCompare(right.id))[0];
  }

  private rank(posterior: DiagnosticPosterior, candidate: QuestionCandidate): RankedQuestion {
    const expectedEntropy = candidate.outcomes.reduce((sum, outcome) => {
      const unnormalized = posterior.hypotheses.map((item) => item.probability * (outcome.likelihoods[item.id] ?? 1));
      const total = unnormalized.reduce((value, item) => value + item, 0);
      return sum + outcome.probability * entropy(unnormalized.map((item) => item / Math.max(Number.EPSILON, total)));
    }, 0);
    const maximumEntropy = Math.log2(Math.max(2, posterior.hypotheses.length));
    const informationGain = Math.max(0, posterior.entropy - expectedEntropy);
    const normalizedGain = informationGain / maximumEntropy;
    const causalValue = bounded(candidate.causalValue ?? candidate.validationNeed);
    const perspectiveBalance = bounded(candidate.perspectiveBalance ?? 0);
    const repetitionPenalty = bounded(candidate.repetitionRisk ?? 0);
    const score = .4 * normalizedGain + .2 * bounded(candidate.coverage) + .15 * bounded(candidate.validationNeed)
      + .1 * causalValue + .1 * perspectiveBalance + .05 * (1 - bounded(candidate.cost)) - .1 * repetitionPenalty;
    return { ...candidate, informationGain, score, reasons: [`Ganho esperado de ${informationGain.toFixed(3)} bit.`, `Cobertura ${percent(candidate.coverage)}, validação ${percent(candidate.validationNeed)}, valor causal ${percent(causalValue)}, equilíbrio de perspectiva ${percent(perspectiveBalance)}, repetição ${percent(repetitionPenalty)} e custo ${percent(candidate.cost)}.`] };
  }
}
function bounded(value: number): number { return Math.max(0, Math.min(1, value)); }
function percent(value: number): string { return `${Math.round(bounded(value) * 100)}%`; }
