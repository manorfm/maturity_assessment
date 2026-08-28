import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('showcase reinicia o banco antes do E2E e preserva a massa ao servir os links', () => {
  const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> };
  const playwrightConfig = readFileSync(new URL('../playwright.config.ts', import.meta.url), 'utf8');

  assert.match(packageJson.scripts['demo:test-server']!, /demo-server\.ts/);
  assert.match(playwrightConfig, /E2E_PORT \?\? '3218'/);
  assert.match(playwrightConfig, /E2E_DATABASE_PATH/);
  assert.match(playwrightConfig, /E2E_SHOWCASE_GUIDE/);
  assert.match(playwrightConfig, /env: \{/);
  assert.doesNotMatch(packageJson.scripts['demo:test-server']!, /DATABASE_PATH=/);
  assert.match(packageJson.scripts['demo:serve']!, /src\/server\.ts/);
  assert.match(packageJson.scripts['demo:serve']!, /PORT=3217/);
  assert.match(packageJson.scripts['demo:serve']!, /SHOWCASE_GUIDE=/);
  assert.doesNotMatch(packageJson.scripts['demo:serve']!, /demo-server\.ts/);
});
