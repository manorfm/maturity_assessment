import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ObservedEvent } from '../src/modules/catalog/observed-event.js';

test('ObservedEvent preserva fatos da anamnese sem concluir causa ou capacidade', () => {
  const event = ObservedEvent.create({
    key: 'last-release-delay',
    family: 'change',
    recency: 'last-30-days',
    trigger: 'Uma mudança pronta aguardou chegar ao ambiente.',
    observer: { responsibilities: ['build', 'operate'], authority: 'execute', scope: 'service' },
    timeline: [
      { order: 1, kind: 'decision', fact: 'O time concluiu a alteração e pediu um ambiente.' },
      { order: 2, kind: 'wait', fact: 'A solicitação aguardou outro grupo por três dias.' },
      { order: 3, kind: 'workaround', fact: 'Uma pessoa reutilizou um ambiente compartilhado.' },
      { order: 4, kind: 'consequence', fact: 'Outra validação foi interrompida pela concorrência.' },
    ],
    reviewTrigger: 'Revisar a interpretação se o caminho suportado já atendia esse caso sem espera.',
  });

  assert.equal(event.key, 'last-release-delay');
  assert.deepEqual(event.timeline.map((item) => item.order), [1, 2, 3, 4]);
  assert.equal('cause' in event, false);
  assert.equal('capability' in event, false);
});

test('ObservedEvent rejeita narrativa sem sequência observável', () => {
  assert.throws(() => ObservedEvent.create({
    key: 'abstract-opinion',
    family: 'change',
    recency: 'last-30-days',
    trigger: 'O processo parece lento.',
    observer: { responsibilities: ['build'], authority: 'observe', scope: 'team' },
    timeline: [{ order: 1, kind: 'decision', fact: 'Normalmente falta maturidade.' }],
    reviewTrigger: 'Revisar depois.',
  }), /ao menos dois fatos|fato abstrato/i);
});

test('ObservedEvent exige ordem temporal única e responsabilidade observável', () => {
  assert.throws(() => ObservedEvent.create({
    key: 'duplicate-order',
    family: 'incident',
    recency: 'last-90-days',
    trigger: 'Uma degradação afetou clientes.',
    observer: { responsibilities: [], authority: 'observe', scope: 'service' },
    timeline: [
      { order: 1, kind: 'signal', fact: 'Um alerta apareceu.' },
      { order: 1, kind: 'decision', fact: 'Uma pessoa interrompeu a entrega.' },
    ],
    reviewTrigger: 'Revisar se havia outro sinal anterior.',
  }), /responsabilidade|ordem/i);
});
