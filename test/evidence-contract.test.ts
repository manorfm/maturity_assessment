import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  evidenceToSignal,
  normalizeOptionEvidence,
  signalToEvidenceLinks,
  weightToAnchorStage,
} from '../src/modules/catalog/evidence-contract.js';
import type { Signal } from '../src/modules/catalog/assessment-graph.js';
import { evidenceToAnchoredResponse } from '../src/modules/inference/domain/evidence-observation.js';
import { observeStage, publishIndex } from '../src/modules/inference/domain/stage-posterior.js';

const signal = (overrides: Partial<Signal> = {}): Signal => ({
  capability: 'entrega',
  pattern: 'empacotamento-manual',
  weight: -2,
  details: ['release-feedback'],
  layer: 'practice',
  constraint: 'none',
  ...overrides,
});

test('weight migra para âncora pela tabela 04 §4.2', () => {
  assert.equal(weightToAnchorStage(-2), 0);
  assert.equal(weightToAnchorStage(-1), 1);
  assert.equal(weightToAnchorStage(0), 2);
  assert.equal(weightToAnchorStage(1), 3);
  assert.equal(weightToAnchorStage(2), 4);
  assert.equal(weightToAnchorStage(-3), 0);
  assert.equal(weightToAnchorStage(3), 4);
});

test('signal vira evidência com discriminação medium e papel por folha', () => {
  const links = signalToEvidenceLinks(signal({
    details: ['release-feedback', 'sdlc-automation'],
    weight: -2,
  }));
  assert.equal(links.length, 2);
  assert.equal(links[0]?.capability, 'release-feedback');
  assert.equal(links[0]?.role, 'primary');
  assert.equal(links[0]?.anchorStage, 0);
  assert.equal(links[0]?.discrimination, 'medium');
  assert.equal(links[0]?.pattern, 'empacotamento-manual');
  assert.equal(links[0]?.pillar, 'entrega');
  assert.equal(links[1]?.role, 'effect');
  assert.equal(links[1]?.capability, 'sdlc-automation');
});

test('heroísmo e ritual em peso −2 recebem appropriation e mantêm âncora 0 até revisão', () => {
  const hero = signalToEvidenceLinks(signal({ pattern: 'dependencia-de-heroi', weight: -2 }))[0]!;
  assert.equal(hero.anchorStage, 0);
  assert.equal(hero.appropriation, 'heroism');
  const ritual = signalToEvidenceLinks(signal({ pattern: 'war-room-como-gestao', weight: -2 }))[0]!;
  assert.equal(ritual.anchorStage, 0);
  assert.equal(ritual.appropriation, 'ritual');
});

test('adaptador reconstrói Signal para o motor m1 sem perder padrão nem folha', () => {
  const links = signalToEvidenceLinks(signal({ weight: 2, layer: 'outcome', details: ['release-feedback'] }));
  const rebuilt = evidenceToSignal(links[0]!);
  assert.equal(rebuilt.capability, 'entrega');
  assert.equal(rebuilt.pattern, 'empacotamento-manual');
  assert.equal(rebuilt.weight, 2);
  assert.deepEqual(rebuilt.details, ['release-feedback']);
  assert.equal(rebuilt.layer, 'outcome');
});

test('normalizeOptionEvidence torna evidence a fonte e signals o derivado m1', () => {
  const option = normalizeOptionEvidence({
    id: 'manual-package',
    label: 'Em preparar a versão.',
    signals: [signal({ details: ['release-feedback'] })],
  });
  assert.equal(option.evidence.length, 1);
  assert.equal(option.evidence[0]?.anchorStage, 0);
  assert.equal(option.signals.length, 1);
  assert.equal(option.signals[0]?.pattern, 'empacotamento-manual');
  assert.equal(option.signals[0]?.weight, -2);
});

test('evidence alimenta observeStage sem inventar publicação abaixo do limiar', () => {
  const links = [
    ...signalToEvidenceLinks(signal({ weight: -2, details: ['release-feedback'] })),
    ...signalToEvidenceLinks(signal({ weight: -2, pattern: 'caminho-de-versao-sem-origem', details: ['release-feedback'] })),
  ];
  const responses = links.map((link) => evidenceToAnchoredResponse(link));
  const posterior = observeStage(responses);
  assert.ok(posterior.index <= 40);
  assert.equal(publishIndex({
    respondents: 3, testlets: 1, perspectives: 1, posterior, coverage: 0.4,
  }).published, false);
});
