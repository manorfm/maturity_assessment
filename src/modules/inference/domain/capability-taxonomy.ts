export type CapabilityMeasure = {
  id: string; label: string; level: number; confidence: number; evidence: number; hasContradiction: boolean;
};

export type CapabilityBranch = CapabilityMeasure & { assessed: boolean; children: CapabilityBranch[] };

type TaxonomyNode = { id: string; label: string; sources?: string[]; children?: TaxonomyNode[] };

const taxonomy: TaxonomyNode[] = [
  { id: 'value-flow', label: 'Fluxo de valor e produto', children: [
    { id: 'product-discovery', label: 'Descoberta e direção de produto', sources: ['product-discovery'] },
    { id: 'work-flow', label: 'Fluxo de trabalho', sources: ['work-flow'] },
    { id: 'delivery-release', label: 'Entrega e release', sources: ['delivery-release'] },
  ] },
  { id: 'engineering-system', label: 'Excelência de engenharia', children: [
    { id: 'integration-code', label: 'Integração e código sustentável', sources: ['integration-code'] },
    { id: 'continuous-quality', label: 'Qualidade contínua', sources: ['continuous-quality'] },
    { id: 'secure-sdlc', label: 'Segurança no SDLC', sources: ['secure-sdlc'] },
  ] },
  { id: 'architecture-runtime', label: 'Arquitetura e operação de produtos', children: [
    { id: 'arquitetura', label: 'Arquitetura de software', sources: ['arquitetura'] },
    { id: 'cloud-platform', label: 'Cloud e plataforma', children: [
      { id: 'platform-self-service', label: 'Autosserviço e experiência de plataforma', sources: ['platform-self-service'] },
      { id: 'cloud-security', label: 'Segurança operacional', sources: ['cloud-security'] },
      { id: 'reproducible-infrastructure', label: 'Infraestrutura reproduzível', sources: ['reproducible-infrastructure'] },
    ] },
    { id: 'confiabilidade', label: 'Confiabilidade e observabilidade', sources: ['confiabilidade'] },
  ] },
  { id: 'organization-direction', label: 'Organização, governança e aprendizado', children: [
    { id: 'organizacao', label: 'Organização e interação', sources: ['organizacao'] },
    { id: 'governanca', label: 'Governança e estratégia', sources: ['governanca'] },
    { id: 'aprendizado', label: 'Aprendizado e adaptação', sources: ['aprendizado'] },
  ] },
];

export class CapabilityTaxonomy {
  static organize(capabilities: CapabilityMeasure[]): CapabilityBranch[] {
    const byId = new Map(capabilities.map((capability) => [capability.id, capability]));
    const build = (node: TaxonomyNode): CapabilityBranch => {
      const children = (node.children ?? []).map(build);
      const measures = [...(node.sources ?? []).flatMap((source) => byId.get(source) ? [byId.get(source)!] : []), ...children];
      const assessed = measures.filter((measure) => 'assessed' in measure ? measure.assessed : measure.evidence > 0);
      const limitingLevel = assessed.length ? Math.min(...assessed.map((measure) => measure.level)) : 0;
      return {
        id: node.id,
        label: node.label,
        level: limitingLevel,
        confidence: assessed.length ? Math.min(...assessed.map((measure) => measure.confidence)) : 0,
        evidence: assessed.reduce((total, measure) => total + measure.evidence, 0),
        hasContradiction: assessed.some((measure) => measure.hasContradiction),
        assessed: assessed.length > 0,
        children,
      };
    };
    return taxonomy.map(build);
  }
}
