import { escapeHtml } from '../../shared/html.js';
import type { ObservationKind } from '../catalog/assessment-graph.js';

const BRAND = 'Anamnese de Tecnologia';
const TOKEN_STYLE = '--bg:#F6F2EA;--surface:#FFFDF8;--sunk:#EFE9DE;--ink:#1E1C19;--ink2:#46413A;--ink3:#625B51;--rule:#DCD4C6;--accent:#0D5C63;--accent-ink:#0A4B51;--accent-soft:#DCEAE8;--on-accent:#FFFFFF;--red:#A2372A;--red-soft:#F6E3DE;--ochre:#94560F;--ochre-soft:#F5E6D0;--na:#B9B2A7;--na-ink:#5E584E;--focus:#0D5C63';

export type InterviewOption = {
  id: string;
  label: string;
  observation?: ObservationKind;
};

export function renderInterviewShell(input: {
  title: string;
  body: string;
  progressLabel?: string;
  progressPercent?: number;
}): string {
  const percent = clampPercent(input.progressPercent);
  const progress = input.progressLabel !== undefined
    ? `<div class="interview-progress-meta"><span class="interview-brand" style="font-family:Newsreader,Georgia,serif">${escapeHtml(BRAND)}</span><span>${escapeHtml(input.progressLabel)}</span></div>
      <div class="interview-progress" role="progressbar" aria-label="Progresso" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><div style="width:${percent}%"></div></div>`
    : `<div class="interview-progress-meta"><span class="interview-brand" style="font-family:Newsreader,Georgia,serif">${escapeHtml(BRAND)}</span><span></span></div>`;
  return `<div class="interview" data-theme="claro" style="${TOKEN_STYLE};font-family:'IBM Plex Sans',sans-serif">
  <header class="interview-header">${progress}</header>
  <div class="interview-main">${input.body}</div>
</div>`;
}

export function renderInterviewWelcome(welcome: {
  title: string;
  purpose: string;
  cases: string;
  anonymity: string;
  pause: string;
  duration: string;
  start: string;
  action: string;
}): string {
  const body = `<div class="interview-copy">
    <h1>${escapeHtml(welcome.title)}</h1>
    <p class="interview-lead">${escapeHtml(welcome.cases)}</p>
    <p class="interview-lead">${escapeHtml(welcome.purpose)}</p>
  </div>
  <div class="interview-panel">
    <p class="interview-notice">${escapeHtml(welcome.anonymity)}</p>
    <p class="interview-lead">${escapeHtml(welcome.pause)}</p>
    <form method="post" action="${escapeHtml(welcome.action)}">
      <div class="interview-actions"><button type="submit">${escapeHtml(welcome.start)}</button></div>
    </form>
  </div>`;
  return renderInterviewShell({ title: welcome.title, body, progressLabel: welcome.duration, progressPercent: 0 });
}

export function renderInterviewQuestion(input: {
  brand?: string;
  kicker: string;
  title: string;
  lead: string;
  why: string;
  prompt: string;
  progressLabel: string;
  progressPercent: number;
  action: string;
  options: InterviewOption[];
  nodeId?: string;
  freeText?: { maxChars: number; submitOptionId: string };
}): string {
  const practice = input.options.filter((option) => (option.observation ?? 'practice') === 'practice');
  const observational = input.options.filter((option) => (option.observation ?? 'practice') !== 'practice');
  const freeTextBlock = input.freeText
    ? `<label class="interview-free-text">
        <span class="visually-hidden">Resposta escrita</span>
        <textarea name="freeText" maxlength="${input.freeText.maxChars}" rows="4" placeholder="Uma frase, sem nomes de pessoas ou clientes."></textarea>
        <span class="interview-hint">Até ${input.freeText.maxChars} caracteres</span>
        <input type="hidden" name="optionId" value="${escapeHtml(input.freeText.submitOptionId)}" />
      </label>`
    : '';
  const practiceChoices = input.freeText ? '' : practice.map(renderChoice).join('');
  const observationalBlock = observational.length
    ? `<div class="interview-or" aria-hidden="true"><span></span><span>ou</span><span></span></div>
      <div class="interview-choices interview-choices-secondary">${observational.map(renderChoice).join('')}</div>`
    : '';
  const body = `<div class="interview-copy">
    <p class="interview-kicker">${escapeHtml(input.kicker)}</p>
    <h1>${escapeHtml(input.title)}</h1>
    <p class="interview-lead">${escapeHtml(input.lead)}</p>
    <p class="interview-why">${escapeHtml(input.why)}</p>
  </div>
  <div class="interview-panel">
    <form class="interview-form" method="post" action="${escapeHtml(input.action)}"${input.nodeId ? ` data-assessment-node="${escapeHtml(input.nodeId)}"` : ''}>
      <fieldset>
        <legend>${escapeHtml(input.prompt)}</legend>
        ${freeTextBlock}
        <div class="interview-choices">${practiceChoices}</div>
        ${observationalBlock}
      </fieldset>
      <div class="interview-actions">
        <button type="submit">Continuar</button>
      </div>
    </form>
    <p class="interview-notice">Guarde este endereço para retomar se precisar pausar. O convite original não reabre a entrevista.</p>
    <p class="interview-hint">Responda pelo que normalmente acontece, não pelo processo ideal. Não existe alternativa ligada a uma ferramenta específica. No fim podem aparecer até cinco perguntas extras para esclarecer uma causa.</p>
  </div>`;
  return renderInterviewShell({
    title: input.title,
    body,
    progressLabel: input.progressLabel,
    progressPercent: input.progressPercent,
  });
}

export function renderInterviewComplete(): string {
  const body = `<div class="interview-copy interview-complete">
    <h1>Obrigado.</h1>
    <p class="interview-lead">Suas respostas foram registradas de forma anônima.</p>
    <p class="interview-lead">Elas vão se somar às de outras pessoas e só entram em resultados com 5 ou mais participantes.</p>
    <p class="interview-lead">Por segurança, elas e o percurso não são exibidos novamente. O percurso não reabre.</p>
    <p class="interview-hint">Você já pode fechar esta página.</p>
  </div>`;
  return renderInterviewShell({ title: 'Obrigado', body, progressLabel: 'concluído', progressPercent: 100 });
}

export function renderInterviewStatus(input: {
  kicker: string;
  title: string;
  lead: string;
}): string {
  const body = `<div class="interview-copy">
    <p class="interview-kicker">${escapeHtml(input.kicker)}</p>
    <h1>${escapeHtml(input.title)}</h1>
    <p class="interview-lead">${escapeHtml(input.lead)}</p>
  </div>`;
  return renderInterviewShell({ title: input.title, body });
}

export function interviewProgressPercent(remainingMinutes: number, budgetMinutes: number): number {
  if (budgetMinutes <= 0) return 0;
  return clampPercent(Math.round(((budgetMinutes - remainingMinutes) / budgetMinutes) * 100));
}

function renderChoice(option: InterviewOption): string {
  return `<label class="interview-choice">
    <input type="radio" name="optionId" value="${escapeHtml(option.id)}" required>
    <span class="interview-choice-dot" aria-hidden="true"><span></span></span>
    <span>${escapeHtml(option.label)}</span>
  </label>`;
}

function clampPercent(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
