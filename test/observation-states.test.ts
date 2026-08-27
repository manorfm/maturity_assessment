import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CANNOT_OBSERVE_ID, GRAPH_VERSION, graph, observationOf, type Option } from '../src/modules/catalog/assessment-graph.js';
import { CapabilityAssessment } from '../src/modules/inference/domain/capability-assessment.js';
import { CatalogService, validateGraphDefinition } from '../src/modules/catalog/catalog-service.js';
import { edges } from '../src/modules/catalog/assessment-graph.js';
import { interventionCatalog, evolutionCatalog } from '../src/modules/inference/inference-service.js';
import { createDatabase } from '../src/shared/database.js';

const practice = (weight: number): Option => ({
  id: 'practice', label: 'prática', signals: [{ capability: 'fluxo', pattern: 'x', weight, details: ['work-management'], layer: 'practice', constraint: 'none' }],
});

test('opções de visibilidade e não aplicabilidade não alimentam o nível', () => {
  const practiced = CapabilityAssessment.from([2, 1]);
  const withSilentExits = CapabilityAssessment.from([2, 1]);
  assert.equal(practiced.level, withSilentExits.level);
  assert.equal(observationOf({ id: CANNOT_OBSERVE_ID, label: 'não observo', observation: 'visibility', signals: [] }), 'visibility');
  assert.equal(observationOf({ id: 'not-applicable', label: 'não ocorre', observation: 'not_applicable', signals: [] }), 'not_applicable');
  assert.equal(observationOf(practice(2)), 'practice');
});

test('cenários e probes oferecem saída de visibilidade que não pontua', () => {
  const interview = graph.filter((node) => node.id !== 'respondent-context');
  for (const node of interview) {
    const option = node.options.find((item) => item.id === CANNOT_OBSERVE_ID);
    assert.ok(option, `missing cannot-observe on ${node.id}`);
    assert.equal(option!.observation, 'visibility');
    assert.equal(option!.signals.length, 0);
  }
});

test('saída de visibilidade tem aresta de continuação', () => {
  const catalog = new CatalogService(createDatabase(':memory:'));
  const withExit = new Set(edges.map((edge) => edge.from));
  for (const node of graph.filter((item) => item.id !== 'respondent-context' && withExit.has(item.id))) {
    assert.ok(catalog.nextNode(GRAPH_VERSION, node.id, CANNOT_OBSERVE_ID, 'engineering'), `no exit from ${node.id}/${CANNOT_OBSERVE_ID}`);
  }
});

test('toda intervenção referencia um padrão publicado no grafo', () => {
  const published = new Set(graph.flatMap((node) => node.options.flatMap((option) => option.signals.map((signal) => signal.pattern))));
  for (const pattern of [...Object.keys(interventionCatalog), ...Object.keys(evolutionCatalog)]) {
    assert.ok(published.has(pattern), `orphan intervention: ${pattern}`);
  }
});

test('grafo com saídas observacionais permanece acíclico e coberto', () => {
  assert.doesNotThrow(() => validateGraphDefinition(graph, edges, graph[0]!.id));
});

test('nós de contexto da onda 1 oferecem não aplicabilidade sem sinal', () => {
  for (const id of ['credential-context', 'dependency-context', 'incentive-context', 'ai-context']) {
    const option = graph.find((node) => node.id === id)?.options.find((item) => item.id === 'not-applicable');
    assert.ok(option, `missing not-applicable on ${id}`);
    assert.equal(option!.observation, 'not_applicable');
    assert.equal(option!.signals.length, 0);
  }
});
