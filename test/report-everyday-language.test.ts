import assert from 'node:assert/strict';
import { test } from 'node:test';
import { interventionCatalog } from '../src/modules/inference/inference-service.js';
import { causeFromGuidance, guidanceFor } from '../src/modules/inference/domain/solution-guidance.js';
import { projectFrontInventory } from '../src/modules/inference/domain/multi-front-inventory.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

test('plataforma descreve o pedido e a espera, não “fila externa”', () => {
  const seed = interventionCatalog['provisionamento-em-fila']!;
  const guidance = guidanceFor('provisionamento-em-fila', seed.foundation, seed.title);
  assert.match(seed.title, /pedido|espera|ambiente|permissão/i);
  assert.doesNotMatch(seed.title, /fila externa|capacidades chegam/i);
  assert.match(guidance.mechanism, /pedido|chamado|espera/i);
  assert.match(guidance.plainExplanation, /ambiente|permissão|acesso/i);
  assert.doesNotMatch(guidance.mechanism, /Neste recorte, o efeito observado/i);
  assert.doesNotMatch(causeFromGuidance(guidance, seed.title), /Neste recorte, o efeito observado/i);
});

test('causa explícita não cola o título de novo no mecanismo', () => {
  const guidance = guidanceFor('war-room-como-gestao');
  const cause = causeFromGuidance(guidance, 'O war room virou o modo de ver e gerir o sistema');
  assert.equal(cause, guidance.mechanism);
  assert.doesNotMatch(cause, /Neste recorte, o efeito observado/i);
});

test('inventário fala de suporte em linguagem cotidiana', () => {
  const finding: OutcomeFinding = {
    kind: 'correction',
    pattern: 'war-room-como-gestao',
    detailCapability: 'leadership-management',
    title: 'O war room virou o modo de gestão',
    cause: 'clima',
    intervention: 'Parar de autorizar caça ao culpado.',
    confidence: .8,
    priority: .9,
    prescription: { status: 'ready', reason: 'Mecanismo discriminado.' },
  };
  const row = projectFrontInventory([finding]).rows.find((item) => item.front === 'management')!;
  assert.match(row.relativeBelief, /suporte|relatos/i);
  assert.doesNotMatch(row.relativeBelief, /crença relativa/i);
});
