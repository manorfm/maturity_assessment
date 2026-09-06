import assert from 'node:assert/strict';
import { test } from 'node:test';
import { plainFoundation } from '../src/modules/inference/domain/foundation-reading.js';

test('fundamento de incidente explica o caminho sem exigir o jargão blameless', () => {
  const reading = plainFoundation({
    source: 'SRE / blameless postmortem',
    principle: 'Aprendeu quando o sistema muda',
    why: 'O rito sem efeito não fecha aprendizado.',
  });
  assert.match(reading.reading, /sem procurar culpado|muda o sistema, não a pessoa/i);
  assert.match(reading.sourceLabel, /incidente sem culpa/i);
  assert.doesNotMatch(reading.reading, /blameless/i);
  assert.doesNotMatch(reading.sourceLabel, /blameless/i);
});

test('fonte sem jargão conhecido permanece no porquê cotidiano', () => {
  const reading = plainFoundation({
    source: 'Continuous Delivery',
    principle: 'Lote pequeno',
    why: 'O conflito aparece enquanto a mudança ainda é reversível.',
  });
  assert.match(reading.reading, /reversível/);
  assert.match(reading.sourceLabel, /Continuous Delivery/);
});
