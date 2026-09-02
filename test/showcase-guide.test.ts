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
    expectedOutcome: 'O cenário deve evidenciar uma restrição sem atribuí-la ao time.',
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
  assert.match(html, /Cenário simulado/);
  assert.match(html, /Resultado produzido/);
  assert.match(html, /O cenário deve evidenciar uma restrição/);
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
    expectedOutcome: scenario.expectedDistinction,
    lookFor: [scenario.expectedDistinction],
    adminUrl: `/projects/${index}`,
  })));

  assert.match(html, /6 de 6 contratos com coerência sintética exercitada/i);
  assert.match(html, /entrevistas reais por perspectiva ainda não foram satisfeitas/i);
  assert.doesNotMatch(html, /contrastes ainda sem cobertura sintética/i);
});

test('guia torna mecanismos concorrentes comparáveis sem alegar acurácia', () => {
  const html = buildShowcaseGuide([{
    id: 'causas', scenarioIds: ['same-symptom-different-causes'], title: 'Mesmo sintoma',
    story: 'Mudanças integram tarde.', expectedOutcome: 'Separar três mecanismos.', lookFor: [], adminUrl: '/manage',
    contrasts: [
      { scope: 'Squad Tooling', mechanism: 'feedback técnico', containment: 'capacidade compartilhada', authority: 'plataforma', nextTest: 'encurtar retorno' },
      { scope: 'Squad Política', mechanism: 'política de lote', containment: 'política organizacional', authority: 'governança', nextTest: 'caminho proporcional' },
      { scope: 'Squad Arquitetura', mechanism: 'acoplamento', containment: 'arquitetura', authority: 'arquitetura e times', nextTest: 'reduzir mudança conjunta' },
    ],
  }]);
  assert.match(html, /Comparação produzida/);
  assert.match(html, /Squad Tooling.*feedback técnico.*plataforma/s);
  assert.match(html, /Squad Política.*política de lote.*governança/s);
  assert.match(html, /Squad Arquitetura.*acoplamento.*reduzir mudança conjunta/s);
  assert.doesNotMatch(html, /acurácia/i);
});
