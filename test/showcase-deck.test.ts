import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { runOrganizationalSynthetic, runPocSyntheticSuite } from '../src/modules/inference/domain/organizational-synthetic.js';
import { collectShowcaseSimulations, renderShowcaseDeck } from '../src/modules/projects/showcase-deck.js';

test('deck vazio explica que as simulações ainda não foram semeadas', () => {
  const html = renderShowcaseDeck([]);
  assert.match(html, /Simulações do relatório/);
  assert.match(html, /Três projetos/);
  assert.match(html, /Ainda não/);
  assert.doesNotMatch(html, /Validação humana pendente/);
  assert.doesNotMatch(html, /Abrir relatório/);
});

test('deck apresenta as três situações lado a lado, sem contrastes de inspeção', () => {
  const db = createDatabase(':memory:');
  const suite = runPocSyntheticSuite(db);
  const html = renderShowcaseDeck(collectShowcaseSimulations(db, {
    manifest: suite.map((entry) => ({
      caseId: entry.caseId,
      title: entry.spec.name,
      adminPath: `/projects/${entry.created.publicId}/manage/${entry.created.adminSecret}`,
    })),
  }));
  assert.match(html, /3 organizações simuladas/);
  assert.match(html, /class="showcase-compare"/);
  assert.match(html, /field-label">Problema/);
  assert.match(html, /field-label">Caminho/);
  assert.match(html, /Menos madura/);
  assert.match(html, /Intermediária/);
  assert.match(html, /Madura/);
  assert.match(html, /POC — sistema opaco/);
  assert.match(html, /POC — sistema reativo/);
  assert.match(html, /POC — prática adaptativa/);
  assert.match(html, /Pode evoluir/);
  assert.match(html, /emergência é reconciliada|trabalho posterior/i);
  assert.equal((html.match(/Abrir relatório/g) ?? []).length, 3);
  assert.doesNotMatch(html, /fronteira de times/);
  assert.doesNotMatch(html, /segurança distinta de governança/);
  assert.doesNotMatch(html, /baixa prática de engenharia/);
  assert.doesNotMatch(html, /class="interview-report"/);
});

test('coleta só as três bandas mesmo quando o banco tem um contraste', () => {
  const db = createDatabase(':memory:');
  runOrganizationalSynthetic(db, { caseId: 'low' });
  runOrganizationalSynthetic(db, { caseId: 'boundary' });
  const collected = collectShowcaseSimulations(db);
  assert.deepEqual(collected.map((entry) => entry.spec.id), ['low']);
});

test('sem manifesto o deck publica o resultado e não aponta Abrir relatório para a página pública', () => {
  const db = createDatabase(':memory:');
  const { created } = runOrganizationalSynthetic(db, { caseId: 'low' });
  const html = renderShowcaseDeck(collectShowcaseSimulations(db));
  assert.match(html, /Menos madura/);
  assert.doesNotMatch(html, /href="\/p\//);
  assert.doesNotMatch(html, new RegExp(`href="/p/${created.publicId}"`));
});
