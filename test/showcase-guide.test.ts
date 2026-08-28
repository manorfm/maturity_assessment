import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildShowcaseGuide } from './e2e/showcase-guide.js';

test('guia vazio ainda explica que os casos são sintéticos', () => {
  const html = buildShowcaseGuide([]);
  assert.match(html, /Índice de inspeção/);
  assert.match(html, /casos sintéticos/i);
  assert.match(html, /não substituem calibração/i);
});

test('guia do showcase descreve casos inspecionáveis com URLs e textos observados', () => {
  const html = buildShowcaseGuide([{
    id: 'fragil',
    title: 'Frágil — linha sob pressão',
    story: 'Entrega <urgente> sem negociar compromisso.',
    lookFor: ['Mapa por estrutura ausente', 'Prioridades com ação recomendada'],
    adminUrl: 'http://127.0.0.1:3217/projects/abc/manage/secret',
    publicUrl: 'http://127.0.0.1:3217/p/abc',
    observed: {
      classification: '0 · Opaco',
      reading: 'O sistema ainda reage sob pressão.',
      limiter: 'Fluxo de trabalho',
      highlights: ['atenção prioritária'],
    },
    unusedInvites: [{ label: 'Complete no Squad Beta para liberar o recorte', url: 'http://127.0.0.1:3217/invite/token' }],
  }]);

  assert.match(html, /Frágil — linha sob pressão/);
  assert.match(html, /Entrega &lt;urgente&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Mapa por estrutura ausente/);
  assert.match(html, /0 · Opaco/);
  assert.match(html, /O sistema ainda reage sob pressão/);
  assert.match(html, /href="http:\/\/127\.0\.0\.1:3217\/projects\/abc\/manage\/secret"/);
  assert.match(html, /href="http:\/\/127\.0\.0\.1:3217\/p\/abc"/);
  assert.match(html, /\/invite\/token/);
  assert.match(html, /Complete no Squad Beta/);
});
