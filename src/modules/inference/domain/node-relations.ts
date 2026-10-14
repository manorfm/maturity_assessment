import { graph } from '../../catalog/assessment-graph.js';
import { CapabilityTaxonomy, capabilityLeafIds } from './capability-taxonomy.js';
import { patternFeeds } from './discipline-crossing.js';
import { enablementCatalog } from './learning-frontier.js';

export const nodeEdgeKinds = ['evidencia', 'amplifica', 'bloqueia', 'depende-de'] as const;

export type NodeEdgeKind = (typeof nodeEdgeKinds)[number];

export type FichaRelation = {
  kind: NodeEdgeKind;
  otherId: string;
  otherLabel: string;
  text: string;
};

export type FichaRelations =
  | { published: false; body: string }
  | { published: true; edges: FichaRelation[] };

type GraphEdge = { kind: NodeEdgeKind; fromId: string; toId: string };

const relationsGap = 'O grafo não ligou este nó.';

const leaves = new Set(capabilityLeafIds);

function kindRank(kind: NodeEdgeKind): number {
  return nodeEdgeKinds.indexOf(kind);
}

export function projectNodeRelations(nodeId: string | undefined): FichaRelations {
  if (!nodeId) return { published: false, body: relationsGap };
  const edges = publishedEdges()
    .filter((edge) => edge.fromId === nodeId || edge.toId === nodeId)
    .map((edge) => relationFor(nodeId, edge));
  const unique = dedupe(edges).sort(compareRelations);
  if (!unique.length) return { published: false, body: relationsGap };
  return { published: true, edges: unique };
}

function relationFor(nodeId: string, edge: GraphEdge): FichaRelation {
  const outgoing = edge.fromId === nodeId;
  const otherId = outgoing ? edge.toId : edge.fromId;
  const otherLabel = CapabilityTaxonomy.labelFor(otherId);
  const text = outgoing ? `${edge.kind} ${otherLabel}` : `${otherLabel} ${edge.kind} este nó`;
  return { kind: edge.kind, otherId, otherLabel, text };
}

function dedupe(edges: FichaRelation[]): FichaRelation[] {
  const seen = new Set<string>();
  const unique: FichaRelation[] = [];
  for (const edge of edges) {
    const key = `${edge.kind}\0${edge.otherId}\0${edge.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(edge);
  }
  return unique;
}

function compareRelations(left: FichaRelation, right: FichaRelation): number {
  const byKind = kindRank(left.kind) - kindRank(right.kind);
  if (byKind) return byKind;
  const byLabel = left.otherLabel.localeCompare(right.otherLabel, 'pt-BR');
  if (byLabel) return byLabel;
  return left.text.localeCompare(right.text, 'pt-BR');
}

let cached: GraphEdge[] | undefined;

function publishedEdges(): GraphEdge[] {
  if (cached) return cached;
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const add = (edge: GraphEdge) => {
    if (edge.fromId === edge.toId || !leaves.has(edge.fromId) || !leaves.has(edge.toId)) return;
    const key = `${edge.kind}|${edge.fromId}|${edge.toId}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push(edge);
  };
  for (const dependency of enablementCatalog) {
    add({ kind: 'depende-de', fromId: dependency.toLeafId, toId: dependency.fromLeafId });
  }
  const leafOf = primaryLeafByPattern();
  for (const feed of patternFeeds()) {
    const fromId = leafOf.get(feed.from);
    const toId = leafOf.get(feed.to);
    if (!fromId || !toId) continue;
    add({ kind: 'amplifica', fromId, toId });
  }
  cached = edges;
  return edges;
}

function primaryLeafByPattern(): Map<string, string> {
  const counts = new Map<string, Map<string, number>>();
  for (const node of graph) {
    for (const option of node.options) {
      for (const signal of option.signals) {
        const leaf = signal.details[0];
        if (!leaf || !leaves.has(leaf)) continue;
        const bucket = counts.get(signal.pattern) ?? new Map<string, number>();
        bucket.set(leaf, (bucket.get(leaf) ?? 0) + 1);
        counts.set(signal.pattern, bucket);
      }
    }
  }
  const chosen = new Map<string, string>();
  for (const [pattern, bucket] of counts) {
    const ranked = [...bucket.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
    const winner = ranked[0]?.[0];
    if (winner) chosen.set(pattern, winner);
  }
  return chosen;
}
