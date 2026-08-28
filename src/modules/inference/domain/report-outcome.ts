import type { CapabilityBranch } from './capability-taxonomy.js';

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
  perspectiveGaps?: Array<{ title: string }>;
  focusId?: string;
}): ReportOutcome {
  if (!input.classification || input.classification.limitingCapabilities.includes('Evidência insuficiente')) {
    return outcome('insufficient', 'Nenhuma capacidade com cobertura suficiente', 'Ainda não há dado agregado para publicar uma nota ou uma ação.', 'Aguardar o grupo mínimo', 'O relatório será conclusivo quando houver evidência coletiva suficiente, sem inventar causa ou intervenção.');
  }
  const focus = input.focusId ? findNode(input.branches, input.focusId) : undefined;
  const leaves = flattenAssessedLeaves(focus ? [focus] : input.branches);
  const limiter = focus && !focus.children.length && focus.assessed
    ? focus
    : primaryLimiter(leaves.length ? leaves : flattenAssessedLeaves(input.branches), input.classification);
  const limiterLabel = limiter?.label ?? input.classification.limitingCapabilities[0] ?? input.classification.label;
  const uniqueFindings = uniqueFindingsByPattern(input.findings);
  const bound = limiter ? uniqueFindings.filter((finding) => finding.detailCapability === limiter.id || finding.affectedCapabilities?.includes(limiter.id)) : uniqueFindings;
  const leading = bound[0];
  const mixed = Boolean(limiter?.hasContradiction || (limiter && limiter.confidence < .5));
  const gap = input.focusId ? undefined : input.perspectiveGaps?.[0];

  if (mixed || gap) {
    const title = gap ? 'Triangular a divergência observada' : 'Discriminar a restrição do limitador';
    const body = gap
      ? `${gap.title}. Trate a diferença de perspectiva como finding do sistema: visibilidade, fronteira ou poder — não como nota baixa automática.`
      : `${limiterLabel} mistura evidências. A próxima rodada deve reconstruir um evento recente e isolar se a restrição é capacidade, autonomia, processo ou estrutura — sem abrir várias frentes.`;
    return { ...outcome('discriminate', limiterLabel, `${limiterLabel} está em ${input.classification.label.toLowerCase()}, mas a evidência ainda não escolhe uma intervenção segura.`, title, body), ...limiterId(limiter) };
  }
  if (leading && !mixed) {
    const kind = leading.kind === 'evolution' ? 'evolve' : 'correct';
    const action = leading.experiment?.action ?? leading.intervention;
    return {
      ...outcome(kind, limiterLabel, `${limiterLabel} limita o recorte em ${input.classification.label.toLowerCase()}. A evidência aponta um experimento compatível com o efeito observado.`, leading.title, action),
      ...limiterId(limiter),
      finding: leading,
    };
  }
  if (input.classification.level >= 4 || (limiter && limiter.level >= 4 && !mixed)) {
    return { ...outcome('preserve', limiterLabel, 'As evidências convergem para uma prática sustentada neste recorte.', 'Não iniciar transformação aqui', 'Preserve a prática, acompanhe consistência sob pressão e não acrescente intervenção só para preencher o relatório.'), ...limiterId(limiter) };
  }
  return {
    ...outcome('discriminate', limiterLabel, `${limiterLabel} está abaixo do estado adaptativo e nenhuma causa recorrente foi isolada.`, 'Observar um evento recente', `Reconstrua a última ocorrência visível em ${limiterLabel} com as perspectivas que faltam. O passo é evidência, não um playbook de processo.`),
    ...limiterId(limiter),
  };
}

function primaryLimiter(leaves: CapabilityBranch[], classification: { level: number; limitingCapabilities: string[] }): CapabilityBranch | undefined {
  const atFloor = leaves.filter((leaf) => Math.floor(leaf.level) === classification.level);
  const named = atFloor.filter((leaf) => classification.limitingCapabilities.includes(leaf.label));
  const pool = (named.length ? named : atFloor.length ? atFloor : leaves);
  return [...pool].sort((left, right) => left.level - right.level || left.confidence - right.confidence)[0];
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
