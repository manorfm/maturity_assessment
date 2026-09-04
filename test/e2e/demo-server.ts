import { rmSync, writeFileSync } from 'node:fs';
import { createDatabase } from '../../src/shared/database.js';
import { POC_SYNTHETIC_ORGS, runPocSyntheticSuite } from '../../src/modules/inference/domain/organizational-synthetic.js';

const databasePath = process.env.DATABASE_PATH ?? '/private/tmp/maturity-assessment-e2e.sqlite';
if (!databasePath.startsWith('/private/tmp/maturity-assessment-e2e-') && databasePath !== '/private/tmp/maturity-assessment-e2e.sqlite') {
  throw new Error('Showcase database must use its isolated /private/tmp path');
}
process.env.DATABASE_PATH = databasePath;
for (const suffix of ['', '-shm', '-wal']) rmSync(`${databasePath}${suffix}`, { force: true });

const outcomes: Record<string, string> = {
  low: 'Publicar limitador, decisão de diretoria e ação por unidade, sem contradizer o elo frágil.',
  medium: 'Mostrar prática intermediária com findings e ações, distinta da organização frágil e da sustentada.',
  high: 'Preservar o comportamento observado sem exigir cargo, ferramenta sofisticada ou transformação organizacional.',
};

const db = createDatabase(databasePath);
const suite = runPocSyntheticSuite(db);
const manifest = suite.map((entry) => {
  const spec = POC_SYNTHETIC_ORGS.find((org) => org.band === entry.band)!;
  return {
    band: entry.band,
    title: spec.name,
    story: spec.story,
    expectedOutcome: outcomes[entry.band],
    adminPath: `/projects/${entry.created.publicId}/manage/${entry.created.adminSecret}`,
    publicPath: `/p/${entry.created.publicId}`,
  };
});
writeFileSync(process.env.SHOWCASE_MANIFEST ?? '/private/tmp/maturity-assessment-showcase-poc.json', JSON.stringify(manifest, null, 2));
db.close();

await import('../../src/server.js');
