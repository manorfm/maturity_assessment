import type { InterventionDefinition } from './group-recommendation-engine.js';
import { diagnosticSystemFor } from './problem-system.js';
import { hasTechnicalContract } from './technical-practice-library.js';

export const CAUSAL_KNOWLEDGE_VERSION = 'causal-catalog-v7';

export type CausalRelation = 'observed_as' | 'may_be_explained_by' | 'supported_by' | 'contradicted_by' | 'addressed_by' | 'grounded_in' | 'may_enable';
export type CausalEdge = { from: string; relation: CausalRelation; to: string };
export type CausalPath = {
  pattern: string;
  effect: string;
  cause: string;
  intervention: string;
  foundation: string;
  knowledgeVersion: string;
  competingHypotheses: string[];
  evidenceFor: string[];
  evidenceAgainst: string[];
  limitations: string;
  edges: CausalEdge[];
};

export class CausalKnowledgeGraph {
  private constructor(private readonly paths: Map<string, CausalPath>) {}

  static from(interventions: Record<string, InterventionDefinition>): CausalKnowledgeGraph {
    const paths = new Map(Object.entries(interventions).map(([pattern, item]) => {
      const system = diagnosticSystemFor(pattern);
      const competingHypotheses = (system?.hypotheses ?? []).filter((hypothesis) => hypothesis !== pattern && interventions[hypothesis]);
      const evidenceFor = [...new Set(item.evidencePatterns)];
      const evidenceAgainst = [...new Set(item.contradictionPatterns)];
      return [pattern, {
        pattern, effect: item.title, cause: item.cause, intervention: item.action, foundation: item.foundation.source,
        knowledgeVersion: CAUSAL_KNOWLEDGE_VERSION, competingHypotheses, evidenceFor, evidenceAgainst,
        limitations: item.guidance?.doesNotSolve ?? 'Não autoriza ampliar a solução sem validar contexto, pré-condições e risco deslocado.',
        edges: [
        { from: `behavior:${pattern}`, relation: 'observed_as', to: `effect:${pattern}` },
        { from: `effect:${pattern}`, relation: 'may_be_explained_by', to: `cause:${pattern}` },
        ...evidenceFor.map((evidence) => ({ from: `cause:${pattern}`, relation: 'supported_by' as const, to: `evidence:${evidence}` })),
        ...evidenceAgainst.map((evidence) => ({ from: `cause:${pattern}`, relation: 'contradicted_by' as const, to: `evidence:${evidence}` })),
        { from: `cause:${pattern}`, relation: 'addressed_by', to: `intervention:${pattern}` },
        ...(hasTechnicalContract(pattern) ? [{ from: `cause:${pattern}`, relation: 'may_enable' as const, to: `technical-contract:${pattern}` }] : []),
        { from: `intervention:${pattern}`, relation: 'grounded_in', to: `foundation:${item.foundation.source}` },
      ],
      } satisfies CausalPath];
    }));
    return new CausalKnowledgeGraph(paths);
  }

  pathFor(pattern: string): CausalPath | undefined { return this.paths.get(pattern); }
  get size(): number { return this.paths.size; }
}
