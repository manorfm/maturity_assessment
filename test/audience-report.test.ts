import assert from 'node:assert/strict';
import test from 'node:test';
import { AudienceReportProjector } from '../src/modules/inference/domain/audience-report.js';
import { TransformationPortfolioPlanner } from '../src/modules/inference/domain/transformation-portfolio.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

function finding(overrides: Partial<OutcomeFinding> & Pick<OutcomeFinding, 'pattern' | 'title' | 'detailCapability'>): OutcomeFinding {
  return {
    kind: 'correction', cause: 'causa observada', intervention: 'teste reversível', confidence: .8, priority: .8,
    mechanism: 'process', containment: 'team', decisionAuthority: 'team', impacts: ['delivery-speed'],
    prescription: { status: 'ready', reason: 'mecanismo discriminado' },
    ...overrides,
  };
}

test('projeta públicos diferentes sem alterar a identidade do finding', () => {
  const findings = [
    finding({ pattern: 'funding', title: 'Investimento não muda com resultado', detailCapability: 'portfolio-management', mechanism: 'priority', containment: 'organizational-policy', decisionAuthority: 'portfolio-leadership', impacts: ['cost', 'customer-experience'] }),
    finding({ pattern: 'pipeline', title: 'Feedback da mudança chega tarde', detailCapability: 'continuous-integration', mechanism: 'tooling', containment: 'shared-service', decisionAuthority: 'platform', impacts: ['delivery-speed', 'quality'] }),
    finding({ pattern: 'batch-local', title: 'Uma squad acumula mudanças', detailCapability: 'work-management' }),
  ];
  const report = AudienceReportProjector.project({ findings, portfolio: TransformationPortfolioPlanner.plan(findings) });

  assert.deepEqual(report.executive.decisions.map((item) => item.pattern), ['funding']);
  assert.deepEqual(report.executive.sharedConstraints.map((item) => item.pattern), ['pipeline']);
  assert.deepEqual(report.technology.systemicConstraints.map((item) => item.pattern), ['pipeline']);
  assert.deepEqual(report.specialist.findings.map((item) => item.pattern), ['funding', 'pipeline', 'batch-local']);
  assert.equal(report.executive.decisions[0], report.specialist.findings[0]);
});

test('gerência local separa ação própria de restrição recebida e escalada', () => {
  const findings = [
    finding({ pattern: 'local', title: 'Refinamento começa depois do compromisso', detailCapability: 'planning-refinement' }),
    finding({ pattern: 'shared', title: 'Ambientes chegam por fila compartilhada', detailCapability: 'platform-autonomy', mechanism: 'platform', containment: 'shared-service', decisionAuthority: 'platform' }),
    finding({ pattern: 'policy', title: 'Aprovação corporativa trata riscos iguais', detailCapability: 'enabling-governance', mechanism: 'policy', containment: 'organizational-policy', decisionAuthority: 'organizational-governance' }),
  ];
  const report = AudienceReportProjector.projectUnit({ id: 'alfa', path: 'Empresa/Squad Alfa', findings, portfolio: TransformationPortfolioPlanner.plan(findings) });

  assert.deepEqual(report.localActions.map((item) => item.pattern), ['local']);
  assert.deepEqual(report.receivedConstraints.map((item) => item.pattern), ['shared', 'policy']);
  assert.deepEqual(report.escalations.map((item) => item.authority), ['platform', 'organizational-governance']);
});

test('achado condicionado vira investigação especialista e não decisão executiva', () => {
  const uncertain = finding({ pattern: 'uncertain', title: 'Espera sem contenção localizada', detailCapability: 'collaboration', mechanism: 'undetermined', containment: 'undetermined', decisionAuthority: 'undetermined', prescription: { status: 'investigate', reason: 'reconstruir um evento' } });
  const report = AudienceReportProjector.project({ findings: [uncertain], portfolio: TransformationPortfolioPlanner.plan([uncertain]) });
  assert.deepEqual(report.executive.decisions, []);
  assert.deepEqual(report.specialist.investigations.map((item) => item.pattern), ['uncertain']);
});
