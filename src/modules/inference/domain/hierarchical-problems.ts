import { diagnosticSystemFor } from './problem-system.js';
import { CapabilityTaxonomy } from './capability-taxonomy.js';
import { disciplineBrief } from './discipline-brief.js';
import type { OrganizationalAreaMap, OrganizationalAreaNode } from './organizational-areas.js';

export type HierarchicalFinding = {
  pattern: string;
  title: string;
  intervention: string;
  detailCapability: string;
};

export type HierarchicalProblem = {
  pattern: string;
  localTitle: string;
  systemicEffect: string;
  intervention: string;
  capabilityId: string;
  capabilityLabel: string;
};

export type BranchStatus = 'published-problem' | 'coverage-without-finding' | 'not-traversed';

export type HierarchicalBranch = {
  id: string;
  label: string;
  kind: 'system' | 'discipline' | 'leaf';
  brief: string;
  status: BranchStatus;
  systemicEffects: string[];
  problems: HierarchicalProblem[];
  children: HierarchicalBranch[];
};

export type NodeProblems = {
  local: HierarchicalProblem[];
  descendants: HierarchicalProblem[];
  systemicEffects: string[];
};

const systemicBySystem: Record<string, string> = {
  'integration-feedback': 'Mudanças se encontram tarde ou sem origem. O fluxo inteiro acumula risco antes de alguém ver o efeito — isso não é o atraso de um pacote isolado.',
  'ownership-boundaries': 'A responsabilidade se parte entre grupos. O sistema inteiro espera coordenação — isso não é o mesmo que um serviço sem dono.',
  'learning-closure': 'O reconhecimento do problema não fecha em mudança. A organização inteira repete o ciclo — isso não é uma retro sem dono.',
  'product-feedback': 'A decisão de investir segue sem evidência de efeito. O portfólio inteiro acumula trabalho — isso não é uma ideia sem teste.',
  'platform-adoption': 'Começar o trabalho depende de outro grupo liberar o caminho compartilhado. A espera se espalha pela entrega — isso não é um pedido atrasado.',
  'governance-trust': 'Controle e aprovação substituem confiança no caminho. O risco continua e a espera cresce — isso não é um acesso mal pedido.',
  'workforce-capability': 'O conhecimento necessário não está com quem executa. O fluxo inteiro espera especialista — isso não é uma pessoa sem treino.',
  'legacy-continuity': 'O sistema antigo só muda por tentativa ou por pessoa. Qualquer alteração arrasta medo — isso não é um arquivo difícil.',
  'operational-response': 'Detectar e conter depende de quem a pessoa conhece. O serviço inteiro só se vê na crise — isso não é um alerta atrasado.',
  'quality-in-flow': 'A proteção chega depois da construção. O defeito já viajou — isso não é um teste faltando num passo.',
  'cognitive-load': 'O trabalho se fragmenta e a carga some da conversa. O grupo inteiro absorve sem decidir parar — isso não é uma semana cheia.',
};

const systemicByCapability: Record<string, string> = {
  'platform-autonomy': systemicBySystem['platform-adoption']!,
  'reproducible-infrastructure': 'Ambientes divergem da origem. A plataforma inteira perde o chão comum — isso não é um servidor desatualizado.',
  'release-feedback': systemicBySystem['integration-feedback']!,
  'continuous-integration': systemicBySystem['integration-feedback']!,
  'work-management': systemicBySystem['cognitive-load']!,
  'leadership-management': 'A evidência do gargalo não vira decisão. O sistema inteiro continua no mesmo desenho — isso não é um time sem disciplina.',
  'organizational-learning': systemicBySystem['learning-closure']!,
  'team-ownership': systemicBySystem['ownership-boundaries']!,
};

export function systemicEffectFor(finding: HierarchicalFinding): string {
  const system = diagnosticSystemFor(finding.pattern);
  const fromSystem = system ? systemicBySystem[system.id] : undefined;
  const fromCapability = systemicByCapability[finding.detailCapability];
  const effect = fromSystem ?? fromCapability ?? 'Neste recorte a dor local se espalha: o nível acima sente a inflamação, que é um problema distinto da ferida da folha.';
  if (effect.toLowerCase() === finding.title.toLowerCase()) {
    return 'Neste recorte a dor local se espalha: o nível acima sente a inflamação, que é um problema distinto da ferida da folha.';
  }
  return effect;
}

export function toHierarchicalProblem(finding: HierarchicalFinding): HierarchicalProblem {
  return {
    pattern: finding.pattern,
    localTitle: finding.title,
    systemicEffect: systemicEffectFor(finding),
    intervention: finding.intervention,
    capabilityId: finding.detailCapability,
    capabilityLabel: CapabilityTaxonomy.labelFor(finding.detailCapability),
  };
}

export function problemsForNode(nodeId: string, childIds: string[], findings: HierarchicalFinding[]): NodeProblems {
  const childSet = new Set(childIds);
  const mapped = findings.map(toHierarchicalProblem);
  const local = mapped.filter((item) => item.capabilityId === nodeId);
  const descendants = mapped.filter((item) => childSet.has(item.capabilityId) || (item.capabilityId !== nodeId && childIds.length > 0 && childSet.size === 0));
  const fromChildren = mapped.filter((item) => childSet.has(item.capabilityId));
  const scoped = childIds.length ? fromChildren : descendants;
  const systemicEffects = unique(scoped.map((item) => item.systemicEffect));
  return { local, descendants: scoped, systemicEffects };
}

export function projectProblemTree(
  findings: HierarchicalFinding[],
  map: OrganizationalAreaMap,
  options: { exhaustive?: boolean } = {},
): HierarchicalBranch[] {
  const roots = [...map.systems, map.band];
  const tree = roots.map((node) => projectBranch(node, findings, options.exhaustive === true));
  return options.exhaustive ? tree : tree.filter(branchHasProblems);
}

function projectBranch(node: OrganizationalAreaNode, findings: HierarchicalFinding[], exhaustive: boolean): HierarchicalBranch {
  const built = node.children.map((child) => projectBranch(child, findings, exhaustive));
  const children = exhaustive ? built : built.filter(branchHasProblems);
  const localFindings = findings.filter((item) => item.detailCapability === (node.leafId ?? node.id));
  const descendantFindings = findings.filter((item) => collectLeafIds(node).includes(item.detailCapability) && item.detailCapability !== (node.leafId ?? node.id));
  const problems = localFindings.map(toHierarchicalProblem);
  const systemicEffects = unique([
    ...problems.map((item) => item.systemicEffect),
    ...descendantFindings.map((item) => systemicEffectFor(item)),
  ]).filter((effect) => !problems.some((item) => item.localTitle.toLowerCase() === effect.toLowerCase()));
  const kind = node.kind === 'system' || node.kind === 'band' ? 'system' : node.kind === 'leaf' && !node.children.length ? 'leaf' : 'discipline';
  const hasPublished = problems.length > 0 || children.some((child) => child.status === 'published-problem');
  const status: BranchStatus = hasPublished
    ? 'published-problem'
    : node.observed
      ? 'coverage-without-finding'
      : 'not-traversed';
  return {
    id: node.id,
    label: node.label,
    kind,
    brief: disciplineBrief(node.id),
    status,
    systemicEffects: kind === 'leaf' ? [] : systemicEffects,
    problems,
    children,
  };
}

function collectLeafIds(node: OrganizationalAreaNode): string[] {
  if (node.leafId && !node.children.length) return [node.leafId];
  const nested = node.children.flatMap(collectLeafIds);
  return node.leafId ? [node.leafId, ...nested] : nested;
}

function branchHasProblems(node: HierarchicalBranch): boolean {
  return node.problems.length > 0 || node.children.some(branchHasProblems);
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
