import { escapeHtml, layout } from '../../shared/html.js';
import type { Database } from '../../shared/database.js';
import { InferenceService } from '../inference/inference-service.js';
import { POC_SYNTHETIC_ORGS, type MaturityBand, type PocSyntheticOrg } from '../inference/domain/organizational-synthetic.js';
import { CapabilityTaxonomy } from '../inference/domain/capability-taxonomy.js';
import { uniqueFindingsByPattern } from '../inference/domain/report-outcome.js';

export type ShowcaseManifestEntry = {
  caseId?: string;
  title?: string;
  adminPath?: string;
};

export type ShowcaseSimulation = {
  spec: PocSyntheticOrg;
  report: ReturnType<InferenceService['report']>;
  adminPath?: string;
};

const situationByBand: Record<MaturityBand, string> = {
  low: 'Menos madura',
  medium: 'Intermediária',
  high: 'Madura',
};

export function collectShowcaseSimulations(db: Database, options: { manifest?: ShowcaseManifestEntry[] } = {}): ShowcaseSimulation[] {
  const rows = db.prepare('SELECT id, public_id, name FROM projects ORDER BY created_at').all() as Array<{ id: string; public_id: string; name: string }>;
  const inference = new InferenceService(db);
  return POC_SYNTHETIC_ORGS.flatMap((spec) => {
    const row = rows.find((item) => item.name === spec.name);
    if (!row) return [];
    const fromManifest = options.manifest?.find((entry) => entry.caseId === spec.id || entry.title === spec.name);
    return [{
      spec,
      report: inference.report(row.id, 5),
      ...(fromManifest?.adminPath ? { adminPath: fromManifest.adminPath } : {}),
    }];
  });
}

export function renderShowcaseDeck(simulations: ShowcaseSimulation[]): string {
  const cards = simulations.map(renderSimulation).join('');
  const count = simulations.length;
  const summary = count
    ? `<p class="showcase-summary"><strong>${count} ${count === 1 ? 'organização simulada' : 'organizações simuladas'}.</strong> Mesmo produto, três situações. A madura ainda publica um resto concreto — não uma lista genérica.</p>`
    : '<p class="showcase-summary"><strong>Ainda não há simulações semeadas.</strong> Rode o showcase para criar as três organizações e publicar os relatórios no mesmo motor da jornada real.</p>';
  return layout('Simulações do relatório', `
    <header class="showcase-deck">
      <p class="eyebrow">Demonstração do produto</p>
      <h1>Simulações do relatório</h1>
      <p class="lead">Três projetos passaram por entrevistas no mesmo motor. Cada cartão separa a situação, o problema observado e o caminho possível. Quem autoriza decide depois de ler.</p>
    </header>
    <section class="showcase-howto">
      <h2>Como o sistema funciona</h2>
      <ol class="showcase-steps">
        <li><span>1</span><p>Cria-se um projeto com duas unidades finais.</p></li>
        <li><span>2</span><p>Cada unidade recebe convites anônimos. A pessoa informa sua perspectiva ao abrir o link.</p></li>
        <li><span>3</span><p>A entrevista percorre eventos recentes — urgência, entrega, risco — não um checklist de ferramenta.</p></li>
        <li><span>4</span><p>Com 18 respostas o relatório publica correção, evolução ou o resto que ainda cabe melhorar.</p></li>
      </ol>
    </section>
    <section class="showcase-cases">
      <h2>Três situações</h2>
      ${summary}
      ${cards ? `<div class="showcase-compare">${cards}</div>` : '<p class="muted">Nenhuma organização sintética foi encontrada nesta base.</p>'}
    </section>
    <section class="showcase-poc">
      <h2>Uma POC com pessoas reais</h2>
      <p>A POC repete o mesmo percurso com os eventos de vocês: <strong>18 pessoas em duas unidades</strong>, no mínimo 5 em cada, com trilhas complementares.</p>
      <p>Esta página simula as entrevistas no mesmo motor. Não é calibração e não substitui as pessoas do recorte.</p>
    </section>
  `);
}

function renderSimulation(entry: ShowcaseSimulation): string {
  const { spec, report } = entry;
  const leftover = uniqueFindingsByPattern(report.findings)[0];
  const problem = leftover?.title ?? report.outcome.nextStepTitle;
  const path = leftover?.experiment?.action ?? leftover?.intervention ?? report.outcome.nextStepBody;
  const where = leftover
    ? CapabilityTaxonomy.labelFor(leftover.detailCapability)
    : report.outcome.limiterLabel;
  const open = entry.adminPath
    ? `<a class="button" href="${escapeHtml(entry.adminPath)}">Abrir relatório</a>`
    : '';
  return `
    <article class="showcase-simulation" data-case="${escapeHtml(spec.id)}" data-band="${escapeHtml(spec.band)}">
      <header class="showcase-sim-head">
        <p class="tag situation">${escapeHtml(situationByBand[spec.band])}</p>
        <p class="tag outcome">${escapeHtml(report.outcome.kindLabel)}</p>
      </header>
      <h3>${escapeHtml(spec.name)}</h3>
      <p class="showcase-desc">${escapeHtml(spec.story)}</p>
      <div class="showcase-block problem">
        <p class="field-label">Problema</p>
        <p class="showcase-problem">${escapeHtml(problem)}</p>
        <p class="showcase-where">${escapeHtml(where)}</p>
      </div>
      <div class="showcase-block path">
        <p class="field-label">Caminho</p>
        <p>${escapeHtml(path)}</p>
      </div>
      ${open}
    </article>
  `;
}
