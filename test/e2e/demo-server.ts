import { rmSync } from 'node:fs';

const databasePath = process.env.DATABASE_PATH ?? '/private/tmp/maturity-assessment-e2e.sqlite';
if (!databasePath.startsWith('/private/tmp/maturity-assessment-e2e-') && databasePath !== '/private/tmp/maturity-assessment-e2e.sqlite') {
  throw new Error('Showcase database must use its isolated /private/tmp path');
}
process.env.DATABASE_PATH = databasePath;
for (const suffix of ['', '-shm', '-wal']) rmSync(`${databasePath}${suffix}`, { force: true });

await import('../../src/server.js');
