import type { ConstraintKind } from './group-recommendation-engine.js';

export type FindingContainment = 'team' | 'shared-service' | 'organizational-policy' | 'organizational-structure' | 'external' | 'undetermined';
export type ImpactKind = 'security' | 'reliability' | 'delivery-speed' | 'quality' | 'cost' | 'customer-experience' | 'engineering-experience' | 'change-capability' | 'predictability';
export type FindingSeverity = 'low' | 'moderate' | 'high' | 'critical' | 'undetermined';
export type DecisionAuthority = 'team' | 'cross-team' | 'platform' | 'architecture' | 'organizational-governance' | 'portfolio-leadership' | 'external-owner' | 'undetermined';
export type PrescriptionDecision = { status: 'ready' | 'investigate'; reason: string };

export type DiagnosticContext = {
  mechanism: ConstraintKind;
  containment: FindingContainment;
  missingEvidence: string;
  impacts: ImpactKind[];
  severity: FindingSeverity;
  decisionAuthority: DecisionAuthority;
  prescription: PrescriptionDecision;
};

const impactsByCapability: Record<string, ImpactKind[]> = {
  'product-direction': ['customer-experience', 'predictability'],
  'discovery-validation': ['customer-experience', 'cost', 'change-capability'],
  'portfolio-management': ['cost', 'delivery-speed', 'predictability'],
  'planning-refinement': ['quality', 'delivery-speed', 'predictability'],
  'work-management': ['delivery-speed', 'predictability', 'engineering-experience'],
  'continuous-integration': ['delivery-speed', 'quality', 'change-capability'],
  'release-feedback': ['delivery-speed', 'reliability', 'customer-experience'],
  'sustainable-design': ['quality', 'change-capability', 'engineering-experience'],
  'quality-strategy': ['quality', 'reliability', 'security'],
  'sdlc-automation': ['quality', 'delivery-speed', 'engineering-experience'],
  'technical-capability': ['quality', 'delivery-speed', 'engineering-experience'],
  'domain-alignment': ['change-capability', 'predictability', 'delivery-speed'],
  'architecture-decisions': ['change-capability', 'reliability', 'cost'],
  evolvability: ['change-capability', 'delivery-speed', 'cost'],
  'integration-data': ['quality', 'reliability', 'change-capability'],
  'observability-practice': ['reliability', 'customer-experience', 'delivery-speed'],
  'reliability-practice': ['reliability', 'customer-experience'],
  'incident-management': ['reliability', 'customer-experience', 'engineering-experience'],
  'cloud-reliability': ['reliability', 'customer-experience'],
  'platform-autonomy': ['delivery-speed', 'engineering-experience', 'change-capability'],
  'reproducible-infrastructure': ['reliability', 'change-capability', 'engineering-experience'],
  'cloud-efficiency': ['cost', 'reliability'],
  'software-security': ['security', 'quality'],
  'cloud-security': ['security', 'reliability'],
  'team-ownership': ['delivery-speed', 'predictability', 'engineering-experience'],
  'enabling-governance': ['delivery-speed', 'security', 'predictability'],
  'leadership-management': ['predictability', 'engineering-experience', 'change-capability'],
  collaboration: ['delivery-speed', 'quality', 'engineering-experience'],
  'organizational-learning': ['change-capability', 'reliability', 'quality'],
};

export function buildDiagnosticContext(input: { capability: string; constraint: ConstraintKind }): DiagnosticContext {
  const mechanism = input.constraint === 'none' || input.constraint === 'culture' ? 'undetermined' : input.constraint;
  const containment = containmentFor(mechanism);
  return {
    mechanism,
    containment,
    missingEvidence: input.constraint === 'culture'
      ? 'Ainda falta ligar a explicação cultural a uma decisão, incentivo, política, fronteira de poder ou consequência observada.'
      : missingEvidenceFor(mechanism),
    impacts: impactsByCapability[input.capability] ?? ['change-capability'],
    severity: 'undetermined',
    decisionAuthority: authorityFor(mechanism),
    prescription: prescriptionFor(mechanism, containment),
  };
}

function authorityFor(mechanism: ConstraintKind): DecisionAuthority {
  if (mechanism === 'external-dependency') return 'external-owner';
  if (mechanism === 'policy' || mechanism === 'governance' || mechanism === 'incentive') return 'organizational-governance';
  if (mechanism === 'priority') return 'portfolio-leadership';
  if (mechanism === 'organization') return 'cross-team';
  if (mechanism === 'architecture') return 'architecture';
  if (mechanism === 'platform' || mechanism === 'tooling' || mechanism === 'access') return 'platform';
  if (mechanism === 'knowledge' || mechanism === 'capacity' || mechanism === 'process' || mechanism === 'culture') return 'team';
  return 'undetermined';
}

function prescriptionFor(mechanism: ConstraintKind, containment: FindingContainment): PrescriptionDecision {
  if (mechanism === 'undetermined' || mechanism === 'none' || containment === 'undetermined') {
    return { status: 'investigate', reason: 'Ainda falta discriminar o mecanismo recorrente e onde a restrição é contida antes de escolher uma intervenção.' };
  }
  return { status: 'ready', reason: 'Mecanismo e contenção possuem evidência suficiente para testar uma intervenção condicionada.' };
}

function containmentFor(mechanism: ConstraintKind): FindingContainment {
  if (mechanism === 'external-dependency') return 'external';
  if (mechanism === 'policy' || mechanism === 'governance' || mechanism === 'incentive' || mechanism === 'priority') return 'organizational-policy';
  if (mechanism === 'organization') return 'organizational-structure';
  if (mechanism === 'platform' || mechanism === 'tooling' || mechanism === 'access') return 'shared-service';
  if (mechanism === 'knowledge' || mechanism === 'capacity' || mechanism === 'process' || mechanism === 'culture') return 'team';
  return 'undetermined';
}

function missingEvidenceFor(mechanism: ConstraintKind): string {
  if (mechanism === 'external-dependency') return 'Ainda falta distinguir obrigação de fornecedor, contrato ou regulador de uma escolha interna de operação.';
  if (mechanism === 'policy' || mechanism === 'governance') return 'Ainda falta confirmar qual risco a regra protege e se existe exigência regulatória ou caminho proporcional.';
  if (mechanism === 'undetermined' || mechanism === 'none') return 'Ainda falta discriminar o mecanismo recorrente: capacidade, processo, política, plataforma, arquitetura ou estrutura.';
  return 'Ainda falta reconstruir um evento equivalente para confirmar onde a restrição é contida e se a explicação resiste a evidência contrária.';
}
