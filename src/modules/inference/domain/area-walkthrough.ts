import { capabilityReferenceCatalog, type CapabilityStageLevel } from './capability-reference.js';
import { CapabilityTaxonomy } from './capability-taxonomy.js';
import { primaryArchetypeFor } from './systemic-archetypes.js';
import { uniqueFindingsByPattern, type OutcomeFinding, type ReportOutcomeKind } from './report-outcome.js';
import type { TreatmentConduct } from './treatment-contract.js';
import type { OrganizationalAreaMap, OrganizationalAreaNode } from './organizational-areas.js';
import {
  advancedPracticeCatalog,
  nextStepTowardPractice,
  type LeafEvidence,
} from './advanced-readiness.js';
import { nextPhaseWithinFrontier, type EnablementEdge } from './learning-frontier.js';
import { projectSophisticationMatrix, type SophisticationPhase } from './sophistication-matrix.js';

export const AREA_WALKTHROUGH_VERSION = 'area-walkthrough-v1' as const;

const STAGE_LABELS = ['Opaco', 'Reativo', 'Repetível', 'Gerenciado', 'Adaptativo'] as const;

export type WalkthroughCapability = {
  id: string;
  label?: string;
  level: number;
};

export type WalkthroughPulse = {
  prompt: string;
  leafId: string;
};

export type AreaWalkthroughPath = {
  d30: string;
  d90: string;
  d180: string;
};

export type AreaWalkthroughSections = {
  where: string[];
  arrived: string;
  working: string;
  next: string[];
  path: AreaWalkthroughPath;
  milestones: string[];
  risks: string[];
  assumptions: string[];
};

export type AreaWalkthrough = {
  version: typeof AREA_WALKTHROUGH_VERSION;
  areaId: string;
  areaLabel: string;
  summary: string;
  sections: AreaWalkthroughSections;
};

/** 16 §3.1: um degrau por vez, nunca além do alvo. */
export function nextPhaseStage(current: number, target = 4): CapabilityStageLevel {
  const floor = clampStage(current);
  const cap = clampStage(target);
  return clampStage(Math.min(cap, floor + 1));
}

export function projectAreaWalkthrough(input: {
  area: OrganizationalAreaNode;
  findings: OutcomeFinding[];
  capabilities: WalkthroughCapability[];
  organizationalAreas: OrganizationalAreaMap;
  outcomeKind: ReportOutcomeKind;
  conducts: TreatmentConduct[];
  pulse: WalkthroughPulse[];
  summary?: string;
  enablementEdges?: EnablementEdge[];
  sophistication?: Array<{ leafId: string; phase: SophisticationPhase | number; appropriation: number }>;
  /** Evidência por folha para mirar práticas avançadas na próxima fase (22 §6). */
  leaves?: Record<string, LeafEvidence>;
  /** Práticas candidatas; padrão = catálogo 22 §5 filtrado pelas folhas da área. */
  targetPracticeIds?: string[];
}): AreaWalkthrough {
  const leaves = new Set(leavesOf(input.area));
  const published = uniqueFindingsByPattern(input.findings).filter((finding) => finding.confidence >= 0.5);
  const local = published.filter((finding) => leaves.has(finding.detailCapability));
  const localCaps = input.capabilities.filter((cap) => leaves.has(cap.id) && (cap as { coverage?: number }).coverage !== 0);
  const prioritized = prioritizeCapabilities(local, localCaps).slice(0, 3);
  const matrix = projectSophisticationMatrix(
    (input.sophistication ?? [])
      .filter((item) => leaves.has(item.leafId))
      .map((item) => ({
        leafId: item.leafId,
        label: CapabilityTaxonomy.labelFor(item.leafId),
        phase: item.phase,
        appropriation: item.appropriation,
      })),
  );
  const capabilityNext = projectNext(prioritized, input.enablementEdges);
  const practiceNext = projectPracticeNext(leaves, input.leaves, input.targetPracticeIds);
  const next = [...capabilityNext, ...practiceNext];

  return {
    version: AREA_WALKTHROUGH_VERSION,
    areaId: input.area.id,
    areaLabel: input.area.label,
    summary: input.summary ?? `Roteiro da área ${input.area.label}: do que as entrevistas sustentaram para o próximo degrau.`,
    sections: {
      where: projectWhere(prioritized, local, matrix.map((item) => item.reading)),
      arrived: projectArrived(local),
      working: projectWorking(input.outcomeKind, prioritized),
      next: next.length
        ? next
        : ['Sem próxima fase enquanto não houver capacidade ou conduta publicada neste recorte.'],
      path: projectPath(input.conducts),
      milestones: projectMilestones(input.pulse, leaves, input.conducts),
      risks: projectRisks(prioritized, local),
      assumptions: projectAssumptions(prioritized),
    },
  };
}

function projectWhere(
  caps: Array<WalkthroughCapability & { finding?: OutcomeFinding }>,
  findings: OutcomeFinding[],
  sophisticationLines: string[] = [],
): string[] {
  if (!caps.length && !findings.length && !sophisticationLines.length) {
    return ['As entrevistas ainda não publicaram índice nem achado neste recorte.'];
  }
  const lines = caps.map((cap) => {
    const stage = clampStage(cap.level);
    const label = cap.label ?? CapabilityTaxonomy.labelFor(cap.id);
    const findingBit = cap.finding ? ` · Achado: ${cap.finding.title}` : '';
    return `${label}: estágio ${stage} (${STAGE_LABELS[stage]})${findingBit}`;
  });
  for (const finding of findings.slice(0, 3)) {
    if (caps.some((cap) => cap.id === finding.detailCapability)) continue;
    lines.push(`Achado: ${finding.title}`);
  }
  lines.push(...sophisticationLines);
  return lines.length ? lines : ['As entrevistas ainda não publicaram índice nem achado neste recorte.'];
}

function projectArrived(findings: OutcomeFinding[]): string {
  if (!findings.length) return 'O caminho até aqui ainda não foi publicado.';
  const archetype = primaryArchetypeFor(findings.map((finding) => finding.pattern));
  if (archetype) return archetype.reading;
  const lead = findings[0]!;
  return lead.cause || lead.title;
}

function projectWorking(kind: ReportOutcomeKind, caps: Array<WalkthroughCapability & { finding?: OutcomeFinding }>): string {
  if (kind === 'preserve') {
    return 'Há prática publicada para preservar neste recorte; acompanhe os sinais de regressão da rubrica.';
  }
  const strong = caps.find((cap) => clampStage(cap.level) >= 3);
  if (strong) {
    const ref = capabilityReferenceCatalog[strong.id];
    const signal = ref?.regressionSignals[0];
    return `${strong.label ?? CapabilityTaxonomy.labelFor(strong.id)} já sustenta estágio ${clampStage(strong.level)}${signal ? `; regressão: ${signal}` : '.'}`;
  }
  return 'Nada neste recorte foi publicado como prática a preservar.';
}

function projectNext(
  caps: Array<WalkthroughCapability & { finding?: OutcomeFinding }>,
  edges?: EnablementEdge[],
): string[] {
  if (!caps.length) return [];
  return caps.map((cap) => {
    const current = clampStage(cap.level);
    const next = edges?.length
      ? nextPhaseWithinFrontier({ leafId: cap.id, current, edges })
      : nextPhaseStage(current);
    const label = cap.label ?? CapabilityTaxonomy.labelFor(cap.id);
    if (next === current) {
      return `${label}: próximo degrau ainda fora da fronteira de aprendizado (23 §6.1).`;
    }
    const ref = capabilityReferenceCatalog[cap.id];
    const behavior = ref?.stage(next).behavior;
    const arrow = `${current} → ${next} (${STAGE_LABELS[current]} → ${STAGE_LABELS[next]})`;
    return behavior
      ? `${label} ${arrow}: ${behavior}`
      : `${label} ${arrow}: quando chegarmos lá, veremos o comportamento do próximo degrau.`;
  });
}

/** 22 §6: próxima fase pode mirar prática avançada — um pré-requisito (gargalo) por vez. */
function projectPracticeNext(
  areaLeaves: Set<string>,
  evidence?: Record<string, LeafEvidence>,
  targetPracticeIds?: string[],
): string[] {
  if (!evidence) return [];
  const practices = targetPracticeIds?.length
    ? advancedPracticeCatalog.filter((practice) => targetPracticeIds.includes(practice.id))
    : advancedPracticeCatalog.filter((practice) => (
      practice.prerequisites.some((item) => areaLeaves.has(item.leafId))
    ));
  const lines: string[] = [];
  for (const practice of practices) {
    const step = nextStepTowardPractice(practice, evidence);
    if (!step || step.band === 'ready') continue;
    if (!areaLeaves.has(step.leafId) && !practice.prerequisites.some((item) => areaLeaves.has(item.leafId))) continue;
    lines.push(step.reading);
    if (lines.length >= 2) break;
  }
  return lines;
}

function projectPath(conducts: TreatmentConduct[]): AreaWalkthroughPath {
  const byHorizon = (horizon: TreatmentConduct['horizon']) =>
    conducts.filter((conduct) => conduct.horizon === horizon).map((conduct) => `${conduct.action} (${conduct.owner})`);
  const empty = 'Sem conduta sequenciada neste horizonte.';
  return {
    d30: joinOr(byHorizon('0-30'), empty),
    d90: joinOr(byHorizon('1-3'), empty),
    d180: joinOr(byHorizon('3-12'), empty),
  };
}

function projectMilestones(pulse: WalkthroughPulse[], leaves: Set<string>, conducts: TreatmentConduct[]): string[] {
  const localPulse = pulse.filter((item) => leaves.has(item.leafId));
  const fromPulse = localPulse.map((item) => `Pulso: ${item.prompt}`);
  const fromSuccess = conducts
    .filter((conduct) => conduct.horizon === '0-30' || conduct.horizon === '1-3')
    .slice(0, 2)
    .map((conduct) => `Marco: ${conduct.success}`);
  const lines = [...fromPulse, ...fromSuccess];
  return lines.length ? lines : ['O marco é o critério de sucesso da conduta publicada, não uma data inventada.'];
}

function projectRisks(caps: Array<WalkthroughCapability & { finding?: OutcomeFinding }>, findings: OutcomeFinding[]): string[] {
  const fromRef = caps.flatMap((cap) => {
    const ref = capabilityReferenceCatalog[cap.id];
    return (ref?.regressionSignals ?? []).slice(0, 1);
  });
  const fromConduct = findings
    .map((finding) => finding.experiment?.successCriterion)
    .filter((item): item is string => Boolean(item))
    .slice(0, 1)
    .map((item) => `Se o critério “${item}” falhar, o avanço regride.`);
  const lines = [...fromRef, ...fromConduct];
  return lines.length ? lines : ['O risco de regressão acompanha a conduta, quando ela existe.'];
}

function projectAssumptions(caps: Array<WalkthroughCapability & { finding?: OutcomeFinding }>): string[] {
  const fromRef = caps.flatMap((cap) => {
    const ref = capabilityReferenceCatalog[cap.id];
    return (ref?.interpretationLimits ?? []).slice(0, 1);
  });
  return fromRef.length
    ? fromRef
    : ['Premissas de índice, alvo e prognóstico da área devem ser revistas na próxima leitura.'];
}

function prioritizeCapabilities(
  findings: OutcomeFinding[],
  capabilities: WalkthroughCapability[],
): Array<WalkthroughCapability & { finding?: OutcomeFinding }> {
  const byId = new Map(capabilities.map((cap) => [cap.id, { ...cap }]));
  const ordered: Array<WalkthroughCapability & { finding?: OutcomeFinding }> = [];
  for (const finding of findings) {
    const existing = byId.get(finding.detailCapability);
    if (existing) {
      ordered.push({ ...existing, finding });
      byId.delete(finding.detailCapability);
    } else {
      ordered.push({
        id: finding.detailCapability,
        label: CapabilityTaxonomy.labelFor(finding.detailCapability),
        level: 1,
        finding,
      });
    }
  }
  for (const cap of byId.values()) ordered.push(cap);
  return ordered.sort((a, b) => a.level - b.level);
}

function leavesOf(node: OrganizationalAreaNode): string[] {
  const ids: string[] = [];
  const walk = (item: OrganizationalAreaNode) => {
    if (item.leafId) ids.push(item.leafId);
    (item.children ?? []).forEach(walk);
  };
  walk(node);
  return ids;
}

function clampStage(value: number): CapabilityStageLevel {
  return Math.max(0, Math.min(4, Math.floor(value))) as CapabilityStageLevel;
}

function joinOr(parts: string[], fallback: string): string {
  return parts.length ? parts.join('; ') : fallback;
}
