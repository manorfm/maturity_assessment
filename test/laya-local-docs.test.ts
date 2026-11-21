import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('technical-architecture documents venv-laya, laya-serve and LAYA_BASE_URL on 127.0.0.1:8000', () => {
  const doc = readFileSync(
    new URL('../docs/knowledge-base/technical-architecture.md', import.meta.url),
    'utf8',
  );

  assert.match(doc, /\.venv-laya/);
  assert.match(doc, /laya-serve/);
  assert.match(doc, /LAYA_BASE_URL=http:\/\/127\.0\.0\.1:8000/);
  assert.match(doc, /--no-laya/);
  assert.match(doc, /determin[ií]stic/i);
});
