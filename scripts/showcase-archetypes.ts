import { rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createDatabase } from '../src/shared/database.js';
import { ORG_ARCHETYPES, runArchetypeCohort } from '../src/modules/inference/domain/org-archetype.js';

const databasePath = process.env.DATABASE_PATH
  ?? '/private/tmp/maturity-assessment-archetype-showcase-v1.sqlite';
const showcaseDbPrefix = '/private/tmp/maturity-assessment-archetype-showcase-';
const normalizedDatabasePath = path.normalize(databasePath);
if (
  !databasePath.startsWith(showcaseDbPrefix)
  || databasePath.includes('..')
  || !normalizedDatabasePath.startsWith(showcaseDbPrefix)
) {
  throw new Error('Archetype showcase database must use /private/tmp/maturity-assessment-archetype-showcase-*.sqlite');
}
process.env.DATABASE_PATH = databasePath;
for (const suffix of ['', '-shm', '-wal']) rmSync(`${databasePath}${suffix}`, { force: true });

const db = createDatabase(databasePath);
const seeded = ORG_ARCHETYPES.map((spec) => ({
  spec,
  created: runArchetypeCohort(db, { archetypeId: spec.id }).created,
}));

const manifest = seeded.map(({ spec, created }) => ({
  archetypeId: spec.id,
  title: spec.name,
  structure: spec.structure,
  deliveryMode: spec.deliveryMode,
  adminPath: `/projects/${created.publicId}/manage/${created.adminSecret}`,
}));

const manifestPath = process.env.SHOWCASE_ARCHETYPE_MANIFEST
  ?? '/private/tmp/maturity-assessment-archetype-showcase.json';
if (!manifestPath.startsWith('/private/tmp/maturity-assessment') || manifestPath.includes('..')) {
  throw new Error('Archetype showcase manifest must stay under /private/tmp/maturity-assessment');
}
process.env.SHOWCASE_ARCHETYPE_MANIFEST = manifestPath;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
db.close();

await import('../src/server.js');
