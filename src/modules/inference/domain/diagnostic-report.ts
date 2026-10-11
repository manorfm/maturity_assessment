import { findAreaPath, type OrganizationalAreaMap } from './organizational-areas.js';
import type { OutcomeFinding, ReportOutcome } from './report-outcome.js';
import { uniqueFindingsByPattern } from './report-outcome.js';
import { guidanceFor, hasExplicitGuidance } from './solution-guidance.js';
import type { IndexPublication } from './stage-posterior.js';
import {
  advancedPracticeCatalog,
  assessReadiness,
  detectPrematureAdoptions,
  resolvePrerequisitePosteriors,
  technicalPhaseFor,
  type AdvancedPractice,
  type LeafEvidence,
  type PrerequisitePosterior,
  type ReadinessAssessment,
} from './advanced-readiness.js';
import { learningFrontier, projectLearningFrontier, type EnablementEdge, type FrontierNode } from './learning-frontier.js';
import { projectHistoryAssessment, type HistoryAssessment, type IndexReading } from './reading-history.js';
import {
  classifyCynefin,
  classifyEvidenceGrade,
  classifyLearningMode,
  foundationIsReplicated,
  transferWarningFor,
  type CynefinDomain,
  type EvidenceGrade,
  type TreatmentConduct,
} from './treatment-contract.js';
import { primaryArchetypeFor } from './systemic-archetypes.js';
import { enablementCatalog } from './learning-frontier.js';
import { selectPulseItems, type PulseCatalogItem } from '../../catalog/item-catalog.js';

export type ReportGap = { gap: string };

export type LaudoFinding = {
  order: number;
  title: string;
  reading: string;
  path: string;
  support: string;
  nodeId: string;
  areas: number;
};

export type DiagnosticLaudo = {
  version: 'diagnostic-report-v2';
  complaint: ReportGap;
  reading: ReportGap | { index: number; band: [number, number]; coverage: number; target?: number; technical?: number; organizational?: number; profile?: string; narrative: string };
  findings: LaudoFinding[];
  otherFindings: string[];
  divergences: Array<{ title: string; body: string }> | ReportGap;
  constraint: { title: string; body: string } | ReportGap;
  conduct: TreatmentConduct[];
  prognosis: ReportGap;
  unknowns: string[];
  footer: { sample: string; instrument: string; calibration: string };
};

const supportLabel = (confidence: number): string => {
  if (confidence >= 0.9) return 'Sustentação forte';
  if (confidence >= 0.7) return 'Sustentação moderada';
  if (confidence >= 0.5) return 'Hipótese a verificar';
  return 'Não publicada como causa';
};

const authorityOwner = (authority?: string): TreatmentConduct['authority'] => {
  if (authority === 'portfolio-leadership' || authority === 'organizational-governance') return 'direction';
  if (authority === 'architecture' || authority === 'platform') return 'specialist';
  if (authority === 'team') return 'team';
  return 'management';
};

export function projectDiagnosticLaudo(input: {
  outcome: ReportOutcome;
  findings: OutcomeFinding[];
  organizationalAreas: OrganizationalAreaMap;
  sample?: { completed: number; units: Array<{ path: string; completed: number }> };
  perspectiveGaps?: Array<{ title: string; capability?: string }>;
  index?: IndexPublication;
  instrument?: string;
  calibration?: string;
  leaves?: Record<string, LeafEvidence>;
}): DiagnosticLaudo {
  const published = uniqueFindingsByPattern(input.findings).filter((finding) => finding.confidence >= 0.5);
  const premature = input.leaves ? detectPrematureAdoptions(input.leaves) : [];
  const prematureLaudo: LaudoFinding[] = premature.slice(0, 2).map((item, index) => ({
    order: index + 1,
    title: item.title,
    reading: item.reading,
    path: 'Práticas avançadas',
    support: 'Achado de risco',
    nodeId: item.practiceId,
    areas: 1,
  }));
  const slots = Math.max(0, 3 - prematureLaudo.length);
  const primary = published.slice(0, slots);
  const findings = [
    ...prematureLaudo,
    ...primary.map((finding, index) => ({
      order: prematureLaudo.length + index + 1,
      title: finding.title,
      reading: guidanceFor(finding.pattern, finding.foundation, finding.title).plainExplanation,
      path: areaPath(input.organizationalAreas, finding.detailCapability),
      support: supportLabel(finding.confidence),
      nodeId: finding.detailCapability,
      areas: Math.max(1, finding.affectedCapabilities?.length ?? 1),
    })),
  ];
  const observedPatterns = published.map((finding) => finding.pattern);
  const prematureConduct: TreatmentConduct[] = premature.slice(0, 2).map((item) => ({
    action: item.action,
    owner: 'Quem autoriza a prática avançada neste recorte',
    success: `Pré-requisitos essenciais de ${item.practiceLabel} com p_k ≥ 0,3 antes de ampliar escopo`,
    horizon: '0-30',
    authority: 'management',
    cynefin: 'complex',
    doesNotSolve: 'Não substitui subir observabilidade, reversão ou aprendizado; só contém o risco da prática cedo demais.',
    learningMode: 'practice-in-work',
  }));
  const conduct = [
    ...prematureConduct,
    ...primary.slice(0, Math.max(0, 3 - prematureConduct.length)).map((finding) => conductFrom(finding, observedPatterns)),
  ];
  const constraint = input.outcome.finding
    ? {
      title: input.outcome.limiterLabel,
      body: input.outcome.finding.cause || input.outcome.reading || input.outcome.finding.title,
    }
    : { gap: 'Ainda não há uma restrição principal publicada.' };
  const divergences = (input.perspectiveGaps ?? []).slice(0, 3).map((gap) => ({
    title: gap.title,
    body: 'As perspectivas descrevem sistemas diferentes. Isso não mostra quem está certo.',
  }));
  const unknowns = published.map((finding) => finding.missingEvidence).filter((item): item is string => Boolean(item)).slice(0, 4);
  if (!unknowns.length) unknowns.push('O motivo da avaliação ainda não foi registrado no projeto.');
  const otherFromPublished = published.slice(slots).map((finding) => finding.title);
  const otherFromPremature = premature.slice(2).map((item) => item.title);
  return {
    version: 'diagnostic-report-v2',
    complaint: { gap: 'O projeto ainda não registrou o motivo da avaliação nas palavras de quem contratou.' },
    reading: readingFrom(input.index),
    findings,
    otherFindings: [...otherFromPremature, ...otherFromPublished],
    divergences: divergences.length ? divergences : { gap: 'Ainda não há divergência publicada com faixa percentual. O modelo m1 não separa escala de visibilidade.' },
    constraint,
    conduct,
    prognosis: { gap: 'Prognóstico em seis meses exige duas distribuições do índice. Esta leitura ainda não as publica.' },
    unknowns,
    footer: {
      sample: sampleLine(input.sample),
      instrument: input.instrument ?? 'Instrumento vigente · modelo m1',
      calibration: input.calibration ?? 'Estimativas provisórias até a calibração com piloto.',
    },
  };
}

function readingFrom(index?: IndexPublication): DiagnosticLaudo['reading'] {
  if (!index?.published) {
    return { gap: index?.published === false ? index.reason : 'Esta leitura ainda não publica índice com faixa, cobertura e alvo. O modelo em execução é m1.' };
  }
  return {
    index: index.index,
    band: index.band,
    coverage: index.coverage,
    ...(index.target !== undefined ? { target: index.target } : {}),
    narrative: 'O índice resume a posterior do estágio. Não é meta de bônus.',
  };
}

function conductFrom(finding: OutcomeFinding, observedPatterns: string[]): TreatmentConduct {
  const guidance = guidanceFor(finding.pattern, finding.foundation, finding.title);
  const cynefin: CynefinDomain = classifyCynefin({
    ...(finding.mechanism ? { mechanism: finding.mechanism } : {}),
    ...(finding.decisionAuthority ? { authority: finding.decisionAuthority } : {}),
    ...(finding.severity ? { severity: finding.severity } : {}),
    ...(finding.prescription?.status ? { prescription: finding.prescription.status } : {}),
  });
  const archetype = primaryArchetypeFor([finding.pattern, ...observedPatterns]);
  const action = finding.experiment?.action || finding.intervention || guidance.plainExplanation;
  const learningMode = classifyLearningMode(action);
  const unlocks = unlocksForLeaf(finding.detailCapability);
  return {
    action,
    owner: finding.experiment?.owner || 'Quem autoriza neste recorte',
    success: finding.experiment?.successCriterion || guidance.successCriterion,
    horizon: '0-30',
    authority: authorityOwner(finding.decisionAuthority),
    cynefin,
    evidenceGrade: classifyEvidenceGrade({
      ...(finding.foundation?.source ? { foundationSource: finding.foundation.source } : {}),
      ...(hasExplicitGuidance(finding.pattern) ? { matureReference: guidance.matureReference } : {}),
      replicated: foundationIsReplicated(finding.foundation),
    }),
    doesNotSolve: guidance.doesNotSolve,
    learningMode,
    ...(unlocks.length ? { unlocks } : {}),
    ...(transferWarningFor(learningMode) ? { lowTransferWarning: true } : {}),
    ...(archetype ? {
      archetype: archetype.label,
      prognosisWithoutTreatment: archetype.prognosisWithoutTreatment,
    } : {}),
  };
}

function unlocksForLeaf(leafId: string): string[] {
  return enablementCatalog
    .filter((edge) => edge.fromLeafId === leafId || edge.toLeafId === leafId)
    .map((edge) => `${edge.toLeafId} ${edge.toFromStage}→${edge.toToStage}`)
    .slice(0, 3);
}

function areaPath(map: OrganizationalAreaMap, capabilityId: string): string {
  const path = findAreaPath(map, capabilityId);
  if (!path?.length) return capabilityId;
  return path.map((node) => node.label).join(' › ');
}

function sampleLine(sample?: { completed: number; units: Array<{ path: string; completed: number }> }): string {
  if (!sample || sample.completed < 1) return 'Amostra ainda não publicada.';
  const units = sample.units.map((unit) => {
    const name = unit.path.split('/').at(-1) ?? unit.path;
    return `${name} (${unit.completed})`;
  }).join(' · ');
  const count = sample.units.length || 1;
  return `${sample.completed} pessoas em ${count} ${count === 1 ? 'unidade' : 'unidades'}${units ? ` — ${units}` : ''}. Recortes com menos de 5 pessoas permanecem agregados.`;
}

export type AudienceVerb = {
  audience: 'direction' | 'management' | 'team' | 'specialist';
  label: string;
  ask: string;
};

export function projectAudienceVerbs(finding: OutcomeFinding): AudienceVerb[] {
  const title = finding.title;
  return [
    { audience: 'direction', label: 'Direção', ask: `Decidir se remove a restrição que mantém “${title}”.` },
    { audience: 'management', label: 'Gestão', ask: `Priorizar o experimento deste achado no seu escopo, ou escalar o que não controla.` },
    { audience: 'team', label: 'Time', ask: `Escolher o menor experimento reversível ligado a “${title}”, sem comparar times.` },
    { audience: 'specialist', label: 'Especialista', ask: `Aprofundar a ficha do nó e checar pré-condição antes de indicar prática.` },
  ];
}

export function projectTreatmentPlan(findings: OutcomeFinding[]): {
  active: TreatmentConduct[];
  later: TreatmentConduct[];
  pulse: PulseCatalogItem[];
} {
  const published = uniqueFindingsByPattern(findings).filter((finding) => finding.confidence >= 0.5);
  const observedPatterns = published.map((finding) => finding.pattern);
  const conducts = published.map((finding) => conductFrom(finding, observedPatterns));
  // No máximo 3 condutas ativas por nível de autoridade (08 §7).
  const active: TreatmentConduct[] = [];
  const later: TreatmentConduct[] = [];
  const byAuthority = new Map<TreatmentConduct['authority'], number>();
  for (const conduct of conducts) {
    const count = byAuthority.get(conduct.authority) ?? 0;
    if (count < 3 && active.length < 9) {
      active.push(conduct);
      byAuthority.set(conduct.authority, count + 1);
    } else {
      later.push(conduct);
    }
  }
  const treatedLeaves = [...new Set(published.map((finding) => finding.detailCapability))];
  return { active, later: later.slice(0, 6), pulse: selectPulseItems(treatedLeaves) };
}

export function projectReadinessPage(practices: Array<{ id: string; label: string; prerequisites?: PrerequisitePosterior[]; technicalPhase?: number }>): Array<{ id: string; label: string; assessment?: ReadinessAssessment; gap?: string }> {
  return practices.map((practice) => {
    if (!practice.prerequisites?.length) return { id: practice.id, label: practice.label, gap: 'Ainda não há posterior dos pré-requisitos. Prontidão não vira índice.' };
    return { id: practice.id, label: practice.label, assessment: assessReadiness({ prerequisites: practice.prerequisites, ...(practice.technicalPhase !== undefined ? { technicalPhase: practice.technicalPhase } : {}) }) };
  });
}

/** Prontidão a partir do catálogo 22 e evidência por folha (nível ou posterior). */
export function projectCatalogReadiness(
  leaves: Record<string, LeafEvidence>,
  practices: AdvancedPractice[] = advancedPracticeCatalog,
): Array<{ id: string; label: string; assessment?: ReadinessAssessment; gap?: string }> {
  return projectReadinessPage(practices.map((practice) => {
    const prerequisites = resolvePrerequisitePosteriors(practice, leaves) ?? undefined;
    const technicalPhase = technicalPhaseFor(practice, leaves);
    return {
      id: practice.id,
      label: practice.label,
      ...(prerequisites ? { prerequisites } : {}),
      ...(technicalPhase !== undefined ? { technicalPhase } : {}),
    };
  }));
}

export function projectFrontierPage(
  input: { nodes: string[]; edges: EnablementEdge[] } | { leaves: Record<string, LeafEvidence> } | undefined,
): { nodes: FrontierNode[]; gap?: string } {
  if (input && 'leaves' in input) return projectLearningFrontier(input.leaves);
  if (!input || !('edges' in input) || !input.edges.length) {
    return { nodes: [], gap: 'O grafo de habilitação ainda não foi elicitado. A fronteira não é inventada a partir do nome das folhas.' };
  }
  return { nodes: learningFrontier(input.nodes, input.edges) };
}

export function projectHistoryPage(input: { previous?: IndexReading; current?: IndexReading }): HistoryAssessment {
  return projectHistoryAssessment(input);
}

export function evidenceGradeGap(conducts: TreatmentConduct[]): { gap?: string; grades: Array<{ action: string; grade: EvidenceGrade }> } {
  const grades = conducts
    .filter((item): item is TreatmentConduct & { evidenceGrade: EvidenceGrade } => Boolean(item.evidenceGrade))
    .map((item) => ({ action: item.action, grade: item.evidenceGrade }));
  if (!grades.length) return { gap: 'Grau de evidência A–D ainda não foi classificado para estas condutas.', grades: [] };
  return { grades };
}

export type { EvidenceGrade };
