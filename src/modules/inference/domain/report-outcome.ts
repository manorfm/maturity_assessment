import { cloudCapabilityIds, type CapabilityBranch } from './capability-taxonomy.js';

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
  experiment?: { action: string; owner: string; metric: string; reviewHorizon: string; successCriterion: string };
  affectedCapabilities?: string[];
  foundation?: { source: string; principle: string; why: string };
  solutionCapability?: string;
  solutionReadiness?: import('./solution-readiness.js').SolutionReadiness;
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
  discriminate: 'Discriminar antes de intervir',
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
  return scopes.filter((scope) => {
    const children = scopes.filter((candidate) => candidate.path.startsWith(`${scope.path}/`) && candidate.path !== scope.path);
    if (children.length === 1 && children[0]!.classification.level === scope.classification.level) return false;
    const leaves = scopes.filter((candidate) => !scopes.some((other) => other.path.startsWith(`${candidate.path}/`) && other.path !== candidate.path));
    if (!children.length && leaves.length <= 1 && scope.classification.level === globalLevel) return false;
    return true;
  });
}

export function decideReportOutcome(input: {
  classification: { level: number; label: string; limitingCapabilities: string[] } | null;
  branches: CapabilityBranch[];
  findings: OutcomeFinding[];
  perspectiveGaps?: Array<{ title: string; capability?: string }>;
  focusId?: string;
}): ReportOutcome {
  if (!input.classification || input.classification.limitingCapabilities.includes('Evidência insuficiente')) {
    return outcome('insufficient', 'Nenhuma capacidade com cobertura suficiente', 'Ainda não há dado agregado para publicar uma nota ou uma ação.', 'Aguardar o grupo mínimo', 'O relatório será conclusivo quando houver evidência coletiva suficiente, sem inventar causa ou intervenção.');
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
  const gap = input.focusId ? undefined : input.perspectiveGaps?.[0];

  if (gap) {
    return {
      ...outcome(
        'discriminate',
        gap.title,
        'As perspectivas não descrevem o mesmo sistema de trabalho. A diferença é o finding: visibilidade, fronteira ou poder — não uma nota baixa automática.',
        'Triangular a divergência observada',
        `${gap.title}. Reconstrua um evento recente com as lentes que divergem antes de prescrever processo, ferramenta ou reestruturação.`,
      ),
      ...limiterId(limiter),
    };
  }
  if (focus?.children.length && focus.level >= 4 && (!limiter || cloudCapabilityIds.has(limiter.id) || limiter.level >= 4)) {
    return { ...outcome('preserve', focus.label, 'As evidências convergem para uma prática sustentada neste recorte.', 'Não iniciar transformação aqui', 'Preserve a prática, acompanhe consistência sob pressão e não acrescente intervenção só para preencher o relatório.'), limiterId: focus.id };
  }
  if (mixed) {
    return {
      ...outcome('discriminate', limiterLabel, `${limiterLabel} está em ${stageLabel.toLowerCase()}, mas as evidências deste elo ainda se misturam.`, 'Discriminar a restrição do limitador', `${limiterLabel} mistura evidências. A próxima rodada deve reconstruir um evento recente e isolar se a restrição é capacidade, autonomia, processo ou estrutura — sem abrir várias frentes.`),
      ...limiterId(limiter),
    };
  }
  if (leading) {
    const kind = leading.kind === 'evolution' ? 'evolve' : 'correct';
    const action = leading.experiment?.action ?? leading.intervention;
    return {
      ...outcome(kind, limiterLabel, `${leading.title}. Isso aparece em ${limiterLabel} (${stageLabel.toLowerCase()}).`, leading.title, action),
      ...limiterId(limiter),
      finding: leading,
    };
  }
  if (stageLevel >= 4 || (limiter && limiter.level >= 4)) {
    return { ...outcome('preserve', limiterLabel, 'As evidências convergem para uma prática sustentada neste recorte.', 'Não iniciar transformação aqui', 'Preserve a prática, acompanhe consistência sob pressão e não acrescente intervenção só para preencher o relatório.'), ...limiterId(limiter) };
  }
  return {
    ...outcome('discriminate', limiterLabel, `${limiterLabel} está em ${stageLabel.toLowerCase()} e nenhuma causa recorrente foi isolada.`, 'Observar um evento recente', `Reconstrua a última ocorrência visível em ${limiterLabel} com as perspectivas que faltam. O passo é evidência, não um playbook.`),
    ...limiterId(limiter),
  };
}

function decisionLimiter(leaves: CapabilityBranch[], stageLevel: number, findings: OutcomeFinding[]): CapabilityBranch | undefined {
  const atFloor = leaves.filter((leaf) => Math.floor(leaf.level) === stageLevel);
  const pool = atFloor.length ? atFloor : leaves;
  const boundTo = (leaf: CapabilityBranch) => findings.some((finding) => finding.detailCapability === leaf.id || finding.affectedCapabilities?.includes(leaf.id));
  const notCloud = (items: CapabilityBranch[]) => items.filter((item) => !cloudCapabilityIds.has(item.id));
  const coherent = (items: CapabilityBranch[]) => items.filter((item) => !item.hasContradiction && item.confidence >= .5);
  const withFinding = pool.filter(boundTo);
  const ranked = pick(coherent(notCloud(withFinding)))
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
