import { escapeHtml } from '../../shared/html.js';
import { projectBatchReading, type BatchLotStatus } from './domain/admin-board.js';

const BRAND = 'Anamnese de Tecnologia';
const TOKEN_STYLE = '--bg:#F6F2EA;--surface:#FFFDF8;--sunk:#EFE9DE;--ink:#1E1C19;--ink2:#46413A;--ink3:#625B51;--rule:#DCD4C6;--accent:#0D5C63;--accent-ink:#0A4B51;--accent-soft:#DCEAE8;--on-accent:#FFFFFF;--red:#A2372A;--red-soft:#F6E3DE;--ochre:#94560F;--ochre-soft:#F5E6D0;--na:#B9B2A7;--na-ink:#5E584E;--focus:#0D5C63';

export type AdminStep = 'project' | 'structure' | 'invites' | 'terms';

const STEPS: Array<{ id: AdminStep; number: string; label: string }> = [
  { id: 'project', number: '1', label: 'Projeto' },
  { id: 'structure', number: '2', label: 'Estrutura' },
  { id: 'invites', number: '3', label: 'Convites e participação' },
  { id: 'terms', number: '4', label: 'Termo de uso' },
];

export function renderAdminShell(input: {
  title: string;
  lead?: string;
  step?: AdminStep;
  projectName?: string;
  status?: string;
  body: string;
  stepHrefs?: Partial<Record<AdminStep, string>>;
  showSteps?: boolean;
  /** When true, omit the top brand bar — used under the report chrome on manage. */
  embedded?: boolean;
}): string {
  const status = input.status
    ? `<span class="admin-status">${escapeHtml(input.status)}</span>`
    : '';
  const projectLabel = input.projectName
    ? `<span>${escapeHtml(input.projectName)}</span>${status}`
    : status || '<span>Administração do diagnóstico</span>';
  const heading = input.lead
    ? `<div class="admin-heading"><h2>${escapeHtml(input.title)}</h2><p>${escapeHtml(input.lead)}</p></div>`
    : `<div class="admin-heading"><h2>${escapeHtml(input.title)}</h2></div>`;
  const nav = input.showSteps === false || !input.step
    ? ''
    : `<nav aria-label="Etapas do projeto" class="admin-steps">${STEPS.map((step) => {
      const current = step.id === input.step;
      const href = input.stepHrefs?.[step.id];
      const attrs = current ? ' aria-current="step"' : '';
      const className = current ? 'admin-step current' : 'admin-step';
      const mark = `<span class="admin-step-mark">${escapeHtml(step.number)}</span>${escapeHtml(step.label)}`;
      return href
        ? `<a class="${className}" href="${escapeHtml(href)}"${attrs}>${mark}</a>`
        : `<span class="${className}"${attrs}>${mark}</span>`;
    }).join('')}</nav>`;
  const top = input.embedded
    ? ''
    : `<header class="admin-top">
    <div class="admin-brand"><strong style="font-family:Newsreader,Georgia,serif">${escapeHtml(BRAND)}</strong><span>Administração</span></div>
    <div class="admin-top-meta">${projectLabel}</div>
  </header>`;
  const rootClass = input.embedded ? 'admin admin--embedded' : 'admin';
  return `<div class="${rootClass}" data-theme="claro" style="${TOKEN_STYLE};font-family:'IBM Plex Sans',sans-serif">
  ${top}
  <div class="admin-body">
    ${nav}
    <div class="admin-main">${heading}${input.body}</div>
  </div>
</div>`;
}

export function renderAdminMetric(label: string, value: string | number, hint: string): string {
  return `<div class="admin-metric"><div class="admin-metric-label">${escapeHtml(label)}</div><div class="admin-metric-value">${escapeHtml(value)}</div><div class="admin-metric-hint">${escapeHtml(hint)}</div></div>`;
}

export function renderAdminAside(title: string, paragraphs: string[]): string {
  return `<aside class="admin-aside"><div class="admin-aside-title">${escapeHtml(title)}</div>${paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join('')}</aside>`;
}

export function renderTermsPanel(orgName: string): string {
  const items = [
    ['1', 'Sem uso individual', 'Os resultados descrevem o sistema de trabalho. Não serão usados para avaliar, promover, desligar ou comparar pessoas.'],
    ['2', 'Sem bônus', 'Nenhum índice deste diagnóstico será meta de remuneração variável, bônus ou objetivo individual.'],
    ['3', 'Mínimo de 5 pessoas', 'Recortes com menos de 5 pessoas não são exibidos e aparecem agregados ao nível acima. Não há acesso a respostas individuais.'],
    ['4', 'Sem ranking', 'O relatório não ordena times ou pessoas por resultado.'],
    ['5', 'Divulgação aos respondentes', 'Um resumo dos achados deve ser apresentado a quem participou após a entrega do laudo.'],
  ];
  return `<div class="admin-terms" id="termo">
    <div class="admin-terms-title">Pacto de uso entre ${escapeHtml(orgName)} e a Anamnese de Tecnologia</div>
    <ol>${items.map(([n, title, body]) => `<li><span>${escapeHtml(n)}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div></li>`).join('')}</ol>
    <p>O aceite formal ainda não é gravado. Esta tela informa o pacto e não trava os convites.</p>
  </div>`;
}

export function renderStructureBoard(input: {
  units: Array<{ name: string; path: string; depth: number; canAdd: boolean; canRemove: boolean }>;
  actionBase: string;
}): string {
  const cards = input.units.map((unit) => {
    const add = unit.canAdd
      ? `<form method="post" action="${escapeHtml(input.actionBase)}/units"><input type="hidden" name="parentPath" value="${escapeHtml(unit.path)}"><label>Nome da unidade<input name="name" required maxlength="80" placeholder="Nome usado no dia a dia"></label><button class="button secondary compact" type="submit">Adicionar unidade abaixo</button></form>`
      : '<p>Convites já nasceram aqui. A unidade permanece final.</p>';
    const remove = unit.canRemove
      ? `<form method="post" action="${escapeHtml(input.actionBase)}/units/remove"><input type="hidden" name="path" value="${escapeHtml(unit.path)}"><button class="button danger compact" type="submit">Remover</button></form>`
      : '';
    return `<article class="hierarchy-row" style="--level:${unit.depth}"><h3>${escapeHtml(unit.name)}</h3><p>${escapeHtml(unit.path)}</p>${add}${remove}</article>`;
  }).join('');
  return `<section id="estrutura"><h2>Estrutura</h2><p>Monte a árvore com os nomes usados no dia a dia. Convites só nascem nas unidades finais. Recorte com menos de 5 pessoas aparece agregado ao nível acima.</p>${cards}</section>`;
}

export function renderInvitationBatch(input: {
  id: string;
  unitPath: string;
  quantity: number;
  status: BatchLotStatus;
  claimed: number;
  completed: number;
  minimum: number;
  actionBase: string;
}): string {
  const reading = projectBatchReading({
    status: input.status,
    quantity: input.quantity,
    claimed: input.claimed,
    completed: input.completed,
    minimum: input.minimum,
  });
  const revoke = input.status === 'issued' || input.status === 'partially_used'
    ? `<form method="post" action="${escapeHtml(input.actionBase)}/invitation-batches/${escapeHtml(input.id)}/revoke"><button type="submit">Revogar links disponíveis</button></form>`
    : '';
  const reissue = input.status === 'revoked' || input.status === 'expired' || input.status === 'partially_used'
    ? `<form method="post" action="${escapeHtml(input.actionBase)}/invitation-batches/${escapeHtml(input.id)}/reissue"><button class="button secondary" type="submit">Reemitir indisponíveis</button></form>`
    : '';
  const remind = input.status === 'revoked' || input.status === 'expired'
    ? ''
    : `<details><summary>Lembrar lote</summary><p>${escapeHtml(reading.remind)}</p></details>`;
  return `<article class="admin-batch"><span class="tag">${escapeHtml(reading.statusLabel)}</span><h3>${escapeHtml(input.unitPath)}</h3><p>${escapeHtml(reading.sample)}</p><p class="muted">${input.quantity} convites no lote · perfil escolhido por cada participante</p>${revoke}${reissue}${remind}</article>`;
}
