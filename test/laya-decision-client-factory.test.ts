import assert from 'node:assert/strict';
import http from 'node:http';
import { test } from 'node:test';
import { createLayaDecisionClient } from '../src/modules/inference/domain/laya-decision-client-factory.js';

type Captured = {
  method?: string | undefined;
  path?: string | undefined;
};

async function withMockServer(
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  run: (baseUrl: string, captured: Captured) => Promise<void>,
): Promise<void> {
  const captured: Captured = {};
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk as Buffer));
    req.on('end', () => {
      captured.method = req.method;
      captured.path = req.url;
      handler(req, res);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl, captured);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

const sampleInput = {
  state: 'persona-state',
  options: [
    { id: 'opt-a', label: 'Option A' },
    { id: 'opt-b', label: 'Option B' },
  ],
  instructions: 'Pick the best fit.',
};

test('createLayaDecisionClient returns null for disallowed baseUrl', () => {
  let fetchCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((..._args: Parameters<typeof fetch>) => {
    fetchCalled = true;
    return originalFetch(..._args);
  }) as typeof fetch;
  try {
    assert.equal(createLayaDecisionClient({ baseUrl: 'http://evil.example' }), null);
    assert.equal(createLayaDecisionClient({ baseUrl: 'https://localhost' }), null);
    assert.equal(fetchCalled, false, 'disallowed baseUrl must not trigger fetch');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('createLayaDecisionClient returns DecisionClient whose choose sync-wraps chooseAsync against local mock', async () => {
  await withMockServer(
    (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ answers: { pick: { choice: 'opt-b' } } }));
    },
    async (baseUrl) => {
      const client = createLayaDecisionClient({ baseUrl });
      assert.ok(client, 'expected DecisionClient for local baseUrl');
      assert.equal(client.choose(sampleInput), 'opt-b');
    },
  );
});

test('createLayaDecisionClient choose returns null when upstream fails', async () => {
  await withMockServer(
    (_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'boom' }));
    },
    async (baseUrl) => {
      const client = createLayaDecisionClient({ baseUrl });
      assert.ok(client, 'expected DecisionClient for local baseUrl');
      assert.equal(client.choose(sampleInput), null);
    },
  );
});
