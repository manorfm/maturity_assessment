import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildShowcaseGuide } from './e2e/showcase-guide.js';
import { WAVE_SIX_SHOWCASE_CASES } from '../src/modules/inference/domain/showcase-validation.js';

test('guia vazio ainda explica que os casos são sintéticos', () => {
  const html = buildShowcaseGuide([]);
  assert.match(html, /Índice de inspeção/);
  assert.match(html, /casos sintéticos/i);
  assert.match(html, /não substituem calibração/i);
  assert.match(html, /6 contrastes ainda sem cobertura sintética/i);
  assert.match(html, /validação humana.*pendente/i);
});

test('guia do showcase descreve casos inspecionáveis com URLs e textos observados', () => {
  const html = buildShowcaseGuide([{
    id: 'fragil',
    scenarioIds: ['low-autonomy-handoffs'],
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
  assert.match(html, /Baixa autonomia e muitos handoffs/);
  assert.match(html, /5 contrastes ainda sem cobertura sintética/i);
});

test('guia distingue cobertura sintética completa do gate humano', () => {
  const html = buildShowcaseGuide(WAVE_SIX_SHOWCASE_CASES.map((scenario, index) => ({
    id: `case-${index}`,
    scenarioIds: [scenario.id],
    title: scenario.title,
    story: scenario.observation,
    lookFor: [scenario.expectedDistinction],
    adminUrl: `/projects/${index}`,
  })));

  assert.match(html, /6 de 6 contrastes cobertos sinteticamente/i);
  assert.match(html, /entrevistas reais por perspectiva ainda não foram satisfeitas/i);
  assert.doesNotMatch(html, /contrastes ainda sem cobertura sintética/i);
});
