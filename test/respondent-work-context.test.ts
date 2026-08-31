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
  assert.equal(context.interviewTrack, 'full-cycle');
});

test('cada contexto seleciona uma trilha estável sem transformar o perfil em capacidade', () => {
  assert.equal(RespondentWorkContext.fromOption('build-focused').interviewTrack, 'delivery');
  assert.equal(RespondentWorkContext.fromOption('quality-and-risk').interviewTrack, 'risk');
  assert.equal(RespondentWorkContext.fromOption('shared-capability').interviewTrack, 'capability');
  assert.equal(RespondentWorkContext.fromOption('architecture-and-boundaries').interviewTrack, 'architecture');
  assert.equal(RespondentWorkContext.fromOption('product-and-outcomes').interviewTrack, 'outcomes');
  assert.equal(RespondentWorkContext.fromOption('people-and-portfolio').interviewTrack, 'portfolio');
  assert.equal(RespondentWorkContext.fromOption('data-and-experience').interviewTrack, 'experience');
});

test('opções de contexto não carregam sinal de capacidade', () => {
  for (const option of workContextOptions) assert.deepEqual(option.signals, [], option.id);
});

test('contexto rejeita opção desconhecida e JSON fora do contrato', () => {
  assert.throws(() => RespondentWorkContext.fromOption('sre'), /contexto de trabalho/i);
  assert.throws(() => RespondentWorkContext.fromJSON('{"responsibilities":["unknown"]}'), /contexto de trabalho/i);
});
