import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CANNOT_OBSERVE_ID } from '../src/modules/catalog/assessment-graph.js';
import { createDatabase } from '../src/shared/database.js';
import {
  optionForArchetype,
  runArchetypeCohort,
} from '../src/modules/inference/domain/org-archetype.js';

function nodeStub(id: string, optionIds: string[]) {
  return {
    id,
    options: optionIds.map((optionId) => ({ id: optionId, label: optionId, signals: [] })),
  };
}

const sampleRole = { profile: 'engineering' as const, workContext: 'build-and-operate' as const };

const visibilityNodes = {
  'improvement-cause': nodeStub('improvement-cause', [
    'no-capacity',
    'no-autonomy',
    'too-many-actions',
    'unsafe-dialogue',
    CANNOT_OBSERVE_ID,
  ]),
  'blocked-cause': nodeStub('blocked-cause', [
    'permission-policy',
    'dependency-priority',
    'missing-capability',
    'architecture-dependency',
    CANNOT_OBSERVE_ID,
  ]),
  'deployment-probe': nodeStub('deployment-probe', [
    'shared-script',
    'local-script',
    'runbook',
    'memory',
    CANNOT_OBSERVE_ID,
  ]),
} as const;

const visibilityNodeIds = Object.keys(visibilityNodes) as Array<keyof typeof visibilityNodes>;

const seniorPracticeByNode = {
  'improvement-cause': 'no-capacity',
  'blocked-cause': 'permission-policy',
  'deployment-probe': 'local-script',
} as const;

test('default sem level preserva discriminadores A/B', () => {
  const teamPressure = nodeStub('team-pressure', ['private-resolution', 'system-learning']);
  const readyToRelease = nodeStub('ready-to-release', ['manual-package', 'small-automated', 'approval']);

  assert.equal(optionForArchetype(teamPressure, sampleRole, 0, 'bureaucratic-fixed-scope'), 'private-resolution');
  assert.equal(optionForArchetype(teamPressure, sampleRole, 0, 'digital-native-continuous'), 'system-learning');
  assert.equal(optionForArchetype(readyToRelease, sampleRole, 0, 'bureaucratic-fixed-scope'), 'manual-package');
  assert.equal(optionForArchetype(readyToRelease, sampleRole, 0, 'digital-native-continuous'), 'small-automated');
});

test('junior bureaucratic escolhe cannot-observe nos 3 nós de visibilidade', () => {
  for (const nodeId of visibilityNodeIds) {
    const option = optionForArchetype(
      visibilityNodes[nodeId],
      sampleRole,
      0,
      'bureaucratic-fixed-scope',
      'junior',
    );
    assert.equal(option, CANNOT_OBSERVE_ID, `${nodeId} junior must be cannot-observe`);
  }
});

test('senior bureaucratic nos mesmos nós escolhe prática do arquétipo (não cannot-observe)', () => {
  for (const nodeId of visibilityNodeIds) {
    const withLevel = optionForArchetype(
      visibilityNodes[nodeId],
      sampleRole,
      0,
      'bureaucratic-fixed-scope',
      'senior',
    );
    const withoutLevel = optionForArchetype(
      visibilityNodes[nodeId],
      sampleRole,
      0,
      'bureaucratic-fixed-scope',
    );
    assert.equal(withLevel, seniorPracticeByNode[nodeId], `${nodeId} senior practice`);
    assert.notEqual(withLevel, CANNOT_OBSERVE_ID, `${nodeId} senior must not be cannot-observe`);
    assert.equal(withLevel, withoutLevel, `${nodeId} senior === default sem level`);
  }
});

test('junior !== senior nos três nós de visibilidade', () => {
  for (const nodeId of visibilityNodeIds) {
    const junior = optionForArchetype(
      visibilityNodes[nodeId],
      sampleRole,
      0,
      'bureaucratic-fixed-scope',
      'junior',
    );
    const senior = optionForArchetype(
      visibilityNodes[nodeId],
      sampleRole,
      0,
      'bureaucratic-fixed-scope',
      'senior',
    );
    assert.notEqual(junior, senior, `${nodeId} junior must differ from senior`);
  }
});

test('pleno === default em bias e discriminador A/B', () => {
  const biasNode = visibilityNodes['improvement-cause'];
  const discriminator = nodeStub('team-pressure', ['private-resolution', 'system-learning', CANNOT_OBSERVE_ID]);

  assert.equal(
    optionForArchetype(biasNode, sampleRole, 0, 'bureaucratic-fixed-scope', 'pleno'),
    optionForArchetype(biasNode, sampleRole, 0, 'bureaucratic-fixed-scope'),
  );
  assert.equal(
    optionForArchetype(discriminator, sampleRole, 0, 'bureaucratic-fixed-scope', 'pleno'),
    optionForArchetype(discriminator, sampleRole, 0, 'bureaucratic-fixed-scope'),
  );
  assert.equal(
    optionForArchetype(discriminator, sampleRole, 0, 'bureaucratic-fixed-scope', 'junior'),
    optionForArchetype(discriminator, sampleRole, 0, 'bureaucratic-fixed-scope'),
    'level must not alter A/B discriminators',
  );
});

test('coorte junior completa sem assertar outcome por nível', () => {
  const { plan, report } = runArchetypeCohort(createDatabase(':memory:'), {
    archetypeId: 'bureaucratic-fixed-scope',
    level: 'junior',
  });
  assert.equal(report.completed, plan.totalPeople);
});
