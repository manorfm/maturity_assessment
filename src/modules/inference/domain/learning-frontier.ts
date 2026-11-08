import { probabilityStageAtLeast, type LeafEvidence } from './advanced-readiness.js';
import { CapabilityTaxonomy } from './capability-taxonomy.js';
import type { StageDistribution } from '../../measurement/domain/measurement-params.js';
import type { CapabilityStageLevel } from './capability-reference.js';
import { modeSophistication, type SophisticationDistribution, type SophisticationPhase } from './sophistication-matrix.js';

export type EnablementStrength = 'essential' | 'comfort';
export type EnablementType = 'technical' | 'cognitive' | 'social' | 'structural' | 'governance';
export type EnablementOrigin = 'A' | 'B' | 'C' | 'D';

export type EnablementDependency = {
  id: string;
  fromLeafId: string;
  fromLabel: string;
  fromMinimum: number;
  toLeafId: string;
  toFromStage: number;
  toToStage: number;
  type: EnablementType;
  strength: EnablementStrength;
  keyBehavior: string;
  origin: EnablementOrigin;
};

export type EnablementEdge = {
  from: string;
  to: string;
  probability: number;
  unlocks: string;
  strength?: EnablementStrength;
  fromLabel?: string;
};

export type FrontierBand = 'frontier' | 'near' | 'blocked';

export type FrontierNode = {
  id: string;
  blockedBy: string[];
  learnable: boolean;
  probability?: number;
  band?: FrontierBand;
  label?: string;
};

export type LearningFrontierProjection = {
  nodes: FrontierNode[];
  gap?: string;
};

/** Amostra inicial 23 §3.3 — conteúdo versionado; força SHELF ainda aberta. */
export const enablementCatalog: EnablementDependency[] = [
  dep('voice-to-learning', 'leadership-management', 'Voz e segurança', 2, 'organizational-learning', 2, 3, 'social', 'essential', 'Contar o próprio erro sem medo', 'B'),
  dep('priority-to-wip', 'portfolio-management', 'Clareza de prioridade', 2, 'work-management', 1, 2, 'governance', 'essential', 'Dizer "isto não agora"', 'C'),
  dep('flow-to-metrics', 'work-management', 'Fluxo visível', 2, 'work-management', 1, 2, 'technical', 'essential', 'Manter o quadro igual ao trabalho real', 'B'),
  dep('obs-to-incident', 'observability-practice', 'Observabilidade', 2, 'incident-management', 2, 3, 'technical', 'essential', 'Investigar pelos dados, não por suposição', 'B'),
  dep('incident-to-learning', 'incident-management', 'Resposta a incidentes', 2, 'organizational-learning', 1, 2, 'technical', 'essential', 'Registrar o que aconteceu', 'B'),
  dep('batch-to-ci', 'work-management', 'Lote pequeno', 2, 'continuous-integration', 2, 3, 'technical', 'essential', 'Integrar diariamente', 'A'),
  dep('testability-to-qa', 'sustainable-design', 'Testabilidade', 2, 'quality-strategy', 1, 2, 'technical', 'essential', 'Escrever código que dá para testar', 'B'),
  dep('ci-to-release', 'continuous-integration', 'Integração contínua', 3, 'release-feedback', 2, 3, 'technical', 'essential', 'Confiar no pipeline', 'A'),
  dep('ownership-to-obs', 'team-ownership', 'Ownership ponta a ponta', 2, 'observability-practice', 2, 3, 'structural', 'essential', 'Operar o que construiu', 'B'),
  dep('obs-to-slo', 'observability-practice', 'Observabilidade', 3, 'reliability-practice', 2, 3, 'technical', 'essential', 'Medir o que o usuário sente', 'B'),
  dep('decision-to-gov', 'leadership-management', 'Direitos de decisão', 2, 'enabling-governance', 1, 2, 'governance', 'essential', 'Decidir por risco, não por hierarquia', 'B'),
  dep('refine-to-ai', 'planning-refinement', 'Refinamento com critérios', 3, 'sdlc-automation', 3, 4, 'cognitive', 'essential', 'Definir o "o quê" e o critério de pronto', 'C'),
  dep('discovery-to-direction', 'discovery-validation', 'Descoberta', 2, 'product-direction', 2, 3, 'cognitive', 'essential', 'Escrever a hipótese antes de construir', 'B'),
  dep('team-to-collab', 'team-ownership', 'Desenho do time', 2, 'collaboration', 2, 3, 'structural', 'comfort', 'Times estáveis com fronteira clara', 'B'),
];

export function learningFrontier(nodes: string[], edges: EnablementEdge[]): FrontierNode[] {
  return nodes.map((id) => {
    const incoming = edges.filter((edge) => edge.to === id);
    if (!incoming.length) {
      return { id, blockedBy: [], learnable: true, probability: 1, band: 'frontier' as const };
    }
    const essential = incoming.filter((edge) => (edge.strength ?? 'essential') === 'essential');
    const governing = essential.length ? essential : incoming;
    const probability = round4(governing.reduce((product, edge) => product * edge.probability, 1));
    const band: FrontierBand = probability >= 0.6 ? 'frontier' : probability >= 0.25 ? 'near' : 'blocked';
    const blockedBy = governing
      .filter((edge) => (band === 'blocked' ? edge.probability < 0.25 : band === 'near' ? edge.probability < 0.6 : false))
      .map((edge) => edge.fromLabel ?? edge.from);
    return {
      id,
      blockedBy,
      learnable: band === 'frontier',
      probability,
      band,
    };
  });
}

export function evaluateEnablementEdges(
  catalog: EnablementDependency[],
  leaves: Record<string, LeafEvidence>,
): EnablementEdge[] {
  return catalog.flatMap((dependency) => {
    const distribution = distributionFor(leaves[dependency.fromLeafId]);
    if (!distribution) return [];
    const unlocks = unlockId(dependency);
    return [{
      from: dependency.fromLeafId,
      to: unlocks,
      probability: probabilityStageAtLeast(distribution, dependency.fromMinimum),
      unlocks,
      strength: dependency.strength,
      fromLabel: dependency.fromLabel,
    }];
  });
}

export function projectLearningFrontier(
  leaves: Record<string, LeafEvidence>,
  catalog: EnablementDependency[] = enablementCatalog,
): LearningFrontierProjection {
  if (!catalog.length) {
    return { nodes: [], gap: 'O grafo de habilitação ainda não foi elicitado. A fronteira não é inventada a partir do nome das folhas.' };
  }
  const edges = evaluateEnablementEdges(catalog, leaves);
  const nodeIds = [...new Set(edges.map((edge) => edge.to))];
  const nodes = learningFrontier(nodeIds, edges).map((node) => {
    const sample = catalog.find((item) => unlockId(item) === node.id);
    return {
      ...node,
      ...(sample ? { label: `${sample.toLeafId} ${sample.toFromStage}→${sample.toToStage}` } : {}),
    };
  });
  return { nodes };
}

export type FrontierSophisticationMark = `F${SophisticationPhase}`;

export type FrontierPlace = {
  leafId: string;
  label: string;
  blockedBy: string[];
  unlocks: string;
  probability: number;
  /** Modo da posterior F0–F5. Ausente quando a folha não tem essa posterior. */
  mark?: FrontierSophisticationMark;
};

export type FrontierBrief = {
  mastered: FrontierPlace[];
  learnable: FrontierPlace[];
  blocked: FrontierPlace[];
  start: { step: string; unlocks: string; leafId: string; mark?: FrontierSophisticationMark } | { gap: string };
  parallel: Array<{ label: string; body: string }>;
  advancedAside: string;
};

const frontierRespondentMinimum = 5;

/**
 * Folhas da fronteira. Só entra posterior de estágio publicada (como
 * `leavesForReadinessPage`). Nível pontual não inventa distribuição.
 * A posterior de sofisticação entra à parte e também não é inventada.
 */
export function frontierLeaves(input: {
  stages?: ReadonlyArray<{ id: string; respondents: number; distribution: StageDistribution }>;
  /** @deprecated Preferir `stages` com distribution; level não publica leitura. */
  capabilities?: ReadonlyArray<{ id: string; level: number; coverage?: number }>;
  phases?: ReadonlyMap<string, { distribution: SophisticationDistribution; phase: number }>;
}): Record<string, LeafEvidence> {
  const phases = input.phases ?? new Map<string, { distribution: SophisticationDistribution; phase: number }>();
  const leaves: Record<string, LeafEvidence> = {};
  for (const stage of input.stages ?? []) {
    if (stage.respondents < frontierRespondentMinimum) continue;
    const phase = phases.get(stage.id);
    leaves[stage.id] = {
      distribution: stage.distribution,
      ...(phase ? { phaseDistribution: phase.distribution, phase: phase.phase } : {}),
    };
  }
  for (const [leafId, phase] of phases) {
    leaves[leafId] = {
      ...(leaves[leafId] ?? {}),
      phaseDistribution: phase.distribution,
      phase: phase.phase,
    };
  }
  return leaves;
}

const advancedAside = 'Práticas avançadas a dois passos não são o próximo passo.';

/** Três faixas e um único começo. Degrau bloqueado não entra em “comece por”. */
export function projectFrontierBrief(
  leaves: Record<string, LeafEvidence>,
  catalog: EnablementDependency[] = enablementCatalog,
): FrontierBrief {
  const projection = projectLearningFrontier(leaves, catalog);
  const mastered: FrontierPlace[] = [];
  const learnable: FrontierPlace[] = [];
  const blocked: FrontierPlace[] = [];
  for (const node of projection.nodes) {
    const parsed = parseUnlock(node.id);
    const edge = catalog.find((item) => unlockId(item) === node.id);
    const mark = sophisticationMark(leaves[parsed?.leafId ?? node.id]);
    const place: FrontierPlace = {
      leafId: parsed?.leafId ?? node.id,
      label: parsed ? CapabilityTaxonomy.labelFor(parsed.leafId) : (node.label ?? node.id),
      blockedBy: node.blockedBy,
      unlocks: edge?.keyBehavior ?? 'O comportamento desta aresta ainda não foi nomeado.',
      probability: node.probability ?? 0,
      ...(mark ? { mark } : {}),
    };
    const stage = observedStage(leaves[place.leafId]);
    if (parsed && stage !== undefined && stage >= parsed.toStage) mastered.push(place);
    else if (node.band === 'frontier') learnable.push(place);
    else blocked.push(place);
  }
  learnable.sort((left, right) => right.probability - left.probability || left.label.localeCompare(right.label));
  const first = learnable[0];
  const start = first
    ? {
      step: first.label,
      unlocks: first.unlocks,
      leafId: first.leafId,
      ...(first.mark ? { mark: first.mark } : {}),
    }
    : { gap: 'Nada está desbloqueado para aprender agora.' };
  const parallel = catalog
    .filter((item) => item.type === 'social' || item.type === 'cognitive')
    .map((item) => ({ label: item.fromLabel, body: item.keyBehavior }));
  return { mastered, learnable, blocked, start, parallel, advancedAside };
}

/** 16 §3.1 + 23 §6.1: sobe um degrau só se o desbloqueio estiver na fronteira. */
export function nextPhaseWithinFrontier(input: {
  leafId: string;
  current: number;
  target?: number;
  edges: EnablementEdge[];
}): CapabilityStageLevel {
  const floor = Math.max(0, Math.min(4, Math.floor(input.current))) as CapabilityStageLevel;
  const cap = Math.max(0, Math.min(4, Math.floor(input.target ?? 4))) as CapabilityStageLevel;
  const candidate = Math.max(0, Math.min(4, Math.min(cap, floor + 1))) as CapabilityStageLevel;
  if (candidate === floor) return candidate;
  const unlock = `${input.leafId}:${floor}→${candidate}`;
  const incoming = input.edges.filter((edge) => edge.to === unlock);
  if (!incoming.length) return candidate;
  const essential = incoming.filter((edge) => (edge.strength ?? 'essential') === 'essential');
  const probability = essential.reduce((product, edge) => product * edge.probability, 1);
  return probability >= 0.6 ? candidate : floor;
}

function sophisticationMark(evidence?: LeafEvidence): FrontierSophisticationMark | undefined {
  if (!evidence?.phaseDistribution) return undefined;
  return `F${modeSophistication(evidence.phaseDistribution)}`;
}

function unlockId(dependency: EnablementDependency): string {
  return `${dependency.toLeafId}:${dependency.toFromStage}→${dependency.toToStage}`;
}

function parseUnlock(id: string): { leafId: string; toStage: number } | undefined {
  const match = /^(.+):(\d+)→(\d+)$/.exec(id);
  if (!match?.[1] || !match[3]) return undefined;
  return { leafId: match[1], toStage: Number(match[3]) };
}

function observedStage(evidence?: LeafEvidence): number | undefined {
  if (!evidence?.distribution) return undefined;
  let best = -1;
  let mode = 0;
  evidence.distribution.forEach((weight, index) => {
    if (weight > best) {
      best = weight;
      mode = index;
    }
  });
  return mode;
}

function dep(
  id: string,
  fromLeafId: string,
  fromLabel: string,
  fromMinimum: number,
  toLeafId: string,
  toFromStage: number,
  toToStage: number,
  type: EnablementType,
  strength: EnablementStrength,
  keyBehavior: string,
  origin: EnablementOrigin,
): EnablementDependency {
  return {
    id, fromLeafId, fromLabel, fromMinimum, toLeafId, toFromStage, toToStage, type, strength, keyBehavior, origin,
  };
}

function distributionFor(evidence?: LeafEvidence): StageDistribution | undefined {
  return evidence?.distribution;
}

function round4(value: number): number {
  return Number(value.toFixed(4));
}
