import assert from 'node:assert/strict';
import test from 'node:test';
import { graph, nodeVariants } from '../src/modules/catalog/assessment-graph.js';
import { capabilityReferenceCatalog } from '../src/modules/inference/domain/capability-reference.js';
import { mapCapabilityReferenceCoverage } from '../src/modules/catalog/capability-reference-coverage.js';

test('matriz relaciona as quatro referências a sinais tipados sem inferência textual', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  assert.equal(matrix.version, 'capability-reference-coverage-v1');
  assert.deepEqual(matrix.references.map((item) => item.capabilityId), Object.keys(capabilityReferenceCatalog));
  for (const item of matrix.references) {
    assert.ok(item.direct.patterns >= 2 || item.indirect.patterns >= 2, item.capabilityId);
    assert.ok(item.layers.length > 0, item.capabilityId);
    assert.equal(item.mixedFactAndCause, 0, item.capabilityId);
    assert.equal(item.desirabilityCues, 0, item.capabilityId);
    assert.ok(item.gaps.length > 0 || item.status === 'minimum-covered', item.capabilityId);
  }
});

test('matriz distingue efeito indireto, perspectiva única e ausência', () => {
  const nodes = [{
    id: 'one', type: 'scenario' as const, title: 'Evento', scenario: 'Na última mudança.', prompt: 'O que ocorreu?',
    options: [{ id: 'a', label: 'O grupo aguardou.', signals: [{ capability: 'x', pattern: 'p', weight: -1, details: ['organizational-learning'], layer: 'practice' as const, constraint: 'none' as const }] }],
  }];
  const matrix = mapCapabilityReferenceCoverage(nodes, [{ nodeId: 'one', profile: 'management', scenario: 'Na última mudança.' }], capabilityReferenceCatalog);
  const organizational = matrix.references.find((item) => item.capabilityId === 'organizational-system')!;
  assert.equal(organizational.direct.patterns, 0);
  assert.equal(organizational.indirect.patterns, 1);
  assert.equal(organizational.singlePerspective, true);
  assert.equal(matrix.references.find((item) => item.capabilityId === 'sdlc-automation')?.status, 'missing');
});
