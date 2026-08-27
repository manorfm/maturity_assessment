import { inTransaction, type Database } from '../../shared/database.js';
import { id } from '../../shared/ids.js';
import { edges, graph, GRAPH_VERSION, nodeVariants, observationOf, type AssessmentEdge, type AssessmentNode, type ObservationKind, type Option, type Signal } from './assessment-graph.js';
import { capabilityLeafIds } from '../inference/domain/capability-taxonomy.js';
import { PILOT_THRESHOLDS } from '../inference/domain/pilot-policy.js';

type NodeRow = { node_key: string; node_type: 'context' | 'scenario' | 'probe'; title: string; scenario: string; prompt: string };
type OptionRow = { option_key: string; label: string; observation_kind: string | null; capability: string | null; pattern: string | null; weight: number | null; detail_capabilities: string | null; evidence_layer: string | null; constraint_kind: string | null };

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
          this.db.prepare('INSERT INTO assessment_options (graph_version, node_key, option_key, label, position, observation_kind) VALUES (?, ?, ?, ?, ?, ?)')
            .run(GRAPH_VERSION, node.id, option.id, option.label, optionPosition, observationOf(option));
          for (const signal of option.signals) {
            this.db.prepare('INSERT INTO assessment_signals (id, graph_version, node_key, option_key, capability, pattern, weight, detail_capabilities, evidence_layer, constraint_kind) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
              .run(id(), GRAPH_VERSION, node.id, option.id, signal.capability, signal.pattern, signal.weight, JSON.stringify(signal.details), signal.layer, signal.constraint);
          }
        });
      });
      nodeVariants.forEach((variant) => this.db.prepare('INSERT INTO assessment_node_variants (graph_version, node_key, profile, title, scenario, prompt) VALUES (?, ?, ?, ?, ?, ?)')
        .run(GRAPH_VERSION, variant.nodeId, variant.profile, variant.title ?? null, variant.scenario, variant.prompt ?? null));
      edges.forEach((edge, position) => this.db.prepare('INSERT INTO assessment_edges (id, graph_version, from_node_key, option_key, to_node_key, priority, profile) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id(), GRAPH_VERSION, edge.from, edge.optionId ?? null, edge.to, position, edge.profile ?? null));
      this.seedDiagnosticModel();
    });
  }

  private seedDiagnosticModel(): void {
    const modelVersion = `${GRAPH_VERSION}-bayesian-v2`;
    this.db.prepare('INSERT INTO inference_model_versions (version, graph_version, status, policy_json, published_at) VALUES (?, ?, ?, ?, ?)')
      .run(modelVersion, GRAPH_VERSION, 'published', JSON.stringify({
        informationGain: .5, coverage: .25, validation: .15, inverseCost: .1, minimumInformationGainBits: .01, recommendationThreshold: .7,
        pilot: PILOT_THRESHOLDS,
      }), new Date().toISOString());
    const patternsByCapability = new Map<string, Set<string>>();
    for (const node of graph) for (const option of node.options) for (const signal of option.signals) {
      const isCausal = signal.pattern.startsWith('causa-') || signal.constraint !== 'none' || (signal.layer === 'system' && signal.weight < 1);
      if (!isCausal) continue;
      for (const capability of signal.details) {
        const patterns = patternsByCapability.get(capability) ?? new Set<string>();
        patterns.add(signal.pattern);
        patternsByCapability.set(capability, patterns);
      }
    }
    for (const [capability, patternSet] of patternsByCapability) {
      const patterns = [...patternSet];
      for (const pattern of patterns) {
        const family = `${capability}:${pattern}`;
        this.db.prepare('INSERT INTO diagnostic_hypotheses (model_version, family_key, capability, hypothesis_key, label, prior) VALUES (?, ?, ?, ?, ?, ?)')
          .run(modelVersion, family, capability, pattern, pattern, .5);
        this.db.prepare('INSERT INTO diagnostic_hypotheses (model_version, family_key, capability, hypothesis_key, label, prior) VALUES (?, ?, ?, ?, ?, ?)')
          .run(modelVersion, family, capability, 'unknown', 'Evidência insuficiente para confirmar esta causa', .5);
        this.db.prepare('INSERT INTO evidence_likelihoods (model_version, family_key, pattern, evidence_group, hypothesis_key, likelihood) VALUES (?, ?, ?, ?, ?, ?)')
          .run(modelVersion, family, pattern, `cause:${pattern}`, pattern, .9);
        this.db.prepare('INSERT INTO evidence_likelihoods (model_version, family_key, pattern, evidence_group, hypothesis_key, likelihood) VALUES (?, ?, ?, ?, ?, ?)')
          .run(modelVersion, family, pattern, `cause:${pattern}`, 'unknown', .25);
        const originNode = graph.find((node) => node.options.some((option) => option.signals.some((signal) => signal.pattern === pattern)));
        for (const symptom of originNode ? applicabilityPatternsFor(originNode.id) : []) {
          this.db.prepare('INSERT INTO evidence_likelihoods (model_version, family_key, pattern, evidence_group, hypothesis_key, likelihood) VALUES (?, ?, ?, ?, ?, ?)')
            .run(modelVersion, family, symptom, `symptom:${symptom}`, pattern, .6);
          this.db.prepare('INSERT INTO evidence_likelihoods (model_version, family_key, pattern, evidence_group, hypothesis_key, likelihood) VALUES (?, ?, ?, ?, ?, ?)')
            .run(modelVersion, family, symptom, `symptom:${symptom}`, 'unknown', .45);
        }
      }
    }
    const allProfiles = ['management', 'product', 'quality', 'engineering', 'platform'];
    for (const node of graph) {
      const variantProfiles = nodeVariants.filter((variant) => variant.nodeId === node.id).map((variant) => variant.profile);
      const applicabilityPatterns = applicabilityPatternsFor(node.id);
      this.db.prepare('INSERT INTO question_observations (model_version, node_key, profiles_json, applicability_patterns_json, cost) VALUES (?, ?, ?, ?, ?)')
        .run(modelVersion, node.id, JSON.stringify(variantProfiles.length ? variantProfiles : allProfiles), JSON.stringify(applicabilityPatterns), node.type === 'probe' ? .6 : .35);
    }
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
      SELECT o.option_key, o.label, o.observation_kind, s.capability, s.pattern, s.weight, s.detail_capabilities, s.evidence_layer, s.constraint_kind
      FROM assessment_options o LEFT JOIN assessment_signals s
        ON s.graph_version = o.graph_version AND s.node_key = o.node_key AND s.option_key = o.option_key
      WHERE o.graph_version = ? AND o.node_key = ? ORDER BY o.position, s.id
    `).all(version, nodeKey) as unknown as OptionRow[];
    const options = new Map<string, Option>();
    for (const option of optionRows) {
      const current = options.get(option.option_key) ?? {
        id: option.option_key,
        label: option.label,
        signals: [] as Signal[],
        observation: (option.observation_kind === 'visibility' || option.observation_kind === 'not_applicable' ? option.observation_kind : 'practice') as ObservationKind,
      };
      if (option.pattern && option.capability && option.weight !== null && option.detail_capabilities && option.evidence_layer && option.constraint_kind) {
        const storedSignal: Option['signals'][number] = {
          capability: option.capability, pattern: option.pattern, weight: Number(option.weight),
          details: JSON.parse(option.detail_capabilities) as string[],
          layer: option.evidence_layer as Option['signals'][number]['layer'],
          constraint: option.constraint_kind as Option['signals'][number]['constraint'],
        };
        current.signals.push(storedSignal);
      }
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

  nextNode(version: string, nodeKey: string, optionKey: string, profile?: string): string | undefined {
    const row = this.db.prepare(`
      SELECT to_node_key FROM assessment_edges
      WHERE graph_version = ? AND from_node_key = ? AND (option_key = ? OR option_key IS NULL)
        AND (profile = ? OR profile IS NULL)
      ORDER BY CASE WHEN profile = ? THEN 0 ELSE 1 END,
        CASE WHEN option_key = ? THEN 0 ELSE 1 END, priority LIMIT 1
    `).get(version, nodeKey, optionKey, profile ?? '', profile ?? '', optionKey) as { to_node_key: string } | undefined;
    return row?.to_node_key;
  }

}

function applicabilityPatternsFor(nodeId: string): string[] {
  const incoming = edges.filter((edge) => edge.to === nodeId && edge.optionId);
  return [...new Set(incoming.flatMap((edge) => graph.find((candidate) => candidate.id === edge.from)?.options.find((option) => option.id === edge.optionId)?.signals.map((signal) => signal.pattern) ?? []))];
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
  for (const node of nodes) {
    for (const option of node.options) {
      if (observationOf(option) !== 'practice' && option.signals.length) {
        throw new Error(`Non-practice option cannot carry maturity signals: ${node.id}/${option.id}`);
      }
    }
  }
  const patternsByLeaf = new Map(capabilityLeafIds.map((leafId) => [leafId, new Set<string>()]));
  for (const node of nodes) for (const option of node.options) for (const signal of option.signals) {
    if (!signal.details.length) throw new Error(`Signal has no capability details: ${node.id}/${option.id}/${signal.pattern}`);
    for (const detail of signal.details) patternsByLeaf.get(detail)?.add(signal.pattern);
  }
  const insufficient = [...patternsByLeaf].filter(([, patterns]) => patterns.size < 2).map(([leafId, patterns]) => `${leafId} (${patterns.size})`);
  if (insufficient.length) throw new Error(`Graph lacks independent evidence for capability leaves: ${insufficient.join(', ')}`);
}
