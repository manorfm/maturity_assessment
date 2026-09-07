import { rmSync, writeFileSync } from 'node:fs';
import { createDatabase } from '../../src/shared/database.js';
import { POC_VALIDATION_ORGS, runOrganizationalSynthetic } from '../../src/modules/inference/domain/organizational-synthetic.js';

const databasePath = process.env.DATABASE_PATH ?? '/private/tmp/maturity-assessment-e2e.sqlite';
if (!databasePath.startsWith('/private/tmp/maturity-assessment-e2e-') && databasePath !== '/private/tmp/maturity-assessment-e2e.sqlite') {
  throw new Error('Showcase database must use its isolated /private/tmp path');
}
process.env.DATABASE_PATH = databasePath;
for (const suffix of ['', '-shm', '-wal']) rmSync(`${databasePath}${suffix}`, { force: true });

const outcomes: Record<string, string> = {
  low: 'Publicar limitador, decisão de diretoria e ação por unidade, sem contradizer o elo frágil.',
  medium: 'Mostrar prática intermediária com findings e ações, distinta da organização frágil e da sustentada.',
  high: 'Prática forte com uma evolução publicada — o resto observado, não um programa genérico.',
  boundary: 'Mostrar o mesmo artefato com causas diferentes: responsabilidade na Entrega e na faixa, sem sumir no corte de quatro.',
  'engineering-practice': 'Publicar famílias distintas — origem da versão, autorização no recurso e war room — com inventário e briefing de política, sem colapsar em espera.',
  'security-governance': 'Segurança acende em Engenharia; governança na faixa. Não funde os dois recortes num slogan de controle.',
};

const db = createDatabase(databasePath);
const suite = POC_VALIDATION_ORGS.map((org) => runOrganizationalSynthetic(db, { caseId: org.id }));
const manifest = suite.map((entry) => {
  const spec = entry.spec;
  return {
    caseId: entry.caseId,
    band: entry.band,
    title: spec.name,
    story: spec.story,
    lookFor: spec.lookFor,
    expectedOutcome: outcomes[entry.caseId] ?? outcomes[entry.band],
    adminPath: `/projects/${entry.created.publicId}/manage/${entry.created.adminSecret}`,
    publicPath: `/p/${entry.created.publicId}`,
  };
});
process.env.SHOWCASE_MANIFEST ??= '/private/tmp/maturity-assessment-showcase-poc.json';
writeFileSync(process.env.SHOWCASE_MANIFEST, JSON.stringify(manifest, null, 2));
db.close();

await import('../../src/server.js');
