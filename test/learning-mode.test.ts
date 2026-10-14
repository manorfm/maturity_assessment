import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  classifyLearningMode,
  learningModeReading,
  transferWarningFor,
} from '../src/modules/inference/domain/treatment-contract.js';
import { projectTreatmentPlan } from '../src/modules/inference/domain/diagnostic-report.js';
import { renderTreatmentPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const finding = (pattern: string, intervention: string, extras: Partial<OutcomeFinding> = {}): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  detailCapability: 'incident-management',
  title: 'Incidente frágil',
  cause: 'concentração',
  intervention,
  confidence: 0.9,
  priority: 0.8,
  prescription: { status: 'ready', reason: 'ok' },
  experiment: {
    action: intervention,
    owner: 'Operação',
    metric: 'pessoas distintas',
    reviewHorizon: '30 dias',
    successCriterion: 'próximo incidente muda',
  },
  ...extras,
});

test('curso isolado recebe baixa transferência; prática no trabalho não', () => {
  assert.equal(classifyLearningMode('Fazer um curso de SLO para o time'), 'course');
  assert.equal(transferWarningFor('course'), true);
  assert.match(learningModeReading.course, /baixa|ambiente/i);

  assert.equal(classifyLearningMode('Investigar o próximo incidente em par com quem opera'), 'pair');
  assert.equal(transferWarningFor('pair'), false);

  assert.equal(classifyLearningMode('Kata diário de 15 minutos no quadro do time'), 'kata');
  assert.equal(classifyLearningMode('Dojo de seis semanas no próprio backlog'), 'immersion');
  assert.equal(classifyLearningMode('Time de plataforma coacha o primeiro SLO em produção'), 'guided-practice');
});

test('plano de tratamento declara modalidade, unlocks e aviso de curso', () => {
  const plan = projectTreatmentPlan([
    finding('dependencia-de-heroi', 'Enviar o time a um treinamento de incidentes'),
    finding('war-room-como-gestao', 'Conduzir o próximo incidente em par com rodízio de papéis', {
      detailCapability: 'leadership-management',
      pattern: 'war-room-como-gestao',
    }),
  ]);
  const course = plan.active.find((item) => /treinamento|curso/i.test(item.action));
  assert.ok(course);
  assert.equal(course!.learningMode, 'course');
  assert.equal(course!.lowTransferWarning, true);
  assert.ok(course!.unlocks?.length);

  const pair = plan.active.find((item) => /em par/i.test(item.action));
  assert.ok(pair);
  assert.equal(pair!.learningMode, 'pair');
  assert.equal(pair!.lowTransferWarning ?? false, false);

  const html = renderTreatmentPage(plan);
  assert.match(html, /Modalidade|aprendizado/i);
  assert.match(html, /baixa transferência|sem mudar o ambiente/i);
});
