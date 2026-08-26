import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type Database = DatabaseSync;

export function createDatabase(filename = process.env.DATABASE_PATH ?? 'data/app.sqlite'): Database {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  migrate(db);
  return db;
}

function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, public_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      admin_secret_hash TEXT NOT NULL, minimum_group_size INTEGER NOT NULL DEFAULT 5,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS organization_units (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
      parent_id TEXT REFERENCES organization_units(id), name TEXT NOT NULL,
      unit_type TEXT NOT NULL, path TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_units_project ON organization_units(project_id);
    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
      unit_id TEXT NOT NULL REFERENCES organization_units(id), profile TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL, status TEXT NOT NULL DEFAULT 'issued',
      expires_at TEXT NOT NULL, created_at TEXT NOT NULL, claimed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS participations (
      id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
      unit_id TEXT NOT NULL REFERENCES organization_units(id), profile TEXT NOT NULL,
      resume_hash TEXT UNIQUE NOT NULL, graph_version TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress', current_node TEXT NOT NULL,
      created_at TEXT NOT NULL, completed_at TEXT
    );
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY, participation_id TEXT NOT NULL REFERENCES participations(id),
      node_id TEXT NOT NULL, option_id TEXT NOT NULL, created_at TEXT NOT NULL,
      UNIQUE(participation_id, node_id)
    );
    CREATE TABLE IF NOT EXISTS assessment_graph_versions (
      version TEXT PRIMARY KEY, title TEXT NOT NULL, status TEXT NOT NULL,
      entry_node_key TEXT NOT NULL, published_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assessment_nodes (
      graph_version TEXT NOT NULL REFERENCES assessment_graph_versions(version),
      node_key TEXT NOT NULL, node_type TEXT NOT NULL, title TEXT NOT NULL,
      scenario TEXT NOT NULL, prompt TEXT NOT NULL, position INTEGER NOT NULL,
      PRIMARY KEY (graph_version, node_key)
    );
    CREATE TABLE IF NOT EXISTS assessment_options (
      graph_version TEXT NOT NULL, node_key TEXT NOT NULL, option_key TEXT NOT NULL,
      label TEXT NOT NULL, position INTEGER NOT NULL,
      PRIMARY KEY (graph_version, node_key, option_key),
      FOREIGN KEY (graph_version, node_key) REFERENCES assessment_nodes(graph_version, node_key)
    );
    CREATE TABLE IF NOT EXISTS assessment_edges (
      id TEXT PRIMARY KEY, graph_version TEXT NOT NULL, from_node_key TEXT NOT NULL,
      option_key TEXT, to_node_key TEXT NOT NULL, priority INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (graph_version, from_node_key) REFERENCES assessment_nodes(graph_version, node_key),
      FOREIGN KEY (graph_version, to_node_key) REFERENCES assessment_nodes(graph_version, node_key)
    );
    CREATE TABLE IF NOT EXISTS assessment_signals (
      id TEXT PRIMARY KEY, graph_version TEXT NOT NULL, node_key TEXT NOT NULL,
      option_key TEXT NOT NULL, capability TEXT NOT NULL, pattern TEXT NOT NULL,
      weight INTEGER NOT NULL,
      FOREIGN KEY (graph_version, node_key, option_key)
        REFERENCES assessment_options(graph_version, node_key, option_key)
    );
  `);
}
