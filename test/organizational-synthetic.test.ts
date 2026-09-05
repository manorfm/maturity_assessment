import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import {
  POC_SYNTHETIC_ORGS,
  runOrganizationalSynthetic,
  runPocSyntheticSuite,
  type MaturityBand,
} from '../src/modules/inference/domain/organizational-synthetic.js';

test('plano de POC declara três organizações com amostra de 18 pessoas', () => {
  assert.deepEqual(POC_SYNTHETIC_ORGS.map((org) => org.band), ['low', 'medium', 'high']);
  assert.ok(POC_SYNTHETIC_ORGS.every((org) => org.units.length === 2));
});

test('sintético opaco fecha uma decisão executiva, não uma coleta de impacto', () => {
  const { plan, report } = runOrganizationalSynthetic(createDatabase(':memory:'), { band: 'low' });
  assertPresentableReport(report, plan.totalPeople, 'low');
  assert.ok((report.classification?.level ?? 4) <= 1);
  assertExecutiveDecision(report);
  assertDirectorateAndUnits(report);
});

test('sintético intermediário fecha problema e solução que um diretor consegue usar', () => {
  const { plan, report } = runOrganizationalSynthetic(createDatabase(':memory:'), { band: 'medium' });
  assertPresentableReport(report, plan.totalPeople, 'medium');
  assert.ok((report.classification?.level ?? 0) >= 1);
  assert.ok((report.classification?.level ?? 4) <= 2);
  assertExecutiveDecision(report);
  assert.notEqual(report.outcome.limiterId, 'observability-practice');
  assertDirectorateAndUnits(report);
});

test('sintético de alta preserva prática sustentada sem inventar transformação', () => {
  const { plan, report } = runOrganizationalSynthetic(createDatabase(':memory:'), { band: 'high' });
  assertPresentableReport(report, plan.totalPeople, 'high');
  assert.ok((report.classification?.level ?? 0) >= 3);
  assert.equal(report.outcome.kind, 'preserve');
  assert.match(report.outcome.kindLabel, /preservar/i);
});

test('as três bandas da POC produzem relatórios distintos e apresentáveis', () => {
  const suite = runPocSyntheticSuite(createDatabase(':memory:'));
  assert.deepEqual(suite.map((entry) => entry.band), ['low', 'medium', 'high']);
  const levels = suite.map((entry) => entry.report.classification?.level ?? -1);
  assert.ok(levels[0]! < levels[1]!, `baixa (${levels[0]}) deveria ficar abaixo da média (${levels[1]})`);
  assert.ok(levels[1]! < levels[2]!, `média (${levels[1]}) deveria ficar abaixo da alta (${levels[2]})`);
  const headlines = suite.map((entry) => entry.report.outcome.finding?.title ?? entry.report.outcome.nextStepTitle);
  assert.equal(new Set(headlines).size, 3, `first screens must differ: ${headlines.join(' | ')}`);
  const readings = suite.map((entry) => `${entry.report.outcome.kind}|${entry.report.outcome.limiterLabel}|${entry.report.outcome.reading}`);
  assert.equal(new Set(readings).size, 3);
});

function assertPresentableReport(report: ReturnType<typeof runOrganizationalSynthetic>['report'], people: number, band: MaturityBand) {
  const assessed = report.capabilityGroups.filter((pillar) => pillar.assessed);
  const strongLeaves = report.capabilities.filter((capability) => capability.level >= 3 && (capability.coverage ?? 0) >= 1);
  const limiter = report.capabilities.find((capability) => capability.id === report.outcome.limiterId);
  assert.equal(report.completed, people);
  if (band === 'high') {
    assert.ok(strongLeaves.length >= 3, `${band}: expected several strong leaves, got ${strongLeaves.map((item) => item.id).join(', ') || 'none'}`);
  } else {
    assert.ok(assessed.length >= 4, `${band}: expected several assessed pillars, got ${assessed.map((item) => item.id).join(', ') || 'none'}`);
  }
  assert.notEqual(report.outcome.kind, 'insufficient');
  assert.ok(report.outcome.reading.length > 40);
  assert.ok(report.outcome.nextStepTitle.length > 0);
  assert.ok(report.outcome.nextStepBody.length > 20);
  assert.ok(!/e mais/i.test(report.outcome.limiterLabel));
  assert.ok(!/e mais/i.test(report.outcome.reading));
  assert.equal(limiter?.hasContradiction ?? false, false);
  for (const finding of report.findings) {
    assert.ok(finding.title.length > 0);
    assert.ok(finding.cause.length > 0 || finding.intervention.length > 0);
    assert.ok(finding.containment !== 'undetermined' || finding.prescription?.status === 'investigate');
  }
}

function assertExecutiveDecision(report: ReturnType<typeof runOrganizationalSynthetic>['report']) {
  assert.ok(report.outcome.kind === 'correct' || report.outcome.kind === 'evolve', `expected closed decision, got ${report.outcome.kind} on ${report.outcome.limiterLabel}`);
  assert.ok(report.outcome.finding);
  assert.notEqual(report.outcome.finding?.prescription?.status, 'investigate');
  assert.ok(report.outcome.finding?.containment && report.outcome.finding.containment !== 'undetermined');
  assert.doesNotMatch(report.outcome.nextStepTitle, /distinguir as explicações|investigar impacto/i);
}

function assertDirectorateAndUnits(report: ReturnType<typeof runOrganizationalSynthetic>['report']) {
  assert.ok(
    report.audienceReports.executive.decisions.length + report.audienceReports.executive.sharedConstraints.length > 0,
    'diretoria precisa de decisão ou restrição compartilhada',
  );
  const leafUnits = report.scopes.filter((scope) => scope.path.split('/').length > 1);
  assert.ok(leafUnits.length >= 2);
  for (const scope of leafUnits) {
    const actions = scope.audienceReport.localActions.length + scope.audienceReport.receivedConstraints.length + scope.audienceReport.escalations.length;
    assert.ok(actions > 0, `${scope.path} precisa de ação local, restrição recebida ou escalada`);
  }
}
