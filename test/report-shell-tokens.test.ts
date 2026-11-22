import assert from 'node:assert/strict';
import { test } from 'node:test';
import { layout } from '../src/shared/html.js';
import { renderReportShell } from '../src/modules/projects/diagnostic-report-view.js';

const TOKEN_NAMES = [
  '--bg',
  '--surface',
  '--sunk',
  '--ink',
  '--ink2',
  '--ink3',
  '--rule',
  '--accent',
  '--accent-ink',
  '--accent-soft',
  '--on-accent',
  '--ochre',
  '--ochre-soft',
  '--red',
  '--red-soft',
  '--na',
  '--na-ink',
  '--focus',
] as const;

const LIGHT_HEX: Record<(typeof TOKEN_NAMES)[number], string> = {
  '--bg': '#F6F2EA',
  '--surface': '#FFFDF8',
  '--sunk': '#EFE9DE',
  '--ink': '#1E1C19',
  '--ink2': '#46413A',
  '--ink3': '#625B51',
  '--rule': '#DCD4C6',
  '--accent': '#0D5C63',
  '--accent-ink': '#0A4B51',
  '--accent-soft': '#DCEAE8',
  '--on-accent': '#FFFFFF',
  '--ochre': '#94560F',
  '--ochre-soft': '#F5E6D0',
  '--red': '#A2372A',
  '--red-soft': '#F6E3DE',
  '--na': '#B9B2A7',
  '--na-ink': '#5E584E',
  '--focus': '#0D5C63',
};

const DARK_HEX: Record<(typeof TOKEN_NAMES)[number], string> = {
  '--bg': '#171614',
  '--surface': '#211F1C',
  '--sunk': '#1B1A17',
  '--ink': '#EDE8DF',
  '--ink2': '#CBC3B6',
  '--ink3': '#A89F91',
  '--rule': '#3A3631',
  '--accent': '#5FB0B0',
  '--accent-ink': '#8FD0CF',
  '--accent-soft': '#1C3435',
  '--on-accent': '#0D1414',
  '--ochre': '#E0A35C',
  '--ochre-soft': '#382B1A',
  '--red': '#E8826F',
  '--red-soft': '#3C2420',
  '--na': '#6A645B',
  '--na-ink': '#B5AC9E',
  '--focus': '#8FD0CF',
};

function cssRuleBody(served: string, selector: RegExp): string {
  const match = [...served.matchAll(selector)].find((entry) => entry[1]?.includes('--bg'));
  assert.ok(match?.[1], `regra CSS com tokens não encontrada: ${selector}`);
  return match[1]!.replace(/\s+/g, '');
}

function assertTokens(rule: string, expected: Record<(typeof TOKEN_NAMES)[number], string>): void {
  for (const name of TOKEN_NAMES) {
    assert.match(rule, new RegExp(`${name}:${expected[name]}`, 'i'), `token ausente ou hex errado: ${name}`);
  }
}

test('CSS do diagnostic-report claro declara o conjunto completo de tokens do protótipo', () => {
  const served = layout('Relatório', '');
  const rule = cssRuleBody(served, /(?<![\w-])\.diagnostic-report\s*\{([^}]+)\}/g);
  assertTokens(rule, LIGHT_HEX);
});

test('CSS do diagnostic-report escuro redefine o mesmo conjunto', () => {
  const served = layout('Relatório', '');
  const rule = cssRuleBody(served, /\.diagnostic-report\[data-theme="escuro"\]\s*\{([^}]+)\}/g);
  assertTokens(rule, DARK_HEX);
});

test('Shell do relatório mantém tema via data-theme e botão', () => {
  const html = renderReportShell({
    page: 'laudo',
    base: '/projects/fixture/manage/secret/report',
    projectName: 'Projeto fixture',
    body: '<p>laudo</p>',
  });
  assert.match(html, /class="diagnostic-report"/);
  assert.match(html, /data-theme="claro"/);
  assert.match(html, /<button[^>]*data-report-theme[^>]*>[\s\S]*Tema escuro/);
  assert.match(html, /getAttribute\(['"]data-theme['"]\)/);
  assert.match(html, /setAttribute\(['"]data-theme['"]/);
  assert.match(html, /claro.*escuro|escuro.*claro/);
});

test('Shell com fixture mínima não publica dados de exemplo do protótipo', () => {
  const html = renderReportShell({
    page: 'laudo',
    base: '/projects/fixture/manage/secret/report',
    projectName: 'Projeto fixture',
    body: '<p>laudo</p>',
  });
  assert.doesNotMatch(html, /Orbital/);
  assert.doesNotMatch(html, /13%/);
  assert.doesNotMatch(html, /Integração contínua/);
});
