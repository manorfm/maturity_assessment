import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderReportShell, reportMenuFicha } from '../src/modules/projects/diagnostic-report-view.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const base = '/projects/orbital/manage/secret/report';

test('menu do relatório repete só os itens do protótipo, com a ficha na terceira posição', () => {
  const html = renderReportShell({
    page: 'laudo',
    base,
    projectName: 'Orbital Pagamentos',
    ficha: { label: 'Integração contínua', href: '/projects/orbital/manage/secret/capabilities/continuous-integration' },
    body: '<p>laudo</p>',
  });
  const nav = html.match(/<nav aria-label="Relatório">([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const labels = [...nav.matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map((match) => match[1]);
  assert.deepEqual(labels, [
    'Laudo',
    'Mapa',
    'Ficha: Integração contínua',
    'Prontidão para práticas avançadas',
    'Fronteira de aprendizado',
    'Plano de tratamento',
    'Área: Operação',
    'Histórico e reavaliação',
    'Visão por público',
  ]);
  assert.doesNotMatch(nav, /Área: Produto|Área: Engenharia|Área: Organização/);
  assert.match(nav, /href="\/projects\/orbital\/manage\/secret\/capabilities\/continuous-integration"/);
  assert.doesNotMatch(nav, /\/nodes\//);
  assert.match(nav, /<a aria-current="page" href="\/projects\/orbital\/manage\/secret">Laudo<\/a>/);
});

test('ficha aberta marca o item da ficha e o walkthrough de outra área não marca Operação', () => {
  const html = renderReportShell({
    page: 'node',
    base,
    projectName: 'Orbital Pagamentos',
    ficha: { label: 'Gestão de portfólio', href: '/capabilities/portfolio-management' },
    body: '<p>ficha</p>',
  });
  assert.match(html, /<a aria-current="page" href="\/capabilities\/portfolio-management">Ficha: Gestão de portfólio<\/a>/);

  const otherArea = renderReportShell({
    page: 'walkthrough',
    base,
    projectName: 'Orbital Pagamentos',
    areaId: 'product',
    body: '<p>produto</p>',
  });
  assert.doesNotMatch(otherArea, /aria-current="page"[^>]*>Área: Operação/);
});

test('ficha do menu aponta para a capacidade do primeiro achado publicado', () => {
  const finding = {
    pattern: 'espera',
    detailCapability: 'portfolio-management',
    confidence: 0.9,
    priority: 0.8,
  } as OutcomeFinding;
  assert.deepEqual(reportMenuFicha([finding], '/capabilities'), {
    label: 'Gestão de portfólio',
    href: '/capabilities/portfolio-management',
  });
  assert.equal(reportMenuFicha([{ ...finding, confidence: 0.2 }], '/capabilities'), undefined);
});
