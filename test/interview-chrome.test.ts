import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import {
  renderInterviewComplete,
  renderInterviewQuestion,
  renderInterviewShell,
} from '../src/modules/assessments/interview-view.js';

test('shell da entrevista usa tokens e tipografia do design-graph', () => {
  const html = renderInterviewShell({ title: 'Teste', body: '<p>corpo</p>' });
  assert.match(html, /Anamnese de Tecnologia/);
  assert.match(html, /class="interview"/);
  assert.match(html, /--accent:#0D5C63/);
  assert.match(html, /Newsreader/);
  assert.match(html, /IBM\+Plex\+Sans|IBM Plex Sans/);
});

test('pergunta separa práticas de saídas observacionais e mostra progresso', () => {
  const html = renderInterviewQuestion({
    brand: 'Anamnese de Tecnologia',
    kicker: 'Incidentes',
    title: 'Pense na última falha',
    lead: 'Vale a mais recente.',
    why: 'Não precisa ser a mais grave. Vale a mais recente de que você se lembra bem.',
    prompt: 'O que aconteceu primeiro?',
    progressLabel: 'cerca de 9 minutos restantes',
    progressPercent: 40,
    action: '/respond/token',
    options: [
      { id: 'a', label: 'Registramos o que aconteceu.', observation: 'practice' },
      { id: 'x', label: 'Não acompanho esse tipo de situação', observation: 'visibility' },
      { id: 'y', label: 'Isso não acontece aqui', observation: 'not_applicable' },
    ],
  });
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="40"/);
  assert.match(html, /interview-choice/);
  assert.match(html, /Não acompanho esse tipo de situação/);
  assert.match(html, />ou</);
  assert.match(html, /Continuar/);
  assert.match(html, /Guarde este endereço para retomar/);
});

test('conclusão da entrevista segue o tom do protótipo', () => {
  const html = renderInterviewComplete();
  assert.match(html, /Obrigado\./);
  assert.match(html, /registradas de forma anônima/);
  assert.match(html, /não são exibidos novamente/);
  assert.match(html, /aria-valuenow="100"/);
});

test('rota /respond serve o chrome de entrevista do design-graph', async () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const app = await createApp(db);
  const projects = new ProjectService(db);
  const created = projects.create('Interview UI', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unitId = projects.listUnits(String(project.id)).find((unit) => unit.isLeaf)!.id;
  const invitations = new InvitationService(db);
  const batch = invitations.createBatch(String(project.id), unitId, 1);
  const token = batch.tokens[0]!;
  const claim = await app.inject({ method: 'GET', url: `/invite/${token}` });
  const resume = claim.headers.location!;
  const page = await app.inject({ method: 'GET', url: resume });
  assert.equal(page.statusCode, 200);
  assert.match(page.body, /Começar/);
  await app.inject({ method: 'POST', url: `${resume}/intro` });
  const question = await app.inject({ method: 'GET', url: resume });
  assert.match(question.body, /class="interview"/);
  assert.match(question.body, /Anamnese de Tecnologia/);
  assert.match(question.body, /role="progressbar"/);
  assert.match(question.body, /class="interview-choice"/);
  assert.match(question.body, /minuto/);
  await app.close();
});
