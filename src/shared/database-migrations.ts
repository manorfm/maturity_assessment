import type { DatabaseSync } from 'node:sqlite';

type Migration = { version: number; apply: (db: DatabaseSync) => void };

const migrations: Migration[] = [
  {
    version: 1,
    apply: (db) => db.exec(`
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
      CREATE TABLE IF NOT EXISTS assessment_node_variants (
        graph_version TEXT NOT NULL, node_key TEXT NOT NULL, profile TEXT NOT NULL,
        title TEXT, scenario TEXT NOT NULL, prompt TEXT,
        PRIMARY KEY (graph_version, node_key, profile),
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
    `),
  },
  {
    version: 2,
    apply: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS invitation_batches (
          id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
          unit_id TEXT NOT NULL REFERENCES organization_units(id), profile TEXT NOT NULL,
          quantity INTEGER NOT NULL, created_at TEXT NOT NULL,
          reissued_from TEXT REFERENCES invitation_batches(id)
        );
        CREATE INDEX IF NOT EXISTS idx_batches_project ON invitation_batches(project_id, created_at);
      `);
      const columns = db.prepare('PRAGMA table_info(invitations)').all() as Array<{ name: string }>;
      if (!columns.some((column) => column.name === 'batch_id')) db.exec('ALTER TABLE invitations ADD COLUMN batch_id TEXT REFERENCES invitation_batches(id)');
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_invitations_batch ON invitations(batch_id);
        INSERT INTO invitation_batches (id, project_id, unit_id, profile, quantity, created_at)
        SELECT 'legacy-' || lower(hex(randomblob(16))), i.project_id, i.unit_id, i.profile, COUNT(*), MIN(i.created_at)
        FROM invitations i
        WHERE i.batch_id IS NULL
          AND EXISTS (SELECT 1 FROM projects p WHERE p.id = i.project_id)
          AND EXISTS (SELECT 1 FROM organization_units u WHERE u.id = i.unit_id AND u.project_id = i.project_id)
        GROUP BY i.project_id, i.unit_id, i.profile;
        UPDATE invitations
        SET batch_id = (
          SELECT b.id FROM invitation_batches b
          WHERE b.project_id = invitations.project_id
            AND b.unit_id = invitations.unit_id
            AND b.profile = invitations.profile
            AND b.reissued_from IS NULL
          ORDER BY b.rowid LIMIT 1
        )
        WHERE batch_id IS NULL
          AND EXISTS (SELECT 1 FROM projects p WHERE p.id = invitations.project_id);
      `);
    },
  },
  {
    version: 3,
    apply: (db) => db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_batches_reissued_once ON invitation_batches(reissued_from) WHERE reissued_from IS NOT NULL'),
  },
];

export function applyMigrations(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL
  )`);
  const applied = new Set((db.prepare('SELECT version FROM schema_migrations').all() as Array<{ version: number }>).map((row) => Number(row.version)));
  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;
    db.exec('BEGIN IMMEDIATE');
    try {
      migration.apply(db);
      db.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)').run(migration.version, new Date().toISOString());
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}
