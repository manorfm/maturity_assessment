import { rmSync } from 'node:fs';

const databasePath = '/private/tmp/maturity-assessment-e2e.sqlite';
for (const suffix of ['', '-shm', '-wal']) rmSync(`${databasePath}${suffix}`, { force: true });

await import('../../src/server.js');
