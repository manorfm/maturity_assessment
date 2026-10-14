import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { freeTextStrategy } from '../src/modules/catalog/item-catalog.js';
import { graph } from '../src/modules/catalog/assessment-graph.js';
import { projectInterviewStep, projectInterviewWelcome } from '../src/modules/assessments/domain/interview-step.js';
import { renderInterviewComplete, renderInterviewWelcome } from '../src/modules/assessments/interview-view.js';

test('a abertura publica anonimato, tempo e pausa sem o caso de exemplo', () => {
  const welcome = projectInterviewWelcome(18);
  assert.match(welcome.anonymity, /anônimas/);
  assert.match(welcome.anonymity, /5 ou mais/);
  assert.match(welcome.pause, /pausar e voltar/);
  assert.equal(welcome.duration, 'Cerca de 18 minutos.');
  assert.equal(welcome.start, 'Começar');
  const html = renderInterviewWelcome({ ...welcome, action: '/respond/token/intro' });
  assert.match(html, /Começar/);
  assert.match(html, /sistema de trabalho/);
  assert.doesNotMatch(html, /Orbital|Senioridade|Tempo na empresa/);
});

test('cada passo do grafo diz por que está ali e o aprofundamento só existe no probe', () => {
  const perspective = projectInterviewStep({ id: 'respondent-context' });
  const context = projectInterviewStep({ id: 'work-context', type: 'context' });
  assert.equal(perspective.kind, 'perspective');
  assert.equal(context.kind, 'context');
  assert.match(perspective.why, /não gera pontuação/);
  assert.match(context.why, /não gera pontuação/);
  assert.doesNotMatch(graph.find((node) => node.id === 'respondent-context')!.scenario, /último caso semelhante/);
  assert.doesNotMatch(`${perspective.why} ${context.why}`, /Senioridade|Tempo na empresa/);

  const event = projectInterviewStep({ id: 'urgent-change', type: 'scenario' });
  assert.equal(event.kind, 'event');
  assert.match(event.why, /mais recente/);

  const example = projectInterviewStep({ id: freeTextStrategy.id });
  assert.equal(example.kind, 'example');
  assert.equal(example.maxChars, freeTextStrategy.maxChars);
  assert.match(example.why, /nomes/);

  assert.equal(projectInterviewStep({ id: 'deployment-probe', type: 'probe' }).kind, 'pressure');
  assert.equal(projectInterviewStep({ id: 'release-validation', type: 'probe' }).kind, 'pressure');
  assert.notEqual(projectInterviewStep({ id: 'urgent-change', type: 'scenario' }).kind, 'pressure');

  const reading = projectInterviewStep({ id: 'literacy-wip-chart', type: 'scenario' });
  assert.equal(reading.kind, 'reading');
  assert.match(reading.why, /estímulo/);
});

test('a conclusão avisa o limiar e que o percurso não reabre', () => {
  const html = renderInterviewComplete();
  assert.match(html, /5 ou mais/);
  assert.match(html, /percurso não reabre/);
  assert.doesNotMatch(html, /Orbital/);
});

test('o convite abre na boas-vindas e só depois na pergunta', async () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const app = await createApp(db);
  const projects = new ProjectService(db);
  const created = projects.create('Entrevista', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unitId = projects.listUnits(String(project.id)).find((unit) => unit.isLeaf)!.id;
  const batch = new InvitationService(db).createBatch(String(project.id), unitId, 1);
  const claim = await app.inject({ method: 'GET', url: `/invite/${batch.tokens[0]}` });
  const resume = claim.headers.location!;
  const opening = await app.inject({ method: 'GET', url: resume });
  assert.equal(opening.statusCode, 200);
  assert.equal(opening.body.includes('Começar'), true);
  assert.equal(opening.body.includes('class="interview-choice"'), false);
  assert.equal(opening.body.includes('anônimas'), true);
  const started = await app.inject({ method: 'POST', url: `${resume}/intro` });
  assert.equal(started.statusCode, 302);
  const question = await app.inject({ method: 'GET', url: resume });
  assert.equal(question.body.includes('class="interview-choice"'), true);
  assert.equal(question.body.includes('não gera pontuação'), true);
  assert.equal(question.body.includes('Senioridade'), false);
  assert.equal(opening.body.includes('.interview-main{flex-direction:column'), true);
  await app.close();
});
