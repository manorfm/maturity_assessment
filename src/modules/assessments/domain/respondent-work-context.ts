import type { Option } from '../../catalog/assessment-graph.js';

export type WorkResponsibility = 'build' | 'test' | 'operate' | 'provision' | 'protect' | 'architecture' | 'prioritize' | 'manage-people' | 'fund' | 'data' | 'design';
export type WorkAuthority = 'decide' | 'execute-within-guardrails' | 'recommend' | 'request' | 'observe';
export type WorkScope = 'component' | 'service' | 'journey' | 'team' | 'cross-team' | 'organization';
export type ObservableEvent = 'change' | 'incident' | 'security-risk' | 'environment-access' | 'architecture-decision' | 'product-result' | 'system-improvement' | 'data-change' | 'user-experience';
export type InterviewTrack = 'delivery' | 'full-cycle' | 'risk' | 'capability' | 'architecture' | 'outcomes' | 'portfolio' | 'experience';

type WorkContextData = Readonly<{
  responsibilities: readonly WorkResponsibility[];
  authority: WorkAuthority;
  scope: WorkScope;
  observableEvents: readonly ObservableEvent[];
  interviewTrack: InterviewTrack;
}>;

type WorkContextDefinition = WorkContextData & { label: string };

const definitions = {
  'build-focused': {
    label: 'Construo e verifico mudanças; operação, ambiente e decisões mais amplas costumam envolver outras pessoas.',
    responsibilities: ['build', 'test'], authority: 'execute-within-guardrails', scope: 'component',
    observableEvents: ['change', 'security-risk', 'architecture-decision'],
    interviewTrack: 'delivery',
  },
  'build-and-operate': {
    label: 'Construo, verifico e opero serviços; também consigo preparar ou ajustar o ambiente dentro de limites definidos.',
    responsibilities: ['build', 'test', 'operate', 'provision'], authority: 'execute-within-guardrails', scope: 'service',
    observableEvents: ['change', 'incident', 'security-risk', 'environment-access', 'architecture-decision'],
    interviewTrack: 'full-cycle',
  },
  'quality-and-risk': {
    label: 'Ajudo a decidir riscos e verificações e acompanho o efeito das mudanças, mesmo quando outra pessoa as implementa.',
    responsibilities: ['test', 'protect'], authority: 'recommend', scope: 'journey',
    observableEvents: ['change', 'security-risk', 'incident', 'user-experience'],
    interviewTrack: 'risk',
  },
  'shared-capability': {
    label: 'Ofereço ou opero uma capacidade usada por vários times, como ambiente, entrega, confiabilidade, acesso ou proteção.',
    responsibilities: ['operate', 'provision', 'protect'], authority: 'execute-within-guardrails', scope: 'cross-team',
    observableEvents: ['change', 'incident', 'security-risk', 'environment-access', 'system-improvement'],
    interviewTrack: 'capability',
  },
  'architecture-and-boundaries': {
    label: 'Ajudo grupos a decidir limites, dependências e evolução técnica que atravessam mais de um serviço ou time.',
    responsibilities: ['architecture'], authority: 'recommend', scope: 'cross-team',
    observableEvents: ['change', 'incident', 'architecture-decision', 'data-change'],
    interviewTrack: 'architecture',
  },
  'product-and-outcomes': {
    label: 'Decido ou recomendo prioridade, escopo e continuidade a partir de necessidade, uso e resultado do produto.',
    responsibilities: ['prioritize'], authority: 'decide', scope: 'journey',
    observableEvents: ['change', 'product-result', 'user-experience', 'system-improvement'],
    interviewTrack: 'outcomes',
  },
  'people-and-portfolio': {
    label: 'Decido ou recomendo capacidade, estrutura, desenvolvimento de pessoas, investimento ou prioridade entre grupos.',
    responsibilities: ['manage-people', 'fund', 'prioritize'], authority: 'decide', scope: 'organization',
    observableEvents: ['product-result', 'system-improvement', 'incident', 'architecture-decision'],
    interviewTrack: 'portfolio',
  },
  'data-and-experience': {
    label: 'Acompanho significado de dados ou experiência de uso e influencio mudanças que atravessam produtos e jornadas.',
    responsibilities: ['data', 'design'], authority: 'recommend', scope: 'journey',
    observableEvents: ['data-change', 'user-experience', 'product-result', 'change'],
    interviewTrack: 'experience',
  },
} as const satisfies Record<string, WorkContextDefinition>;

export type WorkContextOptionId = keyof typeof definitions;

export const workContextOptions: Option[] = Object.entries(definitions).map(([id, definition]) => ({ id, label: definition.label, signals: [] }));

export class RespondentWorkContext implements WorkContextData {
  readonly responsibilities: readonly WorkResponsibility[];
  readonly authority: WorkAuthority;
  readonly scope: WorkScope;
  readonly observableEvents: readonly ObservableEvent[];
  readonly interviewTrack: InterviewTrack;

  private constructor(value: WorkContextData) {
    this.responsibilities = Object.freeze([...value.responsibilities]);
    this.authority = value.authority;
    this.scope = value.scope;
    this.observableEvents = Object.freeze([...value.observableEvents]);
    this.interviewTrack = value.interviewTrack;
    Object.freeze(this);
  }

  static fromOption(raw: string): RespondentWorkContext {
    const definition = definitions[raw as WorkContextOptionId];
    if (!definition) throw new Error('Opção de contexto de trabalho inválida.');
    return new RespondentWorkContext(definition);
  }

  static fromJSON(raw: string): RespondentWorkContext | undefined {
    if (!raw || raw === '{}') return undefined;
    try {
      const value = JSON.parse(raw) as WorkContextData;
      if (!Array.isArray(value.responsibilities) || !value.responsibilities.length || !value.responsibilities.every((item) => validResponsibility(item))) throw new Error();
      if (!validAuthority(value.authority) || !validScope(value.scope) || !Array.isArray(value.observableEvents) || !value.observableEvents.every((item) => validEvent(item)) || !validTrack(value.interviewTrack)) throw new Error();
      return new RespondentWorkContext(value);
    } catch {
      throw new Error('Contexto de trabalho persistido é inválido.');
    }
  }

  toJSON(): WorkContextData {
    return { responsibilities: this.responsibilities, authority: this.authority, scope: this.scope, observableEvents: this.observableEvents, interviewTrack: this.interviewTrack };
  }
}

function validResponsibility(value: unknown): value is WorkResponsibility { return ['build', 'test', 'operate', 'provision', 'protect', 'architecture', 'prioritize', 'manage-people', 'fund', 'data', 'design'].includes(String(value)); }
function validAuthority(value: unknown): value is WorkAuthority { return ['decide', 'execute-within-guardrails', 'recommend', 'request', 'observe'].includes(String(value)); }
function validScope(value: unknown): value is WorkScope { return ['component', 'service', 'journey', 'team', 'cross-team', 'organization'].includes(String(value)); }
function validEvent(value: unknown): value is ObservableEvent { return ['change', 'incident', 'security-risk', 'environment-access', 'architecture-decision', 'product-result', 'system-improvement', 'data-change', 'user-experience'].includes(String(value)); }
function validTrack(value: unknown): value is InterviewTrack { return ['delivery', 'full-cycle', 'risk', 'capability', 'architecture', 'outcomes', 'portfolio', 'experience'].includes(String(value)); }
