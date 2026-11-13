import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { POC_VALIDATION_ORGS } from '../src/modules/inference/domain/organizational-synthetic.js';
import { runRealFlowCohort } from '../src/modules/inference/domain/real-flow-cohort.js';
import { uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';

type SyntheticExpect = {
  outcomeKinds: ReadonlyArray<'correct' | 'evolve'>;
  requiredPatterns: string[];
  patternGroups: ReadonlyArray<readonly string[]>;
  minDistinctPatterns: number;
  forbiddenPatterns: string[];
  unitDivergence: true;
  systemsObserved: string[];
};

type LabeledOrg = {
  id: string;
  expect?: SyntheticExpect;
};

function engineeringPracticeOrg(): LabeledOrg {
  const org = POC_VALIDATION_ORGS.find((candidate) => candidate.id === 'engineering-practice');
  assert.ok(org, 'engineering-practice must exist in POC_VALIDATION_ORGS');
  return org as LabeledOrg;
}

function assertExpectShape(expect: SyntheticExpect): void {
  assert.ok(Array.isArray(expect.outcomeKinds));
  assert.ok(expect.outcomeKinds.every((kind) => kind === 'correct' || kind === 'evolve'));
  assert.ok(Array.isArray(expect.requiredPatterns));
  assert.ok(expect.requiredPatterns.includes('war-room-como-gestao'));
  assert.ok(Array.isArray(expect.patternGroups));
  assert.ok(expect.patternGroups.length >= 1);
  assert.ok(expect.patternGroups.every((group) => Array.isArray(group) && group.length >= 1));
  assert.equal(typeof expect.minDistinctPatterns, 'number');
  assert.ok(expect.minDistinctPatterns >= 4);
  assert.ok(Array.isArray(expect.forbiddenPatterns));
  assert.equal(expect.unitDivergence, true);
  assert.ok(Array.isArray(expect.systemsObserved));
  assert.ok(expect.systemsObserved.includes('engineering'));
}

test('coorte via fluxo de produto completa e satisfaz expect de engineering-practice', () => {
  const labeled = engineeringPracticeOrg();
  assert.ok(labeled.expect, 'engineering-practice must export machine-checkable expect');
  const expect = labeled.expect;
  assertExpectShape(expect);

  const { plan, report } = runRealFlowCohort(createDatabase(':memory:'), {
    caseId: 'engineering-practice',
  });

  assert.equal(report.completed, plan.totalPeople);
  assert.ok(
    (expect.outcomeKinds as readonly string[]).includes(report.outcome.kind),
    `outcome.kind ${report.outcome.kind} not in ${expect.outcomeKinds.join('|')}`,
  );
  assert.ok(report.outcome.finding);
  assert.ok(report.outcome.limiterId);

  const patterns = uniqueFindingsByPattern(report.findings).map((finding) => finding.pattern);
  const patternSet = new Set(patterns);

  for (const required of expect.requiredPatterns) {
    assert.ok(patternSet.has(required), `missing required pattern ${required}; got ${patterns.join(', ')}`);
  }
  for (const group of expect.patternGroups) {
    assert.ok(
      group.some((pattern) => patternSet.has(pattern)),
      `pattern group [${group.join('|')}] needs ≥1 hit; got ${patterns.join(', ')}`,
    );
  }
  assert.ok(
    patternSet.size >= expect.minDistinctPatterns,
    `expected ≥${expect.minDistinctPatterns} distinct patterns, got ${patternSet.size}: ${patterns.join(', ')}`,
  );
  for (const forbidden of expect.forbiddenPatterns) {
    assert.ok(!patternSet.has(forbidden), `forbidden pattern ${forbidden} appeared`);
  }

  if (expect.unitDivergence) {
    const leafScopes = report.scopes.filter((scope) => scope.path.split('/').length > 1);
    const patternSignatures = leafScopes.map((scope) => {
      const local = uniqueFindingsByPattern(scope.findings).map((finding) => finding.pattern).sort();
      return local.join('\0');
    });
    const distinctSets = new Set(patternSignatures.filter((signature) => signature.length > 0));
    assert.ok(
      distinctSets.size >= 2,
      `unitDivergence requires ≥2 leaf scopes with different pattern sets; got ${patternSignatures.join(' || ')}`,
    );
  }

  for (const systemId of expect.systemsObserved) {
    const system = report.organizationalAreas.systems.find((candidate) => candidate.id === systemId);
    assert.equal(system?.observed, true, `system ${systemId} must be observed`);
  }
});
