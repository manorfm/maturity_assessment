export type CapabilityMeasure = {
  id: string; label: string; level: number; confidence: number; evidence: number; hasContradiction: boolean; coverage?: number;
  observers?: number; interval?: { lower: number; upper: number };
};

export type CapabilityBranch = CapabilityMeasure & { assessed: boolean; coverage: number; children: CapabilityBranch[] };

type TaxonomyNode = { id: string; label: string; sources?: string[]; children?: TaxonomyNode[] };

const leaf = (id: string, label: string): TaxonomyNode => ({ id, label, sources: [id] });

const taxonomy: TaxonomyNode[] = [
  { id: 'product-value', label: 'Estratégia de produto e valor', children: [
    leaf('product-direction', 'Direção e alinhamento'), leaf('discovery-validation', 'Descoberta e validação'), leaf('portfolio-management', 'Gestão de portfólio'),
  ] },
  { id: 'delivery-flow', label: 'Fluxo de entrega', children: [
    leaf('planning-refinement', 'Planejamento e refinamento'), leaf('work-management', 'Fluxo de trabalho'), leaf('continuous-integration', 'Integração contínua'), leaf('release-feedback', 'Release e feedback'),
  ] },
  { id: 'engineering-quality', label: 'Engenharia e qualidade', children: [
    leaf('sustainable-design', 'Design e sustentabilidade do código'), leaf('quality-strategy', 'Estratégia de qualidade'), leaf('sdlc-automation', 'Feedback técnico repetível'), leaf('software-security', 'Segurança de software'), leaf('technical-capability', 'Capacidade técnica'),
  ] },
  { id: 'architecture-evolution', label: 'Arquitetura e evolução', children: [
    leaf('domain-alignment', 'Alinhamento ao domínio'), leaf('architecture-decisions', 'Decisões arquiteturais'), leaf('evolvability', 'Evolutibilidade'), leaf('integration-data', 'Integração e dados'),
  ] },
  { id: 'operations-platform', label: 'Operação, confiabilidade e plataforma', children: [
    leaf('observability-practice', 'Observabilidade'), leaf('reliability-practice', 'Confiabilidade'), leaf('incident-management', 'Gestão de incidentes'), leaf('platform-autonomy', 'Plataforma e autonomia'),
    { id: 'cloud-infrastructure', label: 'Cloud e infraestrutura', children: [
      leaf('reproducible-infrastructure', 'Infraestrutura reproduzível'), leaf('cloud-security', 'Segurança e identidade'), leaf('cloud-reliability', 'Confiabilidade de infraestrutura'), leaf('cloud-efficiency', 'Eficiência, custos e sustentabilidade'),
    ] },
  ] },
  { id: 'organizational-system', label: 'Sistema organizacional', children: [
    leaf('team-ownership', 'Estrutura e ownership'), leaf('enabling-governance', 'Governança habilitadora'), leaf('leadership-management', 'Liderança e gestão'), leaf('collaboration', 'Colaboração'), leaf('organizational-learning', 'Aprendizado e adaptação'),
  ] },
];

export const capabilityLeafIds = collectLeaves(taxonomy);

export const cloudCapabilityIds = new Set([
  'cloud-infrastructure', 'reproducible-infrastructure', 'cloud-security', 'cloud-reliability', 'cloud-efficiency',
]);

function collectLeaves(nodes: TaxonomyNode[]): string[] {
  return nodes.flatMap((node) => node.children?.length ? collectLeaves(node.children) : [node.id]);
}

export class CapabilityTaxonomy {
  static labelFor(id: string): string { return findLabel(taxonomy, id) ?? id; }
  static organize(capabilities: CapabilityMeasure[]): CapabilityBranch[] {
    const byId = new Map(capabilities.map((capability) => [capability.id, capability]));
    const build = (node: TaxonomyNode): CapabilityBranch => {
      const children = (node.children ?? []).map(build);
      const sourced = (node.sources ?? []).flatMap((source) => byId.get(source) ? [byId.get(source)!] : []);
      const publishableSources = sourced.filter((measure) => (measure.coverage ?? 0) >= 1);
      const measures = [...publishableSources, ...children.filter((child) => child.assessed)];
      const coverage = children.length
        ? children.reduce((total, child) => total + child.coverage, 0) / children.length
        : Math.max(0, Math.min(1, sourced[0]?.coverage ?? 0));
      const assessedChildren = children.filter((child) => child.assessed).length;
      const assessed = children.length
        ? coverage >= .5 && assessedChildren >= Math.ceil(children.length / 2)
        : publishableSources.length > 0;
      return {
        id: node.id,
        label: node.label,
        level: assessed ? Math.min(...measures.map((measure) => measure.level)) : 0,
        confidence: assessed ? Math.min(...measures.map((measure) => measure.confidence)) : 0,
        evidence: measures.reduce((total, measure) => total + measure.evidence, 0),
        observers: Math.max(0, ...measures.map((measure) => measure.observers ?? 0)),
        interval: measures.length ? { lower: Math.min(...measures.map((measure) => measure.interval?.lower ?? measure.level)), upper: Math.max(...measures.map((measure) => measure.interval?.upper ?? measure.level)) } : { lower: 0, upper: 4 },
        hasContradiction: measures.some((measure) => measure.hasContradiction),
        assessed,
        coverage: Number(coverage.toFixed(2)),
        children,
      };
    };
    return taxonomy.map(build);
  }
}

function findLabel(nodes: TaxonomyNode[], id: string): string | undefined {
  for (const node of nodes) {
    if (node.id === id) return node.label;
    const nested = node.children ? findLabel(node.children, id) : undefined;
    if (nested) return nested;
  }
  return undefined;
}
