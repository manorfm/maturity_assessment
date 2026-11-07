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

export type ReadingFigure = {
  ariaLabel: string;
  stages: readonly string[];
  values: Readonly<Record<string, readonly number[]>>;
};

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
  kind?: string;
  readingFigure?: ReadingFigure;
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
  const stimulusFigure = input.kind === 'reading' && input.readingFigure
    ? renderReadingStimulusFigure(input.readingFigure)
    : '';
  const body = `<div class="interview-copy">
    <p class="interview-kicker">${escapeHtml(input.kicker)}</p>
    <h1>${escapeHtml(input.title)}</h1>
    <p class="interview-lead">${escapeHtml(input.lead)}</p>
    <p class="interview-why">${escapeHtml(input.why)}</p>
    ${stimulusFigure}
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

const READING_BAND_FILLS = ['var(--accent)', 'var(--ochre)', 'var(--ink3)', 'var(--na)'] as const;
const READING_BAND_CLASSES = [
  'reading-stimulus-band reading-stimulus-band-accent',
  'reading-stimulus-band reading-stimulus-band-ochre',
  'reading-stimulus-band reading-stimulus-band-ink3',
  'reading-stimulus-band reading-stimulus-band-na',
] as const;

/** Área empilhada só com índices de semana e valores publicados — sem pontos do protótipo. */
function renderReadingStimulusFigure(figure: ReadingFigure): string {
  const weekCount = figure.stages.reduce((max, stage) => Math.max(max, figure.values[stage]?.length ?? 0), 0);
  const stackBottomFirst = [...figure.stages].reverse();
  const weekTotals = Array.from({ length: weekCount }, (_, week) =>
    stackBottomFirst.reduce((sum, stage) => sum + Number(figure.values[stage]?.[week] ?? 0), 0));
  const peak = Math.max(0, ...weekTotals);
  const height = peak > 0 ? peak : weekCount;
  const bands = stackBottomFirst.map((stage, bandIndex) => {
    const fill = READING_BAND_FILLS[Math.min(bandIndex, READING_BAND_FILLS.length - 1)]!;
    const bandClass = READING_BAND_CLASSES[Math.min(bandIndex, READING_BAND_CLASSES.length - 1)]!;
    const upper: string[] = [];
    const lower: string[] = [];
    for (let week = 0; week < weekCount; week += 1) {
      const below = stackBottomFirst
        .slice(0, bandIndex)
        .reduce((sum, name) => sum + Number(figure.values[name]?.[week] ?? 0), 0);
      const value = Number(figure.values[stage]?.[week] ?? 0);
      const x = week + 1;
      upper.push(`${x},${below + value}`);
      lower.push(`${x},${below}`);
    }
    const points = [...upper, ...lower.reverse()].join(' ');
    return `<polygon class="${bandClass}" fill="${fill}" points="${escapeHtml(points)}"></polygon>`;
  }).join('');
  const axis = weekCount > 0
    ? `<line class="reading-stimulus-axis" x1="1" y1="${height}" x2="${weekCount}" y2="${height}"></line>`
    : '';
  const legend = figure.stages.map((stage, index) => {
    const fromTop = figure.stages.length - 1 - index;
    const swatchClass = ['reading-stimulus-swatch-accent', 'reading-stimulus-swatch-ochre', 'reading-stimulus-swatch-ink3', 'reading-stimulus-swatch-na'][
      Math.min(fromTop, 3)
    ];
    return `<li><span class="reading-stimulus-swatch ${swatchClass}" aria-hidden="true"></span>${escapeHtml(stage)}</li>`;
  }).join('');
  const caption = weekCount > 0
    ? `Itens de trabalho acumulados por estado, ${weekCount} semanas`
    : 'Itens de trabalho acumulados por estado';
  return `<figure class="reading-stimulus">
    <figcaption>${escapeHtml(caption)}</figcaption>
    <svg viewBox="0 0 ${weekCount} ${height}" role="img" aria-label="${escapeHtml(figure.ariaLabel)}"><g transform="translate(0 ${height}) scale(1 -1)">${bands}</g>${axis}</svg>
    <ul class="reading-stimulus-legend" aria-hidden="true">${legend}</ul>
  </figure>`;
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
