import { entropy, type DiagnosticPosterior } from './bayesian-inference-engine.js';

export type QuestionOutcome = { probability: number; likelihoods: Record<string, number> };
export type QuestionCandidate = {
  id: string;
  cost: number;
  coverage: number;
  validationNeed: number;
  causalValue?: number;
  perspectiveBalance?: number;
  repetitionRisk?: number;
  outcomes: QuestionOutcome[];
  /** Tempo estimado do item em minutos (06 §2). Default derivado de `cost`. */
  minutes?: number;
  leafId?: string;
  testletId?: string;
  kind?: 'probe' | 'vignette';
};

export type RankedQuestion = QuestionCandidate & {
  informationGain: number;
  /** Utilidade em bits/minuto (06 §2). */
  utility: number;
  /** Alias de `utility` para compatibilidade com o journey service. */
  score: number;
  reasons: string[];
};

export type UnitSelectionState = {
  preferredIds?: readonly string[];
  leafCoverage?: Record<string, { testlets: number; perspectives: number }>;
  answeredTestlets?: ReadonlySet<string>;
  recentLeafIds?: readonly string[];
  remainingMinutes?: number;
  vignettesAsked?: number;
  perspective?: string;
  /** Peso relativo do diagnóstico causal (β), inicial 1.0. */
  beta?: number;
  leafWeights?: Record<string, number>;
};

/** @deprecated Use UnitSelectionState. */
export type SelectionPreference = UnitSelectionState;

const UTILITY_THRESHOLD = 0.01;

export class AdaptiveQuestionSelector {
  select(
    posterior: DiagnosticPosterior,
    candidates: QuestionCandidate[],
    state: UnitSelectionState = {},
  ): RankedQuestion | undefined {
    const eligible = this.filterConstraints(candidates, state);
    if (!eligible.length) return undefined;

    const sparse = sparseLeaves(state.leafCoverage);
    const coveragePool = sparse.length
      ? eligible.filter((candidate) => candidate.leafId && sparse.includes(candidate.leafId))
      : [];
    const restricted = coveragePool.length ? coveragePool : eligible;

    const preferred = new Set(state.preferredIds ?? []);
    const preferredPool = preferred.size
      ? restricted.filter((candidate) => preferred.has(candidate.id))
      : [];
    const pool = preferredPool.length ? preferredPool : restricted;

    const ranked = pool
      .map((candidate) => this.rank(posterior, candidate, state, sparse.includes(candidate.leafId ?? '')))
      .filter((item) => item.utility >= UTILITY_THRESHOLD)
      .sort((left, right) => right.utility - left.utility || right.informationGain - left.informationGain || left.id.localeCompare(right.id));

    return ranked[0];
  }

  private filterConstraints(candidates: QuestionCandidate[], state: UnitSelectionState): QuestionCandidate[] {
    const answered = state.answeredTestlets ?? new Set<string>();
    const recent = state.recentLeafIds ?? [];
    const remaining = state.remainingMinutes ?? Number.POSITIVE_INFINITY;
    const vignettesAsked = state.vignettesAsked ?? 0;

    return candidates.filter((candidate) => {
      const testlet = candidate.testletId ?? candidate.id;
      if (answered.has(testlet)) return false;
      if ((candidate.repetitionRisk ?? 0) >= 1) return false;
      const minutes = itemMinutes(candidate);
      if (minutes > remaining) return false;
      if (candidate.kind === 'vignette' && vignettesAsked >= 2) return false;
      if (candidate.leafId && recent.length >= 2 && recent.at(-1) === candidate.leafId && recent.at(-2) === candidate.leafId) {
        return false;
      }
      return true;
    });
  }

  private rank(
    posterior: DiagnosticPosterior,
    candidate: QuestionCandidate,
    state: UnitSelectionState,
    coversSparseLeaf: boolean,
  ): RankedQuestion {
    const informationGain = expectedInformationGain(posterior, candidate);
    const beta = state.beta ?? 1;
    const leafWeight = candidate.leafId ? (state.leafWeights?.[candidate.leafId] ?? 1) : 1;
    const leafGain = coversSparseLeaf ? leafWeight * Math.max(informationGain, 0.05) : 0;
    const causalGain = beta * informationGain;
    const minutes = itemMinutes(candidate);
    const utility = (causalGain + leafGain) / minutes;
    const reasons = [
      `Utilidade ${utility.toFixed(3)} bit/min (ΔH causal ${informationGain.toFixed(3)} bit · ${minutes.toFixed(1)} min).`,
    ];
    if (coversSparseLeaf) reasons.push('Prioriza folha da unidade com cobertura de testlets ou perspectivas incompleta.');
    if (state.preferredIds?.includes(candidate.id)) reasons.push('Prefere confirmar ou matar hipótese já reforçada.');
    return { ...candidate, informationGain, utility, score: utility, reasons };
  }
}

function expectedInformationGain(posterior: DiagnosticPosterior, candidate: QuestionCandidate): number {
  const expectedEntropy = candidate.outcomes.reduce((sum, outcome) => {
    const unnormalized = posterior.hypotheses.map((item) => item.probability * (outcome.likelihoods[item.id] ?? 1));
    const total = unnormalized.reduce((value, item) => value + item, 0);
    return sum + outcome.probability * entropy(unnormalized.map((item) => item / Math.max(Number.EPSILON, total)));
  }, 0);
  return Math.max(0, posterior.entropy - expectedEntropy);
}

function itemMinutes(candidate: QuestionCandidate): number {
  if (candidate.minutes !== undefined && Number.isFinite(candidate.minutes) && candidate.minutes > 0) {
    return candidate.minutes;
  }
  return Math.max(0.5, 0.5 + 2.5 * Math.max(0, Math.min(1, candidate.cost)));
}

function sparseLeaves(coverage?: Record<string, { testlets: number; perspectives: number }>): string[] {
  if (!coverage) return [];
  return Object.entries(coverage)
    .filter(([, value]) => value.testlets < 2 || value.perspectives < 2)
    .map(([leaf]) => leaf);
}
