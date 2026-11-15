import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import {
  ORG_ARCHETYPES,
  optionForArchetype,
  runArchetypeCohort,
  type OrgArchetype,
  type OrgArchetypeExpect,
  type OrgArchetypeId,
} from '../src/modules/inference/domain/org-archetype.js';
import { uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';

function archetype(id: OrgArchetypeId): OrgArchetype {
  const found = ORG_ARCHETYPES.find((candidate) => candidate.id === id);
  assert.ok(found, `${id} must exist in ORG_ARCHETYPES`);
  return found;
}

function nodeStub(id: string, optionIds: string[]) {
  return {
    id,
    options: optionIds.map((optionId) => ({ id: optionId, label: optionId, signals: [] })),
  };
}

const sampleRole = { profile: 'engineering' as const, workContext: 'build-and-operate' as const };

test('optionForArchetype distingue A e B nos nós discriminadores', () => {
  const teamPressure = nodeStub('team-pressure', ['private-resolution', 'system-learning']);
  const readyToRelease = nodeStub('ready-to-release', ['manual-package', 'small-automated', 'approval']);

  const aTeam = optionForArchetype(teamPressure, sampleRole, 0, 'bureaucratic-fixed-scope');
  const bTeam = optionForArchetype(teamPressure, sampleRole, 0, 'digital-native-continuous');
  const aRelease = optionForArchetype(readyToRelease, sampleRole, 0, 'bureaucratic-fixed-scope');
  const bRelease = optionForArchetype(readyToRelease, sampleRole, 0, 'digital-native-continuous');

  assert.notEqual(aTeam, bTeam, 'team-pressure A and B must differ');
  assert.notEqual(aRelease, bRelease, 'ready-to-release A and B must differ');
  assert.equal(aTeam, 'private-resolution');
  assert.equal(bTeam, 'system-learning');
  assert.equal(aRelease, 'manual-package');
  assert.equal(bRelease, 'small-automated');
});

test('coorte bureaucratic-fixed-scope satisfaz expect A', () => {
  const { plan, report } = runArchetypeCohort(createDatabase(':memory:'), {
    archetypeId: 'bureaucratic-fixed-scope',
  });

  const labeled = archetype('bureaucratic-fixed-scope');
  const expect = labeled.expect as OrgArchetypeExpect | undefined;
  assert.ok(expect, 'bureaucratic-fixed-scope must export machine-checkable expect');

  assert.equal(report.completed, plan.totalPeople);
  assert.ok(
    (expect.outcomeKinds as readonly string[]).includes(report.outcome.kind),
    `outcome.kind ${report.outcome.kind} not in ${expect.outcomeKinds.join('|')}`,
  );

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
});

test('coorte digital-native-continuous satisfaz expect B', () => {
  const { plan, report } = runArchetypeCohort(createDatabase(':memory:'), {
    archetypeId: 'digital-native-continuous',
  });

  const labeled = archetype('digital-native-continuous');
  const expect = labeled.expect as OrgArchetypeExpect | undefined;
  assert.ok(expect, 'digital-native-continuous must export machine-checkable expect');

  assert.equal(report.completed, plan.totalPeople);
  assert.equal(report.outcome.kind, 'evolve');
  assert.ok(
    (expect.outcomeKinds as readonly string[]).includes(report.outcome.kind),
    `outcome.kind ${report.outcome.kind} not in ${expect.outcomeKinds.join('|')}`,
  );

  const patterns = uniqueFindingsByPattern(report.findings).map((finding) => finding.pattern);
  const patternSet = new Set(patterns);

  for (const required of expect.requiredPatterns) {
    assert.ok(patternSet.has(required), `missing required pattern ${required}; got ${patterns.join(', ')}`);
  }
  for (const forbidden of expect.forbiddenPatterns) {
    assert.ok(!patternSet.has(forbidden), `forbidden pattern ${forbidden} appeared`);
  }
  assert.ok(
    !patternSet.has('war-room-como-gestao'),
    `B must not contain war-room-como-gestao; got ${patterns.join(', ')}`,
  );
});

test('contraste A vs B: required/forbidden não colapsam', () => {
  const a = archetype('bureaucratic-fixed-scope').expect;
  const b = archetype('digital-native-continuous').expect;
  assert.ok(a, 'A expect must exist');
  assert.ok(b, 'B expect must exist');

  assert.ok(
    a.requiredPatterns.includes('war-room-como-gestao'),
    'A.requiredPatterns must include war-room-como-gestao',
  );
  assert.ok(
    b.forbiddenPatterns.includes('war-room-como-gestao'),
    'B.forbiddenPatterns must include war-room-como-gestao',
  );

  const aRequired = new Set(a.requiredPatterns);
  const bRequired = new Set(b.requiredPatterns);
  assert.notDeepEqual(
    [...aRequired].sort(),
    [...bRequired].sort(),
    'Set(A.required) must differ from Set(B.required)',
  );
});
