import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { DecisionClient } from '../src/modules/inference/domain/decision-client.js';
import { resolveArchetypeDecisionClient } from '../src/modules/inference/domain/archetype-laya-wire.js';
import { parseArgs } from '../scripts/run-real-flow-cohort.js';

test('resolveArchetypeDecisionClient injects client when archetype mode and allowed LAYA_BASE_URL', () => {
  const stubClient: DecisionClient = {
    choose: () => 'opt-stub',
  };
  let factoryCalls = 0;
  const createClient = () => {
    factoryCalls += 1;
    return stubClient;
  };

  const result = resolveArchetypeDecisionClient({
    mode: 'archetype',
    env: { LAYA_BASE_URL: 'http://127.0.0.1:8000' },
    noLaya: false,
    createClient,
  });

  assert.equal(result, stubClient);
  assert.equal(factoryCalls, 1);
});

test('resolveArchetypeDecisionClient stays deterministic without env, with --no-laya, or invalid URL', () => {
  let factoryCalls = 0;
  const createClient = () => {
    factoryCalls += 1;
    return { choose: () => null };
  };

  assert.equal(
    resolveArchetypeDecisionClient({
      mode: 'archetype',
      env: {},
      noLaya: false,
      createClient,
    }),
    undefined,
  );

  factoryCalls = 0;
  assert.equal(
    resolveArchetypeDecisionClient({
      mode: 'archetype',
      env: { LAYA_BASE_URL: 'http://127.0.0.1:8000' },
      noLaya: true,
      createClient,
    }),
    undefined,
  );
  assert.equal(factoryCalls, 0, 'factory must not be called when --no-laya');

  assert.equal(
    resolveArchetypeDecisionClient({
      mode: 'archetype',
      env: { LAYA_BASE_URL: 'http://evil.example' },
      noLaya: false,
      createClient,
    }),
    undefined,
  );
});

test('parseArgs accepts --no-laya on archetype path', () => {
  const parsed = parseArgs(['--archetype', 'bureaucratic-fixed-scope', '--no-laya']);
  assert.equal(parsed.mode, 'archetype');
  if (parsed.mode !== 'archetype') {
    assert.fail('expected archetype mode');
  }
  assert.equal(parsed.archetypeId, 'bureaucratic-fixed-scope');
  assert.equal(parsed.noLaya, true);
});
