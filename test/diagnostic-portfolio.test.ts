import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyPortfolioLevel } from '../src/modules/inference/domain/diagnostic-portfolio.js';

test('política organizacional permanece decisão organizacional mesmo quando observada em uma squad', () => {
  assert.equal(classifyPortfolioLevel({ containment: 'organizational-policy' }), 'organizational');
});

test('restrição contida no time permanece local mesmo quando o comportamento se repete', () => {
  assert.equal(classifyPortfolioLevel({ containment: 'team' }), 'local');
});

test('plataforma e dependência externa entram no portfólio compartilhado', () => {
  assert.equal(classifyPortfolioLevel({ containment: 'shared-service' }), 'shared');
  assert.equal(classifyPortfolioLevel({ containment: 'external' }), 'shared');
});

test('contenção não demonstrada não é promovida a problema organizacional', () => {
  assert.equal(classifyPortfolioLevel({ containment: 'undetermined' }), 'undetermined');
});
