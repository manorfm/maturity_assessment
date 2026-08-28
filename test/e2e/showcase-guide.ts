import { escapeHtml, layout } from '../../src/shared/html.js';

export const SHOWCASE_GUIDE_PATH = '/private/tmp/maturity-assessment-showcase.html';

export type ShowcaseGuideCase = {
  id: string;
  title: string;
  story: string;
  lookFor: string[];
  adminUrl: string;
  publicUrl?: string;
  observed?: {
    classification?: string;
    reading?: string;
    limiter?: string;
    highlights?: string[];
  };
  unusedInvites?: Array<{ label: string; url: string }>;
};

export function buildShowcaseGuide(cases: ShowcaseGuideCase[]): string {
  const index = cases.map((entry) => `<li><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.title)}</a></li>`).join('');
  const articles = cases.map((entry) => renderCase(entry)).join('');
  return layout('Índice de inspeção', `
    <header>
      <p class="eyebrow">Showcase sintético</p>
      <h1>Índice de inspeção</h1>
      <p class="lead">Casos sintéticos para inspecionar textos, classificações, recomendações e proteções de agregação. Eles não substituem calibração empírica; o posterior permanece provisório.</p>
    </header>
    <div class="notice">
      <p>Abra cada relatório administrativo, compare a leitura executiva com o radar e use os convites não consumidos para percorrer a entrevista à mão. A página pública do projeto não revela respostas.</p>
    </div>
    ${index ? `<section class="card"><h2>Casos gerados</h2><ol>${index}</ol></section>` : '<p class="muted">Nenhum caso foi gerado nesta execução.</p>'}
    ${articles}
  `);
}

function renderCase(entry: ShowcaseGuideCase): string {
  const lookFor = entry.lookFor.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const observed = entry.observed ? `
    <h3>O que esta execução observou</h3>
    <dl class="executive-facts">
      ${entry.observed.classification ? `<div><dt>Classificação</dt><dd>${escapeHtml(entry.observed.classification)}</dd></div>` : ''}
      ${entry.observed.limiter ? `<div><dt>Principal limitador</dt><dd>${escapeHtml(entry.observed.limiter)}</dd></div>` : ''}
      ${entry.observed.highlights?.length ? `<div><dt>Destaques</dt><dd>${entry.observed.highlights.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join(' ')}</dd></div>` : ''}
    </dl>
    ${entry.observed.reading ? `<p class="executive-reading">${escapeHtml(entry.observed.reading)}</p>` : ''}
  ` : '';
  const unused = entry.unusedInvites?.length ? `
    <h3>Convites para percorrer ou completar à mão</h3>
    <ol>${entry.unusedInvites.map((invite) => `<li><p>${escapeHtml(invite.label)}</p><p><a href="${escapeHtml(invite.url)}"><code>${escapeHtml(invite.url)}</code></a></p></li>`).join('')}</ol>
  ` : '';
  return `
    <article class="card" id="${escapeHtml(entry.id)}">
      <p class="eyebrow">Caso de inspeção</p>
      <h2>${escapeHtml(entry.title)}</h2>
      <p>${escapeHtml(entry.story)}</p>
      <h3>O que procurar</h3>
      <ul>${lookFor}</ul>
      <p><a class="button" href="${escapeHtml(entry.adminUrl)}">Abrir relatório administrativo</a>
      ${entry.publicUrl ? `<a class="button secondary" href="${escapeHtml(entry.publicUrl)}">Página pública do projeto</a>` : ''}</p>
      ${observed}
      ${unused}
    </article>
  `;
}
