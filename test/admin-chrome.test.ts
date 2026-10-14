import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import { renderAdminShell } from '../src/modules/projects/admin-view.js';

test('shell administrativo usa tokens e tipografia do design-graph', () => {
  const html = renderAdminShell({
    title: 'Novo diagnóstico',
    lead: 'Descreva o contexto.',
    step: 'project',
    body: '<p>corpo</p>',
  });
  assert.match(html, /class="admin"/);
  assert.match(html, /Anamnese de Tecnologia/);
  assert.match(html, /Administração/);
  assert.match(html, /--accent:#0D5C63/);
  assert.match(html, /Newsreader/);
  assert.match(html, /IBM Plex Sans/);
  assert.match(html, /aria-label="Etapas do projeto"/);
  assert.match(html, /aria-current="step"/);
});

test('shell embutido omite a barra superior de marca', () => {
  const html = renderAdminShell({
    title: 'Convites e participação',
    step: 'invites',
    embedded: true,
    body: '<p>corpo</p>',
  });
  assert.match(html, /class="admin admin--embedded"/);
  assert.doesNotMatch(html, /class="admin-top"/);
  assert.doesNotMatch(html, />Administração</);
  assert.match(html, /Convites e participação/);
});

test('criar projeto e painel servem o chrome administrativo', async () => {
  const db = createDatabase(':memory:');
  const app = await createApp(db);
  const createPage = await app.inject({ method: 'GET', url: '/projects/new' });
  assert.equal(createPage.statusCode, 200);
  assert.match(createPage.body, /class="admin"/);
  assert.match(createPage.body, /Anamnese de Tecnologia/);
  assert.match(createPage.body, /Administração/);
  assert.match(createPage.body, /data-hierarchy-editor/);
  assert.match(createPage.body, /Novo diagnóstico/);

  const created = await app.inject({
    method: 'POST',
    url: '/projects',
    payload: { name: 'Orbital', hierarchy: 'Empresa/Time A' },
  });
  const manageUrl = created.headers.location!;
  const manage = await app.inject({ method: 'GET', url: manageUrl });
  assert.equal(manage.statusCode, 200);
  assert.match(manage.body, /class="manage-workspace"/);
  assert.match(manage.body, /class="manage-report"/);
  assert.match(manage.body, /class="manage-ops"/);
  assert.match(manage.body, /admin--embedded/);
  assert.doesNotMatch(manage.body, /class="report-home"/);
  assert.doesNotMatch(manage.body, /<p class="eyebrow">Diagnóstico<\/p>/);
  assert.match(manage.body, /class="admin admin--embedded"/);
  assert.match(manage.body, /Convites e participação/);
  assert.match(manage.body, /admin-metric/);
  assert.match(manage.body, /Gerar convites individuais/);
  const reportIdx = manage.body.indexOf('diagnostic-report');
  const opsIdx = manage.body.indexOf('manage-ops');
  assert.ok(reportIdx >= 0 && opsIdx > reportIdx);
  await app.close();
});

test('acesso e showcase usam o mesmo sistema visual', async () => {
  const app = await createApp(createDatabase(':memory:'));
  const access = await app.inject({ method: 'GET', url: '/projects/access' });
  assert.match(access.body, /class="admin"/);
  assert.match(access.body, /Acesse o painel/);
  const showcase = await app.inject({ method: 'GET', url: '/showcase' });
  assert.equal(showcase.statusCode, 200);
  assert.match(showcase.body, /class="admin"|class="showcase-shell"/);
  assert.match(showcase.body, /Anamnese de Tecnologia|Simulações do relatório/);
  await app.close();
});
