import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDiagnosticContext } from '../src/modules/inference/domain/diagnostic-contract.js';

test('abrangência não determina contenção quando o mecanismo é desconhecido', () => {
  const context = buildDiagnosticContext({ capability: 'continuous-integration', constraint: 'undetermined' });
  assert.equal(context.containment, 'undetermined');
  assert.equal(context.mechanism, 'undetermined');
  assert.match(context.missingEvidence, /mecanismo/i);
  assert.deepEqual(context.impacts, []);
  assert.equal(context.severity, 'undetermined');
});

test('dependência externa preserva contenção externa sem culpar o time', () => {
  const context = buildDiagnosticContext({ capability: 'platform-autonomy', constraint: 'external-dependency' });
  assert.equal(context.containment, 'external');
  assert.equal(context.decisionAuthority, 'external-owner');
  assert.equal(context.prescription.status, 'ready');
  assert.match(context.missingEvidence, /fornecedor|regulador/i);
});

test('mecanismo desconhecido mantém autoridade e prescrição em investigação', () => {
  const context = buildDiagnosticContext({ capability: 'continuous-integration', constraint: 'none' });
  assert.equal(context.mechanism, 'undetermined');
  assert.equal(context.decisionAuthority, 'undetermined');
  assert.equal(context.prescription.status, 'investigate');
  assert.match(context.prescription.reason, /mecanismo|contenção/i);
});

test('cultura isolada permanece hipótese e não autoriza prescrição ou contenção local', () => {
  const context = buildDiagnosticContext({ capability: 'organizational-learning', constraint: 'culture' });
  assert.equal(context.mechanism, 'undetermined');
  assert.equal(context.containment, 'undetermined');
  assert.equal(context.decisionAuthority, 'undetermined');
  assert.equal(context.prescription.status, 'investigate');
  assert.match(context.missingEvidence, /decisão|incentivo|política|poder/i);
});

test('política discriminada pede decisão organizacional e permite experimento condicionado', () => {
  const context = buildDiagnosticContext({ capability: 'enabling-governance', constraint: 'policy' });
  assert.equal(context.containment, 'organizational-policy');
  assert.equal(context.decisionAuthority, 'organizational-governance');
  assert.equal(context.prescription.status, 'ready');
});
