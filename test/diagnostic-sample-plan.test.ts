import assert from 'node:assert/strict';
import { test } from 'node:test';
import { capabilityPillarIds } from '../src/modules/inference/domain/capability-taxonomy.js';
import {
  COVERAGE_ROLES,
  DiagnosticSamplePlanner,
  SAMPLE_POLICY,
  observableLeavesForRole,
  observablePillars,
} from '../src/modules/inference/domain/diagnostic-sample-plan.js';

test('oito pessoas em uma trilha não observam os oito pilares', () => {
  const plan = DiagnosticSamplePlanner.forGate('language-check');
  assert.equal(plan.totalPeople, 8);
  assert.equal(plan.units.length, 1);
  assert.equal(plan.calibrationReady, false);
  assert.equal(plan.extraAxesDoNotIncreasePrecision, true);
  assert.ok(plan.unpublishedPillars.length > 0);
  assert.match(plan.summary, /linguagem/i);
});

test('cinco pessoas na mesma trilha de entrega não publicam os oito pilares', () => {
  const delivery = Array.from({ length: 5 }, () => COVERAGE_ROLES[0]!);
  const pillars = observablePillars(delivery);
  assert.ok(pillars.length < capabilityPillarIds.length);
  assert.ok(observableLeavesForRole(COVERAGE_ROLES[0]!).length > 0);
});

test('diagnóstico organizacional declara quantas pessoas e quais trilhas complementares', () => {
  const plan = DiagnosticSamplePlanner.forGate('organizational-diagnostic');
  const contexts = new Set(plan.units.flatMap((unit) => unit.roles.map((role) => role.workContext)));
  assert.equal(plan.totalPeople, 18);
  assert.equal(plan.units.length, 2);
  assert.ok(plan.units.every((unit) => unit.people >= SAMPLE_POLICY.anonymityMinimum));
  assert.ok(contexts.size >= 8);
  assert.ok(plan.observablePillars.length >= 6);
  assert.equal(plan.calibrationReady, false);
  assert.match(plan.summary, /organizacional/);
  assert.ok(plan.why.some((item) => /não de mais eixos/i.test(item)));
  assert.ok(plan.why.some((item) => /first screen fecha/i.test(item)));
});

test('comparar duas squads exige dez pessoas, cinco em cada unidade', () => {
  const plan = DiagnosticSamplePlanner.forGate('cross-unit-comparison');
  assert.equal(plan.totalPeople, 10);
  assert.deepEqual(plan.units.map((unit) => unit.people), [5, 5]);
});

test('triangulação das nove lentes exige cinco pessoas por perspectiva', () => {
  const plan = DiagnosticSamplePlanner.forGate('perspective-triangulation');
  assert.equal(plan.totalPeople, 45);
  assert.equal(plan.calibrationReady, false);
});

test('calibração continua 50 jornadas rotuladas e recusa sintéticos', () => {
  const plan = DiagnosticSamplePlanner.forGate('calibration');
  assert.equal(plan.totalPeople, 50);
  assert.ok(plan.blockers.some((item) => /sintéticos não abrem/i.test(item)));
});

test('avaliar alocação insuficiente explica o que falta para o experimento real', () => {
  const report = DiagnosticSamplePlanner.evaluate({
    gate: 'organizational-diagnostic',
    units: [{ id: 'squad-a', roles: [COVERAGE_ROLES[0]!, COVERAGE_ROLES[0]!] }],
  });
  assert.ok(report.blockers.some((item) => /faltam/i.test(item) || /anonimato/i.test(item)));
});

test('progresso da amostra distingue convites do diagnóstico organizacional', () => {
  const early = DiagnosticSamplePlanner.progress([{ id: 'a', invited: 8, completed: 8 }]);
  assert.equal(early.readyToDiagnose, false);
  assert.ok(early.blockers.some((item) => /duas unidades/i.test(item)));
  const ready = DiagnosticSamplePlanner.progress([
    { id: 'a', invited: 9, completed: 9 },
    { id: 'b', invited: 9, completed: 9 },
  ]);
  assert.equal(ready.readyToDiagnose, true);
  assert.equal(ready.target.totalPeople, 18);
});
