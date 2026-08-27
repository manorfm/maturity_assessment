import type { DiagnosticModel, HypothesisDefinition } from './diagnostic-model.js';

export type HypothesisPosterior = { id: string; label: string; probability: number; prior: number };
export type DiagnosticPosterior = {
  familyId: string; capability: string; modelVersion: string; hypotheses: HypothesisPosterior[];
  entropy: number; evidenceUsed: string[]; ignoredEvidence: string[]; explanation: string[];
};

export class BayesianInferenceEngine {
  infer(model: DiagnosticModel, observedPatterns: string[]): DiagnosticPosterior[] {
    return model.families.map((family) => {
      const evidenceByPattern = new Map(family.evidence.map((item) => [item.pattern, item]));
      const usedGroups = new Set<string>();
      const evidenceUsed: string[] = [];
      const ignoredEvidence: string[] = [];
      const selected = observedPatterns.flatMap((pattern) => {
        const evidence = evidenceByPattern.get(pattern);
        if (!evidence) return [];
        if (usedGroups.has(evidence.group)) { ignoredEvidence.push(pattern); return []; }
        usedGroups.add(evidence.group);
        evidenceUsed.push(pattern);
        return [evidence];
      });
      const logs = family.hypotheses.map((hypothesis) => Math.log(hypothesis.prior)
        + selected.reduce((sum, evidence) => sum + Math.log(evidence.likelihoods[hypothesis.id]!), 0));
      const probabilities = softmax(logs);
      const hypotheses = family.hypotheses.map((hypothesis, index) => posterior(hypothesis, probabilities[index]!))
        .sort((left, right) => right.probability - left.probability);
      return {
        familyId: family.id, capability: family.capability, modelVersion: model.version, hypotheses,
        entropy: entropy(hypotheses.map((item) => item.probability)), evidenceUsed, ignoredEvidence,
        explanation: [`Priors especialistas da versão ${model.version}.`, ...evidenceUsed.map((pattern) => `Evidência aplicada: ${pattern}.`), ...ignoredEvidence.map((pattern) => `Evidência correlacionada ignorada: ${pattern}.`)],
      };
    });
  }
}

function posterior(hypothesis: HypothesisDefinition, value: number): HypothesisPosterior { return { id: hypothesis.id, label: hypothesis.label, prior: hypothesis.prior, probability: value }; }
function softmax(logs: number[]): number[] { const maximum = Math.max(...logs); const values = logs.map((value) => Math.exp(value - maximum)); const total = values.reduce((sum, value) => sum + value, 0); return values.map((value) => value / total); }
export function entropy(probabilities: number[]): number { return -probabilities.reduce((sum, value) => sum + (value > 0 ? value * Math.log2(value) : 0), 0); }
