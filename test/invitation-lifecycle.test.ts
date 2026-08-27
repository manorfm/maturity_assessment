import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ConflictError } from '../src/shared/errors.js';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('lote pode ser revogado e reemitido sem recuperar tokens antigos', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const created = projects.create('Piloto', 'Empresa/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;

  const original = invitations.createBatch(String(project.id), unit.id, 3);
  assert.equal(original.tokens.length, 3);
  assert.equal(invitations.revokeBatch(String(project.id), original.batchId), 3);
  assert.equal(invitations.claim(original.tokens[0]!), 'invalid');

  const replacement = invitations.reissueBatch(String(project.id), original.batchId);
  assert.equal(replacement.tokens.length, 3);
  assert.notDeepEqual(replacement.tokens, original.tokens);
  assert.throws(() => invitations.reissueBatch(String(project.id), original.batchId), ConflictError);
  const summary = invitations.listBatches(String(project.id));
  assert.deepEqual(summary.map((batch) => batch.status), ['revoked', 'issued']);
});

test('banco novo nasce somente no esquema vigente', () => {
  const db = createDatabase(':memory:');
  const signals = db.prepare('PRAGMA table_info(assessment_signals)').all() as Array<{ name: string; notnull: number }>;
  const invitations = db.prepare('PRAGMA table_info(invitations)').all() as Array<{ name: string; notnull: number }>;
  assert.equal(signals.find((column) => column.name === 'detail_capabilities')?.notnull, 1);
  assert.equal(signals.find((column) => column.name === 'evidence_layer')?.notnull, 1);
  assert.equal(signals.find((column) => column.name === 'constraint_kind')?.notnull, 1);
  assert.equal(invitations.find((column) => column.name === 'batch_id')?.notnull, 1);
  assert.deepEqual([...db.prepare('SELECT version FROM schema_migrations').all()].map((row) => Number((row as { version: number }).version)), [14]);
  db.close();
});

test('banco de versão anterior é rejeitado em vez de migrado', () => {
  const directory = mkdtempSync(join(tmpdir(), 'maturity-obsolete-'));
  const filename = join(directory, 'obsolete.sqlite');
  try {
    const obsolete = new DatabaseSync(filename);
    obsolete.exec("CREATE TABLE schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL); INSERT INTO schema_migrations VALUES (4, '2026-01-01')");
    obsolete.close();
    assert.throws(() => createDatabase(filename), /Unsupported database schema/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
