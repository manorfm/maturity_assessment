export type CapabilityMeasure = {
  id: string; label: string; level: number; confidence: number; evidence: number; hasContradiction: boolean;
};

export type CapabilityBranch = CapabilityMeasure & { children: CapabilityBranch[] };

type TaxonomyNode = { id: string; label: string; sources?: string[]; children?: TaxonomyNode[] };

const taxonomy: TaxonomyNode[] = [
  { id: 'value-flow', label: 'Valor e fluxo', sources: ['fluxo'] },
  { id: 'engineering-system', label: 'Sistema de engenharia', sources: ['engenharia'] },
  { id: 'architecture-runtime', label: 'Arquitetura e operação', children: [
    { id: 'arquitetura', label: 'Arquitetura de software', sources: ['arquitetura'] },
    { id: 'plataforma', label: 'Cloud, plataforma e segurança', sources: ['plataforma'] },
    { id: 'confiabilidade', label: 'Confiabilidade e observabilidade', sources: ['confiabilidade'] },
  ] },
  { id: 'organization-direction', label: 'Organização e direção', children: [
    { id: 'organizacao', label: 'Organização e interação', sources: ['organizacao'] },
    { id: 'governanca', label: 'Governança e estratégia', sources: ['governanca'] },
    { id: 'aprendizado', label: 'Aprendizado e adaptação', sources: ['aprendizado'] },
  ] },
];

export class CapabilityTaxonomy {
  static organize(capabilities: CapabilityMeasure[]): CapabilityBranch[] {
    const byId = new Map(capabilities.map((capability) => [capability.id, capability]));
    const build = (node: TaxonomyNode): CapabilityBranch | undefined => {
      const children = (node.children ?? []).flatMap((child) => {
        const branch = build(child);
        return branch ? [branch] : [];
      });
      const measures = [...(node.sources ?? []).flatMap((source) => byId.get(source) ? [byId.get(source)!] : []), ...children];
      if (!measures.length) return undefined;
      const limitingLevel = Math.min(...measures.map((measure) => measure.level));
      return {
        id: node.id,
        label: node.label,
        level: limitingLevel,
        confidence: Math.min(...measures.map((measure) => measure.confidence)),
        evidence: measures.reduce((total, measure) => total + measure.evidence, 0),
        hasContradiction: measures.some((measure) => measure.hasContradiction),
        children,
      };
    };
    return taxonomy.flatMap((node) => {
      const branch = build(node);
      return branch ? [branch] : [];
    });
  }
}
