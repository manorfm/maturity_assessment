import { escapeHtml, layout } from '../../src/shared/html.js';
import { COGNITIVE_VALIDATION_PROTOCOL } from '../../src/modules/inference/domain/showcase-validation.js';

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
  const index = cases.map((entry) => `<li><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.title)}</a></li>`).join('');
  const articles = cases.map((entry) => renderCase(entry)).join('');
  return layout('Índice de inspeção', `
    <header>
      <p class="eyebrow">Showcase sintético</p>
      <h1>Índice de inspeção</h1>
      <p class="lead">Três relatórios organizacionais sintéticos — comportamento frágil, prática intermediária e prática sustentada — para inspecionar textos e decisões antes de uma POC real. Eles não substituem calibração empírica; o posterior permanece provisório.</p>
    </header>
    <div class="notice">
      <p>Cada caso usa 18 pessoas em duas unidades com trilhas complementares. A visão global é o cartão da organização; o detalhe de cada pilar e de cada unidade traz ações de área ou de diretoria. A página pública do projeto não revela respostas.</p>
    </div>
    ${renderPocCoverage(cases.length)}
    ${index ? `<section class="card"><h2>Relatórios gerados</h2><ol>${index}</ol></section>` : '<p class="muted">Nenhum relatório organizacional foi gerado nesta execução.</p>'}
    ${articles}
  `);
}

function renderCase(entry: ShowcaseGuideCase): string {
  const lookFor = entry.lookFor.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const observed = entry.observed ? `
    <h3>Resultado produzido</h3>
    <dl class="executive-facts">
      ${entry.observed.decision ? `<div><dt>Decisão apresentada</dt><dd>${escapeHtml(entry.observed.decision)}</dd></div>` : ''}
      ${entry.observed.classification ? `<div><dt>Consistência do elo</dt><dd>${escapeHtml(entry.observed.classification)}</dd></div>` : ''}
      ${entry.observed.limiter ? `<div><dt>Onde aparece</dt><dd>${escapeHtml(entry.observed.limiter)}</dd></div>` : ''}
    </dl>
    ${entry.observed.reading ? `<p class="executive-reading">${escapeHtml(entry.observed.reading)}</p>` : ''}
  ` : '';
  return `
    <article class="card" id="${escapeHtml(entry.id)}">
      <p class="eyebrow">Caso de inspeção</p>
      <h2>${escapeHtml(entry.title)}</h2>
      <h3>Cenário simulado</h3><p>${escapeHtml(entry.story)}</p>
      <p><strong>Comportamento esperado do diagnóstico:</strong> ${escapeHtml(entry.expectedOutcome)}</p>
      <h3>O que procurar</h3>
      <ul>${lookFor}</ul>
      <p><a class="button" href="${escapeHtml(entry.adminUrl)}">Abrir relatório administrativo</a>
      ${entry.publicUrl ? `<a class="button secondary" href="${escapeHtml(entry.publicUrl)}">Página pública do projeto</a>` : ''}</p>
      ${observed}
    </article>
  `;
}

function renderPocCoverage(generated: number): string {
  const complete = generated >= POC_SHOWCASE_BANDS;
  const state = complete
    ? `${POC_SHOWCASE_BANDS} de ${POC_SHOWCASE_BANDS} relatórios organizacionais da POC com coerência sintética.`
    : `${POC_SHOWCASE_BANDS - generated} relatórios organizacionais da POC ainda ausentes.`;
  return `<section class="card"><p class="eyebrow">Pronto para a POC</p><h2>Três organizações sintéticas</h2><p><strong>${escapeHtml(state)}</strong></p><p>Baixa, média e alta descrevem comportamento observado — não um ranking de maturidade. Expandir o radar não aumenta precisão: cada relatório precisa de padrões independentes, trilhas complementares e um limitador sem contradição.</p><p class="notice"><strong>Validação humana pendente.</strong> O showcase não substitui entrevistas reais por perspectiva. O gate exige ${COGNITIVE_VALIDATION_PROTOCOL.minimumInterviewsPerPerspective} entrevistas por perspectiva; entrevistas reais por perspectiva ainda não foram satisfeitas.</p></section>`;
}
