import { findAreaPath, type OrganizationalAreaMap } from './organizational-areas.js';
import type { OutcomeFinding, ReportOutcome } from './report-outcome.js';
import { uniqueFindingsByPattern } from './report-outcome.js';
import { guidanceFor } from './solution-guidance.js';
import type { IndexPublication } from './stage-posterior.js';
import { assessReadiness, type PrerequisitePosterior, type ReadinessAssessment } from './advanced-readiness.js';
import { learningFrontier, type EnablementEdge, type FrontierNode } from './learning-frontier.js';
import { compareReadings, type IndexReading, type ReadingChange } from './reading-history.js';
import { classifyCynefin, type CynefinDomain, type EvidenceGrade, type TreatmentConduct } from './treatment-contract.js';

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
}): DiagnosticLaudo {
  const published = uniqueFindingsByPattern(input.findings).filter((finding) => finding.confidence >= 0.5);
  const primary = published.slice(0, 3);
  const findings = primary.map((finding, index) => ({
    order: index + 1,
    title: finding.title,
    reading: guidanceFor(finding.pattern, finding.foundation, finding.title).plainExplanation,
    path: areaPath(input.organizationalAreas, finding.detailCapability),
    support: supportLabel(finding.confidence),
    nodeId: finding.detailCapability,
    areas: Math.max(1, finding.affectedCapabilities?.length ?? 1),
  }));
  const conduct = primary.slice(0, 3).map((finding) => conductFrom(finding));
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
  return {
    version: 'diagnostic-report-v2',
    complaint: { gap: 'O projeto ainda não registrou o motivo da avaliação nas palavras de quem contratou.' },
    reading: readingFrom(input.index),
    findings,
    otherFindings: published.slice(3).map((finding) => finding.title),
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

function conductFrom(finding: OutcomeFinding): TreatmentConduct {
  const guidance = guidanceFor(finding.pattern, finding.foundation, finding.title);
  const cynefin: CynefinDomain = classifyCynefin({
    ...(finding.mechanism ? { mechanism: finding.mechanism } : {}),
    ...(finding.decisionAuthority ? { authority: finding.decisionAuthority } : {}),
    ...(finding.severity ? { severity: finding.severity } : {}),
    ...(finding.prescription?.status ? { prescription: finding.prescription.status } : {}),
  });
  return {
    action: finding.experiment?.action || finding.intervention || guidance.plainExplanation,
    owner: finding.experiment?.owner || 'Quem autoriza neste recorte',
    success: finding.experiment?.successCriterion || guidance.successCriterion,
    horizon: '0-30',
    authority: authorityOwner(finding.decisionAuthority),
    cynefin,
    doesNotSolve: guidance.doesNotSolve,
  };
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

export function projectTreatmentPlan(findings: OutcomeFinding[]): { active: TreatmentConduct[]; later: TreatmentConduct[] } {
  const published = uniqueFindingsByPattern(findings).filter((finding) => finding.confidence >= 0.5);
  const conducts = published.map(conductFrom);
  return { active: conducts.slice(0, 3), later: conducts.slice(3, 6) };
}

export function projectReadinessPage(practices: Array<{ id: string; label: string; prerequisites?: PrerequisitePosterior[]; technicalPhase?: number }>): Array<{ id: string; label: string; assessment?: ReadinessAssessment; gap?: string }> {
  return practices.map((practice) => {
    if (!practice.prerequisites?.length) return { id: practice.id, label: practice.label, gap: 'Ainda não há posterior dos pré-requisitos. Prontidão não vira índice.' };
    return { id: practice.id, label: practice.label, assessment: assessReadiness({ prerequisites: practice.prerequisites, ...(practice.technicalPhase !== undefined ? { technicalPhase: practice.technicalPhase } : {}) }) };
  });
}

export function projectFrontierPage(input: { nodes: string[]; edges: EnablementEdge[] } | undefined): { nodes: FrontierNode[]; gap?: string } {
  if (!input?.edges.length) return { nodes: [], gap: 'O grafo de habilitação ainda não foi elicitado. A fronteira não é inventada a partir do nome das folhas.' };
  return { nodes: learningFrontier(input.nodes, input.edges) };
}

export function projectHistoryPage(input: { previous?: IndexReading; current?: IndexReading }): { change?: ReadingChange; gap?: string } {
  if (!input.previous || !input.current) return { gap: 'Ainda não há duas leituras com índice e faixa. Diferença de suporte de padrão não publica melhora.' };
  return { change: compareReadings(input.previous, input.current) };
}

export function evidenceGradeGap(): { gap: string } {
  return { gap: 'Grau de evidência A–D ainda não foi classificado para estas condutas.' };
}

export type { EvidenceGrade };
