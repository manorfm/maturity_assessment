import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildShowcaseGuide } from './e2e/showcase-guide.js';

test('demonstração vazia explica o produto e o que ainda falta', () => {
  const html = buildShowcaseGuide([]);
  assert.match(html, /Diagnóstico de engenharia/);
  assert.match(html, /Como o sistema funciona/);
  assert.match(html, /projeto/);
  assert.match(html, /convites/);
  assert.match(html, /entrevistas/);
  assert.match(html, /A demonstração ainda não gerou os três relatórios/);
  assert.doesNotMatch(html, /Índice de inspeção/);
  assert.doesNotMatch(html, /Validação humana pendente/);
});

test('demonstração apresenta três casos com decisão produzida e link do relatório', () => {
  const html = buildShowcaseGuide([{
    id: 'poc-baixa',
    title: 'POC — sistema opaco',
    story: 'Entrega <urgente> sem negociar compromisso.',
    expectedOutcome: 'O cenário deve evidenciar uma restrição sem atribuí-la ao time.',
    lookFor: ['Briefing de diretoria', 'Ação por unidade'],
    adminUrl: 'http://127.0.0.1:3217/projects/abc/manage/secret',
    publicUrl: 'http://127.0.0.1:3217/p/abc',
    observed: {
      decision: 'Corrigir o limitador',
      classification: '0 · Opaco',
      reading: 'O sistema ainda reage sob pressão.',
      limiter: 'Fluxo de trabalho',
    },
  }]);

  assert.match(html, /Três casos concluídos|Casos concluídos/);
  assert.match(html, /sistema opaco/);
  assert.match(html, /Entrega &lt;urgente&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Corrigir o limitador/);
  assert.match(html, /O sistema ainda reage sob pressão/);
  assert.match(html, /Abrir relatório/);
  assert.match(html, /href="http:\/\/127\.0\.0\.1:3217\/projects\/abc\/manage\/secret"/);
  assert.match(html, /18 pessoas em duas unidades/);
  assert.match(html, /Notas de inspeção/);
  assert.match(html, /Briefing de diretoria/);
  assert.doesNotMatch(html, /Validação humana pendente/);
});

test('demonstração completa mostra os três relatórios sem vender calibração', () => {
  const html = buildShowcaseGuide(['baixa', 'média', 'alta'].map((band, index) => ({
    id: `poc-${index}`,
    title: `POC — ${band}`,
    story: `Organização ${band}.`,
    expectedOutcome: 'Relatório apresentável.',
    lookFor: ['Amostra de 18 pessoas'],
    adminUrl: `/projects/${index}`,
    observed: {
      decision: index === 2 ? 'Preservar a prática' : 'Corrigir o limitador',
      reading: `Leitura da organização ${band} com decisão fechada.`,
      limiter: 'Fluxo de trabalho',
    },
  })));

  assert.match(html, /3 de 3 casos concluídos/);
  assert.match(html, /entrevistas simuladas/);
  assert.doesNotMatch(html, /ainda não gerou os três relatórios/);
  assert.doesNotMatch(html, /Validação humana pendente/);
  assert.doesNotMatch(html, /o posterior permanece provisório/);
});
