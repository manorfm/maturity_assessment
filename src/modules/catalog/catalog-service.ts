import { inTransaction, type Database } from '../../shared/database.js';
import { id } from '../../shared/ids.js';
import { edges, graph, GRAPH_VERSION, nodeVariants, type AssessmentEdge, type AssessmentNode, type Option } from './assessment-graph.js';

type NodeRow = { node_key: string; node_type: 'context' | 'scenario' | 'probe'; title: string; scenario: string; prompt: string };
type OptionRow = { option_key: string; label: string; capability: string | null; pattern: string | null; weight: number | null };

export class CatalogService {
  constructor(private readonly db: Database) { this.seed(); }

  private seed(): void {
    const exists = this.db.prepare('SELECT 1 FROM assessment_graph_versions WHERE version = ?').get(GRAPH_VERSION);
    if (exists) return;
    validateGraphDefinition(graph, edges, graph[0]!.id);
    inTransaction(this.db, () => {
      this.db.prepare('INSERT INTO assessment_graph_versions (version, title, status, entry_node_key, published_at) VALUES (?, ?, ?, ?, ?)')
        .run(GRAPH_VERSION, 'Entrega e observabilidade', 'published', graph[0]!.id, new Date().toISOString());
      graph.forEach((node, position) => {
        this.db.prepare('INSERT INTO assessment_nodes (graph_version, node_key, node_type, title, scenario, prompt, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(GRAPH_VERSION, node.id, node.type ?? 'scenario', node.title, node.scenario, node.prompt, position);
        node.options.forEach((option, optionPosition) => {
          this.db.prepare('INSERT INTO assessment_options (graph_version, node_key, option_key, label, position) VALUES (?, ?, ?, ?, ?)')
            .run(GRAPH_VERSION, node.id, option.id, option.label, optionPosition);
          for (const signal of option.signals) {
            this.db.prepare('INSERT INTO assessment_signals (id, graph_version, node_key, option_key, capability, pattern, weight) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .run(id(), GRAPH_VERSION, node.id, option.id, signal.capability, signal.pattern, signal.weight);
          }
        });
      });
      nodeVariants.forEach((variant) => this.db.prepare('INSERT INTO assessment_node_variants (graph_version, node_key, profile, title, scenario, prompt) VALUES (?, ?, ?, ?, ?, ?)')
        .run(GRAPH_VERSION, variant.nodeId, variant.profile, variant.title ?? null, variant.scenario, variant.prompt ?? null));
      edges.forEach((edge, position) => this.db.prepare('INSERT INTO assessment_edges (id, graph_version, from_node_key, option_key, to_node_key, priority) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id(), GRAPH_VERSION, edge.from, edge.optionId ?? null, edge.to, position));
    });
  }

  entryNode(version = GRAPH_VERSION): string {
    const row = this.db.prepare("SELECT entry_node_key FROM assessment_graph_versions WHERE version = ? AND status = 'published'").get(version) as { entry_node_key: string } | undefined;
    if (!row) throw new Error(`Published graph not found: ${version}`);
    return row.entry_node_key;
  }

  getNode(version: string, nodeKey: string, profile?: string): AssessmentNode | undefined {
    const row = this.db.prepare('SELECT node_key, node_type, title, scenario, prompt FROM assessment_nodes WHERE graph_version = ? AND node_key = ?')
      .get(version, nodeKey) as NodeRow | undefined;
    if (!row) return undefined;
    const optionRows = this.db.prepare(`
      SELECT o.option_key, o.label, s.capability, s.pattern, s.weight
      FROM assessment_options o LEFT JOIN assessment_signals s
        ON s.graph_version = o.graph_version AND s.node_key = o.node_key AND s.option_key = o.option_key
      WHERE o.graph_version = ? AND o.node_key = ? ORDER BY o.position, s.id
    `).all(version, nodeKey) as unknown as OptionRow[];
    const options = new Map<string, Option>();
    for (const option of optionRows) {
      const current = options.get(option.option_key) ?? { id: option.option_key, label: option.label, signals: [] };
      if (option.pattern && option.capability && option.weight !== null) current.signals.push({ capability: option.capability, pattern: option.pattern, weight: Number(option.weight) });
      options.set(option.option_key, current);
    }
    const variant = profile ? this.db.prepare('SELECT title, scenario, prompt FROM assessment_node_variants WHERE graph_version = ? AND node_key = ? AND profile = ?')
      .get(version, nodeKey, profile) as { title: string | null; scenario: string; prompt: string | null } | undefined : undefined;
    return {
      id: row.node_key,
      type: row.node_type,
      title: variant?.title ?? row.title,
      scenario: variant?.scenario ?? row.scenario,
      prompt: variant?.prompt ?? row.prompt,
      options: [...options.values()],
    };
  }

  nextNode(version: string, nodeKey: string, optionKey: string): string | undefined {
    const row = this.db.prepare(`
      SELECT to_node_key FROM assessment_edges
      WHERE graph_version = ? AND from_node_key = ? AND (option_key = ? OR option_key IS NULL)
      ORDER BY CASE WHEN option_key = ? THEN 0 ELSE 1 END, priority LIMIT 1
    `).get(version, nodeKey, optionKey, optionKey) as { to_node_key: string } | undefined;
    return row?.to_node_key;
  }

}

export function validateGraphDefinition(nodes: AssessmentNode[], graphEdges: AssessmentEdge[], entryNode: string): void {
  const keys = new Set(nodes.map((node) => node.id));
  if (keys.size !== nodes.length) throw new Error('Graph contains duplicate node keys');
  if (!keys.has(entryNode)) throw new Error('Graph entry node does not exist');
  for (const edge of graphEdges) {
    if (!keys.has(edge.from) || !keys.has(edge.to)) throw new Error(`Graph edge references unknown node: ${edge.from} -> ${edge.to}`);
    if (edge.optionId && !nodes.find((node) => node.id === edge.from)?.options.some((option) => option.id === edge.optionId)) {
      throw new Error(`Graph edge references unknown option: ${edge.from}/${edge.optionId}`);
    }
  }
  const reachable = new Set<string>();
  const visiting = new Set<string>();
  const visit = (nodeKey: string) => {
    if (visiting.has(nodeKey)) throw new Error(`Graph contains a cycle at ${nodeKey}`);
    if (reachable.has(nodeKey)) return;
    visiting.add(nodeKey);
    for (const edge of graphEdges.filter((item) => item.from === nodeKey)) visit(edge.to);
    visiting.delete(nodeKey);
    reachable.add(nodeKey);
  };
  visit(entryNode);
  const unreachable = nodes.filter((node) => !reachable.has(node.id)).map((node) => node.id);
  if (unreachable.length) throw new Error(`Graph contains unreachable nodes: ${unreachable.join(', ')}`);
  for (const node of nodes) {
    const outgoing = graphEdges.filter((edge) => edge.from === node.id);
    if (outgoing.length === 0) continue;
    const optionEdges = new Set(outgoing.flatMap((edge) => edge.optionId ? [edge.optionId] : []));
    const hasDefault = outgoing.some((edge) => !edge.optionId);
    if (!hasDefault && node.options.some((option) => !optionEdges.has(option.id))) throw new Error(`Graph node has options without an exit: ${node.id}`);
  }
}
