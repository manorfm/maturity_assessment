import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { graph, GRAPH_VERSION } from '../src/modules/catalog/assessment-graph.js';
import { freeTextStrategy, groupErrorReferent } from '../src/modules/catalog/item-catalog.js';
import { FreeTextReviewService } from '../src/modules/inference/domain/free-text-review.js';
import { createApp } from '../src/app/create-app.js';
import { renderInterviewQuestion } from '../src/modules/assessments/interview-view.js';

test('nó de texto livre existe no grafo e a UI oferece área de texto', () => {
  assert.ok(graph.some((node) => node.id === freeTextStrategy.id));
  const html = renderInterviewQuestion({
    kicker: 'Engenharia',
    title: freeTextStrategy.title,
    lead: freeTextStrategy.scenario,
    prompt: freeTextStrategy.prompt,
    why: 'Não escreva nomes de pessoas, times ou clientes.',
    progressLabel: 'cerca de 10 minutos',
    progressPercent: 40,
    action: '/respond/token',
    options: [{ id: 'skip', label: 'Prefiro não responder por escrito.', observation: 'visibility' }],
    nodeId: freeTextStrategy.id,
    freeText: { maxChars: freeTextStrategy.maxChars, submitOptionId: 'submitted' },
  });
  assert.match(html, /textarea|name="freeText"/i);
  assert.match(html, /submitted|Continuar/i);
});

test('com flag ligada o tronco passa pelo texto livre após a técnica de lista', async () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const created = projects.create('Texto no tronco', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  projects.setFreeTextEnabled(String(project.id), true);
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };

  participations.answer(claimed.resumeToken, 'engineering');
  participations.answer(claimed.resumeToken, 'build-and-operate');
  // vignette
  const vignette = participations.find(claimed.resumeToken)!;
  const vignetteNode = new CatalogService(db).getNode(GRAPH_VERSION, vignette.current_node, 'engineering')!;
  participations.answer(claimed.resumeToken, vignetteNode.options[0]!.id);
  // literacy
  const literacy = participations.find(claimed.resumeToken)!;
  const literacyNode = new CatalogService(db).getNode(GRAPH_VERSION, literacy.current_node, 'engineering')!;
  participations.answer(claimed.resumeToken, literacyNode.options[0]!.id);
  // group referent
  assert.equal(participations.find(claimed.resumeToken)?.current_node, groupErrorReferent.id);
  participations.answer(claimed.resumeToken, 'hide');
  // list technique arm
  const afterGroup = participations.find(claimed.resumeToken)!;
  assert.match(afterGroup.current_node, /^list-/);
  const listNode = new CatalogService(db).getNode(GRAPH_VERSION, afterGroup.current_node, 'engineering')!;
  participations.answer(claimed.resumeToken, listNode.options[0]!.id);

  assert.equal(participations.find(claimed.resumeToken)?.current_node, freeTextStrategy.id);

  const result = participations.answer(claimed.resumeToken, 'submitted', {
    freeText: 'O trabalho reduz a espera do cliente no fluxo de pedidos.',
  });
  assert.equal(result, 'next');
  assert.notEqual(participations.find(claimed.resumeToken)?.current_node, freeTextStrategy.id);

  const reviews = new FreeTextReviewService(db);
  assert.equal(reviews.listPending(String(project.id)).length, 1);
});

test('com flag desligada o tronco não passa pelo texto livre', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const created = projects.create('Sem texto', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };

  participations.answer(claimed.resumeToken, 'engineering');
  participations.answer(claimed.resumeToken, 'build-and-operate');
  const catalog = new CatalogService(db);
  for (const _ of [0, 1]) {
    const current = participations.find(claimed.resumeToken)!;
    const node = catalog.getNode(GRAPH_VERSION, current.current_node, 'engineering')!;
    participations.answer(claimed.resumeToken, node.options[0]!.id);
  }
  participations.answer(claimed.resumeToken, 'hide');
  const listNodeId = participations.find(claimed.resumeToken)!.current_node;
  assert.match(listNodeId, /^list-/);
  const listNode = catalog.getNode(GRAPH_VERSION, listNodeId, 'engineering')!;
  participations.answer(claimed.resumeToken, listNode.options[0]!.id);
  assert.notEqual(participations.find(claimed.resumeToken)?.current_node, freeTextStrategy.id);
});

test('página de entrevista renderiza textarea no nó de texto livre', async () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const created = projects.create('UI texto', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  projects.setFreeTextEnabled(String(project.id), true);
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };
  const catalog = new CatalogService(db);

  participations.answer(claimed.resumeToken, 'engineering');
  participations.answer(claimed.resumeToken, 'build-and-operate');
  for (const _ of [0, 1]) {
    const current = participations.find(claimed.resumeToken)!;
    const node = catalog.getNode(GRAPH_VERSION, current.current_node, 'engineering')!;
    participations.answer(claimed.resumeToken, node.options[0]!.id);
  }
  participations.answer(claimed.resumeToken, 'hide');
  const listId = participations.find(claimed.resumeToken)!.current_node;
  const listNode = catalog.getNode(GRAPH_VERSION, listId, 'engineering')!;
  participations.answer(claimed.resumeToken, listNode.options[0]!.id);

  const app = await createApp(db);
  const page = await app.inject({ method: 'GET', url: `/respond/${claimed.resumeToken}` });
  assert.equal(page.statusCode, 200);
  assert.match(page.body, /textarea|name="freeText"/i);
  assert.match(page.body, /free-text-strategy-purpose/);
});
