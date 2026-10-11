import assert from 'node:assert/strict';
import { test } from 'node:test';
import { graph } from '../src/modules/catalog/assessment-graph.js';
import {
  declaredSophistication,
  normalizeOptionEvidence,
} from '../src/modules/catalog/evidence-contract.js';
import { evidenceToAnchoredResponse } from '../src/modules/inference/domain/evidence-observation.js';

/** Folhas do grafo alinhadas às trilhas 12 §3 (exceto 3.11 IA, ainda sem folha própria). */
const trails: Record<string, string> = {
  'observability-practice': '3.1',
  'incident-management': '3.2',
  'continuous-integration': '3.3',
  'release-feedback': '3.4',
  'reproducible-infrastructure': '3.5',
  'quality-strategy': '3.6',
  'software-security': '3.7',
  'cloud-reliability': '3.8',
  'cloud-efficiency': '3.9',
  'integration-data': '3.10',
  'work-management': '3.12',
};

function phasesByLeaf(): Map<string, Set<number>> {
  const byLeaf = new Map<string, Set<number>>();
  for (const node of graph) {
    for (const option of node.options) {
      for (const link of normalizeOptionEvidence(option).evidence) {
        if (!(link.capability in trails) || link.sophistication === undefined) continue;
        const phases = byLeaf.get(link.capability) ?? new Set();
        phases.add(link.sophistication);
        byLeaf.set(link.capability, phases);
      }
    }
  }
  return byLeaf;
}

test('cada trilha 12 §3 no grafo declara F baixo e alto sem alterar âncora', () => {
  const byLeaf = phasesByLeaf();
  for (const [leaf, section] of Object.entries(trails)) {
    const phases = byLeaf.get(leaf) ?? new Set();
    assert.ok(phases.size >= 2, `${section} ${leaf}: precisa ≥2 fases distintas, tem ${[...phases]}`);
    assert.ok([...phases].some((phase) => phase <= 1), `${section} ${leaf}: falta F0–F1`);
    assert.ok([...phases].some((phase) => phase >= 3), `${section} ${leaf}: falta F3–F5`);
  }

  // Amostra: F declarado não muda âncora (R28).
  for (const pattern of ['integracao-continua-validada', 'seguranca-habilitadora', 'eficiencia-cloud-reativa-a-fatura']) {
    assert.notEqual(declaredSophistication(pattern), undefined, pattern);
  }
  const sample = normalizeOptionEvidence(
    graph.flatMap((node) => node.options).find((option) => option.id === 'continuous')!,
  ).evidence.find((link) => link.pattern === 'integracao-frequente');
  assert.ok(sample);
  const withF = { ...sample!, sophistication: declaredSophistication(sample!.pattern) };
  assert.equal(evidenceToAnchoredResponse(sample!).anchor, evidenceToAnchoredResponse(withF).anchor);
});
