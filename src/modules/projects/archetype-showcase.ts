import { escapeHtml, layout } from '../../shared/html.js';
import type { Database } from '../../shared/database.js';
import {
  ORG_ARCHETYPES,
  type OrgArchetype,
  type OrgArchetypeId,
} from '../inference/domain/org-archetype.js';
import { renderAdminShell } from './admin-view.js';

export type ArchetypeShowcaseManifestEntry = {
  archetypeId?: OrgArchetypeId;
  title?: string;
  adminPath?: string;
};

export type ArchetypeShowcaseCard = {
  spec: OrgArchetype;
  publicId: string;
  adminPath?: string;
};

export function collectArchetypeShowcase(
  db: Database,
  options: { manifest?: ArchetypeShowcaseManifestEntry[] | undefined } = {},
): ArchetypeShowcaseCard[] {
  const rows = db
    .prepare('SELECT public_id, name FROM projects ORDER BY created_at')
    .all() as Array<{ public_id: string; name: string }>;

  return ORG_ARCHETYPES.flatMap((spec) => {
    const row = rows.find((item) => item.name === spec.name);
    if (!row) return [];
    const fromManifest = options.manifest?.find(
      (entry) => entry.archetypeId === spec.id || entry.title === spec.name,
    );
    return [{
      spec,
      publicId: row.public_id,
      ...(fromManifest?.adminPath ? { adminPath: fromManifest.adminPath } : {}),
    }];
  });
}

export function renderArchetypeShowcase(cards: ArchetypeShowcaseCard[]): string {
  const count = cards.length;
  const summary = count
    ? `<p class="showcase-summary"><strong>${count} ${count === 1 ? 'arquétipo' : 'arquétipos'}.</strong> Mesmo motor, duas lentes de estrutura e modo de entrega — sem misturar com as bandas da POC.</p>`
    : '<p class="showcase-summary"><strong>Ainda não há arquétipos semeados.</strong> Rode o seed de arquétipos para criar A e B e comparar os laudos lado a lado.</p>';

  const bodyCards = cards.map(renderCard).join('');
  return layout('Arquétipos organizacionais', renderAdminShell({
    title: 'Arquétipos organizacionais',
    lead: 'Dois projetos semeados por coorte de arquétipo. Cada cartão mostra estrutura, modo de entrega e o que o expect pede no laudo.',
    showSteps: false,
    status: 'Demonstração',
    body: `<div class="showcase-shell">
    <section class="showcase-cases">
      <h2>Contraste A e B</h2>
      ${summary}
      ${bodyCards
        ? `<div class="showcase-compare">${bodyCards}</div>`
        : '<p class="muted">Nenhum arquétipo foi encontrado nesta base.</p>'}
    </section>
    </div>`,
  }));
}

function expectHint(spec: OrgArchetype): string {
  const expect = spec.expect;
  if (!expect) return 'Sem expect machine-checkable neste arquétipo.';
  const parts: string[] = [];
  for (const pattern of expect.requiredPatterns) {
    parts.push(`esperar ${pattern}`);
  }
  for (const pattern of expect.forbiddenPatterns) {
    parts.push(`não deve aparecer ${pattern}`);
  }
  for (const group of expect.patternGroups) {
    if (group.length) parts.push(`grupo ${group.join(' | ')}`);
  }
  return parts.length ? parts.join('; ') : 'Expect sem padrões pinados.';
}

function renderCard(entry: ArchetypeShowcaseCard): string {
  const { spec } = entry;
  const open = entry.adminPath
    ? `<a class="button" href="${escapeHtml(entry.adminPath)}">Abrir relatório</a>`
    : '';
  return `
    <article class="showcase-simulation" data-archetype="${escapeHtml(spec.id)}">
      <header class="showcase-sim-head">
        <p class="tag situation">${escapeHtml(spec.structure)}</p>
        <p class="tag outcome">${escapeHtml(spec.deliveryMode)}</p>
      </header>
      <h3>${escapeHtml(spec.name)}</h3>
      <div class="showcase-block problem">
        <p class="field-label">Estrutura</p>
        <p class="showcase-problem">${escapeHtml(spec.structure)}</p>
      </div>
      <div class="showcase-block path">
        <p class="field-label">Modo de entrega</p>
        <p>${escapeHtml(spec.deliveryMode)}</p>
      </div>
      <div class="showcase-block path">
        <p class="field-label">Expectativa no laudo</p>
        <p>${escapeHtml(expectHint(spec))}</p>
      </div>
      ${open}
    </article>
  `;
}
