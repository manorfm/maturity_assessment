export type PatternKind = 'virtuous' | 'vicious';
export type IncentiveKind = 'recognition' | 'deadline' | 'utilization' | 'hidden-risk' | 'volume' | 'cost' | 'outcome';
export type CompensatingBehaviorKind = 'coordination' | 'heroism' | 'workaround' | 'queue' | 'control';

export type SociotechnicalPatternInput = {
  kind: PatternKind;
  behavior: string;
  enablingCondition: string;
  localRationale: string;
  systemicEffect: string;
  reinforcementHypothesis: string;
  regressionSignal: string;
  observations: { decision: string[]; consequence: string[]; contrary: string[]; missing: string[] };
  incentive?: { kind: IncentiveKind; effectOnDecision: string };
  boundary: { observes: string; recommends: string; decides: string; executes: string };
  compensatingBehavior?: { kind: CompensatingBehaviorKind; description: string; masks: string };
  scope: { observed: string[]; eligible: string[] };
  divergence?: { perspectives: string[]; interpretation: 'visibility-boundary-or-power' };
};

export type SociotechnicalPatternView = {
  kind: PatternKind;
  behavior: string;
  enablingCondition: string;
  localRationale: string;
  systemicEffect: string;
  regressionSignal: string;
  loop: { status: 'hypothesis'; plainLanguage: string };
  evidence: { for: string[]; against: string[]; missing: string[] };
  incentive?: SociotechnicalPatternInput['incentive'];
  boundary: SociotechnicalPatternInput['boundary'];
  compensatingBehavior?: SociotechnicalPatternInput['compensatingBehavior'];
  scope: { containment: 'local' | 'observed-across-scopes'; observed: string[]; limit: string };
  divergence?: { perspectives: string[]; diagnosticEffect: 'investigate'; explanation: string };
};

export class SociotechnicalPattern {
  static create(input: SociotechnicalPatternInput): SociotechnicalPatternView {
    if (!input.observations.decision.length) throw new Error('Um ciclo exige ao menos uma decisão observada.');
    if (!input.observations.consequence.length) throw new Error('Um ciclo exige ao menos uma consequência observada.');
    if (!input.reinforcementHypothesis.trim()) throw new Error('Um ciclo exige uma hipótese explícita de reforço.');
    if (input.incentive && !input.incentive.effectOnDecision.trim()) throw new Error('Um incentivo precisa explicar como alterou a decisão observada.');

    const observedScopes = [...new Set(input.scope.observed)];
    const local = observedScopes.length <= 1;
    const scopeLimit = input.kind === 'virtuous' && local
      ? 'O resultado local não demonstra difusão para outros times ou para a organização.'
      : local
        ? 'A recorrência neste recorte não autoriza concluir contenção organizacional.'
        : 'A repetição nos recortes observados não prova que a contenção seja organizacional.';
    const relation = input.kind === 'virtuous' ? 'sustentar' : 'reforçar';

    return {
      kind: input.kind,
      behavior: input.behavior,
      enablingCondition: input.enablingCondition,
      localRationale: input.localRationale,
      systemicEffect: input.systemicEffect,
      regressionSignal: input.regressionSignal,
      loop: {
        status: 'hypothesis',
        plainLanguage: `${input.reinforcementHypothesis} Essa relação pode ${relation} o padrão; as entrevistas não comprovam causalidade sozinhas.`,
      },
      evidence: {
        for: [...input.observations.decision, ...input.observations.consequence],
        against: [...input.observations.contrary],
        missing: [...input.observations.missing],
      },
      ...(input.incentive ? { incentive: input.incentive } : {}),
      boundary: { ...input.boundary },
      ...(input.compensatingBehavior ? { compensatingBehavior: input.compensatingBehavior } : {}),
      scope: { containment: local ? 'local' : 'observed-across-scopes', observed: observedScopes, limit: scopeLimit },
      ...(input.divergence ? {
        divergence: {
          perspectives: [...new Set(input.divergence.perspectives)],
          diagnosticEffect: 'investigate',
          explanation: 'A divergência abre investigação sobre visibilidade, fronteira de decisão ou assimetria de poder; não constitui fragilidade por si só.',
        },
      } : {}),
    };
  }
}

type FindingProjectionInput = {
  kind: 'correction' | 'evolution';
  pattern: string;
  title: string;
  cause: string;
  constraint: string;
  evidence: { patterns: string[]; layers: string[]; profiles: string[]; observationLabels?: string[] };
};

const decisionOwner: Record<string, string> = {
  policy: 'Responsável pela política', governance: 'Responsável pela governança', incentive: 'Liderança responsável pelos incentivos',
  priority: 'Liderança de produto e engenharia', organization: 'Liderança organizacional', architecture: 'Responsáveis pela arquitetura',
  platform: 'Responsável pela capacidade compartilhada', access: 'Plataforma e segurança', process: 'Responsável pelo fluxo',
};

export function sociotechnicalPatternFor(input: FindingProjectionInput): SociotechnicalPatternView | undefined {
  const hasDecision = input.evidence.layers.some((layer) => layer === 'practice' || layer === 'system');
  const hasConsequence = input.evidence.layers.includes('outcome');
  if (!hasDecision || !hasConsequence || input.evidence.patterns.length < 2) return undefined;
  const kind: PatternKind = input.kind === 'evolution' ? 'virtuous' : 'vicious';
  const incentive = incentiveFor(input.constraint, input.cause);
  const observations = input.evidence.observationLabels?.length === input.evidence.patterns.length
    ? input.evidence.observationLabels
    : input.evidence.patterns;
  return SociotechnicalPattern.create({
    kind,
    behavior: input.title,
    enablingCondition: observableCondition(input.constraint),
    localRationale: localRationaleFor(input.constraint),
    systemicEffect: `A consequência apareceu no mesmo conjunto de eventos associado a “${input.title}”.`,
    reinforcementHypothesis: kind === 'virtuous'
      ? 'O resultado observado pode tornar a mesma decisão mais provável no próximo evento equivalente.'
      : 'O custo da consequência pode consumir capacidade e tornar a mesma resposta local mais provável no próximo evento.',
    regressionSignal: `O padrão “${input.title}” deixa de produzir o efeito observado ou volta a depender de exceção.`,
    observations: {
      decision: observations.slice(0, -1).map((observation) => `Decisão ou comportamento observado: ${observation}.`),
      consequence: [`Consequência observada: ${observations.at(-1)}.`],
      contrary: [],
      missing: ['Confirmar a relação de reforço e a autoridade que contém a restrição em um próximo evento equivalente.'],
    },
    ...(incentive ? { incentive } : {}),
    boundary: {
      observes: input.evidence.profiles.join(' · ') || 'Pessoas que observaram o evento',
      recommends: 'Responsável pelo recorte com as pessoas que executam o trabalho',
      decides: decisionOwner[input.constraint] ?? 'Autoridade ainda não determinada',
      executes: 'Pessoas que executam o fluxo observado',
    },
    ...(compensationFor(input.constraint)),
    scope: { observed: ['Recorte agregado publicado'], eligible: ['Demais recortes elegíveis não inferidos'] },
  });
}

function incentiveFor(constraint: string, cause: string): SociotechnicalPatternInput['incentive'] | undefined {
  const kinds: Record<string, IncentiveKind> = { incentive: 'recognition', priority: 'deadline', capacity: 'utilization' };
  const kind = kinds[constraint];
  return kind ? { kind, effectOnDecision: cause } : undefined;
}

function compensationFor(constraint: string): Pick<SociotechnicalPatternInput, 'compensatingBehavior'> | Record<string, never> {
  const definitions: Record<string, NonNullable<SociotechnicalPatternInput['compensatingBehavior']>> = {
    governance: { kind: 'control', description: 'Controles adicionais preservam confiança local no fluxo.', masks: 'A fonte da incerteza permanece sem discriminação.' },
    organization: { kind: 'coordination', description: 'Coordenação recorrente mantém a entrega atravessando fronteiras.', masks: 'A fronteira de decisão continua dependente de intervenção.' },
    knowledge: { kind: 'heroism', description: 'Conhecimento concentrado mantém o trabalho avançando.', masks: 'A capacidade não está disponível de forma reproduzível.' },
    process: { kind: 'queue', description: 'A fila organiza a dependência entre etapas.', masks: 'A espera permanece incorporada ao fluxo.' },
  };
  return definitions[constraint] ? { compensatingBehavior: definitions[constraint] } : {};
}

function observableCondition(constraint: string): string {
  return `A decisão ocorreu sob uma restrição de ${constraint === 'culture' ? 'segurança para expor risco ainda não discriminada' : constraint}.`;
}

function localRationaleFor(constraint: string): string {
  return `A resposta reduziu custo, espera ou exposição imediata para quem decidiu sob a restrição de ${constraint}.`;
}
