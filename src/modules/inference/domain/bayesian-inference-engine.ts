import type { DiagnosticModel, HypothesisDefinition } from './diagnostic-model.js';

export type HypothesisPosterior = { id: string; label: string; probability: number; prior: number };
export type EvidenceObservation = { pattern: string; support: number; applicablePopulation: number; profiles: string[]; layers: string[] };
export type DiagnosticPosterior = {
  familyId: string; capability: string; modelVersion: string; hypotheses: HypothesisPosterior[];
  entropy: number; evidenceUsed: string[]; ignoredEvidence: string[]; explanation: string[];
  observability: number; population?: { support: number; applicable: number; profiles: number; layers: number };
  nextQuestionKey?: string; nextQuestionLabel?: string;
};

export class BayesianInferenceEngine {
  infer(model: DiagnosticModel, input: string[] | EvidenceObservation[]): DiagnosticPosterior[] {
    const observations = input.map((item): EvidenceObservation => typeof item === 'string'
      ? { pattern: item, support: 1, applicablePopulation: 1, profiles: ['synthetic-a', 'synthetic-b'], layers: ['practice', 'outcome'] }
      : item);
    return model.families.map((family) => {
      const evidenceByPattern = new Map(family.evidence.map((item) => [item.pattern, item]));
      const usedGroups = new Set<string>();
      const evidenceUsed: string[] = [];
      const ignoredEvidence: string[] = [];
      const selected = observations.flatMap((observation) => {
        const evidence = evidenceByPattern.get(observation.pattern);
        if (!evidence) return [];
        if (usedGroups.has(evidence.group)) { ignoredEvidence.push(observation.pattern); return []; }
        usedGroups.add(evidence.group);
        evidenceUsed.push(observation.pattern);
        return [{ evidence, observation }];
      });
      const observability = selected.length ? Math.max(...selected.map(({ observation }) => observationQuality(observation))) : 0;
      const priors = adaptivePriors(family.hypotheses, observability, selected.length > 0);
      const logs = family.hypotheses.map((hypothesis) => Math.log(priors.get(hypothesis.id)!)
        + selected.reduce((sum, { evidence, observation }) => sum + evidenceStrength(observation) * Math.log(evidence.likelihoods[hypothesis.id]!), 0));
      const probabilities = softmax(logs);
      const hypotheses = family.hypotheses.map((hypothesis, index) => posterior(hypothesis, probabilities[index]!))
        .sort((left, right) => right.probability - left.probability);
      const population = populationOf(selected.map((item) => item.observation), family);
      return {
        familyId: family.id, capability: family.capability, modelVersion: model.version, hypotheses,
        entropy: entropy(hypotheses.map((item) => item.probability)), evidenceUsed, ignoredEvidence, observability,
        ...(population ? { population } : {}),
        explanation: [`Priors especialistas da versão ${model.version}, ajustados pela observabilidade.`, ...selected.map(({ observation }) => `Evidência ${observation.pattern}: ${observation.support} de ${observation.applicablePopulation} observadores aplicáveis.`), ...ignoredEvidence.map((pattern) => `Evidência correlacionada ignorada: ${pattern}.`)],
      };
    });
  }
}

function observationQuality(observation: EvidenceObservation): number {
  const profileCoverage = Math.min(1, observation.profiles.length / 2);
  const layerCoverage = Math.min(1, observation.layers.length / 2);
  return clamp(.5 * profileCoverage + .5 * layerCoverage);
}

function evidenceStrength(observation: EvidenceObservation): number {
  const prevalence = observation.support / Math.max(1, observation.applicablePopulation);
  return Math.max(.05, prevalence * Math.min(3, Math.sqrt(Math.max(1, observation.support))) * (.75 + .25 * observationQuality(observation)));
}

function adaptivePriors(hypotheses: HypothesisDefinition[], observability: number, hasEvidence: boolean): Map<string, number> {
  if (!hasEvidence) return new Map(hypotheses.map((item) => [item.id, item.prior]));
  const unknown = hypotheses.find((item) => item.id === 'unknown');
  if (!unknown) return new Map(hypotheses.map((item) => [item.id, item.prior]));
  const unknownPrior = .65 - .4 * observability;
  const known = hypotheses.filter((item) => item.id !== 'unknown');
  const knownTotal = known.reduce((sum, item) => sum + item.prior, 0);
  return new Map([...known.map((item) => [item.id, (1 - unknownPrior) * item.prior / knownTotal] as const), ['unknown', unknownPrior]]);
}

function populationOf(observations: EvidenceObservation[], family?: { hypotheses: HypothesisDefinition[]; evidence: Array<{ pattern: string }> }): DiagnosticPosterior['population'] {
  if (!observations.length) return undefined;
  const causeIds = new Set((family?.hypotheses ?? []).filter((item) => item.id !== 'unknown' && (family?.evidence.some((evidence) => evidence.pattern === item.id) ?? false)).map((item) => item.id));
  const causal = causeIds.size ? observations.filter((item) => causeIds.has(item.pattern)) : observations;
  if (!causal.length) return undefined;
  const strongest = [...causal].sort((left, right) => right.support - left.support)[0]!;
  return { support: strongest.support, applicable: strongest.applicablePopulation, profiles: strongest.profiles.length, layers: strongest.layers.length };
}

function posterior(hypothesis: HypothesisDefinition, value: number): HypothesisPosterior { return { id: hypothesis.id, label: hypothesis.label, prior: hypothesis.prior, probability: value }; }
function softmax(logs: number[]): number[] { const maximum = Math.max(...logs); const values = logs.map((value) => Math.exp(value - maximum)); const total = values.reduce((sum, value) => sum + value, 0); return values.map((value) => value / total); }
export function entropy(probabilities: number[]): number { return -probabilities.reduce((sum, value) => sum + (value > 0 ? value * Math.log2(value) : 0), 0); }
function clamp(value: number): number { return Math.max(0, Math.min(1, value)); }
