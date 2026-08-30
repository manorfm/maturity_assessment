import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupFindingsByDiagnosticSystem } from '../src/modules/inference/domain/problem-system.js';

test('agrupa sintomas de integração em uma frente sem apagar os padrões', () => {
  const findings = [
    { kind: 'correction' as const, pattern: 'mudanca-isolada', detailCapability: 'continuous-integration', title: 'Mudanças isoladas', cause: '', intervention: '', confidence: .9, priority: .9 },
    { kind: 'correction' as const, pattern: 'integracao-tardia', detailCapability: 'organizational-learning', title: 'Partes encontram-se tarde', cause: '', intervention: '', confidence: .8, priority: .8 },
    { kind: 'correction' as const, pattern: 'integracao-por-janela', detailCapability: 'evolvability', title: 'Janelas coordenadas', cause: '', intervention: '', confidence: .8, priority: .7 },
  ];
  const systems = groupFindingsByDiagnosticSystem(findings);
  assert.equal(systems.length, 1);
  assert.equal(systems[0]?.id, 'integration-feedback');
  assert.equal(systems[0]?.findings.length, 3);
});
