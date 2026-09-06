import type { AssessmentNode, Option } from '../../catalog/assessment-graph.js';
import { CatalogService } from '../../catalog/catalog-service.js';
import { InvitationService } from '../../assessments/invitation-service.js';
import { ParticipationService } from '../../assessments/participation-service.js';
import { ProjectService } from '../../projects/project-service.js';
import type { Database } from '../../../shared/database.js';
import { DiagnosticSamplePlanner, type SampleRole } from './diagnostic-sample-plan.js';
import { InferenceService } from '../inference-service.js';

export type MaturityBand = 'low' | 'medium' | 'high';
export type SyntheticCaseId = MaturityBand | 'boundary' | 'security-governance' | 'engineering-practice';

export type PocSyntheticOrg = {
  id: SyntheticCaseId;
  band: MaturityBand;
  name: string;
  hierarchy: string;
  units: readonly [string, string];
  story: string;
  lookFor: string[];
};

export const POC_SYNTHETIC_ORGS: readonly PocSyntheticOrg[] = [
  {
    id: 'low',
    band: 'low',
    name: 'POC — sistema opaco',
    hierarchy: 'Linha sob restrição/Alpha\nLinha sob restrição/Beta',
    units: ['Alpha', 'Beta'],
    story: 'Dezoito pessoas em duas unidades. Alpha espera esteira, regressão e empacotamento; Beta espera aprovação, ownership e coordenação. O first screen fecha a restrição sistêmica e mostra o que a alimenta — não um slogan único.',
    lookFor: [
      'Home em Corrigir, com finding pronto de responsabilidade.',
      'O efeito se apoia em espera de esteira, empacotamento e aprovação, não num slogan único.',
      'Radar na first screen; “?” é cobertura temática, não falta de gente.',
    ],
  },
  {
    id: 'medium',
    band: 'medium',
    name: 'POC — sistema reativo',
    hierarchy: 'Produto em transição/Gama\nProduto em transição/Delta',
    units: ['Gama', 'Delta'],
    story: 'Dezoito pessoas em duas unidades. Há acordo local e alguns ciclos se fecham. O cartão principal traz um problema com causa e experimento, não uma disputa de explicações.',
    lookFor: [
      'Cartão de portfólio: quem autoriza o ciclo, valor ainda não medido, teste visível.',
      'Cinco outros padrões visíveis; mapa em Produto e Engenharia.',
      'Nome não alega prática repetível; a restrição não culpa o time.',
    ],
  },
  {
    id: 'high',
    band: 'high',
    name: 'POC — prática adaptativa',
    hierarchy: 'Operação sustentável/Plataforma\nOperação sustentável/Produto',
    units: ['Plataforma', 'Produto'],
    story: 'Dezoito pessoas em duas unidades full-cycle. Entrega, operação e aprendizado resistem à urgência. O first screen preserva a prática, sem inventar transformação.',
    lookFor: [
      'Decisão de preservar a prática observada.',
      'Sistemas sem cobertura aparecem como entrevista não atravessou, não como zero nem como ausência de problema.',
      'Nome não chama a organização de adaptativa; não inventa evoluções genéricas.',
    ],
  },
];

export const POC_VALIDATION_ORGS: readonly PocSyntheticOrg[] = [
  ...POC_SYNTHETIC_ORGS,
  {
    id: 'boundary',
    band: 'low',
    name: 'POC — fronteira de times',
    hierarchy: 'Mesmo artefato/Entrega\nMesmo artefato/Sustentação',
    units: ['Entrega', 'Sustentação'],
    story: 'Dezoito pessoas em duas unidades alteram o mesmo artefato. Entrega vê espera de integração; Sustentação vê decisão e ownership fragmentados. As causas diferem; o recorte é um só.',
    lookFor: [
      'Finding de responsabilidade ou fronteira, ancorado em Entrega e na faixa.',
      'Os dois recortes aparecem; o padrão não some atrás de um corte de quatro.',
      'Não trata a divergência como fragilidade automática do time.',
    ],
  },
  {
    id: 'security-governance',
    band: 'medium',
    name: 'POC — segurança distinta de governança',
    hierarchy: 'Risco no fluxo/Ameaça\nRisco no fluxo/Aprovação',
    units: ['Ameaça', 'Aprovação'],
    story: 'Dezoito pessoas em duas unidades. Em Ameaça o risco muda o caminho da entrega; em Aprovação o mesmo controle trata riscos diferentes. Segurança e governança não viram um slogan.',
    lookFor: [
      'Segurança acende em Engenharia; governança na faixa de Gestão.',
      'Uma unidade mostra ameaça alterando o caminho; a outra, a mesma aprovação.',
      'Não funde os dois recortes num único slogan de controle.',
    ],
  },
  {
    id: 'engineering-practice',
    band: 'low',
    name: 'POC — baixa prática de engenharia',
    hierarchy: 'Prática de engenharia/Entrega\nPrática de engenharia/Sustentação',
    units: ['Entrega', 'Sustentação'],
    story: 'Dezoito pessoas em duas frentes no mesmo trabalho. Promoção manual, credencial sem autorização no recurso, retro sem efeito, sustentação à parte, negócio fechando desenho e war room como modo de gestão. O panorama mostra famílias distintas, não só espera na esteira.',
    lookFor: [
      'Famílias distintas no panorama: origem da versão, autorização no recurso e war room.',
      'Briefing de política para diretoria: o que parar de autorizar.',
      'Cruzamento entre disciplinas, sem colapsar em espera na esteira.',
    ],
  },
];

const contextOccurs = {
  'credential-context': 'occurs',
  'dependency-context': 'occurs',
  'incentive-context': 'occurs',
  'ai-context': 'occurs',
} as const;

const lowShared: Record<string, string> = {
  ...contextOccurs,
  'environment-access': 'ticket-queue',
  'credential-practice': 'handoff-secret',
  'dependency-practice': 'wait-forever',
  'incentive-practice': 'delivery-weighted',
  'ai-practice': 'shadow-model',
  'security-change': 'late-review',
  'platform-path-to-capability': 'ticket-hero',
  'platform-path-adoption': 'path-does-not-fit',
  'improvement-loop': 'action-list-fades',
  degradation: 'customer-volume',
  'incident-diagnosis': 'separate-searches',
  'diagnostic-cause': 'telemetry-gap',
  'incident-remediation': 'live-data-change',
  'incident-intake': 'central-screening',
  'platform-cloud-reliability': 'console-recovery',
  'platform-cloud-resilience-validation': 'incident-proof',
  'platform-cloud-efficiency': 'after-bill',
  'platform-cloud-sustainability': 'local-ownership',
  'product-discovery-depth': 'business-request',
  'product-outcome-depth': 'report-result',
  'management-portfolio': 'parallel-initiatives',
  'management-safety': 'risk-recorded',
  'quality-risk-strategy': 'qa-judgment',
  'quality-nonfunctional': 'incident-learning',
};

const lowUnits: Record<number, Record<string, string>> = {
  0: {
    'ready-to-release': 'manual-package',
    'deployment-probe': 'local-script',
    'quality-probe': 'regression',
    'shared-change': 'before-release',
    'integration-cadence': 'isolated-days',
    'delivery-cause': 'architecture-coupling',
    'change-verification': 'slow-suite',
    'improvement-cause': 'too-many-actions',
    'blocked-work': 'facilitator-chases',
  },
  1: {
    'urgent-change': 'manager-coordinates',
    'ready-to-release': 'approval',
    'governance-probe': 'same-flow',
    'shared-change': 'coordination',
    'integration-cadence': 'coordinated-window',
    'delivery-cause': 'process-policy',
    'architecture-pressure': 'ownership-dispute',
    'blocked-work': 'waiting-external',
    'blocked-cause': 'architecture-dependency',
    'service-ownership-continuity': 'no-accountable-group',
    'improvement-cause': 'no-autonomy',
  },
};

const mediumShared: Record<string, string> = {
  ...contextOccurs,
  'urgent-change': 'manager-coordinates',
  'shared-change': 'continuous',
  'ready-to-release': 'small-automated',
  'deployment-probe': 'shared-script',
  'quality-probe': 'risk-together',
  'governance-probe': 'same-flow',
  'integration-cadence': 'integrated-few-days',
  'change-verification': 'slow-suite',
  'environment-access': 'self-service',
  'credential-practice': 'scoped-identity',
  'dependency-practice': 'cosmetic-limit',
  'incentive-practice': 'outcome-weighted',
  'ai-practice': 'proportional-review',
  'security-change': 'team-best-effort',
  'architecture-pressure': 'planning-sync',
  'team-pressure': 'system-learning',
  'improvement-loop': 'owned-and-verified',
  'blocked-work': 'facilitator-chases',
  'decision-context': 'expert-decides',
  degradation: 'impact-change',
  'incident-intake': 'impact-routed',
  'incident-triage': 'risk-classified',
  'incident-diagnosis': 'correlated-telemetry',
  'incident-remediation': 'controlled-emergency',
  recurrence: 'action-list',
  'platform-path-to-capability': 'docs-instead-of-path',
  'platform-path-adoption': 'recurring-help',
  'platform-path-learning': 'delivery-only',
  'platform-cloud-reliability': 'provider-runbook',
  'platform-cloud-resilience-validation': 'documented-design',
  'platform-cloud-efficiency': 'cost-target',
  'platform-cloud-sustainability': 'periodic-review',
  'product-discovery-depth': 'solution-refinement',
  'product-outcome-depth': 'optimize-feature',
  'product-outcome-evidence': 'usage-reported',
  'product-operating-model-cause': 'next-initiative-consumes-capacity',
  'service-ownership-continuity': 'end-to-end-owner',
  'management-portfolio': 'executive-priority',
  'management-safety': 'risk-recorded',
  'quality-risk-strategy': 'standard-suite',
  'quality-nonfunctional': 'release-campaign',
  'legacy-change-safety': 'trial-and-observe',
  'team-health': 'add-coordination',
  'leadership-enablement': 'escalation-followup',
  'engineering-security-depth': 'pipeline-scans',
  'engineering-knowledge-depth': 'learn-while-changing',
  'release-event-consequence': 'rework-after-wait',
  'technical-feedback-consequence': 'rework-after-integration',
  'environment-event-consequence': 'wait-removed-choice',
  'security-event-consequence': 'exception-recorded',
  'architecture-event-consequence': 'meetings-remained',
  'improvement-event-consequence': 'action-not-revisited',
};

const mediumUnits: Record<number, Record<string, string>> = {
  0: {
    'delivery-cause': 'tooling-gap',
    'improvement-event-consequence': 'action-not-revisited',
    'integration-cadence': 'integrated-few-days',
    degradation: 'threshold',
    'incident-remediation': 'controlled-emergency',
    'architecture-pressure': 'planning-sync',
    'architecture-event-consequence': 'meetings-remained',
    'security-change': 'team-best-effort',
  },
  1: {
    'delivery-cause': 'process-policy',
    'improvement-loop': 'owned-and-verified',
    'improvement-event-consequence': 'effect-rechecked',
    'governance-probe': 'relationship',
    'integration-cadence': 'integrated-daily',
    'incident-remediation': 'reproducible-change',
    'architecture-pressure': 'measure-and-adjust',
    'architecture-event-consequence': 'coordination-reduced',
    'security-change': 'risk-guardrails',
    'security-event-consequence': 'design-changed',
  },
};

const highShared: Record<string, string> = {
  ...contextOccurs,
  'urgent-change': 'replan-together',
  'shared-change': 'continuous',
  'ready-to-release': 'small-automated',
  'deployment-probe': 'shared-script',
  'quality-probe': 'risk-together',
  'governance-probe': 'proportional',
  'integration-cadence': 'integrated-daily',
  'change-verification': 'repeatable-checks',
  'environment-access': 'self-service',
  'credential-practice': 'scoped-identity',
  'dependency-practice': 'decided-limits',
  'incentive-practice': 'outcome-weighted',
  'ai-practice': 'proportional-review',
  'security-change': 'risk-guardrails',
  'architecture-pressure': 'measure-and-adjust',
  'team-pressure': 'system-learning',
  'improvement-loop': 'owned-and-verified',
  'blocked-work': 'team-resolves',
  'decision-context': 'options-recorded',
  degradation: 'impact-change',
  'incident-intake': 'impact-routed',
  'incident-triage': 'risk-classified',
  'incident-diagnosis': 'correlated-telemetry',
  'incident-remediation': 'reproducible-change',
  recurrence: 'system-change',
  'platform-path-to-capability': 'supported-path',
  'platform-path-adoption': 'common-case-works',
  'platform-path-learning': 'usage-improves-path',
  'platform-cloud-reliability': 'designed-recovery',
  'platform-cloud-resilience-validation': 'failure-experiments',
  'platform-cloud-efficiency': 'unit-economics',
  'platform-cloud-sustainability': 'continuous-guardrails',
  'product-discovery-depth': 'problem-evidence',
  'product-outcome-depth': 'change-investment',
  'management-portfolio': 'portfolio-tradeoffs',
  'management-safety': 'risk-changes-decision',
  'quality-risk-strategy': 'risk-shaped',
  'quality-nonfunctional': 'continuous-risk-evidence',
  'service-ownership-continuity': 'end-to-end-owner',
  'legacy-change-safety': 'recoverable-model',
  'team-health': 'observe-and-adapt',
  'leadership-enablement': 'system-owner',
  'engineering-security-depth': 'threat-and-guardrails',
  'engineering-knowledge-depth': 'shared-model',
  'release-event-consequence': 'decision-still-useful',
  'technical-feedback-consequence': 'changed-before-integration',
  'environment-event-consequence': 'result-in-time',
  'security-event-consequence': 'design-changed',
  'architecture-event-consequence': 'coordination-reduced',
  'improvement-event-consequence': 'effect-rechecked',
};

const boundaryShared: Record<string, string> = {
  ...contextOccurs,
  'urgent-change': 'manager-coordinates',
  'shared-change': 'before-release',
  'ready-to-release': 'small-automated',
  'deployment-probe': 'shared-script',
  'quality-probe': 'risk-together',
  'integration-cadence': 'isolated-days',
  'change-verification': 'slow-suite',
  'environment-access': 'self-service',
  'credential-practice': 'scoped-identity',
  'dependency-practice': 'cosmetic-limit',
  'incentive-practice': 'delivery-weighted',
  'ai-practice': 'proportional-review',
  'security-change': 'team-best-effort',
  'improvement-loop': 'action-list-fades',
  'blocked-work': 'waiting-external',
  'decision-context': 'expert-decides',
  degradation: 'impact-change',
  'incident-intake': 'impact-routed',
  'incident-diagnosis': 'correlated-telemetry',
  'incident-remediation': 'controlled-emergency',
  'platform-path-to-capability': 'docs-instead-of-path',
  'platform-cloud-reliability': 'provider-runbook',
  'product-discovery-depth': 'solution-refinement',
  'product-outcome-depth': 'optimize-feature',
  'management-portfolio': 'executive-priority',
  'management-safety': 'risk-recorded',
  'quality-risk-strategy': 'standard-suite',
  'service-ownership-continuity': 'no-accountable-group',
  'team-health': 'add-coordination',
  'leadership-enablement': 'escalation-followup',
};

const boundaryUnits: Record<number, Record<string, string>> = {
  0: {
    'shared-change': 'before-release',
    'integration-cadence': 'isolated-days',
    'delivery-cause': 'architecture-coupling',
    'architecture-pressure': 'planning-sync',
    'blocked-work': 'facilitator-chases',
    'service-ownership-continuity': 'code-only-owner',
  },
  1: {
    'shared-change': 'coordination',
    'integration-cadence': 'coordinated-window',
    'delivery-cause': 'team-boundary',
    'architecture-pressure': 'ownership-dispute',
    'blocked-work': 'waiting-external',
    'blocked-cause': 'architecture-dependency',
    'service-ownership-continuity': 'no-accountable-group',
    'urgent-change': 'manager-coordinates',
  },
};

const securityGovernanceShared: Record<string, string> = {
  ...contextOccurs,
  'urgent-change': 'replan-together',
  'shared-change': 'continuous',
  'ready-to-release': 'small-automated',
  'deployment-probe': 'shared-script',
  'quality-probe': 'risk-together',
  'integration-cadence': 'integrated-few-days',
  'change-verification': 'repeatable-checks',
  'environment-access': 'self-service',
  'credential-practice': 'scoped-identity',
  'dependency-practice': 'decided-limits',
  'incentive-practice': 'outcome-weighted',
  'ai-practice': 'proportional-review',
  'architecture-pressure': 'planning-sync',
  'team-pressure': 'system-learning',
  'improvement-loop': 'owned-and-verified',
  'blocked-work': 'team-resolves',
  degradation: 'impact-change',
  'incident-intake': 'impact-routed',
  'incident-diagnosis': 'correlated-telemetry',
  'incident-remediation': 'controlled-emergency',
  'platform-path-to-capability': 'supported-path',
  'platform-cloud-reliability': 'designed-recovery',
  'product-discovery-depth': 'problem-evidence',
  'product-outcome-evidence': 'outcome-reviewed',
  'product-outcome-depth': 'change-investment',
  'management-portfolio': 'portfolio-tradeoffs',
  'quality-risk-strategy': 'risk-shaped',
  'service-ownership-continuity': 'end-to-end-owner',
  'team-health': 'observe-and-adapt',
  'leadership-enablement': 'system-owner',
};

const securityGovernanceUnits: Record<number, Record<string, string>> = {
  0: {
    'security-change': 'risk-guardrails',
    'security-event-consequence': 'design-changed',
    'engineering-security-depth': 'threat-and-guardrails',
    'security-threat-in-change': 'threat-in-design',
    'security-after-finding': 'finding-changes-path',
    'security-control-decision': 'contextual-control',
    'governance-probe': 'proportional',
    'ready-to-release': 'small-automated',
  },
  1: {
    'security-change': 'same-checklist',
    'security-event-consequence': 'case-fixed-only',
    'engineering-security-depth': 'pipeline-scans',
    'security-threat-in-change': 'checklist-security',
    'security-after-finding': 'finding-queued',
    'security-control-decision': 'approval-records-only',
    'security-control-learning': 'audit-passed',
    'governance-probe': 'same-flow',
    'ready-to-release': 'approval',
  },
};

const engineeringPracticeShared: Record<string, string> = {
  ...lowShared,
  'ready-to-release': 'manual-package',
  'deployment-probe': 'memory',
  'credential-practice': 'config-secret',
  'blocked-cause': 'permission-policy',
  'team-pressure': 'private-resolution',
  'war-room-thread': 'climate-hunt',
  'improvement-loop': 'ceremony-report',
  'improvement-cause': 'no-autonomy',
  'shared-surface-context': 'multiple-teams',
  'shared-surface-risk': 'overwritten-change',
  'batch-or-frontier': 'accumulated-batch',
  'decision-context': 'design-handed-off',
  'product-discovery-depth': 'business-request',
  'product-outcome-evidence': 'delivery-accepted',
  'product-operating-model-cause': 'acceptance-ends-ownership',
  'incident-intake': 'central-screening',
  'incident-triage': 'same-queue',
  'incident-routing-cause': 'support-boundary',
  'incident-remediation': 'live-console-change',
  'management-portfolio': 'parallel-initiatives',
  'iteration-purpose': 'urgent-priority',
  'priority-containment': 'org-authorization',
};

const engineeringPracticeUnits: Record<number, Record<string, string>> = {
  0: {
    'delivery-cause': 'process-policy',
    'war-room-thread': 'live-fix',
    'service-ownership-continuity': 'code-only-owner',
    'improvement-cause': 'no-capacity',
  },
  1: {
    'delivery-cause': 'team-boundary',
    'war-room-thread': 'permission-gap',
    'product-operating-model-cause': 'acceptance-ends-ownership',
    'service-ownership-continuity': 'no-accountable-group',
    'blocked-cause': 'permission-policy',
    'incident-routing-cause': 'support-boundary',
    'improvement-cause': 'no-autonomy',
  },
};

const scripts: Record<SyntheticCaseId, { shared: Record<string, string>; units: Record<number, Record<string, string>> }> = {
  low: { shared: lowShared, units: lowUnits },
  medium: { shared: mediumShared, units: mediumUnits },
  high: { shared: highShared, units: {} },
  boundary: { shared: boundaryShared, units: boundaryUnits },
  'security-governance': { shared: securityGovernanceShared, units: securityGovernanceUnits },
  'engineering-practice': { shared: engineeringPracticeShared, units: engineeringPracticeUnits },
};

export function optionForOrganizationalSynthetic(
  node: Pick<AssessmentNode, 'id' | 'options'>,
  role: SampleRole,
  unitIndex: number,
  caseId: SyntheticCaseId = 'low',
): string {
  if (node.id === 'respondent-context') return role.profile;
  if (node.id === 'work-context') return role.workContext;
  const fallbackBand = POC_VALIDATION_ORGS.find((org) => org.id === caseId)?.band ?? 'low';
  const wanted = scripts[caseId].units[unitIndex]?.[node.id] ?? scripts[caseId].shared[node.id] ?? optionByBand(node.options, fallbackBand);
  return node.options.some((option) => option.id === wanted) ? wanted : optionByBand(node.options, fallbackBand);
}

export function runOrganizationalSynthetic(db: Database, options: { band?: MaturityBand; caseId?: SyntheticCaseId } = {}) {
  const caseId = options.caseId ?? options.band ?? 'low';
  const spec = POC_VALIDATION_ORGS.find((org) => org.id === caseId)!;
  const plan = DiagnosticSamplePlanner.forGate('organizational-diagnostic');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  const created = projects.create(spec.name, spec.hierarchy);
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const units = projects.listUnits(projectId).filter((unit) => unit.isLeaf);
  plan.units.forEach((unitPlan, unitIndex) => {
    const unit = units.find((candidate) => candidate.name === spec.units[unitIndex]) ?? units[unitIndex]!;
    const tokens = invitations.createBatch(projectId, unit.id, unitPlan.roles.length).tokens;
    unitPlan.roles.forEach((role, index) => completeJourney(catalog, invitations, participations, tokens[index]!, role, unitIndex, caseId));
  });
  const report = new InferenceService(db).report(projectId, 5);
  return { band: spec.band, caseId, spec, plan, created, projectId, report };
}

export function runPocSyntheticSuite(db: Database) {
  return POC_SYNTHETIC_ORGS.map((org) => runOrganizationalSynthetic(db, { band: org.band }));
}

export function runPresentationValidationSuite(db: Database) {
  return POC_VALIDATION_ORGS.map((org) => runOrganizationalSynthetic(db, { caseId: org.id }));
}

function completeJourney(
  catalog: CatalogService,
  invitations: InvitationService,
  participations: ParticipationService,
  token: string,
  role: SampleRole,
  unitIndex: number,
  caseId: SyntheticCaseId,
): void {
  const claimed = invitations.claim(token) as { resumeToken: string };
  let guard = 0;
  while (participations.find(claimed.resumeToken)?.status === 'in_progress') {
    if (guard++ > 80) throw new Error(`Synthetic journey exceeded 80 answers for ${role.profile}/${role.workContext}`);
    const current = participations.find(claimed.resumeToken)!;
    const node = catalog.getNode(current.graph_version, current.current_node, current.profile)!;
    const option = optionForOrganizationalSynthetic(node, role, unitIndex, caseId);
    const result = participations.answer(claimed.resumeToken, option);
    if (result === 'invalid') throw new Error(`Invalid synthetic answer ${option} on ${node.id}`);
  }
}

function optionByBand(options: Option[], band: MaturityBand): string {
  const occurs = options.find((option) => option.id === 'occurs');
  if (occurs) return occurs.id;
  const practice = options.filter((option) => (option.observation ?? 'practice') === 'practice');
  const pool = practice.length ? practice : options;
  const scored = pool.map((option) => ({
    id: option.id,
    score: option.signals.reduce((total, signal) => total + signal.weight, 0),
    negativeCost: option.signals.reduce((cost, signal) => cost + Math.max(0, -signal.weight), 0),
  }));
  if (band === 'high') {
    return [...scored].sort((left, right) => left.negativeCost - right.negativeCost || right.score - left.score || left.id.localeCompare(right.id))[0]!.id;
  }
  if (band === 'low') {
    const fragile = scored.filter((item) => item.score < 0).sort((left, right) => left.score - right.score || left.id.localeCompare(right.id));
    return (fragile[0] ?? scored.sort((left, right) => Math.abs(left.score) - Math.abs(right.score) || left.id.localeCompare(right.id))[0])!.id;
  }
  const intermediate = [...scored].sort((left, right) => {
    const leftDistance = Math.abs(left.score);
    const rightDistance = Math.abs(right.score);
    if (leftDistance !== rightDistance) return leftDistance - rightDistance;
    return right.score - left.score || left.id.localeCompare(right.id);
  });
  return intermediate[0]!.id;
}
