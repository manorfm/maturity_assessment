import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isAllowedLayaBaseUrl } from '../src/modules/inference/domain/laya-base-url.js';

test('isAllowedLayaBaseUrl accepts http://127.0.0.1 and http://localhost with optional port', () => {
  for (const url of [
    'http://127.0.0.1',
    'http://127.0.0.1:8000',
    'http://localhost',
    'http://localhost:8000',
    'http://127.0.0.1:8000/',
    'http://localhost/',
  ]) {
    assert.equal(isAllowedLayaBaseUrl(url), true, `expected allow for ${url}`);
  }
});

test('isAllowedLayaBaseUrl rejects non-local host, non-http scheme, and SSRF shapes', () => {
  for (const url of [
    'https://127.0.0.1',
    'http://example.com',
    'http://169.254.169.254',
    'http://[::1]:8000',
    'http://127.0.0.1.evil.com',
    'http://user:pass@127.0.0.1',
    'file:///tmp',
    'ftp://localhost',
    '',
  ]) {
    assert.equal(isAllowedLayaBaseUrl(url), false, `expected reject for ${JSON.stringify(url)}`);
  }
});
