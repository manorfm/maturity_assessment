import assert from 'node:assert/strict';
import http from 'node:http';
import { test } from 'node:test';
import { LayaSystemOneClient } from '../src/modules/inference/domain/laya-system-one-client.js';

type Captured = {
  method?: string | undefined;
  path?: string | undefined;
  body?: unknown;
};

async function withMockServer(
  handler: (req: http.IncomingMessage, res: http.ServerResponse, body: string) => void,
  run: (baseUrl: string, captured: Captured) => Promise<void>,
): Promise<void> {
  const captured: Captured = {};
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk as Buffer));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      captured.method = req.method;
      captured.path = req.url;
      try {
        captured.body = raw ? JSON.parse(raw) : undefined;
      } catch {
        captured.body = raw;
      }
      handler(req, res, raw);
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

test('LayaSystemOneClient POSTs /v1/systemone choice pick and returns valid optionId', async () => {
  await withMockServer(
    (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ answers: { pick: { choice: 'opt-b' } } }));
    },
    async (baseUrl, captured) => {
      const client = new LayaSystemOneClient({ baseUrl });
      const chosen = await client.chooseAsync(sampleInput);
      assert.equal(chosen, 'opt-b');
      assert.equal(captured.method, 'POST');
      assert.equal(captured.path, '/v1/systemone');
      const body = captured.body as {
        state: string;
        questions: { pick: { type: string; instructions: string; criteria: Record<string, string> } };
      };
      assert.equal(body.state, 'persona-state');
      assert.equal(body.questions.pick.type, 'choice');
      assert.equal(body.questions.pick.criteria['opt-b'], 'Option B');
      assert.equal(body.questions.pick.instructions, 'Pick the best fit.');
    },
  );
});

test('LayaSystemOneClient returns null on HTTP 500', async () => {
  await withMockServer(
    (_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'boom' }));
    },
    async (baseUrl) => {
      const client = new LayaSystemOneClient({ baseUrl });
      const chosen = await client.chooseAsync(sampleInput);
      assert.equal(chosen, null);
    },
  );
});

test('LayaSystemOneClient returns null on choice outside options', async () => {
  await withMockServer(
    (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ answers: { pick: { choice: 'nope' } } }));
    },
    async (baseUrl) => {
      const client = new LayaSystemOneClient({ baseUrl });
      const chosen = await client.chooseAsync({
        state: 'persona-state',
        options: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ],
      });
      assert.equal(chosen, null);
    },
  );
});

test('LayaSystemOneClient returns null on malformed answers.pick', async () => {
  await withMockServer(
    (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ answers: { pick: {} } }));
    },
    async (baseUrl) => {
      const client = new LayaSystemOneClient({ baseUrl });
      const chosen = await client.chooseAsync(sampleInput);
      assert.equal(chosen, null);
    },
  );
});
