export type ObservedEventFamily = 'change' | 'incident' | 'architecture-decision' | 'security-risk' | 'environment-access' | 'product-result' | 'system-improvement';
export type ObservedResponsibility = 'build' | 'test' | 'operate' | 'provision' | 'protect' | 'architecture' | 'prioritize' | 'manage-people' | 'fund';
export type ObservedAuthority = 'decide' | 'execute' | 'recommend' | 'request' | 'observe';
export type ObservedScope = 'component' | 'service' | 'journey' | 'team' | 'cross-team' | 'organization';
export type ObservedFactKind = 'signal' | 'decision' | 'work' | 'wait' | 'workaround' | 'consequence' | 'learning';

export type ObservedFact = Readonly<{
  order: number;
  kind: ObservedFactKind;
  fact: string;
}>;

export type ObservedEventInput = {
  key: string;
  family: ObservedEventFamily;
  recency: 'last-30-days' | 'last-90-days' | 'last-comparable-event';
  trigger: string;
  observer: {
    responsibilities: ObservedResponsibility[];
    authority: ObservedAuthority;
    scope: ObservedScope;
  };
  timeline: ObservedFact[];
  reviewTrigger: string;
};

const abstractJudgment = /\b(maturidade|imaturo|maduro|ideal|ruim|bom processo|melhor prática)\b/i;

export class ObservedEvent {
  readonly key: string;
  readonly family: ObservedEventFamily;
  readonly recency: ObservedEventInput['recency'];
  readonly trigger: string;
  readonly observer: Readonly<ObservedEventInput['observer']>;
  readonly timeline: readonly ObservedFact[];
  readonly reviewTrigger: string;

  private constructor(input: ObservedEventInput) {
    this.key = input.key.trim();
    this.family = input.family;
    this.recency = input.recency;
    this.trigger = input.trigger.trim();
    this.observer = Object.freeze({ ...input.observer, responsibilities: Object.freeze([...input.observer.responsibilities]) }) as Readonly<ObservedEventInput['observer']>;
    this.timeline = Object.freeze(input.timeline.map((item) => Object.freeze({ ...item, fact: item.fact.trim() })));
    this.reviewTrigger = input.reviewTrigger.trim();
    Object.freeze(this);
  }

  static create(input: ObservedEventInput): ObservedEvent {
    if (!input.key.trim() || !input.trigger.trim() || !input.reviewTrigger.trim()) throw new Error('ObservedEvent exige chave, gatilho e condição de revisão.');
    if (input.observer.responsibilities.length === 0) throw new Error('ObservedEvent exige ao menos uma responsabilidade observável.');
    if (input.timeline.length < 2) throw new Error('ObservedEvent exige ao menos dois fatos em sequência.');
    const orders = input.timeline.map((item) => item.order);
    if (orders.some((order) => !Number.isInteger(order) || order < 1) || new Set(orders).size !== orders.length) throw new Error('ObservedEvent exige ordem temporal positiva e única.');
    if (input.timeline.some((item) => !item.fact.trim() || abstractJudgment.test(item.fact))) throw new Error('ObservedEvent rejeita fato abstrato ou julgamento de capacidade.');
    const sorted = [...orders].sort((left, right) => left - right);
    if (orders.some((order, index) => order !== sorted[index])) throw new Error('ObservedEvent exige fatos fornecidos em ordem temporal.');
    return new ObservedEvent(input);
  }
}
