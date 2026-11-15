import { CANNOT_OBSERVE_ID, type AssessmentNode, type Option } from '../../catalog/assessment-graph.js';
import { CatalogService } from '../../catalog/catalog-service.js';
import { InvitationService } from '../../assessments/invitation-service.js';
import { ParticipationService } from '../../assessments/participation-service.js';
import { ProjectService } from '../../projects/project-service.js';
import type { Database } from '../../../shared/database.js';
import type { DecisionClient } from './decision-client.js';
import { DiagnosticSamplePlanner, type SampleRole } from './diagnostic-sample-plan.js';
import { InferenceService } from '../inference-service.js';

export type OrgArchetypeId = 'bureaucratic-fixed-scope' | 'digital-native-continuous';
export type OrgArchetypeLevel = 'junior' | 'pleno' | 'senior';

/** Visibility lens only — not maturity. Junior may exit these cause/probe nodes. */
const JUNIOR_VISIBILITY_NODES = new Set(['improvement-cause', 'blocked-cause', 'deployment-probe']);

export type OrgArchetypeStructure = 'bureaucratic' | 'digital-native';
export type OrgArchetypeDeliveryMode = 'fixed-scope-batch' | 'continuous-flow';

export type OrgArchetypeExpect = {
  outcomeKinds: ReadonlyArray<'correct' | 'evolve'>;
  requiredPatterns: string[];
  patternGroups: ReadonlyArray<readonly string[]>;
  minDistinctPatterns: number;
  forbiddenPatterns: string[];
  unitDivergence?: true;
  systemsObserved?: string[];
};

export type OrgArchetype = {
  id: OrgArchetypeId;
  structure: OrgArchetypeStructure;
  deliveryMode: OrgArchetypeDeliveryMode;
  name: string;
  hierarchy: string;
  units: readonly [string, string];
  expect?: OrgArchetypeExpect;
};

const contextOccurs = {
  'credential-context': 'occurs',
  'dependency-context': 'occurs',
  'incentive-context': 'occurs',
  'ai-context': 'occurs',
} as const;

/** A ≈ engineering-practice / low biases; discriminators open war-room and manual packaging. */
const bureaucraticShared: Record<string, string> = {
  ...contextOccurs,
  'group-error-climate': 'blame',
  'environment-access': 'ticket-queue',
  'credential-practice': 'config-secret',
  'dependency-practice': 'wait-forever',
  'incentive-practice': 'delivery-weighted',
  'ai-practice': 'shadow-model',
  'security-change': 'late-review',
  'platform-path-to-capability': 'ticket-hero',
  'platform-path-adoption': 'path-does-not-fit',
  'team-pressure': 'private-resolution',
  'war-room-thread': 'climate-hunt',
  'improvement-loop': 'ceremony-report',
  'improvement-cause': 'no-autonomy',
  'ready-to-release': 'manual-package',
  'deployment-probe': 'memory',
  'blocked-cause': 'permission-policy',
  'shared-surface-context': 'multiple-teams',
  'shared-surface-risk': 'overwritten-change',
  'batch-or-frontier': 'accumulated-batch',
  'decision-context': 'design-handed-off',
  'product-discovery-depth': 'business-request',
  'product-outcome-depth': 'report-result',
  'product-outcome-evidence': 'delivery-accepted',
  'product-operating-model-cause': 'acceptance-ends-ownership',
  degradation: 'customer-volume',
  'incident-diagnosis': 'separate-searches',
  'diagnostic-cause': 'telemetry-gap',
  'incident-remediation': 'live-console-change',
  'incident-intake': 'central-screening',
  'incident-triage': 'same-queue',
  'incident-routing-cause': 'support-boundary',
  'platform-cloud-reliability': 'console-recovery',
  'platform-cloud-resilience-validation': 'incident-proof',
  'platform-cloud-efficiency': 'after-bill',
  'platform-cloud-sustainability': 'local-ownership',
  'management-portfolio': 'parallel-initiatives',
  'management-safety': 'risk-recorded',
  'quality-risk-strategy': 'qa-judgment',
  'quality-nonfunctional': 'incident-learning',
  'iteration-purpose': 'urgent-priority',
  'priority-containment': 'org-authorization',
};

const bureaucraticUnits: Record<number, Record<string, string>> = {
  0: {
    'ready-to-release': 'manual-package',
    'deployment-probe': 'local-script',
    'quality-probe': 'regression',
    'shared-change': 'before-release',
    'integration-cadence': 'isolated-days',
    'delivery-cause': 'process-policy',
    'change-verification': 'slow-suite',
    'blocked-work': 'facilitator-chases',
    'war-room-thread': 'live-fix',
    'service-ownership-continuity': 'code-only-owner',
    'improvement-cause': 'no-capacity',
  },
  1: {
    'urgent-change': 'manager-coordinates',
    'ready-to-release': 'approval',
    'governance-probe': 'same-flow',
    'shared-change': 'coordination',
    'integration-cadence': 'coordinated-window',
    'delivery-cause': 'team-boundary',
    'architecture-pressure': 'ownership-dispute',
    'blocked-work': 'waiting-external',
    'blocked-cause': 'permission-policy',
    'service-ownership-continuity': 'no-accountable-group',
    'improvement-cause': 'no-autonomy',
    'product-operating-model-cause': 'acceptance-ends-ownership',
    'war-room-thread': 'permission-gap',
    'incident-routing-cause': 'support-boundary',
  },
};

/** B ≈ high band; discriminators avoid war-room and use continuous delivery options. */
const digitalNativeShared: Record<string, string> = {
  ...contextOccurs,
  'group-error-climate': 'adapt',
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
  'incident-remediation': 'controlled-emergency',
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

const scripts: Record<
  OrgArchetypeId,
  { shared: Record<string, string>; units: Record<number, Record<string, string>>; fallback: 'low' | 'high' }
> = {
  'bureaucratic-fixed-scope': { shared: bureaucraticShared, units: bureaucraticUnits, fallback: 'low' },
  'digital-native-continuous': { shared: digitalNativeShared, units: {}, fallback: 'high' },
};

export const ORG_ARCHETYPES: readonly OrgArchetype[] = [
  {
    id: 'bureaucratic-fixed-scope',
    structure: 'bureaucratic',
    deliveryMode: 'fixed-scope-batch',
    name: 'Arquétipo — burocrático / escopo fechado',
    hierarchy: 'Arquétipo A/Entrega\nArquétipo A/Sustentação',
    units: ['Entrega', 'Sustentação'],
    expect: {
      outcomeKinds: ['correct', 'evolve'],
      requiredPatterns: ['war-room-como-gestao'],
      patternGroups: [['caminho-de-versao-sem-origem', 'empacotamento-manual']],
      minDistinctPatterns: 2,
      forbiddenPatterns: [],
    },
  },
  {
    id: 'digital-native-continuous',
    structure: 'digital-native',
    deliveryMode: 'continuous-flow',
    name: 'Arquétipo — digital-native / fluxo contínuo',
    hierarchy: 'Arquétipo B/Entrega\nArquétipo B/Sustentação',
    units: ['Entrega', 'Sustentação'],
    expect: {
      outcomeKinds: ['evolve'],
      requiredPatterns: [],
      patternGroups: [],
      minDistinctPatterns: 0,
      forbiddenPatterns: ['war-room-como-gestao'],
    },
  },
];

export function optionForArchetype(
  node: Pick<AssessmentNode, 'id' | 'options'>,
  role: SampleRole,
  unitIndex: number,
  archetypeId: OrgArchetypeId,
  level?: OrgArchetypeLevel,
): string {
  if (node.id === 'respondent-context') return role.profile;
  if (node.id === 'work-context') return role.workContext;
  if (node.id.startsWith('vignette-')) {
    const anchor = node.options.find((option) => option.id === 'ritual') ?? node.options[0];
    return anchor!.id;
  }
  if (node.id.startsWith('literacy-')) {
    return node.options.find((option) => option.id === 'stop-starting')?.id ?? node.options[0]!.id;
  }
  if (node.id.startsWith('list-')) {
    return node.options.find((option) => option.id === 'count-2')?.id ?? node.options[0]!.id;
  }
  if (node.id.startsWith('free-text-')) {
    return node.options.find((option) => option.id === 'skip')?.id ?? node.options[0]!.id;
  }

  if (
    level === 'junior' &&
    JUNIOR_VISIBILITY_NODES.has(node.id) &&
    node.options.some((option) => option.id === CANNOT_OBSERVE_ID)
  ) {
    return CANNOT_OBSERVE_ID;
  }

  const script = scripts[archetypeId];
  if (!script) throw new Error(`Unknown archetypeId: ${archetypeId}`);
  const wanted =
    script.units[unitIndex]?.[node.id] ?? script.shared[node.id] ?? optionByBand(node.options, script.fallback);
  return node.options.some((option) => option.id === wanted)
    ? wanted
    : optionByBand(node.options, script.fallback);
}

export type ResolveArchetypeOptionInput = {
  node: Pick<AssessmentNode, 'id' | 'title' | 'prompt' | 'options'>;
  role: SampleRole;
  unitIndex: number;
  archetypeId: OrgArchetypeId;
  level?: OrgArchetypeLevel;
  decisionClient?: DecisionClient;
};

function isDecisionClientSkipPath(
  node: Pick<AssessmentNode, 'id' | 'options'>,
  level?: OrgArchetypeLevel,
): boolean {
  if (node.id === 'respondent-context' || node.id === 'work-context') return true;
  if (
    node.id.startsWith('vignette-') ||
    node.id.startsWith('literacy-') ||
    node.id.startsWith('list-') ||
    node.id.startsWith('free-text-')
  ) {
    return true;
  }
  return (
    level === 'junior' &&
    JUNIOR_VISIBILITY_NODES.has(node.id) &&
    node.options.some((option) => option.id === CANNOT_OBSERVE_ID)
  );
}

export function resolveArchetypeOption(input: ResolveArchetypeOptionInput): string {
  const { node, role, unitIndex, archetypeId, level, decisionClient } = input;
  if (isDecisionClientSkipPath(node, level) || !decisionClient) {
    return optionForArchetype(node, role, unitIndex, archetypeId, level);
  }

  const state =
    `archetype=${archetypeId};level=${level ?? 'unspecified'};unit=${unitIndex};` +
    `role=${role.profile}/${role.workContext};node=${node.id};title=${node.title};prompt=${node.prompt}`;
  const options = node.options.map((option) => ({ id: option.id, label: option.label }));
  const chosen = decisionClient.choose({ state, options });
  if (chosen !== null && options.some((option) => option.id === chosen)) {
    return chosen;
  }
  return optionForArchetype(node, role, unitIndex, archetypeId, level);
}

export function runArchetypeCohort(
  db: Database,
  options: { archetypeId: OrgArchetypeId; level?: OrgArchetypeLevel; decisionClient?: DecisionClient },
): {
  plan: ReturnType<typeof DiagnosticSamplePlanner.forGate>;
  created: ReturnType<ProjectService['create']>;
  projectId: string;
  report: ReturnType<InferenceService['report']>;
} {
  const archetypeId = options.archetypeId;
  const level = options.level;
  const spec = ORG_ARCHETYPES.find((candidate) => candidate.id === archetypeId);
  if (!spec) throw new Error(`Unknown archetypeId: ${archetypeId}`);

  const plan = DiagnosticSamplePlanner.forGate('organizational-diagnostic');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);

  const created = projects.create(spec.name, spec.hierarchy);
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const units = projects.listUnits(projectId).filter((unit) => unit.isLeaf);

  const decisionClient = options.decisionClient;
  plan.units.forEach((unitPlan, unitIndex) => {
    const unit = units.find((candidate) => candidate.name === spec.units[unitIndex]) ?? units[unitIndex]!;
    const tokens = invitations.createBatch(projectId, unit.id, unitPlan.roles.length).tokens;
    unitPlan.roles.forEach((role, index) => {
      completeArchetypeJourney(
        catalog,
        invitations,
        participations,
        tokens[index]!,
        role,
        unitIndex,
        archetypeId,
        level,
        decisionClient,
      );
    });
  });

  const report = new InferenceService(db).report(projectId, 5);
  return { plan, created, projectId, report };
}

function completeArchetypeJourney(
  catalog: CatalogService,
  invitations: InvitationService,
  participations: ParticipationService,
  token: string,
  role: SampleRole,
  unitIndex: number,
  archetypeId: OrgArchetypeId,
  level?: OrgArchetypeLevel,
  decisionClient?: DecisionClient,
): void {
  const claimed = invitations.claim(token) as { resumeToken: string };
  let guard = 0;
  while (participations.find(claimed.resumeToken)?.status === 'in_progress') {
    if (guard++ > 80) {
      throw new Error(`Archetype journey exceeded 80 answers for ${role.profile}/${role.workContext}`);
    }
    const current = participations.find(claimed.resumeToken)!;
    const node = catalog.getNode(current.graph_version, current.current_node, current.profile)!;
    const option = resolveArchetypeOption({
      node,
      role,
      unitIndex,
      archetypeId,
      ...(level !== undefined ? { level } : {}),
      ...(decisionClient !== undefined ? { decisionClient } : {}),
    });
    const result = participations.answer(claimed.resumeToken, option);
    if (result === 'invalid') throw new Error(`Invalid archetype answer ${option} on ${node.id}`);
  }
}

function optionByBand(options: Option[], band: 'low' | 'high'): string {
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
    return [...scored].sort(
      (left, right) =>
        left.negativeCost - right.negativeCost || right.score - left.score || left.id.localeCompare(right.id),
    )[0]!.id;
  }
  const fragile = scored
    .filter((item) => item.score < 0)
    .sort((left, right) => left.score - right.score || left.id.localeCompare(right.id));
  return (
    fragile[0] ??
    scored.sort(
      (left, right) => Math.abs(left.score) - Math.abs(right.score) || left.id.localeCompare(right.id),
    )[0]
  )!.id;
}
