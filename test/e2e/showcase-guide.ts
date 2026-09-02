import { escapeHtml, layout } from '../../src/shared/html.js';
import {
  COGNITIVE_VALIDATION_PROTOCOL,
  WAVE_SIX_SHOWCASE_CASES,
  evaluateShowcaseCoverage,
  type WaveSixShowcaseCaseId,
} from '../../src/modules/inference/domain/showcase-validation.js';

export const SHOWCASE_GUIDE_PATH = process.env.E2E_SHOWCASE_GUIDE
  ?? process.env.SHOWCASE_GUIDE
  ?? '/private/tmp/maturity-assessment-showcase-pilot-v1.html';

export type ShowcaseGuideCase = {
  id: string;
  scenarioIds: WaveSixShowcaseCaseId[];
  title: string;
  story: string;
  expectedOutcome: string;
  lookFor: string[];
  adminUrl: string;
  publicUrl?: string;
  observed?: {
    classification?: string;
    reading?: string;
    limiter?: string;
    highlights?: string[];
  };
  contrasts?: Array<{ scope: string; mechanism: string; containment: string; authority: string; nextTest: string }>;
  unusedInvites?: Array<{ label: string; url: string }>;
};

export function buildShowcaseGuide(cases: ShowcaseGuideCase[]): string {
  const coverage = evaluateShowcaseCoverage(cases.flatMap((entry) => entry.scenarioIds));
  const index = cases.map((entry) => `<li><a href="#${escapeHtml(entry.id)}">${escapeHtml(entry.title)}</a></li>`).join('');
  const articles = cases.map((entry) => renderCase(entry)).join('');
  return layout('Índice de inspeção', `
    <header>
      <p class="eyebrow">Showcase sintético</p>
      <h1>Índice de inspeção</h1>
      <p class="lead">Casos sintéticos para inspecionar textos, diagnósticos, recomendações e proteções de agregação. Eles não substituem calibração empírica; o posterior permanece provisório.</p>
    </header>
    <div class="notice">
      <p>Abra cada relatório administrativo, compare o cartão de diagnóstico com o mapa de contraste e use os convites não consumidos para percorrer a entrevista à mão. A página pública do projeto não revela respostas.</p>
    </div>
    ${renderWaveSixCoverage(coverage.coveredCaseIds, coverage.missingCaseIds)}
    ${index ? `<section class="card"><h2>Casos gerados</h2><ol>${index}</ol></section>` : '<p class="muted">Nenhum caso foi gerado nesta execução.</p>'}
    ${articles}
  `);
}

function renderCase(entry: ShowcaseGuideCase): string {
  const scenarioLabels = entry.scenarioIds.map((id) => WAVE_SIX_SHOWCASE_CASES.find((item) => item.id === id)?.title).filter(Boolean);
  const lookFor = entry.lookFor.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const observed = entry.observed ? `
    <h3>Resultado produzido</h3>
    <dl class="executive-facts">
      ${entry.observed.classification ? `<div><dt>Consistência do elo</dt><dd>${escapeHtml(entry.observed.classification)}</dd></div>` : ''}
      ${entry.observed.limiter ? `<div><dt>Onde aparece</dt><dd>${escapeHtml(entry.observed.limiter)}</dd></div>` : ''}
      ${entry.observed.highlights?.length ? `<div><dt>Destaques</dt><dd>${entry.observed.highlights.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join(' ')}</dd></div>` : ''}
    </dl>
    ${entry.observed.reading ? `<p class="executive-reading">${escapeHtml(entry.observed.reading)}</p>` : ''}
  ` : '';
  const contrasts = entry.contrasts?.length ? `
    <h3>Comparação produzida</h3>
    <div class="comparison-table" role="region" aria-label="Comparação entre mecanismos" tabindex="0"><table><thead><tr><th>Recorte</th><th>Mecanismo</th><th>Onde mudar</th><th>Quem decide</th><th>Menor teste</th></tr></thead><tbody>${entry.contrasts.map((item) => `<tr><th scope="row">${escapeHtml(item.scope)}</th><td>${escapeHtml(item.mechanism)}</td><td>${escapeHtml(item.containment)}</td><td>${escapeHtml(item.authority)}</td><td>${escapeHtml(item.nextTest)}</td></tr>`).join('')}</tbody></table></div>
  ` : '';
  const unused = entry.unusedInvites?.length ? `
    <h3>Convites para percorrer ou completar à mão</h3>
    <ol>${entry.unusedInvites.map((invite) => `<li><p>${escapeHtml(invite.label)}</p><p><a href="${escapeHtml(invite.url)}"><code>${escapeHtml(invite.url)}</code></a></p></li>`).join('')}</ol>
  ` : '';
  return `
    <article class="card" id="${escapeHtml(entry.id)}">
      <p class="eyebrow">Caso de inspeção</p>
      <h2>${escapeHtml(entry.title)}</h2>
      <h3>Cenário simulado</h3><p>${escapeHtml(entry.story)}</p>
      <p><strong>Comportamento esperado do diagnóstico:</strong> ${escapeHtml(entry.expectedOutcome)}</p>
      <p>${scenarioLabels.map((label) => `<span class="tag">${escapeHtml(label!)}</span>`).join(' ')}</p>
      <h3>O que procurar</h3>
      <ul>${lookFor}</ul>
      <p><a class="button" href="${escapeHtml(entry.adminUrl)}">Abrir relatório administrativo</a>
      ${entry.publicUrl ? `<a class="button secondary" href="${escapeHtml(entry.publicUrl)}">Página pública do projeto</a>` : ''}</p>
      ${observed}
      ${contrasts}
      ${unused}
    </article>
  `;
}

function renderWaveSixCoverage(covered: WaveSixShowcaseCaseId[], missing: WaveSixShowcaseCaseId[]): string {
  const state = missing.length
    ? `${missing.length} contrastes ainda sem cobertura sintética.`
    : `${covered.length} de ${WAVE_SIX_SHOWCASE_CASES.length} contratos com coerência sintética exercitada.`;
  const rows = WAVE_SIX_SHOWCASE_CASES.map((scenario) => `<li><strong>${escapeHtml(scenario.title)}</strong> — ${covered.includes(scenario.id) ? 'exercitado com massa sintética' : 'pendente'}. ${escapeHtml(scenario.expectedDistinction)} <span class="muted">Não inferir: ${escapeHtml(scenario.nonInference)}</span></li>`).join('');
  return `<section class="card"><p class="eyebrow">Cobertura da onda 6</p><h2>Matriz de contrastes</h2><p><strong>${escapeHtml(state)}</strong></p><ol>${rows}</ol><p class="notice"><strong>Validação humana pendente.</strong> O showcase não substitui entrevistas reais por perspectiva. O gate exige ${COGNITIVE_VALIDATION_PROTOCOL.minimumInterviewsPerPerspective} entrevistas por perspectiva; entrevistas reais por perspectiva ainda não foram satisfeitas.</p></section>`;
}
