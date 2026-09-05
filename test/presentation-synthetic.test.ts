import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { findAreaPath } from '../src/modules/inference/domain/organizational-areas.js';
import { uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';
import { guidanceFor } from '../src/modules/inference/domain/solution-guidance.js';
import {
  POC_SYNTHETIC_ORGS,
  POC_VALIDATION_ORGS,
  runOrganizationalSynthetic,
  type SyntheticCaseId,
} from '../src/modules/inference/domain/organizational-synthetic.js';
import { renderFirstScreen } from '../src/modules/projects/project-routes.js';

test('validação do produto declara três bandas e dois contrastes, sem alegar calibração', () => {
  assert.deepEqual(POC_SYNTHETIC_ORGS.map((org) => org.band), ['low', 'medium', 'high']);
  assert.deepEqual(POC_VALIDATION_ORGS.map((org) => org.id), ['low', 'medium', 'high', 'boundary', 'security-governance']);
  assert.ok(POC_VALIDATION_ORGS.every((org) => org.lookFor.length >= 3));
  assert.ok(POC_VALIDATION_ORGS.every((org) => org.units.length === 2));
});

test('opaco fecha Corrigir com responsabilidade pronta e acende Engenharia e a faixa', () => {
  const { spec, report } = runCase('low');
  const findings = uniqueFindingsByPattern(report.findings);
  const ready = findings.filter((finding) => finding.prescription?.status === 'ready');
  const investigate = findings.filter((finding) => finding.prescription?.status === 'investigate');
  assert.match(spec.name, /opaco/i);
  assert.doesNotMatch(spec.name, /adaptativ|repetível/i);
  assert.equal(report.outcome.kind, 'correct');
  assert.ok(ready.some((finding) => finding.detailCapability === 'team-ownership'));
  assert.ok(investigate.length >= 3);
  assert.equal(systemObserved(report, 'engineering'), true);
  assert.equal(report.organizationalAreas.band.observed, true);
  assertPresentationLookFor(report, spec.lookFor);
});

test('intermediário fecha portfólio, lista cinco outros e acende Produto e Engenharia', () => {
  const { spec, report } = runCase('medium');
  const findings = uniqueFindingsByPattern(report.findings);
  const ready = findings.filter((finding) => finding.prescription?.status === 'ready');
  const html = firstScreenOf(report);
  assert.match(spec.name, /reativo/i);
  assert.doesNotMatch(spec.name, /prática repetível/i);
  assert.equal(findings.length, 6);
  assert.equal(ready.length, 1);
  assert.equal(ready[0]?.detailCapability, 'portfolio-management');
  assert.doesNotMatch(guidanceFor(ready[0]!.pattern, ready[0]!.foundation, ready[0]!.title).plainExplanation, /a equipe sabe|a equipe já recebeu/i);
  assert.match(html, /Preparação concentra espera|Ambientes e capacidades chegam por fila|A lista de melhoria não fecha/);
  assert.doesNotMatch(html, /mostrando os 4/);
  assert.equal(systemObserved(report, 'product'), true);
  assert.equal(systemObserved(report, 'engineering'), true);
  assertPresentationLookFor(report, spec.lookFor);
});

test('sustentável preserva e deixa sistema sem cobertura como não observado', () => {
  const { spec, report } = runCase('high');
  const html = firstScreenOf(report);
  assert.doesNotMatch(spec.name, /organização adaptativa/i);
  assert.equal(report.outcome.kind, 'preserve');
  assert.ok(report.capabilities.filter((capability) => capability.level >= 3 && (capability.coverage ?? 0) >= 1).length >= 3);
  const unobserved = report.organizationalAreas.systems.filter((system) => !system.observed);
  assert.ok(unobserved.length >= 1);
  assert.match(html, /não observado/);
  assert.doesNotMatch(html, /Agilidade/);
  assertPresentationLookFor(report, spec.lookFor);
});

test('fronteira de times ancora responsabilidade em Entrega e na faixa', () => {
  const { spec, report } = runCase('boundary');
  const findings = uniqueFindingsByPattern(report.findings);
  const ownership = findings.find((finding) => finding.detailCapability === 'team-ownership' || /fronteira|ownership|responsab/i.test(finding.pattern));
  assert.ok(ownership, `expected ownership/frontier finding, got ${findings.map((item) => item.pattern).join(', ')}`);
  const delivery = findAreaPath(report.organizationalAreas, 'work-management') ?? findAreaPath(report.organizationalAreas, 'continuous-integration');
  assert.ok(delivery?.some((node) => node.id === 'engineering' || node.id === 'delivery'));
  assert.equal(systemObserved(report, 'engineering'), true);
  assert.equal(report.organizationalAreas.band.observed, true);
  const html = firstScreenOf(report);
  assert.match(html, /Entrega|Fluxo de trabalho|Integração/);
  assert.match(html, /Gestão|Responsabilidade/);
  assert.doesNotMatch(html, /mostrando os 4/);
  assert.ok(findings.length >= 2);
  assertPresentationLookFor(report, spec.lookFor);
});

test('segurança e governança acendem recortes distintos, sem um slogan único', () => {
  const { spec, report } = runCase('security-governance');
  const findings = uniqueFindingsByPattern(report.findings);
  const security = findings.find((finding) => finding.detailCapability === 'software-security' || finding.affectedCapabilities?.includes('software-security'));
  const governance = findings.find((finding) => finding.detailCapability === 'enabling-governance' || finding.affectedCapabilities?.includes('enabling-governance'));
  assert.ok(security || systemObserved(report, 'engineering'), 'Segurança precisa acender em Engenharia');
  assert.ok(governance || report.organizationalAreas.band.children.some((child) => child.id === 'enabling-governance' && child.observed));
  const securityPath = findAreaPath(report.organizationalAreas, 'software-security');
  const governancePath = findAreaPath(report.organizationalAreas, 'enabling-governance');
  assert.ok(securityPath?.some((node) => node.id === 'engineering'));
  assert.ok(governancePath?.some((node) => node.id === 'management'));
  const html = firstScreenOf(report);
  assert.match(html, /Segurança/);
  assert.match(html, /Governança/);
  assert.doesNotMatch(html, /segurança e governança/i);
  assert.doesNotMatch(html, /Agilidade/);
  assertPresentationLookFor(report, spec.lookFor);
});

function runCase(id: SyntheticCaseId) {
  return runOrganizationalSynthetic(createDatabase(':memory:'), { caseId: id });
}

function systemObserved(report: ReturnType<typeof runOrganizationalSynthetic>['report'], id: string) {
  return report.organizationalAreas.systems.find((system) => system.id === id)?.observed === true;
}

function firstScreenOf(report: ReturnType<typeof runOrganizationalSynthetic>['report']) {
  return renderFirstScreen({
    outcome: report.outcome,
    ...(report.classification ? { classification: report.classification } : {}),
    organizationalAreas: report.organizationalAreas,
    findings: report.findings,
    scopes: report.scopes.filter((scope) => scope.path.split('/').length > 1),
    areaBase: '/areas',
    capabilityBase: '/capabilities',
  });
}

function assertPresentationLookFor(report: ReturnType<typeof runOrganizationalSynthetic>['report'], lookFor: string[]) {
  const html = firstScreenOf(report);
  const haystack = `${report.outcome.kindLabel} ${report.outcome.finding?.title ?? report.outcome.nextStepTitle} ${html}`;
  assert.doesNotMatch(haystack, /prática repetível/i);
  assert.doesNotMatch(haystack, /organização adaptativa/i);
  assert.doesNotMatch(html, /A consequência alcança custo/);
  assert.doesNotMatch(html, />Agilidade</);
  assert.ok(lookFor.length >= 3);
}
