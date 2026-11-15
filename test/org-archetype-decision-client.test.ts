import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import type { DecisionClient } from '../src/modules/inference/domain/decision-client.js';
import {
  optionForArchetype,
  resolveArchetypeOption,
  runArchetypeCohort,
} from '../src/modules/inference/domain/org-archetype.js';
import { uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';

function nodeStub(id: string, optionIds: string[], title = id, prompt = id) {
  return {
    id,
    title,
    prompt,
    options: optionIds.map((optionId) => ({ id: optionId, label: optionId, signals: [] })),
  };
}

const sampleRole = { profile: 'engineering' as const, workContext: 'build-and-operate' as const };

const teamPressureWithBothOptions = nodeStub('team-pressure', ['private-resolution', 'system-learning']);

test('decisionClient override on team-pressure diverges from optionForArchetype for archetype A', () => {
  const archetypeId = 'bureaucratic-fixed-scope' as const;
  const unitIndex = 0;
  const defaultOption = optionForArchetype(teamPressureWithBothOptions, sampleRole, unitIndex, archetypeId);
  assert.equal(defaultOption, 'private-resolution');

  const calls: Array<{ state: string; chosen: string | null }> = [];
  const decisionClient: DecisionClient = {
    choose(input) {
      const chosen = input.state.includes('node=team-pressure') ? 'system-learning' : null;
      calls.push({ state: input.state, chosen });
      return chosen;
    },
  };

  assert.equal(
    resolveArchetypeOption({
      node: teamPressureWithBothOptions,
      role: sampleRole,
      unitIndex,
      archetypeId,
      decisionClient,
    }),
    'system-learning',
  );
  assert.ok(
    calls.some((call) => call.state.includes('node=team-pressure') && call.chosen === 'system-learning'),
    'stub choose must be used for team-pressure',
  );

  const { report } = runArchetypeCohort(createDatabase(':memory:'), {
    archetypeId,
    decisionClient,
  });
  const patterns = uniqueFindingsByPattern(report.findings).map((finding) => finding.pattern);
  assert.ok(
    !patterns.includes('war-room-como-gestao'),
    `override on team-pressure must drop war-room-como-gestao; got ${patterns.join(', ')}`,
  );
});

test('invalid or null decisionClient falls back to optionForArchetype', () => {
  const archetypeId = 'bureaucratic-fixed-scope' as const;
  const unitIndex = 0;
  const expected = optionForArchetype(
    teamPressureWithBothOptions,
    sampleRole,
    unitIndex,
    archetypeId,
  );
  assert.equal(expected, 'private-resolution');

  assert.equal(
    resolveArchetypeOption({
      node: teamPressureWithBothOptions,
      role: sampleRole,
      unitIndex,
      archetypeId,
      decisionClient: { choose: () => null },
    }),
    expected,
  );
  assert.equal(
    resolveArchetypeOption({
      node: teamPressureWithBothOptions,
      role: sampleRole,
      unitIndex,
      archetypeId,
      decisionClient: { choose: () => 'nope' },
    }),
    expected,
  );
});

test('decisionClient is not consulted for vignette literacy list free-text or context nodes', () => {
  const calls: string[] = [];
  const decisionClient: DecisionClient = {
    choose(input) {
      calls.push(input.state);
      return null;
    },
  };

  const skipNodes = [
    nodeStub('vignette-pressure', ['ritual', 'other']),
    nodeStub('literacy-flow', ['stop-starting', 'other']),
    nodeStub('list-tools', ['count-2', 'count-1']),
    nodeStub('free-text-note', ['skip', 'write']),
    nodeStub('respondent-context', ['engineering', 'product']),
    nodeStub('work-context', ['build-and-operate', 'operate-only']),
  ];

  for (const node of skipNodes) {
    resolveArchetypeOption({
      node,
      role: sampleRole,
      unitIndex: 0,
      archetypeId: 'bureaucratic-fixed-scope',
      decisionClient,
    });
  }

  const forbidden = [
    'node=vignette-',
    'node=literacy-',
    'node=list-',
    'node=free-text-',
    'node=respondent-context',
    'node=work-context',
  ];
  for (const marker of forbidden) {
    assert.ok(
      !calls.some((state) => state.includes(marker)),
      `decisionClient must not be consulted for ${marker}; calls=${calls.join(' | ')}`,
    );
  }
});

test('runArchetypeCohort without decisionClient keeps bureaucratic A war-room expect', () => {
  const { plan, report } = runArchetypeCohort(createDatabase(':memory:'), {
    archetypeId: 'bureaucratic-fixed-scope',
  });
  assert.equal(report.completed, plan.totalPeople);
  const patterns = uniqueFindingsByPattern(report.findings).map((finding) => finding.pattern);
  assert.ok(
    patterns.includes('war-room-como-gestao'),
    `expected war-room-como-gestao; got ${patterns.join(', ')}`,
  );
});
