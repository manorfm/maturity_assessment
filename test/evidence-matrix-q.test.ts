import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GRAPH_VERSION, graph } from '../src/modules/catalog/assessment-graph.js';
import { auditEvidenceMatrix } from '../src/modules/catalog/evidence-matrix-audit.js';

test('grafo v21 publica evidence[] em toda opção de prática e mantém signals derivados', () => {
  assert.equal(GRAPH_VERSION, 'evidence-anamnesis-pilot-v21');
  const practice = graph.flatMap((node) => node.options
    .filter((option) => (option.observation ?? 'practice') === 'practice' && option.id !== 'finish')
    .map((option) => ({ node: node.id, option })));
  assert.ok(practice.length > 20);
  for (const item of practice) {
    assert.ok(item.option.evidence, `${item.node}/${item.option.id} sem evidence`);
    if (item.option.signals.length) {
      assert.ok(item.option.evidence!.length >= 1, `${item.node}/${item.option.id} evidence vazia com signals`);
      assert.equal(item.option.evidence![0]!.discrimination, 'medium');
    }
  }
  const release = graph.find((node) => node.id === 'ready-to-release');
  assert.equal(release?.taskFamily, 'change');
  assert.equal(release?.testlet, 'ready-to-release');
});

test('auditoria da matriz Q bloqueia prática sem evidence e exige cobertura de âncoras por folha', () => {
  const issues = auditEvidenceMatrix(graph);
  assert.equal(issues.filter((item) => item.code === 'missing-evidence').length, 0);
  assert.ok(issues.every((item) => item.code !== 'missing-evidence'));
});
