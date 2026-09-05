import { escapeHtml, layout } from '../../src/shared/html.js';

export const SHOWCASE_GUIDE_PATH = process.env.E2E_SHOWCASE_GUIDE
  ?? process.env.SHOWCASE_GUIDE
  ?? '/private/tmp/maturity-assessment-showcase-pilot-v1.html';

export const POC_SHOWCASE_BANDS = 3;

export type ShowcaseGuideCase = {
  id: string;
  scenarioIds?: string[];
  title: string;
  story: string;
  expectedOutcome: string;
  lookFor: string[];
  adminUrl: string;
  publicUrl?: string;
  observed?: {
    decision?: string;
    classification?: string;
    reading?: string;
    limiter?: string;
  };
};

export function buildShowcaseGuide(cases: ShowcaseGuideCase[]): string {
  const complete = cases.length >= POC_SHOWCASE_BANDS;
  const cards = cases.map((entry) => renderCase(entry)).join('');
  const notes = cases.map((entry) => renderInspectionNote(entry)).join('');
  return layout('Diagnóstico de engenharia', `
    <header class="showcase-deck">
      <p class="eyebrow">Demonstração do produto</p>
      <h1>Diagnóstico de engenharia</h1>
      <p class="lead">O mesmo caminho de uma POC: criar o projeto, gerar convites anônimos, responder entrevistas por eventos do trabalho e ler um relatório que fecha uma decisão. Estas três organizações já passaram por esse percurso com entrevistas simuladas no motor.</p>
    </header>
    <section class="card">
      <h2>Como o sistema funciona</h2>
      <ol>
        <li>Cria-se um projeto com duas unidades finais.</li>
        <li>Cada unidade recebe convites anônimos. A pessoa informa sua perspectiva ao abrir o link.</li>
        <li>A entrevista percorre eventos recentes — urgência, entrega, risco, dependência — não um checklist de ferramenta.</li>
        <li>Com 18 respostas em duas unidades o relatório pede corrigir, evoluir ou preservar, com teste e quem autoriza.</li>
      </ol>
    </section>
    <section>
      <h2>Casos concluídos</h2>
      <p>${complete ? '<strong>3 de 3 casos concluídos.</strong> Cada um fecha uma decisão distinta no mesmo produto.' : '<strong>A demonstração ainda não gerou os três relatórios.</strong> Rode o showcase para criar projeto, preencher as entrevistas e publicar os casos.'}</p>
      ${cards || '<p class="muted">Nenhum relatório foi gerado nesta execução.</p>'}
    </section>
    <section class="card">
      <h2>Uma POC com pessoas reais</h2>
      <p>O produto é este. A POC repete o mesmo percurso com os eventos de vocês: <strong>18 pessoas em duas unidades</strong>, no mínimo 5 em cada, com trilhas complementares (entrega, operação, risco, plataforma, arquitetura, produto, portfólio e dados).</p>
      <p>A massa desta página simula as entrevistas no mesmo motor. Não é calibração empírica e não substitui as pessoas do recorte.</p>
    </section>
    <details class="methodology">
      <summary>Notas de inspeção</summary>
      <p class="muted">Uso interno: conferir coerência dos textos e do mapa. Não é o roteiro da apresentação.</p>
      ${notes}
    </details>
  `);
}

function renderCase(entry: ShowcaseGuideCase): string {
  const decision = entry.observed?.decision ?? 'Relatório gerado';
  const reading = entry.observed?.reading ?? entry.story;
  const limiter = entry.observed?.limiter ? `<p class="muted">Onde aparece: ${escapeHtml(entry.observed.limiter)}</p>` : '';
  return `
    <article class="card" id="${escapeHtml(entry.id)}">
      <p class="tag">${escapeHtml(decision)}</p>
      <h3>${escapeHtml(entry.title)}</h3>
      <p class="executive-reading">${escapeHtml(reading)}</p>
      <p>${escapeHtml(entry.story)}</p>
      ${limiter}
      <p><a class="button" href="${escapeHtml(entry.adminUrl)}">Abrir relatório</a></p>
    </article>
  `;
}

function renderInspectionNote(entry: ShowcaseGuideCase): string {
  const lookFor = entry.lookFor.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `
    <article>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.expectedOutcome)}</p>
      ${lookFor ? `<ul>${lookFor}</ul>` : ''}
    </article>
  `;
}
