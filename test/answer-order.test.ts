import assert from 'node:assert/strict';
import { test } from 'node:test';
import { orderAssessmentOptions } from '../src/modules/assessments/answer-order.js';

const options = [
  { id: 'a', label: 'A', signals: [], observation: 'practice' as const },
  { id: 'b', label: 'B', signals: [], observation: 'practice' as const },
  { id: 'c', label: 'C', signals: [], observation: 'practice' as const },
  { id: 'unknown', label: 'Não observo', signals: [], observation: 'visibility' as const },
];

test('ordem é estável por participação e mantém saídas observacionais no final', () => {
  const first = orderAssessmentOptions(options, 'participant-one', 'node');
  const repeated = orderAssessmentOptions(options, 'participant-one', 'node');
  assert.deepEqual(first, repeated);
  assert.equal(first.at(-1)?.id, 'unknown');
  assert.deepEqual(new Set(first.map((option) => option.id)), new Set(options.map((option) => option.id)));
});

test('participações distribuem a primeira alternativa comportamental', () => {
  const firstOptions = new Set(Array.from({ length: 20 }, (_, index) => orderAssessmentOptions(options, `participant-${index}`, 'node')[0]?.id));
  assert.ok(firstOptions.size > 1);
});
