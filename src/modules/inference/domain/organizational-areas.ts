import { capabilityLeafIds, type CapabilityMeasure } from './capability-taxonomy.js';

export type AreaKind = 'system' | 'band' | 'group' | 'leaf';

export type OrganizationalAreaNode = {
  id: string;
  label: string;
  kind: AreaKind;
  leafId?: string;
  observed: boolean;
  findingCount: number;
  children: OrganizationalAreaNode[];
};

export type OrganizationalAreaMap = {
  version: 'organizational-areas-v1';
  systems: OrganizationalAreaNode[];
  band: OrganizationalAreaNode;
};

export type AreaFindingRef = {
  detailCapability: string;
  affectedCapabilities?: string[];
};

type AreaDefinition = {
  id: string;
  label: string;
  kind: AreaKind;
  leafId?: string;
  children?: AreaDefinition[];
};

const leaf = (id: string, label: string, children?: AreaDefinition[]): AreaDefinition => ({
  id, label, kind: 'leaf', leafId: id, ...(children ? { children } : {}),
});

const group = (id: string, label: string, children: AreaDefinition[]): AreaDefinition => ({
  id, label, kind: 'group', children,
});

const presentationSystems: AreaDefinition[] = [
  {
    id: 'product', label: 'Produto', kind: 'system', children: [
      leaf('product-direction', 'Direção'),
      leaf('discovery-validation', 'Descoberta'),
      leaf('portfolio-management', 'Portfólio'),
      leaf('planning-refinement', 'Planejamento'),
    ],
  },
  {
    id: 'engineering', label: 'Engenharia', kind: 'system', children: [
      group('delivery', 'Entrega', [
        leaf('work-management', 'Fluxo de trabalho'),
        leaf('continuous-integration', 'Integração'),
        leaf('release-feedback', 'Publicação', [
          leaf('observability-practice', 'Observabilidade'),
        ]),
      ]),
      group('software-quality', 'Qualidade de software', [
        leaf('sustainable-design', 'Sustentabilidade da mudança'),
        leaf('quality-strategy', 'Estratégia de qualidade'),
        leaf('sdlc-automation', 'Feedback técnico'),
        leaf('technical-capability', 'Competência técnica'),
      ]),
      group('architecture', 'Arquitetura', [
        leaf('domain-alignment', 'Domínio'),
        leaf('architecture-decisions', 'Decisões'),
        leaf('evolvability', 'Evolução'),
        leaf('integration-data', 'Dados'),
      ]),
      group('platform', 'Plataforma', [
        leaf('platform-autonomy', 'Acesso a capacidades'),
        leaf('reproducible-infrastructure', 'Infraestrutura'),
        leaf('cloud-efficiency', 'Eficiência'),
      ]),
      group('security', 'Segurança', [
        leaf('software-security', 'Segurança na entrega'),
        leaf('cloud-security', 'Identidade e acesso'),
      ]),
    ],
  },
  {
    id: 'operations', label: 'Operação', kind: 'system', children: [
      leaf('reliability-practice', 'Confiabilidade'),
      leaf('incident-management', 'Incidentes'),
      leaf('cloud-reliability', 'Recuperação'),
    ],
  },
];

const presentationBand: AreaDefinition = {
  id: 'management', label: 'Gestão', kind: 'band', children: [
    leaf('team-ownership', 'Responsabilidade'),
    leaf('enabling-governance', 'Governança'),
    leaf('leadership-management', 'Liderança'),
    leaf('collaboration', 'Colaboração'),
    leaf('organizational-learning', 'Aprendizado'),
  ],
};

export class OrganizationalAreaProjector {
  static empty(): OrganizationalAreaMap {
    return this.project({ capabilities: [], findings: [] });
  }

  static project(input: { capabilities: CapabilityMeasure[]; findings: AreaFindingRef[] }): OrganizationalAreaMap {
    const published = new Set(input.capabilities.filter((item) => (item.coverage ?? 0) >= 1).map((item) => item.id));
    const findingLeaves = indexFindings(input.findings);
    const build = (node: AreaDefinition): OrganizationalAreaNode => {
      const children = (node.children ?? []).map(build);
      const selfLit = Boolean(node.leafId && (published.has(node.leafId) || findingLeaves.has(node.leafId)));
      return {
        id: node.id,
        label: node.label,
        kind: node.kind,
        ...(node.leafId ? { leafId: node.leafId } : {}),
        observed: selfLit || children.some((child) => child.observed),
        findingCount: countFindings(node, findingLeaves),
        children,
      };
    };
    return {
      version: 'organizational-areas-v1',
      systems: presentationSystems.map(build),
      band: build(presentationBand),
    };
  }
}

export function collectAreaLeaves(map: Pick<OrganizationalAreaMap, 'systems' | 'band'>): string[] {
  const leaves: string[] = [];
  const walk = (node: OrganizationalAreaNode) => {
    if (node.leafId) leaves.push(node.leafId);
    node.children.forEach(walk);
  };
  map.systems.forEach(walk);
  walk(map.band);
  return leaves;
}

export function findAreaPath(map: OrganizationalAreaMap, id: string): OrganizationalAreaNode[] | undefined {
  const search = (nodes: OrganizationalAreaNode[], ancestors: OrganizationalAreaNode[] = []): OrganizationalAreaNode[] | undefined => {
    for (const node of nodes) {
      const path = [...ancestors, node];
      if (node.id === id || node.leafId === id) return path;
      const nested = search(node.children, path);
      if (nested) return nested;
    }
    return undefined;
  };
  return search([...map.systems, map.band]);
}

function indexFindings(findings: AreaFindingRef[]): Map<string, Set<string>> {
  const findingLeaves = new Map<string, Set<string>>();
  findings.forEach((item, index) => {
    const key = `${item.detailCapability}:${index}`;
    for (const leafId of findingLeafIds(item)) {
      const current = findingLeaves.get(leafId) ?? new Set<string>();
      current.add(key);
      findingLeaves.set(leafId, current);
    }
  });
  return findingLeaves;
}

function findingLeafIds(finding: AreaFindingRef): string[] {
  return [...new Set([finding.detailCapability, ...(finding.affectedCapabilities ?? [])])]
    .filter((id) => capabilityLeafIds.includes(id));
}

function countFindings(node: AreaDefinition, findingLeaves: Map<string, Set<string>>): number {
  const keys = new Set<string>();
  const walk = (item: AreaDefinition) => {
    if (item.leafId) for (const key of findingLeaves.get(item.leafId) ?? []) keys.add(key);
    for (const child of item.children ?? []) walk(child);
  };
  walk(node);
  return keys.size;
}
