import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { runRealFlowCohort } from '../src/modules/inference/domain/real-flow-cohort.js';
import { uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';

test('real-flow cohort sensitivity: override flips war-room pattern', () => {
  const baseline = runRealFlowCohort(createDatabase(':memory:'), {
    caseId: 'engineering-practice',
  });
  const baselinePatterns = uniqueFindingsByPattern(baseline.report.findings).map(
    (finding) => finding.pattern,
  );

  assert.ok(
    baselinePatterns.includes('war-room-como-gestao'),
    `A: expected war-room-como-gestao; got ${baselinePatterns.join(', ')}`,
  );
  assert.equal(baseline.report.completed, baseline.plan.totalPeople);

  const overridden = runRealFlowCohort(createDatabase(':memory:'), {
    caseId: 'engineering-practice',
    optionOverrides: [{ nodeId: 'team-pressure', optionId: 'system-learning' }],
  });
  const overriddenPatterns = uniqueFindingsByPattern(overridden.report.findings).map(
    (finding) => finding.pattern,
  );

  assert.ok(
    !overriddenPatterns.includes('war-room-como-gestao'),
    `B: must not contain war-room-como-gestao; got ${overriddenPatterns.join(', ')}`,
  );
  assert.equal(overridden.report.completed, overridden.plan.totalPeople);
  assert.equal(overridden.report.completed, baseline.report.completed);
});
