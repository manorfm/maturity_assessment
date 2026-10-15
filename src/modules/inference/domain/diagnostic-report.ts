import { findAreaPath, type OrganizationalAreaMap } from './organizational-areas.js';
import type { OutcomeFinding, ReportOutcome } from './report-outcome.js';
import { uniqueFindingsByPattern } from './report-outcome.js';
import { guidanceFor, hasExplicitGuidance } from './solution-guidance.js';
import type { IndexPublication, MaturitySlice } from './stage-posterior.js';
import {
  advancedPracticeCatalog,
  assessReadiness,
  bottleneckStatus,
  detectPrematureAdoptions,
  nextStepTowardPractice,
  resolvePrerequisitePosteriors,
  technicalPhaseFor,
  type AdvancedPractice,
  type LeafEvidence,
  type PrerequisitePosterior,
  type ReadinessAssessment,
} from './advanced-readiness.js';
import { learningFrontier, projectLearningFrontier, type EnablementEdge, type FrontierBrief, type FrontierNode } from './learning-frontier.js';
import { projectHistoryAssessment, type HistoryAssessment, type IndexReading } from './reading-history.js';
import {
  classifyCynefin,
  classifyEvidenceGrade,
  classifyLearningMode,
  foundationIsReplicated,
  transferWarningFor,
  type CynefinDomain,
  type EvidenceGrade,
  type LearningMode,
  type TreatmentConduct,
} from './treatment-contract.js';
import { primaryArchetypeFor } from './systemic-archetypes.js';
import { enablementCatalog } from './learning-frontier.js';
import { selectPulseItems, type PulseCatalogItem } from '../../catalog/item-catalog.js';
import type { StageDistribution } from '../../measurement/domain/measurement-params.js';
import { aggregateParentIndex } from '../../measurement/domain/index-aggregation.js';
import type { SophisticationDistribution } from './sophistication-matrix.js';
import { TransformationPortfolioPlanner, type QualitativeLevel } from './transformation-portfolio.js';
import { authorityRole } from './finding-narrative.js';

export type ReportGap = { gap: string };

export type LaudoFinding = {
  order: number;
  title: string;
  reading: string;
  path: string;
  support: string;
  nodeId: string;
  destination: 'capability' | 'readiness';
  areas: number;
};

export type LaudoComplaint = ReportGap | { quote: string; author: string };

export type LaudoDivergence = { title: string; left: string; right: string };

export type DiagnosticLaudo = {
  version: 'diagnostic-report-v2';
  context: string;
  complaint: LaudoComplaint;
  mechanism: string | ReportGap;
  reading: ReportGap | { index: number; band: [number, number]; coverage: number; target?: number; technical?: MaturitySlice; organizational?: MaturitySlice; profile?: string; narrative: string };
  findings: LaudoFinding[];
  otherFindings: string[];
  divergences: LaudoDivergence[] | ReportGap;
  constraint: { title: string; body: string } | ReportGap;
  conduct: TreatmentConduct[];
  prognosis: ReportGap;
  unknowns: string[];
  exams: string[];
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
  context?: string;
  complaint?: { quote: string; author: string };
  perspectiveGaps?: Array<{ title: string; capability?: string; strongerProfiles?: string[]; constrainedProfiles?: string[] }>;
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
    destination: 'readiness',
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
      destination: 'capability',
      areas: Math.max(1, finding.affectedCapabilities?.length ?? 1),
    })),
  ];
  const observedPatterns = published.map((finding) => finding.pattern);
  const dependsOn = portfolioDependsOn(published);
  const prematureConduct: TreatmentConduct[] = premature.slice(0, 2).map((item) => {
    const learningMode = 'work-experiment' as const;
    return {
      action: item.action,
      owner: 'Quem autoriza a prática avançada neste recorte',
      success: `Pré-requisitos essenciais de ${item.practiceLabel} com p_k ≥ 0,3 antes de ampliar escopo`,
      horizon: publishConductHorizon({ learningMode }),
      authority: 'management',
      cynefin: 'complex',
      doesNotSolve: 'Não substitui subir observabilidade, reversão ou aprendizado; só contém o risco da prática cedo demais.',
      learningMode,
    };
  });
  const conduct = [
    ...prematureConduct,
    ...primary.slice(0, Math.max(0, 3 - prematureConduct.length)).map((finding) => (
      conductFrom(finding, observedPatterns, dependencyOf(finding, published, dependsOn))
    )),
  ];
  const constraintFact = input.outcome.finding
    ? input.outcome.finding.cause || input.outcome.reading || input.outcome.finding.title
    : '';
  const queueEffect = 'Enquanto essa restrição existir, melhorar outras capacidades antes dela tende a aumentar a fila, não a velocidade.';
  const constraint = input.outcome.finding
    ? { title: input.outcome.limiterLabel, body: `${constraintFact} ${queueEffect}` }
    : { gap: 'Ainda não há uma restrição principal publicada.' };
  const divergences = (input.perspectiveGaps ?? []).slice(0, 3).map(divergenceFrom);
  const unknowns = published.map((finding) => finding.missingEvidence).filter((item): item is string => Boolean(item)).slice(0, 4);
  if (!unknowns.length) unknowns.push('O motivo da avaliação ainda não foi registrado no projeto.');
  const otherFromPublished = published.slice(slots).map((finding) => finding.title);
  const otherFromPremature = premature.slice(2).map((item) => item.title);
  const quote = input.complaint?.quote.trim() ?? '';
  const author = input.complaint?.author.trim() ?? '';
  const mechanismText = input.outcome.reading.trim();
  return {
    version: 'diagnostic-report-v2',
    context: input.context?.trim() || 'O contexto do projeto ainda não foi registrado.',
    complaint: quote && author
      ? { quote, author }
      : { gap: 'O projeto ainda não registrou o motivo da avaliação nas palavras de quem contratou.' },
    mechanism: mechanismText || { gap: 'Ainda não há uma frase de mecanismo publicada.' },
    reading: readingFrom(input.index, input.organizationalAreas),
    findings,
    otherFindings: [...otherFromPremature, ...otherFromPublished],
    divergences: divergences.length ? divergences : { gap: 'Ainda não há divergência publicada com faixa percentual. O modelo m1 não separa escala de visibilidade.' },
    constraint,
    conduct,
    prognosis: { gap: 'Prognóstico em seis meses exige duas distribuições do índice. Esta leitura ainda não as publica. É uma direção provável, não é uma promessa.' },
    unknowns,
    exams: [],
    footer: {
      sample: sampleLine(input.sample),
      instrument: input.instrument ?? 'Instrumento vigente · modelo m1',
      calibration: input.calibration ?? 'Estimativas provisórias até a calibração com piloto.',
    },
  };
}

function divergenceFrom(gap: { title: string; strongerProfiles?: string[]; constrainedProfiles?: string[] }): LaudoDivergence {
  const side = (profiles: string[] | undefined, verb: string) => profiles?.length
    ? `${profiles.join(', ')} ${verb}`
    : 'Este lado da divergência ainda não tem relato.';
  return {
    title: gap.title,
    left: side(gap.strongerProfiles, 'descreve um sistema mais folgado.'),
    right: side(gap.constrainedProfiles, 'descreve a restrição no mesmo recorte.'),
  };
}

const technicalSystemIds = new Set(['product', 'engineering', 'operations']);

/** Mesma simulação da raiz (05 §7.3): o recorte só entra se a faixa publicar. */
export const maturitySliceDraws = 8_000;
export const maturitySliceSeed = 1;

type LeafDistribution = readonly [number, number, number, number, number];

/**
 * Maturidade técnica (Produto, Engenharia, Operação) e organizacional (Organização).
 * Grupo sem folha publicada, ou com faixa larga demais, fica de fora (05 §7.4).
 */
export function publishMaturitySlices(
  leaves: ReadonlyArray<{ id: string; distribution: LeafDistribution }>,
  map: OrganizationalAreaMap,
): { technical?: MaturitySlice; organizational?: MaturitySlice } {
  const technical: Record<string, LeafDistribution> = {};
  const organizational: Record<string, LeafDistribution> = {};
  for (const leaf of leaves) {
    const systemId = findAreaPath(map, leaf.id)?.[0]?.id;
    if (systemId === 'organization') organizational[leaf.id] = leaf.distribution;
    else if (systemId && technicalSystemIds.has(systemId)) technical[leaf.id] = leaf.distribution;
  }
  const technicalSlice = sliceWhenPublished(technical);
  const organizationalSlice = sliceWhenPublished(organizational);
  return {
    ...(technicalSlice ? { technical: technicalSlice } : {}),
    ...(organizationalSlice ? { organizational: organizationalSlice } : {}),
  };
}

function sliceWhenPublished(leaves: Record<string, LeafDistribution>): MaturitySlice | undefined {
  const ids = Object.keys(leaves);
  if (!ids.length) return undefined;
  const parent = aggregateParentIndex({
    leaves,
    weights: Object.fromEntries(ids.map((id) => [id, 1])),
    draws: maturitySliceDraws,
    seed: maturitySliceSeed,
  });
  if (parent.band[1] - parent.band[0] > 50) return undefined;
  return { index: parent.index, band: parent.band };
}

function readingFrom(index: IndexPublication | undefined, map: OrganizationalAreaMap): DiagnosticLaudo['reading'] {
  if (!index?.published) {
    return { gap: index?.published === false ? index.reason : 'Esta leitura ainda não publica índice com faixa, cobertura e alvo. O modelo em execução é m1.' };
  }
  const slices = index.leaves
    ? publishMaturitySlices(index.leaves, map)
    : {
        ...(index.technical ? { technical: index.technical } : {}),
        ...(index.organizational ? { organizational: index.organizational } : {}),
      };
  return {
    index: index.index,
    band: index.band,
    coverage: index.coverage,
    ...(index.target !== undefined ? { target: index.target } : {}),
    ...(slices.technical ? { technical: slices.technical } : {}),
    ...(slices.organizational ? { organizational: slices.organizational } : {}),
    narrative: 'O índice resume a posterior do estágio. Não é meta de bônus.',
  };
}

const immediateExperiment = new Set<LearningMode>(['work-experiment', 'kata', 'pair']);
/** Comunidade e rodízio espalham o que já foi aprendido: só cabem depois da fronteira (23 §5). */
const afterFrontier = new Set<LearningMode>(['community', 'rotation']);

/**
 * Horizonte da conduta (01 §8). A tela desenha este campo e não escolhe outro.
 * O que destrava agora — sem predecessora e experimento imediato (trabalho, kata, par) — fica em 0–30.
 * O que espera um pré-requisito (“depende de”) fica em 1–3 meses, como a capacidade que ainda não é experimento imediato (curso, prática guiada, imersão).
 * Comunidade e rodízio ficam em 3–12 meses. Contenção de adoção prematura sem outra conduta na frente permanece em 0–30.
 */
function publishConductHorizon(conduct: { dependency?: string; learningMode?: LearningMode }): TreatmentConduct['horizon'] {
  if (conduct.learningMode && afterFrontier.has(conduct.learningMode)) return '3-12';
  if (conduct.dependency?.startsWith('depende de')) return '1-3';
  if (conduct.learningMode && !immediateExperiment.has(conduct.learningMode)) return '1-3';
  return '0-30';
}

function portfolioDependsOn(published: OutcomeFinding[]): Map<string, string[]> {
  return new Map(TransformationPortfolioPlanner.plan(published).sequence.map((step) => [step.pattern, step.dependsOn]));
}

function dependencyOf(finding: OutcomeFinding, published: OutcomeFinding[], dependsOn: Map<string, string[]>): string {
  const predecessor = published.find((item) => (dependsOn.get(finding.pattern) ?? []).includes(item.pattern));
  return predecessor
    ? `depende de ${predecessor.experiment?.action || predecessor.intervention || predecessor.title}`
    : 'sem dependência';
}

function conductFrom(finding: OutcomeFinding, observedPatterns: string[], dependency = 'sem dependência'): TreatmentConduct {
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
    dependency,
    horizon: publishConductHorizon({ dependency, learningMode }),
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

export type AudienceField = { label: string; body: string; published: boolean };

export type AudienceReading = {
  path: string;
  pathPublished: boolean;
  title: string;
  fact: string;
  direction: AudienceField[];
  team: AudienceField[];
  roles: string;
  rolesPublished: boolean;
  bonus: string;
};

export const audienceBonus = 'O acompanhamento não vira meta de bônus nem avaliação individual.';

const costLine: Record<QualitativeLevel, string> = {
  low: 'Custo baixo no recorte do experimento. A ordem de grandeza se estima com o time; não exige contratação.',
  moderate: 'Custo moderado: tempo de quem já opera o fluxo. A ordem de grandeza se estima com o time; não exige contratação.',
  high: 'Custo alto: muda capacidade ou estrutura. A ordem de grandeza se estima com quem autoriza.',
};

const roleMark = /liderança|responsável|plataforma|engenharia|governança|time|segurança|produto|arquitetura|qualidade|operação|fluxo|política|capacidade/i;

/** Um achado por vez, com a decisão de quem autoriza e a semana de quem executa. */
export function projectAudienceReadings(input: {
  findings: OutcomeFinding[];
  map: OrganizationalAreaMap;
}): AudienceReading[] {
  const published = uniqueFindingsByPattern(input.findings).filter((finding) => finding.confidence >= 0.5).slice(0, 3);
  const portfolio = TransformationPortfolioPlanner.plan(published);
  const patterns = published.map((finding) => finding.pattern);
  const prognosis = primaryArchetypeFor(patterns)?.prognosisWithoutTreatment;
  return published.map((finding) => {
    const trail = findAreaPath(input.map, finding.detailCapability);
    const guidance = guidanceFor(finding.pattern, finding.foundation, finding.title);
    const ready = finding.prescription?.status !== 'investigate' && Boolean(finding.experiment || finding.intervention);
    const action = finding.experiment?.action || finding.intervention;
    const step = portfolio.sequence.find((item) => item.pattern === finding.pattern);
    const local = finding.containment === 'team';
    const owner = finding.experiment?.owner;
    const roles = [authorityRole(finding.decisionAuthority), owner && roleMark.test(owner) ? owner : '']
      .filter((item) => item && item !== 'ainda não determinada');
    const investigation = 'Este achado ainda é investigação. A decisão e a semana entram quando o experimento estiver publicado.';
    return {
      path: trail?.length ? trail.map((node) => node.label).join(' › ') : 'O caminho desta capacidade ainda não está no mapa.',
      pathPublished: Boolean(trail?.length),
      title: finding.title,
      fact: guidance.plainExplanation,
      direction: ready
        ? [
          { label: 'Decisão pedida', body: `Autorizar ou recusar: ${action}. Revisão: ${finding.experiment?.reviewHorizon ?? 'quando o efeito puder ser visto'}.`, published: true },
          prognosis
            ? { label: 'Risco de não agir', body: prognosis, published: true }
            : { label: 'Risco de não agir', body: 'O risco de não agir entra quando dois padrões do mesmo arquétipo estiverem publicados.', published: false },
          step
            ? { label: 'Investimento', body: costLine[step.cost], published: true }
            : { label: 'Investimento', body: 'O investimento entra quando o passo publicar o custo.', published: false },
          finding.experiment?.metric
            ? { label: 'O que acompanhar', body: `${finding.experiment.metric}. Não use como meta de bônus.`, published: true }
            : { label: 'O que acompanhar', body: 'O que acompanhar entra quando o experimento publicar o indicador.', published: false },
          step
            ? { label: 'Quando parar', body: `${step.riskDisplacement} Revisão: ${finding.experiment?.reviewHorizon ?? 'no horizonte do experimento'}.`, published: true }
            : { label: 'Quando parar', body: 'Quando parar entra quando o passo publicar o risco que pode se deslocar.', published: false },
        ]
        : [
          { label: 'Decisão pedida', body: investigation, published: false },
          { label: 'Risco de não agir', body: investigation, published: false },
          { label: 'Investimento', body: investigation, published: false },
          { label: 'O que acompanhar', body: investigation, published: false },
          { label: 'Quando parar', body: investigation, published: false },
        ],
      team: ready
        ? [
          {
            label: 'O que muda',
            body: local
              ? `Nesta semana: ${action}.`
              : `A restrição não se resolve no time. Depois da autorização, o que muda é: ${action}.`,
            published: true,
          },
          { label: 'Como fazer', body: guidance.solutionClass, published: true },
          {
            label: 'O que registrar',
            body: finding.experiment?.metric
              ? `Registre ${finding.experiment.metric}. Isso alimenta a próxima leitura; não avalia ninguém.`
              : 'O que registrar entra quando o experimento publicar o indicador.',
            published: Boolean(finding.experiment?.metric),
          },
        ]
        : [
          { label: 'O que muda', body: investigation, published: false },
          { label: 'Como fazer', body: investigation, published: false },
          { label: 'O que registrar', body: investigation, published: false },
        ],
      roles: roles.length ? roles.join('. ') : 'Ainda não há papel publicado para recorrer.',
      rolesPublished: roles.length > 0,
      bonus: audienceBonus,
    };
  });
}

export function projectTreatmentPlan(findings: OutcomeFinding[]): {
  active: TreatmentConduct[];
  waiting: TreatmentConduct[];
  deferred: TreatmentConduct[];
  later: TreatmentConduct[];
  pulse: PulseCatalogItem[];
} {
  const published = uniqueFindingsByPattern(findings).filter((finding) => finding.confidence >= 0.5);
  const observedPatterns = published.map((finding) => finding.pattern);
  const dependsOn = portfolioDependsOn(published);
  const rows = published.map((finding) => ({
    conduct: conductFrom(finding, observedPatterns, dependencyOf(finding, published, dependsOn)),
    leafId: finding.detailCapability,
  }));
  // No máximo 3 condutas ativas por nível de autoridade (08 §7). Quem depende de outra fica na espera.
  const active: TreatmentConduct[] = [];
  const waiting: TreatmentConduct[] = [];
  const deferred: TreatmentConduct[] = [];
  const activeLeaves: string[] = [];
  const byAuthority = new Map<TreatmentConduct['authority'], number>();
  for (const row of rows) {
    if (row.conduct.dependency?.startsWith('depende de')) {
      waiting.push(row.conduct);
      continue;
    }
    const count = byAuthority.get(row.conduct.authority) ?? 0;
    if (count < 3 && active.length < 9) {
      active.push(row.conduct);
      activeLeaves.push(row.leafId);
      byAuthority.set(row.conduct.authority, count + 1);
    } else {
      deferred.push(row.conduct);
    }
  }
  const treatedLeaves = [...new Set(activeLeaves)];
  const later = [...waiting, ...deferred].slice(0, 6);
  return { active, waiting, deferred, later, pulse: selectPulseItems(treatedLeaves) };
}

export function projectReadinessPage(practices: Array<{ id: string; label: string; prerequisites?: PrerequisitePosterior[]; technicalPhase?: number }>): Array<{ id: string; label: string; assessment?: ReadinessAssessment; gap?: string }> {
  return practices.map((practice) => {
    if (!practice.prerequisites?.length) return { id: practice.id, label: practice.label, gap: 'Ainda não há posterior dos pré-requisitos. Prontidão não vira índice.' };
    return { id: practice.id, label: practice.label, assessment: assessReadiness({ prerequisites: practice.prerequisites, ...(practice.technicalPhase !== undefined ? { technicalPhase: practice.technicalPhase } : {}) }) };
  });
}

export type CatalogReadinessItem = {
  id: string;
  label: string;
  assessment?: ReadinessAssessment;
  gap?: string;
  weakest?: string;
  conduct?: string;
};

/**
 * Prontidão do catálogo 22. Só há leitura quando o pré-requisito essencial
 * tem posterior de estágio. Nível pontual não publica p_k nem “Pronto”.
 */
export function projectCatalogReadiness(
  leaves: Record<string, LeafEvidence>,
  practices: AdvancedPractice[] = advancedPracticeCatalog,
): CatalogReadinessItem[] {
  const observed = leavesWithStageReading(leaves);
  return practices.map((practice) => {
    const prerequisites = resolvePrerequisitePosteriors(practice, observed);
    if (!prerequisites) {
      return { id: practice.id, label: practice.label, gap: 'Ainda não há posterior dos pré-requisitos. Prontidão não vira índice.' };
    }
    const technicalPhase = technicalPhaseFor(practice, observed);
    const assessment = assessReadiness({
      prerequisites,
      ...(technicalPhase !== undefined ? { technicalPhase } : {}),
    });
    const step = nextStepTowardPractice(practice, observed);
    return {
      id: practice.id,
      label: practice.label,
      assessment,
      weakest: bottleneckStatus(assessment).bottleneck,
      ...(step ? { conduct: step.reading } : {}),
    };
  });
}

const readinessRespondentMinimum = 5;

/** Folhas com pelo menos 5 respondentes entram como posterior. Abaixo disso não há leitura. */
export function leavesForReadinessPage(input: {
  stages: ReadonlyArray<{ id: string; respondents: number; distribution: StageDistribution }>;
  phases?: ReadonlyMap<string, { distribution: SophisticationDistribution; phase: number }>;
  practicePhases?: ReadonlyMap<string, { distribution: SophisticationDistribution; phase: number }>;
}): Record<string, LeafEvidence> {
  const leaves: Record<string, LeafEvidence> = {};
  for (const stage of input.stages) {
    if (stage.respondents < readinessRespondentMinimum) continue;
    const phase = input.phases?.get(stage.id);
    leaves[stage.id] = {
      distribution: stage.distribution,
      ...(phase ? { phaseDistribution: phase.distribution, phase: phase.phase } : {}),
    };
  }
  for (const [practiceId, phase] of input.practicePhases ?? []) {
    leaves[practiceId] = {
      ...(leaves[practiceId] ?? {}),
      phaseDistribution: phase.distribution,
      phase: phase.phase,
    };
  }
  return leaves;
}

/** Posterior de estágio entra; nível sem distribuição não. Fase técnica pode acompanhar. */
function leavesWithStageReading(leaves: Record<string, LeafEvidence>): Record<string, LeafEvidence> {
  const observed: Record<string, LeafEvidence> = {};
  for (const [id, evidence] of Object.entries(leaves)) {
    if (evidence.distribution) {
      observed[id] = {
        distribution: evidence.distribution,
        ...(evidence.phaseDistribution ? { phaseDistribution: evidence.phaseDistribution } : {}),
        ...(evidence.phase !== undefined ? { phase: evidence.phase } : {}),
      };
      continue;
    }
    if (!evidence.phaseDistribution && evidence.phase === undefined) continue;
    observed[id] = {
      ...(evidence.phaseDistribution ? { phaseDistribution: evidence.phaseDistribution } : {}),
      ...(evidence.phase !== undefined ? { phase: evidence.phase } : {}),
    };
  }
  return observed;
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

/** Passo da prontidão some quando a folha está só na faixa bloqueada da fronteira. */
export function projectReadinessSteps(
  leaves: Record<string, LeafEvidence>,
  brief: FrontierBrief,
): Map<string, { next?: string; withheld?: string }> {
  const steps = new Map<string, { next?: string; withheld?: string }>();
  for (const practice of advancedPracticeCatalog) {
    const step = nextStepTowardPractice(practice, leaves);
    if (!step) continue;
    const blocked = brief.blocked.some((item) => item.leafId === step.leafId);
    const open = brief.learnable.some((item) => item.leafId === step.leafId)
      || brief.mastered.some((item) => item.leafId === step.leafId);
    if (blocked && !open) {
      steps.set(practice.id, { withheld: `${step.bottleneckLabel} está bloqueado na fronteira e não é o próximo passo.` });
      continue;
    }
    steps.set(practice.id, { next: step.reading });
  }
  return steps;
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
