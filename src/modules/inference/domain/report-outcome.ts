import { CapabilityTaxonomy, cloudCapabilityIds, type CapabilityBranch } from './capability-taxonomy.js';
import { investigationFor, preservationFor } from './capability-narrative.js';

export type ReportOutcomeKind = 'insufficient' | 'preserve' | 'correct' | 'evolve' | 'discriminate';

export type OutcomeFinding = {
  kind: 'correction' | 'evolution';
  pattern: string;
  detailCapability: string;
  title: string;
  cause: string;
  intervention: string;
  confidence: number;
  priority: number;
  priorityFactors?: { intensity: number; reach: number };
  mechanism?: import('./group-recommendation-engine.js').ConstraintKind;
  containment?: import('./diagnostic-contract.js').FindingContainment;
  missingEvidence?: string;
  impacts?: import('./diagnostic-contract.js').ImpactKind[];
  severity?: import('./diagnostic-contract.js').FindingSeverity;
  decisionAuthority?: import('./diagnostic-contract.js').DecisionAuthority;
  prescription?: import('./diagnostic-contract.js').PrescriptionDecision;
  experiment?: { action: string; owner: string; metric: string; reviewHorizon: string; successCriterion: string };
  affectedCapabilities?: string[];
  foundation?: { source: string; principle: string; why: string };
  solutionCapability?: string;
  solutionReadiness?: import('./solution-readiness.js').SolutionReadiness;
  technicalDirection?: import('./technical-practice-library.js').TechnicalDirection;
  recommendationEvidence?: { supportingParticipants: number; applicablePopulation: number; contradictingParticipants: number; unclassifiedParticipants?: number; patterns: string[]; layers: string[]; profiles: string[]; strength?: import('./group-recommendation-engine.js').EvidenceStrength };
  causalAnalysis?: {
    knowledgeVersion: string;
    hypothesis: string;
    alternatives: string[];
    evidenceFor: string[];
    evidenceAgainst: string[];
    missingEvidence: string;
    limitations: string;
    sociotechnicalPattern?: import('./sociotechnical-pattern.js').SociotechnicalPatternView;
  };
};

export type ConfirmedCause = {
  pattern: string;
  label: string;
  capability: string;
  probability: number;
  support: number;
  applicable: number;
  profiles: number;
  nextQuestionLabel?: string;
};

export type FindingScopeOccurrence = {
  pattern: string;
  scopePaths: string[];
  eligibleScopePaths?: string[];
  eligibleScopeCount: number;
};

export type ReportOutcome = {
  kind: ReportOutcomeKind;
  kindLabel: string;
  limiterLabel: string;
  limiterId?: string;
  reading: string;
  nextStepTitle: string;
  nextStepBody: string;
  finding?: OutcomeFinding;
};

const kindLabels: Record<ReportOutcomeKind, string> = {
  insufficient: 'Evidência insuficiente',
  preserve: 'Preservar a prática',
  correct: 'Corrigir o limitador',
  evolve: 'Evoluir a prática',
  discriminate: 'Entender a causa antes de agir',
};

const stageLabels = ['Opaco', 'Reativo', 'Repetível', 'Gerenciado', 'Adaptativo'] as const;

export function flattenAssessedLeaves(nodes: CapabilityBranch[]): CapabilityBranch[] {
  return nodes.flatMap((node) => (node.children.length ? flattenAssessedLeaves(node.children) : node.assessed ? [node] : []));
}

export function uniqueFindingsByPattern<T extends OutcomeFinding>(findings: T[]): Array<T & { affectedCapabilities: string[] }> {
  const byPattern = new Map<string, T[]>();
  for (const finding of findings) byPattern.set(finding.pattern, [...(byPattern.get(finding.pattern) ?? []), finding]);
  return [...byPattern.values()].map((group) => {
    const lead = [...group].sort((left, right) => right.priority - left.priority || right.confidence - left.confidence)[0]!;
    return { ...lead, affectedCapabilities: [...new Set(group.map((item) => item.detailCapability))] };
  }).sort((left, right) => right.priority - left.priority || right.confidence - left.confidence);
}

export function uniqueConfirmedCauses(causes: ConfirmedCause[]): ConfirmedCause[] {
  const byPattern = new Map<string, ConfirmedCause>();
  for (const cause of causes) {
    const current = byPattern.get(cause.pattern);
    if (!current || cause.probability > current.probability) byPattern.set(cause.pattern, cause);
  }
  return [...byPattern.values()].sort((left, right) => right.probability - left.probability).slice(0, 3);
}

export function distinctiveScopes<T extends { path: string; classification: { level: number } }>(scopes: T[], globalLevel: number): T[] {
  if (scopes.length <= 1) return [];
  const roots = scopes.filter((scope) => !scopes.some((candidate) => scope.path.startsWith(`${candidate.path}/`)));
  const duplicatedRoot = roots.length === 1 && scopes.some((scope) => scope.path.startsWith(`${roots[0]!.path}/`)) ? roots[0] : undefined;
  return scopes.filter((scope) => {
    if (scope === duplicatedRoot) return false;
    const children = scopes.filter((candidate) => candidate.path.startsWith(`${scope.path}/`) && candidate.path !== scope.path);
    if (children.length === 1 && children[0]!.classification.level === scope.classification.level) return false;
    const leaves = scopes.filter((candidate) => !scopes.some((other) => other.path.startsWith(`${candidate.path}/`) && other.path !== candidate.path));
    if (!children.length && leaves.length <= 1 && scope.classification.level === globalLevel) return false;
    return true;
  });
}

export function findingScopeOccurrences<T extends { path: string; findings: OutcomeFinding[] }>(scopes: T[]): FindingScopeOccurrence[] {
  const leaves = scopes.filter((scope) => !scopes.some((candidate) => candidate.path.startsWith(`${scope.path}/`)));
  const byPattern = new Map<string, string[]>();
  for (const scope of leaves) {
    for (const finding of uniqueFindingsByPattern(scope.findings)) {
      byPattern.set(finding.pattern, [...(byPattern.get(finding.pattern) ?? []), scope.path]);
    }
  }
  return [...byPattern].map(([pattern, scopePaths]) => ({ pattern, scopePaths, eligibleScopePaths: leaves.map((scope) => scope.path), eligibleScopeCount: leaves.length }));
}

export function decideReportOutcome(input: {
  classification: { level: number; label: string; limitingCapabilities: string[] } | null;
  branches: CapabilityBranch[];
  findings: OutcomeFinding[];
  perspectiveGaps?: Array<{ title: string; capability?: string }>;
  focusId?: string;
}): ReportOutcome {
  if (!input.classification || input.classification.limitingCapabilities.includes('Evidência insuficiente')) {
    return outcome('insufficient', 'Nenhuma capacidade com cobertura suficiente', 'Ainda não há dado agregado para publicar um diagnóstico ou uma ação.', 'Aguardar o grupo mínimo', 'O relatório será conclusivo quando houver evidência coletiva suficiente, sem inventar causa ou intervenção.');
  }
  const focus = input.focusId ? findNode(input.branches, input.focusId) : undefined;
  const stageLevel = focus ? Math.max(0, Math.min(4, Math.floor(focus.level))) : input.classification.level;
  const stageLabel = focus ? stageLabels[stageLevel]! : input.classification.label;
  const uniqueFindings = uniqueFindingsByPattern(input.findings);
  const leaves = flattenAssessedLeaves(focus ? [focus] : input.branches);
  const limiter = focus && !focus.children.length && focus.assessed
    ? focus
    : decisionLimiter(leaves.length ? leaves : flattenAssessedLeaves(input.branches), stageLevel, uniqueFindings);
  const limiterLabel = limiter?.label ?? (focus?.label ?? input.classification.limitingCapabilities[0] ?? input.classification.label);
  const bound = limiter ? uniqueFindings.filter((finding) => finding.detailCapability === limiter.id || finding.affectedCapabilities?.includes(limiter.id)) : uniqueFindings;
  const leading = bound[0];
  const mixed = Boolean(limiter?.hasContradiction || (limiter && limiter.confidence < .5));
  const focusCapabilityIds = new Set(focus ? flattenNodeIds(focus) : []);
  const gap = input.focusId
    ? input.perspectiveGaps?.find((candidate) => focusCapabilityIds.has(candidate.capability ?? ''))
    : input.perspectiveGaps?.[0];

  if (gap) {
    return {
      ...outcome(
        'discriminate',
        gap.title,
        input.focusId
          ? 'Há uma hipótese candidata neste detalhamento, mas as perspectivas não descrevem o mesmo sistema. Não autorize intervenção antes de triangular visibilidade, fronteira e poder de decisão.'
          : 'As perspectivas não descrevem o mesmo sistema de trabalho. A diferença é o finding: visibilidade, fronteira ou poder — não uma nota baixa automática.',
        'Triangular a divergência observada',
        `${gap.title}. Reconstrua um evento recente com as lentes que divergem antes de prescrever processo, ferramenta ou reestruturação.`,
      ),
      ...limiterId(limiter),
    };
  }
  if (focus?.children.length && focus.level >= 4 && (!limiter || cloudCapabilityIds.has(limiter.id) || limiter.level >= 4)) {
    const preservedLeaf = flattenAssessedLeaves([focus]).find((candidate) => !cloudCapabilityIds.has(candidate.id)) ?? flattenAssessedLeaves([focus])[0];
    if (!preservedLeaf) throw new Error(`Narrativa de preservação sem capacidade observada para ${focus.id}.`);
    const preservation = preservationFor(preservedLeaf.id);
    return { ...outcome('preserve', focus.label, preservation.reading, 'Preservar antes de intervir', preservation.nextStep), limiterId: focus.id };
  }
  if (mixed) {
    return {
      ...outcome('discriminate', limiterLabel, `${limiterLabel} está em ${stageLabel.toLowerCase()}, mas as evidências deste elo ainda se misturam.`, 'Discriminar a restrição do limitador', `${limiterLabel} mistura evidências. A próxima rodada deve reconstruir um evento recente e isolar se a restrição é capacidade, autonomia, processo ou estrutura — sem abrir várias frentes.`),
      ...limiterId(limiter),
    };
  }
  if (leading) {
    if (leading.prescription?.status === 'investigate') {
      return {
        ...outcome('discriminate', limiterLabel, `${leading.title}. O comportamento é recorrente, mas a causa ou a contenção ainda não foi discriminada.`, leading.title, leading.prescription.reason),
        ...limiterId(limiter),
        finding: leading,
      };
    }
    const kind = leading.kind === 'evolution' ? 'evolve' : 'correct';
    const action = leading.experiment?.action ?? leading.intervention;
    return {
      ...outcome(kind, limiterLabel, `${leading.title}. Isso aparece em ${limiterLabel} (${stageLabel.toLowerCase()}).`, leading.title, action),
      ...limiterId(limiter),
      finding: leading,
    };
  }
  if (stageLevel >= 4 || (limiter && limiter.level >= 4)) {
    const preservation = preservationFor(limiter?.id ?? focus?.id ?? '');
    return { ...outcome('preserve', limiterLabel, preservation.reading, 'Preservar antes de intervir', preservation.nextStep), ...limiterId(limiter) };
  }
  const investigation = investigationFor(limiter?.id ?? focus?.id ?? '');
  if (!input.focusId && uniqueFindings.length === 0 && stageLevel < 4) {
    return {
      ...outcome(
        'discriminate',
        limiterLabel,
        `${limiterLabel} está em ${stageLabel.toLowerCase()} e as fragilidades observadas neste elo estão dispersas; o relatório não inventa uma causa.`,
        'Distinguir as explicações concorrentes',
        investigation.nextObservation,
      ),
      ...limiterId(limiter),
    };
  }
  return {
    ...outcome('discriminate', limiterLabel, investigation.uncertainty, 'Distinguir as explicações concorrentes', investigation.nextObservation),
    ...limiterId(limiter),
  };
}

function flattenNodeIds(node: CapabilityBranch): string[] {
  return [node.id, ...node.children.flatMap(flattenNodeIds)];
}

function decisionLimiter(leaves: CapabilityBranch[], stageLevel: number, findings: OutcomeFinding[]): CapabilityBranch | undefined {
  const known = new Set(leaves.map((leaf) => leaf.id));
  const virtualReady = findings
    .filter((finding) => finding.prescription?.status !== 'investigate' && !known.has(finding.detailCapability))
    .map((finding) => virtualLeaf(finding));
  const searchable = [...leaves, ...virtualReady];
  const atFloor = leaves.filter((leaf) => Math.floor(leaf.level) === stageLevel);
  const pool = atFloor.length ? atFloor : leaves;
  const boundTo = (leaf: CapabilityBranch, readyOnly = false) => findings.some((finding) => {
    const attached = finding.detailCapability === leaf.id || finding.affectedCapabilities?.includes(leaf.id);
    return attached && (!readyOnly || finding.prescription?.status !== 'investigate');
  });
  const notCloud = (items: CapabilityBranch[]) => items.filter((item) => !cloudCapabilityIds.has(item.id));
  const coherent = (items: CapabilityBranch[]) => items.filter((item) => !item.hasContradiction && item.confidence >= .5);
  const readyOnFloor = pool.filter((leaf) => boundTo(leaf, true));
  const readyAnywhere = searchable.filter((leaf) => boundTo(leaf, true));
  const withFinding = pool.filter((leaf) => boundTo(leaf));
  const ranked = pick(coherent(notCloud(readyOnFloor)))
    ?? pick(notCloud(readyAnywhere))
    ?? pick(coherent(notCloud(withFinding)))
    ?? pick(notCloud(withFinding))
    ?? pick(withFinding)
    ?? pick(coherent(notCloud(pool)))
    ?? pick(notCloud(pool))
    ?? pick(pool);
  return ranked;
}

function pick(items: CapabilityBranch[]): CapabilityBranch | undefined {
  if (!items.length) return undefined;
  return [...items].sort((left, right) => left.level - right.level || right.confidence - left.confidence)[0];
}

function virtualLeaf(finding: OutcomeFinding): CapabilityBranch {
  return {
    id: finding.detailCapability,
    label: CapabilityTaxonomy.labelFor(finding.detailCapability),
    level: 2,
    confidence: .8,
    evidence: finding.recommendationEvidence?.supportingParticipants ?? 2,
    hasContradiction: false,
    assessed: true,
    coverage: 1,
    children: [],
    observers: finding.recommendationEvidence?.supportingParticipants ?? 2,
    interval: { lower: 2, upper: 2 },
  };
}

function findNode(nodes: CapabilityBranch[], id: string): CapabilityBranch | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = findNode(node.children, id);
    if (nested) return nested;
  }
  return undefined;
}

function limiterId(limiter?: CapabilityBranch): { limiterId: string } | Record<string, never> {
  return limiter?.id ? { limiterId: limiter.id } : {};
}

function outcome(kind: ReportOutcomeKind, limiterLabel: string, reading: string, nextStepTitle: string, nextStepBody: string): ReportOutcome {
  return { kind, kindLabel: kindLabels[kind], limiterLabel, reading, nextStepTitle, nextStepBody };
}
