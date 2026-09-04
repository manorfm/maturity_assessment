import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildShowcaseGuide } from './e2e/showcase-guide.js';

test('guia vazio ainda explica que os casos são sintéticos', () => {
  const html = buildShowcaseGuide([]);
  assert.match(html, /Índice de inspeção/);
  assert.match(html, /não substituem calibração/i);
  assert.match(html, /relatórios organizacionais da POC ainda ausentes/i);
  assert.match(html, /validação humana.*pendente/i);
});

test('guia do showcase descreve relatórios organizacionais com URLs e textos observados', () => {
  const html = buildShowcaseGuide([{
    id: 'poc-baixa',
    title: 'POC — sistema opaco',
    story: 'Entrega <urgente> sem negociar compromisso.',
    expectedOutcome: 'O cenário deve evidenciar uma restrição sem atribuí-la ao time.',
    lookFor: ['Briefing de diretoria', 'Ação por unidade'],
    adminUrl: 'http://127.0.0.1:3217/projects/abc/manage/secret',
    publicUrl: 'http://127.0.0.1:3217/p/abc',
    observed: {
      decision: 'Entender a causa antes de agir',
      classification: '0 · Opaco',
      reading: 'O sistema ainda reage sob pressão.',
      limiter: 'Fluxo de trabalho',
    },
  }]);

  assert.match(html, /sistema opaco/);
  assert.match(html, /Entrega &lt;urgente&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Briefing de diretoria/);
  assert.match(html, /0 · Opaco/);
  assert.match(html, /O sistema ainda reage sob pressão/);
  assert.match(html, /Cenário simulado/);
  assert.match(html, /Resultado produzido/);
  assert.match(html, /Decisão apresentada/);
  assert.match(html, /Entender a causa antes de agir/);
  assert.match(html, /O cenário deve evidenciar uma restrição/);
  assert.match(html, /href="http:\/\/127\.0\.0\.1:3217\/projects\/abc\/manage\/secret"/);
  assert.match(html, /href="http:\/\/127\.0\.0\.1:3217\/p\/abc"/);
  assert.match(html, /2 relatórios organizacionais da POC ainda ausentes/i);
});

test('guia distingue os três relatórios da POC do gate humano', () => {
  const html = buildShowcaseGuide(['baixa', 'média', 'alta'].map((band, index) => ({
    id: `poc-${index}`,
    title: `POC — ${band}`,
    story: `Organização ${band}.`,
    expectedOutcome: 'Relatório apresentável.',
    lookFor: ['Amostra de 18 pessoas'],
    adminUrl: `/projects/${index}`,
  })));

  assert.match(html, /3 de 3 relatórios organizacionais da POC com coerência sintética/i);
  assert.match(html, /entrevistas reais por perspectiva ainda não foram satisfeitas/i);
  assert.doesNotMatch(html, /ainda ausentes/i);
});
