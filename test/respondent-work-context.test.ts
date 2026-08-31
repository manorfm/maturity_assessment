import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RespondentWorkContext, workContextOptions } from '../src/modules/assessments/domain/respondent-work-context.js';

test('contexto representa responsabilidade exercida sem depender do cargo', () => {
  const context = RespondentWorkContext.fromOption('build-and-operate');
  assert.deepEqual(context.responsibilities, ['build', 'test', 'operate', 'provision']);
  assert.equal(context.authority, 'execute-within-guardrails');
  assert.equal(context.scope, 'service');
  assert.ok(context.observableEvents.includes('incident'));
  assert.ok(context.observableEvents.includes('environment-access'));
});

test('opções de contexto não carregam sinal de capacidade', () => {
  for (const option of workContextOptions) assert.deepEqual(option.signals, [], option.id);
});

test('contexto rejeita opção desconhecida e JSON fora do contrato', () => {
  assert.throws(() => RespondentWorkContext.fromOption('sre'), /contexto de trabalho/i);
  assert.throws(() => RespondentWorkContext.fromJSON('{"responsibilities":["unknown"]}'), /contexto de trabalho/i);
});
