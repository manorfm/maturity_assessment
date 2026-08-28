import type { InterventionDefinition } from './group-recommendation-engine.js';

export type CausalRelation = 'observed_as' | 'explained_by' | 'addressed_by' | 'grounded_in';
export type CausalEdge = { from: string; relation: CausalRelation; to: string };
export type CausalPath = { pattern: string; effect: string; cause: string; intervention: string; foundation: string; edges: CausalEdge[] };

export class CausalKnowledgeGraph {
  private constructor(private readonly paths: Map<string, CausalPath>) {}

  static from(interventions: Record<string, InterventionDefinition>): CausalKnowledgeGraph {
    const paths = new Map(Object.entries(interventions).map(([pattern, item]) => [pattern, {
      pattern, effect: item.title, cause: item.cause, intervention: item.action, foundation: item.foundation.source,
      edges: [
        { from: `behavior:${pattern}`, relation: 'observed_as', to: `effect:${pattern}` },
        { from: `effect:${pattern}`, relation: 'explained_by', to: `cause:${pattern}` },
        { from: `cause:${pattern}`, relation: 'addressed_by', to: `intervention:${pattern}` },
        { from: `intervention:${pattern}`, relation: 'grounded_in', to: `foundation:${item.foundation.source}` },
      ],
    } satisfies CausalPath]));
    return new CausalKnowledgeGraph(paths);
  }

  pathFor(pattern: string): CausalPath | undefined { return this.paths.get(pattern); }
  get size(): number { return this.paths.size; }
}
