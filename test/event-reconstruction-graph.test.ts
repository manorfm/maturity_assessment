import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  eventReconstructionDefinitions,
  estimatePathScenarios,
  graph,
  validateEventReconstruction,
} from '../src/modules/catalog/assessment-graph.js';

const migratedEvents = [
  'ready-to-release',
  'environment-access',
  'security-change',
  'architecture-pressure',
  'improvement-loop',
] as const;

test('os cinco eventos migrados reconstroem fatos em mais de um momento recuperável', () => {
  assert.deepEqual(Object.keys(eventReconstructionDefinitions).sort(), [...migratedEvents].sort());
  for (const id of migratedEvents) {
    const definition = eventReconstructionDefinitions[id];
    assert.ok(definition, id);
    assert.equal(definition.anchorNodeId, id);
    assert.ok(definition.steps.length >= 2, id);
    assert.equal(definition.steps[0]?.phase, 'trigger');
    assert.ok(definition.steps.some((step) => ['consequence', 'learning', 'review'].includes(step.phase)), id);
    assert.doesNotThrow(() => validateEventReconstruction(definition, graph));
  }
});

test('etapas factuais não pedem causa nem combinam decisão, mecanismo e consequência', () => {
  for (const definition of Object.values(eventReconstructionDefinitions)) {
    for (const step of definition.steps) {
      const node = graph.find((candidate) => candidate.id === step.nodeId)!;
      assert.doesNotMatch(`${node.scenario} ${node.prompt}`, /normalmente|qual (?:é |foi )?a causa/i, node.id);
      for (const option of node.options.filter((item) => item.observation === undefined)) {
        assert.ok(option.factKind, `${node.id}/${option.id}`);
        assert.equal(Array.isArray(option.factKind), false, `${node.id}/${option.id}`);
      }
    }
  }
});

test('estimativa segue a alternativa real em vez do primeiro sucessor', () => {
  assert.ok(
    estimatePathScenarios('ready-to-release', { 'ready-to-release': 'manual-package' })
      > estimatePathScenarios('ready-to-release', { 'ready-to-release': 'small-automated' }),
  );
  assert.ok(
    estimatePathScenarios('improvement-loop', { 'improvement-loop': 'action-list-fades' })
      > estimatePathScenarios('improvement-loop', { 'improvement-loop': 'owned-and-verified' }),
  );
});
