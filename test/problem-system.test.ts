import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diagnosticSystemFor, groupFindingsByDiagnosticSystem } from '../src/modules/inference/domain/problem-system.js';

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

test('sistema de integração preserva sintomas, hipóteses e amplificadores', () => {
  const system = diagnosticSystemFor('mudanca-isolada')!;
  assert.equal(system.id, 'integration-feedback');
  assert.ok(system.symptoms.includes('mudanca-isolada'));
  assert.ok(system.hypotheses.includes('causa-ferramental-feedback'));
  assert.ok(system.hypotheses.includes('causa-processo-lote'));
  assert.ok(system.amplifiers.includes('automacao-sem-feedback'));
});

test('bibliotecas organizacionais cobrem plataforma, governança, workforce e legado', () => {
  assert.equal(diagnosticSystemFor('caminho-inadequado-ao-caso')?.id, 'platform-adoption');
  assert.equal(diagnosticSystemFor('governanca-compensa-feedback-tecnico')?.id, 'governance-trust');
  assert.equal(diagnosticSystemFor('competencia-concentrada')?.id, 'workforce-capability');
  assert.equal(diagnosticSystemFor('legado-sem-modelo-recuperavel')?.id, 'legacy-continuity');
});
