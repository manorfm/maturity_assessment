import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ConflictError } from '../src/shared/errors.js';

test('lote pode ser revogado e reemitido sem recuperar tokens antigos', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const created = projects.create('Piloto', 'Empresa/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;

  const original = invitations.createBatch(String(project.id), unit.id, 'engineering', 3);
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

test('migração incremental adiciona lotes sem destruir tabela existente', () => {
  const directory = mkdtempSync(join(tmpdir(), 'maturity-migration-'));
  const filename = join(directory, 'legacy.sqlite');
  try {
    const legacy = new DatabaseSync(filename);
    legacy.exec(`
      CREATE TABLE projects (id TEXT PRIMARY KEY, public_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, admin_secret_hash TEXT NOT NULL, minimum_group_size INTEGER NOT NULL DEFAULT 5, created_at TEXT NOT NULL);
      CREATE TABLE organization_units (id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), parent_id TEXT, name TEXT NOT NULL, unit_type TEXT NOT NULL, path TEXT NOT NULL);
      CREATE TABLE invitations (
        id TEXT PRIMARY KEY, project_id TEXT NOT NULL, unit_id TEXT NOT NULL,
        profile TEXT NOT NULL, token_hash TEXT NOT NULL, status TEXT NOT NULL,
        expires_at TEXT NOT NULL, created_at TEXT NOT NULL, claimed_at TEXT
      );
      INSERT INTO projects VALUES ('p1','public','Legacy','admin',5,'2026-01-01');
      INSERT INTO organization_units VALUES ('u1','p1',NULL,'Time','team','Time');
    `);
    legacy.prepare("INSERT INTO invitations VALUES ('i1','p1','u1','quality','hash','issued','2099-01-01','2026-01-01',NULL)").run();
    legacy.close();

    const migrated = createDatabase(filename);
    const columns = migrated.prepare('PRAGMA table_info(invitations)').all() as Array<{ name: string }>;
    assert.equal(columns.some((column) => column.name === 'batch_id'), true);
    assert.equal((migrated.prepare('SELECT COUNT(*) total FROM invitations').get() as { total: number }).total, 1);
    assert.equal((migrated.prepare('SELECT COUNT(*) total FROM invitation_batches').get() as { total: number }).total, 1);
    assert.ok((migrated.prepare('SELECT batch_id FROM invitations').get() as { batch_id: string }).batch_id);
    assert.ok((migrated.prepare('SELECT COUNT(*) total FROM schema_migrations').get() as { total: number }).total >= 2);
    migrated.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
