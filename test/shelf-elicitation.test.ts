import assert from 'node:assert/strict';
import { test } from 'node:test';
import { auditCausalCatalog } from '../src/modules/inference/domain/causal-catalog-audit.js';
import { CAUSAL_CATALOG_VERSION, causalCatalog, lateIntegrationFamily } from '../src/modules/inference/domain/causal-catalog.js';
import {
  applyShelfSession,
  lambdaFromHundred,
  type ShelfSession,
} from '../src/modules/inference/domain/shelf-elicitation.js';

test('λ da pergunta SHELF é count/100', () => {
  assert.equal(lambdaFromHundred(60), 0.6);
  assert.equal(lambdaFromHundred(0), 0);
  assert.equal(lambdaFromHundred(100), 1);
  assert.equal(lambdaFromHundred(150), 1);
});

test('catálogo v11 declara proveniência com method e não tem erro estrutural', () => {
  const issues = auditCausalCatalog(causalCatalog);
  assert.equal(issues.filter((item) => item.severity === 'error').length, 0);
  assert.ok(issues.some((item) => item.code === 'provisional-lambda'));
  assert.equal(lateIntegrationFamily.provenance.method, 'prototype');
  assert.equal(lateIntegrationFamily.provenance.version, CAUSAL_CATALOG_VERSION);
  assert.ok(causalCatalog.every((family) => family.provenance.method && family.provenance.version));
});

test('SHELF com menos de 3 especialistas é rejeitado', () => {
  const session: ShelfSession = {
    familyId: 'late-integration',
    experts: 2,
    elicitedAt: '2026-10-10T12:00:00.000Z',
    facilitator: 'facilitador-teste',
    version: 'shelf-late-integration-v1',
    finals: [{ symptomId: 'pr-espera', causeId: 'feedback-lento', countOutOf100: 55, justification: 'x' }],
  };
  assert.throws(() => applyShelfSession(lateIntegrationFamily, session), /3 a 5/);
});

test('aplicar sessão SHELF atualiza λ e marca method shelf', () => {
  const session: ShelfSession = {
    familyId: 'late-integration',
    experts: 4,
    elicitedAt: '2026-10-10T15:00:00.000Z',
    facilitator: 'disciplina-entrega',
    version: 'shelf-late-integration-v1',
    finals: [
      { symptomId: 'pr-espera', causeId: 'feedback-lento', countOutOf100: 55, justification: 'espera de build e teste' },
      { symptomId: 'pr-espera', causeId: 'aprovacao-externa', countOutOf100: 35, justification: 'fila de CAB' },
      { symptomId: 'aprovacao-necessaria', causeId: 'aprovacao-externa', countOutOf100: 85, justification: 'política de lote' },
    ],
  };
  const elicited = applyShelfSession(lateIntegrationFamily, session);
  assert.equal(elicited.provenance.method, 'shelf');
  assert.equal(elicited.provenance.experts, 4);
  assert.equal(elicited.symptoms.find((item) => item.id === 'pr-espera')?.lambda['feedback-lento'], 0.55);
  assert.equal(elicited.symptoms.find((item) => item.id === 'aprovacao-necessaria')?.lambda['aprovacao-externa'], 0.85);
  const issues = auditCausalCatalog([elicited]);
  assert.equal(issues.filter((item) => item.severity === 'error').length, 0);
  assert.equal(issues.filter((item) => item.code === 'provisional-lambda').length, 0);
});
