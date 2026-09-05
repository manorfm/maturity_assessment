import type { OutcomeFinding } from './report-outcome.js';
import type { TransformationPortfolio, TransformationStep } from './transformation-portfolio.js';

export type AudienceFinding = OutcomeFinding;

export type OrganizationalDecisionReport = {
  audience: 'executive';
  decisions: AudienceFinding[];
  sharedConstraints: AudienceFinding[];
  threatenedOutcomes: string[];
  sequence: TransformationStep[];
};

export type TechnologyLeadershipReport = {
  audience: 'technology-leadership';
  systemicConstraints: AudienceFinding[];
  technicalDomains: string[];
  sequence: TransformationStep[];
};

export type SpecialistReport = {
  audience: 'specialist';
  findings: AudienceFinding[];
  investigations: AudienceFinding[];
};

export type UnitManagementReport = {
  audience: 'unit-management';
  id: string;
  path: string;
  localActions: AudienceFinding[];
  receivedConstraints: AudienceFinding[];
  escalations: TransformationStep[];
  sequence: TransformationStep[];
};

export type AudienceReports = {
  version: 'audience-report-v1';
  executive: OrganizationalDecisionReport;
  technology: TechnologyLeadershipReport;
  specialist: SpecialistReport;
};

const technicalAuthorities = new Set(['platform', 'architecture']);
const technicalCapabilities = new Set([
  'continuous-integration', 'release-feedback', 'sustainable-design', 'quality-strategy', 'sdlc-automation', 'technical-capability',
  'domain-alignment', 'architecture-decisions', 'evolvability', 'integration-data', 'observability-practice', 'reliability-practice',
  'incident-management', 'cloud-reliability', 'platform-autonomy', 'reproducible-infrastructure', 'cloud-efficiency', 'software-security', 'cloud-security',
  'team-ownership', 'enabling-governance', 'collaboration', 'organizational-learning',
]);

export function audienceAsk(finding: OutcomeFinding, audience: 'executive' | 'unit-management' | 'technology-leadership'): string {
  if (finding.pattern === 'causa-capacidade-tomada-pela-proxima-iniciativa') {
    if (audience === 'executive') return 'Pare de autorizar o ciclo seguinte sem reservar pessoas para manter, cortar ou redirecionar o anterior.';
    if (audience === 'unit-management') return 'O time não falhou em aprender. Recuse iniciar o próximo item sem a revisão, ou escale a restrição.';
    return 'Não é ferramenta, cerimônia nem treinamento. É restrição de autorização de capacidade.';
  }
  if (audience === 'executive') return 'Autorizar, recusar ou redirecionar o compromisso que sustenta este padrão.';
  if (audience === 'unit-management') {
    return finding.containment === 'organizational-policy' || finding.containment === 'organizational-structure'
      ? 'A restrição não se resolve no time. Recuse o compromisso local ou escale quem autoriza.'
      : 'Há ação local possível neste recorte. Execute ou recuse o próximo item com o critério do finding.';
  }
  return 'Não compre ferramenta para um problema de autorização, política ou desenho.';
}

export class AudienceReportProjector {
  static project(input: { findings: OutcomeFinding[]; portfolio: TransformationPortfolio }): AudienceReports {
    const ready = input.findings.filter((finding) => finding.prescription?.status !== 'investigate');
    const decisions = ready.filter((finding) => finding.containment === 'organizational-policy' || finding.containment === 'organizational-structure');
    const sharedConstraints = ready.filter((finding) => finding.containment === 'shared-service' || finding.containment === 'external');
    const systemicConstraints = ready.filter((finding) => sharedConstraints.includes(finding) || technicalAuthorities.has(finding.decisionAuthority ?? '') || technicalCapabilities.has(finding.detailCapability));
    return {
      version: 'audience-report-v1',
      executive: {
        audience: 'executive',
        decisions,
        sharedConstraints,
        threatenedOutcomes: unique([...decisions, ...sharedConstraints].flatMap((finding) => finding.impacts ?? [])),
        sequence: stepsFor(input.portfolio, [...decisions, ...sharedConstraints]),
      },
      technology: {
        audience: 'technology-leadership',
        systemicConstraints,
        technicalDomains: unique(systemicConstraints.map((finding) => finding.detailCapability)),
        sequence: stepsFor(input.portfolio, systemicConstraints),
      },
      specialist: {
        audience: 'specialist',
        findings: input.findings,
        investigations: input.findings.filter((finding) => finding.prescription?.status === 'investigate'),
      },
    };
  }

  static projectUnit(input: { id: string; path: string; findings: OutcomeFinding[]; portfolio: TransformationPortfolio }): UnitManagementReport {
    const localActions = input.findings.filter((finding) => finding.containment === 'team' && finding.prescription?.status !== 'investigate');
    const receivedConstraints = input.findings.filter((finding) => finding.containment !== 'team' && finding.containment !== 'undetermined' && finding.prescription?.status !== 'investigate');
    return {
      audience: 'unit-management', id: input.id, path: input.path, localActions, receivedConstraints,
      escalations: stepsFor(input.portfolio, receivedConstraints),
      sequence: input.portfolio.sequence,
    };
  }
}

function stepsFor(portfolio: TransformationPortfolio, findings: OutcomeFinding[]): TransformationStep[] {
  const patterns = new Set(findings.map((finding) => finding.pattern));
  return portfolio.sequence.filter((step) => patterns.has(step.pattern));
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
