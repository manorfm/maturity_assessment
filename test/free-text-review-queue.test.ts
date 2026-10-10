import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { freeTextPipeline, freeTextStrategy, stripPii } from '../src/modules/catalog/item-catalog.js';
import {
  cohenKappa,
  FreeTextReviewService,
  strategyPurposeCodebook,
} from '../src/modules/inference/domain/free-text-review.js';
import { createApp } from '../src/app/create-app.js';

test('pipeline de texto livre exige revisão humana e κ mínimo 0,7', () => {
  assert.equal(freeTextPipeline.enabledByDefault, false);
  assert.equal(freeTextPipeline.requiresHumanReview, true);
  assert.equal(freeTextPipeline.minCohenKappa, 0.7);
  assert.equal(strategyPurposeCodebook.version, freeTextStrategy.codebookVersion);
  assert.ok(strategyPurposeCodebook.codes.length >= 3);
});

test('κ de Cohen distingue concordância total de discórdia', () => {
  const agree = cohenKappa([
    { a: 'outcome-linked', b: 'outcome-linked' },
    { a: 'delivery-only', b: 'delivery-only' },
    { a: 'unclear', b: 'unclear' },
    { a: 'outcome-linked', b: 'outcome-linked' },
  ]);
  assert.equal(agree, 1);

  const disagree = cohenKappa([
    { a: 'outcome-linked', b: 'delivery-only' },
    { a: 'delivery-only', b: 'outcome-linked' },
    { a: 'unclear', b: 'delivery-only' },
    { a: 'outcome-linked', b: 'unclear' },
  ]);
  assert.ok(disagree < 0.7);
});

test('enfileira texto sanitizado sem PII e só publica códigos com κ ≥ 0,7', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Texto livre', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  projects.setFreeTextEnabled(String(project.id), true);

  const reviews = new FreeTextReviewService(db);
  const raw = 'Falamos com Ana da equipe Pagamentos sobre o cliente ACME em 12/03/2026.';
  assert.doesNotMatch(stripPii(raw), /Ana|Pagamentos|ACME|12\/03\/2026/);

  const entry = reviews.enqueue({
    projectId: String(project.id),
    unitId: unit.id,
    nodeId: freeTextStrategy.id,
    rawText: raw,
    proposedCode: 'outcome-linked',
    proposedConfidence: 0.4,
  });
  assert.equal(entry.status, 'pending');
  assert.doesNotMatch(entry.sanitizedText, /Ana|Pagamentos|ACME|12\/03\/2026/);
  assert.ok(['low_confidence', 'random_sample', 'required'].includes(entry.reviewReason));

  const second = reviews.enqueue({
    projectId: String(project.id),
    unitId: unit.id,
    nodeId: freeTextStrategy.id,
    rawText: 'O trabalho reduz a espera do cliente no fluxo.',
    proposedCode: 'outcome-linked',
    proposedConfidence: 0.35,
  });

  const queue = reviews.listPending(String(project.id));
  assert.equal(queue.length, 2);
  assert.ok(queue.some((item) => item.id === entry.id));

  for (const item of [entry, second]) {
    reviews.recordCoding(item.id, 'human-a', 'outcome-linked');
    reviews.recordCoding(item.id, 'human-b', 'outcome-linked');
  }
  assert.equal(reviews.listPending(String(project.id)).length, 0);

  const agreement = reviews.agreement(String(project.id));
  assert.ok(agreement.overallKappa !== undefined);
  assert.ok(agreement.overallKappa! >= 0.7);
  assert.ok(agreement.publishableCodes.includes('outcome-linked'));
});

test('painel administrativo lista a fila de revisão de texto livre', async () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Fila painel', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  projects.setFreeTextEnabled(String(project.id), true);
  const reviews = new FreeTextReviewService(db);
  reviews.enqueue({
    projectId: String(project.id),
    unitId: unit.id,
    nodeId: freeTextStrategy.id,
    rawText: 'O trabalho serve para reduzir a espera do cliente.',
    proposedCode: 'outcome-linked',
    proposedConfidence: 0.3,
  });

  const app = await createApp(db);
  const page = await app.inject({
    method: 'GET',
    url: `/projects/${created.publicId}/manage/${created.adminSecret}`,
  });
  assert.equal(page.statusCode, 200);
  assert.match(page.body, /Revisão de texto livre/i);
  assert.match(page.body, /reduzir a espera do cliente/i);
  assert.match(page.body, /free-text-reviews/);

  const codeOptions = strategyPurposeCodebook.codes.map((code) => code.id);
  const submit = await app.inject({
    method: 'POST',
    url: `/projects/${created.publicId}/manage/${created.adminSecret}/free-text-reviews`,
    payload: {
      entryId: reviews.listPending(String(project.id))[0]!.id,
      raterKey: 'human-a',
      code: codeOptions[0]!,
    },
  });
  assert.equal(submit.statusCode, 302);
});
