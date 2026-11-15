import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import {
  ORG_ARCHETYPES,
  runArchetypeCohort,
} from '../src/modules/inference/domain/org-archetype.js';

const ARCHETYPE_A = 'bureaucratic-fixed-scope' as const;
const ARCHETYPE_B = 'digital-native-continuous' as const;
const WAR_ROOM = 'war-room-como-gestao';
const MANAGE_HREF = /href="\/projects\/[^"]+\/manage\/[^"]+"/;
const MANIFEST_PATH = '/private/tmp/maturity-assessment-archetype-showcase-test.json';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const showcaseScriptPath = path.join(repoRoot, 'scripts', 'showcase-archetypes.ts');
const SHOWCASE_CLI_TIMEOUT_MS = 10_000;

function runShowcaseCli(env: NodeJS.ProcessEnv): Promise<{
  exitCode: number | null;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', showcaseScriptPath],
      { cwd: repoRoot, env },
    );
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`showcase CLI timed out after ${SHOWCASE_CLI_TIMEOUT_MS}ms`));
    }, SHOWCASE_CLI_TIMEOUT_MS);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({ exitCode, stdout, stderr });
    });
  });
}

function seedArchetypePair(db: ReturnType<typeof createDatabase>) {
  const a = runArchetypeCohort(db, { archetypeId: ARCHETYPE_A });
  const b = runArchetypeCohort(db, { archetypeId: ARCHETYPE_B });
  const specA = ORG_ARCHETYPES.find((entry) => entry.id === ARCHETYPE_A)!;
  const specB = ORG_ARCHETYPES.find((entry) => entry.id === ARCHETYPE_B)!;
  writeFileSync(MANIFEST_PATH, JSON.stringify([
    {
      archetypeId: ARCHETYPE_A,
      title: specA.name,
      adminPath: `/projects/${a.created.publicId}/manage/${a.created.adminSecret}`,
    },
    {
      archetypeId: ARCHETYPE_B,
      title: specB.name,
      adminPath: `/projects/${b.created.publicId}/manage/${b.created.adminSecret}`,
    },
  ]));
  process.env.SHOWCASE_ARCHETYPE_MANIFEST = MANIFEST_PATH;
  return { a, b };
}

function projectRows(db: ReturnType<typeof createDatabase>) {
  return db
    .prepare('SELECT public_id, name FROM projects ORDER BY created_at')
    .all() as Array<{ public_id: string; name: string }>;
}

test('archetype showcase seed usa runArchetypeCohort A e B sem sintético POC', () => {
  const db = createDatabase(':memory:');
  seedArchetypePair(db);

  const specA = ORG_ARCHETYPES.find((entry) => entry.id === ARCHETYPE_A)!;
  const specB = ORG_ARCHETYPES.find((entry) => entry.id === ARCHETYPE_B)!;
  const rows = projectRows(db);
  assert.equal(rows.length, 2, `expected only A and B projects; got ${rows.map((row) => row.name).join(', ')}`);
  assert.deepEqual(
    rows.map((row) => row.name).sort(),
    [specA.name, specB.name].sort(),
  );
  for (const row of rows) {
    assert.doesNotMatch(row.name, /^POC —/, `seed must not create POC synthetic project: ${row.name}`);
  }
});

test('índice /showcase/archetypes lista A e B com structure, deliveryMode, hint e manage', async () => {
  const previous = process.env.SHOWCASE_ARCHETYPE_MANIFEST;
  try {
    const db = createDatabase(':memory:');
    const { a, b } = seedArchetypePair(db);
    const specA = ORG_ARCHETYPES.find((entry) => entry.id === ARCHETYPE_A)!;
    const specB = ORG_ARCHETYPES.find((entry) => entry.id === ARCHETYPE_B)!;

    const app = await createApp(db);
    const response = await app.inject({ method: 'GET', url: '/showcase/archetypes' });
    await app.close();

    assert.equal(response.statusCode, 200);
    assert.match(String(response.headers['content-type'] ?? ''), /text\/html/);

    const html = response.body;
    const cards = html.match(/data-archetype="[^"]+"/g) ?? [];
    assert.equal(cards.length, 2, `expected 2 archetype cards; got ${cards.length}`);
    assert.match(html, new RegExp(`data-archetype="${ARCHETYPE_A}"`));
    assert.match(html, new RegExp(`data-archetype="${ARCHETYPE_B}"`));

    assert.match(html, new RegExp(specA.structure));
    assert.match(html, new RegExp(specB.structure));
    assert.match(html, new RegExp(specA.deliveryMode));
    assert.match(html, new RegExp(specB.deliveryMode));

    assert.match(html, new RegExp(WAR_ROOM));
    assert.doesNotMatch(html, /DATABASE_PATH/);

    const manageA = `href="/projects/${a.created.publicId}/manage/${a.created.adminSecret}"`;
    const manageB = `href="/projects/${b.created.publicId}/manage/${b.created.adminSecret}"`;
    assert.match(html, new RegExp(manageA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(html, new RegExp(manageB.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

    const withoutManageHrefs = html
      .replace(manageA, 'href="REDACTED"')
      .replace(manageB, 'href="REDACTED"');
    assert.doesNotMatch(withoutManageHrefs, new RegExp(a.created.adminSecret));
    assert.doesNotMatch(withoutManageHrefs, new RegExp(b.created.adminSecret));
  } finally {
    if (previous === undefined) delete process.env.SHOWCASE_ARCHETYPE_MANIFEST;
    else process.env.SHOWCASE_ARCHETYPE_MANIFEST = previous;
  }
});

test('A manage HTML archetype contém war-room finding pattern', async () => {
  const db = createDatabase(':memory:');
  const { created } = runArchetypeCohort(db, { archetypeId: ARCHETYPE_A });
  const app = await createApp(db);
  const response = await app.inject({
    method: 'GET',
    url: `/projects/${created.publicId}/manage/${created.adminSecret}`,
  });
  await app.close();

  assert.equal(response.statusCode, 200);
  assert.match(String(response.headers['content-type'] ?? ''), /text\/html/);
  assert.ok(
    new RegExp(`data-finding-pattern="${WAR_ROOM}"`).test(response.body),
    `expected data-finding-pattern="${WAR_ROOM}"`,
  );
});

test('B manage HTML archetype omite war-room finding pattern', async () => {
  const db = createDatabase(':memory:');
  const { created } = runArchetypeCohort(db, { archetypeId: ARCHETYPE_B });
  const app = await createApp(db);
  const response = await app.inject({
    method: 'GET',
    url: `/projects/${created.publicId}/manage/${created.adminSecret}`,
  });
  await app.close();

  assert.equal(response.statusCode, 200);
  assert.match(String(response.headers['content-type'] ?? ''), /text\/html/);
  assert.ok(
    !new RegExp(`data-finding-pattern="${WAR_ROOM}"`).test(response.body),
    `must not contain data-finding-pattern="${WAR_ROOM}"`,
  );
});

test('índice archetype vazio não fabrica links manage', async () => {
  const previous = process.env.SHOWCASE_ARCHETYPE_MANIFEST;
  try {
    delete process.env.SHOWCASE_ARCHETYPE_MANIFEST;
    const db = createDatabase(':memory:');
    const app = await createApp(db);
    const response = await app.inject({ method: 'GET', url: '/showcase/archetypes' });
    await app.close();

    assert.equal(response.statusCode, 200);
    assert.match(String(response.headers['content-type'] ?? ''), /text\/html/);
    assert.doesNotMatch(response.body, MANAGE_HREF);
    const cards = response.body.match(/data-archetype="[^"]+"/g) ?? [];
    assert.equal(cards.length, 0, 'empty DB must not invent archetype cards');
    assert.match(
      response.body,
      /ainda não|sem arquétipo|nenhum arquétipo|não há|vazia|vazio/i,
    );
  } finally {
    if (previous === undefined) delete process.env.SHOWCASE_ARCHETYPE_MANIFEST;
    else process.env.SHOWCASE_ARCHETYPE_MANIFEST = previous;
  }
});

test(
  'showcase-archetypes rejeita DATABASE_PATH com path traversal (..)',
  { timeout: SHOWCASE_CLI_TIMEOUT_MS },
  async () => {
    const traversalPath =
      '/private/tmp/maturity-assessment-archetype-showcase-../../tmp/evil-showcase.sqlite';
    const { exitCode, stderr } = await runShowcaseCli({
      ...process.env,
      DATABASE_PATH: traversalPath,
      SHOWCASE_ARCHETYPE_MANIFEST:
        '/private/tmp/maturity-assessment-archetype-showcase-traversal-reject.json',
    });
    assert.notEqual(exitCode, 0, 'DATABASE_PATH with .. must exit non-zero');
    assert.match(
      stderr,
      /Archetype showcase database must use \/private\/tmp\/maturity-assessment-archetype-showcase-\*\.sqlite/,
      `stderr must reject traversal DATABASE_PATH; got: ${stderr}`,
    );
  },
);