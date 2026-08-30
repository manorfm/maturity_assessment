import type { DecisionAuthority, FindingContainment } from './diagnostic-contract.js';
import type { ConstraintKind } from './group-recommendation-engine.js';
import type { OutcomeFinding } from './report-outcome.js';

export type TransformationPhase = 'stabilize' | 'shorten-feedback' | 'shared-capability' | 'operating-model' | 'adaptive-capability';
export type QualitativeLevel = 'low' | 'moderate' | 'high';

export type TransformationStep = {
  order: number;
  pattern: string;
  title: string;
  phase: TransformationPhase;
  authority: DecisionAuthority;
  containment: FindingContainment;
  prerequisites: string[];
  dependsOn: string[];
  incompatibilities: string[];
  riskDisplacement: string;
  cost: QualitativeLevel;
  risk: QualitativeLevel;
  reversibility: QualitativeLevel;
};

export type TransformationPortfolio = {
  version: 'transformation-portfolio-v1';
  sequence: TransformationStep[];
  conditioned: Array<{ pattern: string; title: string; condition: string }>;
};

type InterventionPolicy = Pick<TransformationStep, 'prerequisites' | 'incompatibilities' | 'riskDisplacement' | 'cost' | 'risk' | 'reversibility'>;

const defaultPolicy: InterventionPolicy = {
  prerequisites: ['Nomear responsável, fronteira do experimento e estado inicial do indicador.'],
  incompatibilities: ['Não ampliar a solução enquanto a causa e a autoridade não forem confirmadas no evento observado.'],
  riskDisplacement: 'A melhoria local pode deslocar espera ou falha para a próxima fronteira; acompanhe o fluxo ponta a ponta.',
  cost: 'moderate', risk: 'moderate', reversibility: 'high',
};

const policies: Partial<Record<ConstraintKind, InterventionPolicy>> = {
  policy: {
    prerequisites: ['Explicitar o risco protegido e quem possui autoridade para alterar a política.'],
    incompatibilities: ['Não remover controle obrigatório ou regulatório sem uma proteção equivalente.'],
    riskDisplacement: 'Simplificar a aprovação pode deslocar risco para operação ou auditoria se o guardrail não produzir evidência.',
    cost: 'moderate', risk: 'high', reversibility: 'moderate',
  },
  governance: {
    prerequisites: ['Separar obrigação legítima de compensação por baixa confiança técnica.'],
    incompatibilities: ['Não padronizar riscos diferentes no mesmo rito de decisão.'],
    riskDisplacement: 'Delegar decisão sem limites observáveis pode deslocar risco para segurança, confiabilidade ou auditoria.',
    cost: 'moderate', risk: 'high', reversibility: 'moderate',
  },
  organization: {
    prerequisites: ['Nomear serviços, decisões e dependências que hoje não possuem owner efetivo.'],
    incompatibilities: ['Não redesenhar organograma antes de demonstrar a fronteira que produz espera ou conflito.'],
    riskDisplacement: 'Mover responsabilidade pode apenas transferir o handoff se autoridade, capacidade e interfaces não mudarem juntas.',
    cost: 'high', risk: 'high', reversibility: 'low',
  },
  platform: {
    prerequisites: ['Demonstrar demanda recorrente, adequação do caminho e capacidade de operar o serviço compartilhado.'],
    incompatibilities: ['Não impor um caminho comum que não atende o contexto nem medir adoção como conformidade.'],
    riskDisplacement: 'Centralizar a capacidade pode trocar reinvenção por fila ou dependência se produto, suporte e feedback não forem financiados.',
    cost: 'high', risk: 'moderate', reversibility: 'moderate',
  },
  tooling: {
    prerequisites: ['Definir o comportamento que a ferramenta deve habilitar e o indicador que comprova o efeito.'],
    incompatibilities: ['Não tratar instalação ou licença como evidência de capacidade.'],
    riskDisplacement: 'Automação sem ownership e feedback pode esconder falhas ou criar uma nova dependência operacional.',
    cost: 'moderate', risk: 'moderate', reversibility: 'high',
  },
  knowledge: {
    prerequisites: ['Identificar a competência aplicada que falta e uma oportunidade real para praticá-la.'],
    incompatibilities: ['Não usar treinamento genérico quando política, acesso ou prioridade impedem a execução.'],
    riskDisplacement: 'Capacitação sem trabalho protegido e acompanhamento pode aumentar expectativa sem mudar o sistema.',
    cost: 'moderate', risk: 'low', reversibility: 'high',
  },
  priority: {
    prerequisites: ['Explicitar resultado esperado, horizonte de decisão e capacidade disponível para aprender.'],
    incompatibilities: ['Não mudar funding apenas porque uma cerimônia ou artefato está ausente.'],
    riskDisplacement: 'Alterar alocação sem limites de capacidade pode deslocar interrupções e custo para operação ou manutenção.',
    cost: 'high', risk: 'high', reversibility: 'low',
  },
};

const feedbackCapabilities = new Set(['continuous-integration', 'release-feedback', 'quality-strategy', 'sdlc-automation', 'observability-practice', 'incident-management']);
const adaptiveCapabilities = new Set(['technical-capability', 'organizational-learning', 'leadership-management']);

export class TransformationPortfolioPlanner {
  static plan(findings: OutcomeFinding[]): TransformationPortfolio {
    const conditioned = findings
      .filter((finding) => finding.prescription?.status === 'investigate' || finding.mechanism === 'undetermined')
      .map((finding) => ({ pattern: finding.pattern, title: finding.title, condition: finding.prescription?.reason ?? finding.missingEvidence ?? 'Discriminar mecanismo, contenção e autoridade antes de escolher a solução.' }));
    const ready = findings.filter((finding) => !conditioned.some((item) => item.pattern === finding.pattern));
    const ranked = [...ready].sort((left, right) => phaseRank(phaseFor(left)) - phaseRank(phaseFor(right)) || right.priority - left.priority || left.pattern.localeCompare(right.pattern));
    const sequence: TransformationStep[] = [];
    for (const finding of ranked) {
      const phase = phaseFor(finding);
      const policy = policies[finding.mechanism ?? 'undetermined'] ?? defaultPolicy;
      const predecessor = [...sequence].reverse().find((candidate) => phaseRank(candidate.phase) < phaseRank(phase)
        && (candidate.containment !== 'team' || finding.containment === 'team'));
      sequence.push({
        order: sequence.length + 1,
        pattern: finding.pattern,
        title: finding.title,
        phase,
        authority: finding.decisionAuthority ?? 'undetermined',
        containment: finding.containment ?? 'undetermined',
        prerequisites: [...policy.prerequisites],
        dependsOn: predecessor ? [predecessor.pattern] : [],
        incompatibilities: [...policy.incompatibilities],
        riskDisplacement: policy.riskDisplacement,
        cost: policy.cost,
        risk: policy.risk,
        reversibility: policy.reversibility,
      });
    }
    return { version: 'transformation-portfolio-v1', sequence, conditioned };
  }
}

function phaseFor(finding: OutcomeFinding): TransformationPhase {
  if (finding.detailCapability === 'team-ownership' || finding.severity === 'critical' || finding.impacts?.includes('security')) return 'stabilize';
  if (feedbackCapabilities.has(finding.detailCapability)) return 'shorten-feedback';
  if (finding.containment === 'shared-service' || finding.containment === 'external' || finding.mechanism === 'platform' || finding.mechanism === 'tooling') return 'shared-capability';
  if (finding.containment === 'organizational-policy' || finding.containment === 'organizational-structure' || finding.mechanism === 'priority' || finding.mechanism === 'governance') return 'operating-model';
  if (adaptiveCapabilities.has(finding.detailCapability) || finding.mechanism === 'knowledge' || finding.mechanism === 'capacity') return 'adaptive-capability';
  return 'shorten-feedback';
}

function phaseRank(phase: TransformationPhase): number {
  return ['stabilize', 'shorten-feedback', 'shared-capability', 'operating-model', 'adaptive-capability'].indexOf(phase);
}
