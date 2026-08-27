import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { applyMigrations } from './database-migrations.js';

export type Database = DatabaseSync;

export function inTransaction<T>(db: Database, work: () => T, mode: 'DEFERRED' | 'IMMEDIATE' = 'DEFERRED'): T {
  db.exec(`BEGIN ${mode}`);
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function createDatabase(filename = process.env.DATABASE_PATH ?? 'data/app.sqlite'): Database {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  const initialized = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'").get();
  if (!initialized) {
    applyMigrations(db);
  } else {
    const schema = db.prepare('SELECT MAX(version) version FROM schema_migrations').get() as { version: number | null };
    if (Number(schema.version) !== 17) {
      db.close();
      throw new Error('Unsupported database schema; recreate the database');
    }
  }
  return db;
}
