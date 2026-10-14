import { escapeHtml } from '../../shared/html.js';
import { CapabilityTaxonomy } from '../inference/domain/capability-taxonomy.js';
import { uniqueFindingsByPattern, type OutcomeFinding } from '../inference/domain/report-outcome.js';
import type { DiagnosticLaudo, AudienceReading } from '../inference/domain/diagnostic-report.js';
import type { TreatmentConduct } from '../inference/domain/treatment-contract.js';
import { cynefinLine, evidenceGradeReading, learningModeReading } from '../inference/domain/treatment-contract.js';
import type { PulseCatalogItem } from '../catalog/item-catalog.js';
import type { FichaClose, FichaLine, HowItIs, NodeDefinition, PreservePublication, ReportedReadings } from '../inference/domain/ficha-node.js';
import { mapCopy, type MapLegend, type PerspectiveMatrix, type StructureMatrix } from '../inference/domain/map-matrix.js';
import { projectSystemTiles, type FichaCrumb, type OrganizationalAreaMap, type OrganizationalAreaNode } from '../inference/domain/organizational-areas.js';
import { bottleneckStatus, type ReadinessAssessment } from '../inference/domain/advanced-readiness.js';
import type { FrontierBrief } from '../inference/domain/learning-frontier.js';
import type { AreaWalkthrough } from '../inference/domain/area-walkthrough.js';
import type { EvolutionReport } from '../inference/domain/evolution-report.js';

export type ReportPageId = 'laudo' | 'map' | 'node' | 'readiness' | 'frontier' | 'treatment' | 'walkthrough' | 'history' | 'audiences';

export type ReportFicha = { label: string; href: string };

const NAV: Array<{ id: ReportPageId; label: string; href: (base: string) => string }> = [
  { id: 'laudo', label: 'Laudo', href: (base) => base.replace(/\/report$/, '') || base },
  { id: 'map', label: 'Mapa', href: (base) => `${base}/map` },
  { id: 'readiness', label: 'Prontidão para práticas avançadas', href: (base) => `${base}/readiness` },
  { id: 'frontier', label: 'Fronteira de aprendizado', href: (base) => `${base}/frontier` },
  { id: 'treatment', label: 'Plano de tratamento', href: (base) => `${base}/treatment` },
  { id: 'walkthrough', label: 'Área: Operação', href: (base) => `${base}/walkthrough/operations` },
  { id: 'history', label: 'Histórico e reavaliação', href: (base) => `${base}/history` },
  { id: 'audiences', label: 'Visão por público', href: (base) => `${base}/audiences` },
];

export function reportMenuFicha(findings: OutcomeFinding[], capabilityBase: string): ReportFicha | undefined {
  const published = uniqueFindingsByPattern(findings).find((finding) => finding.confidence >= 0.5 && finding.detailCapability);
  if (!published) return undefined;
  return {
    label: CapabilityTaxonomy.labelFor(published.detailCapability),
    href: `${capabilityBase}/${published.detailCapability}`,
  };
}

function renderNavLink(label: string, href: string, current: boolean): string {
  const currentAttr = current ? ' aria-current="page"' : '';
  return `<a${currentAttr} href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

export function renderReportShell(input: {
  page: ReportPageId;
  base: string;
  projectName: string;
  body: string;
  ficha?: ReportFicha;
  areaId?: string;
}): string {
  const links = NAV.flatMap((item) => {
    const ficha = item.id === 'readiness' && input.ficha
      ? [renderNavLink(`Ficha: ${input.ficha.label}`, input.ficha.href, input.page === 'node')]
      : [];
    const current = item.id === input.page && (item.id !== 'walkthrough' || !input.areaId || input.areaId === 'operations');
    return [...ficha, renderNavLink(item.label, item.href(input.base), current)];
  }).join('');
  return `<div class="diagnostic-report" data-theme="claro">
    <aside class="report-sidebar">
      <div class="report-brand"><strong>Anamnese de Tecnologia</strong><span>${escapeHtml(input.projectName)}</span></div>
      <nav aria-label="Relatório">${links}</nav>
      <p class="report-sidebar-note">Instrumento vigente<br>Estimativas provisórias</p>
      <button type="button" class="report-theme" data-report-theme>Tema escuro</button>
    </aside>
    <div class="report-main">${input.body}</div>
  </div>
  <script>
    (() => {
      const root = document.querySelector('.diagnostic-report');
      const button = document.querySelector('[data-report-theme]');
      if (!root || !button) return;
      button.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'escuro' ? 'claro' : 'escuro';
        root.setAttribute('data-theme', next);
        button.textContent = next === 'escuro' ? 'Tema claro' : 'Tema escuro';
      });
    })();
  </script>`;
}

export function renderLaudo(laudo: DiagnosticLaudo, urls: { capabilityBase: string; reportBase: string }): string {
  const complaint = 'gap' in laudo.complaint
    ? `<p class="report-gap">${escapeHtml(laudo.complaint.gap)}</p>`
    : `<blockquote class="report-quote"><p>${escapeHtml(laudo.complaint.quote)}</p><footer>${escapeHtml(laudo.complaint.author)}</footer></blockquote>`;
  const mechanism = typeof laudo.mechanism === 'string'
    ? `<p>${escapeHtml(laudo.mechanism)}</p>`
    : `<p class="report-gap">${escapeHtml(laudo.mechanism.gap)}</p>`;
  const queue = 'gap' in laudo.constraint
    ? ''
    : '<p>Enquanto essa restrição existir, melhorar outras capacidades antes dela tende a aumentar a fila, não a velocidade.</p>';
  const reading = 'gap' in laudo.reading
    ? `<p class="report-gap">${escapeHtml(laudo.reading.gap)}</p>`
    : `<p class="report-index">${laudo.reading.index}%</p><p>faixa ${laudo.reading.band[0]}–${laudo.reading.band[1]}% · cobertura ${Math.round(laudo.reading.coverage * 100)}%${laudo.reading.target !== undefined ? ` · alvo ${laudo.reading.target}%` : ''}</p><p>${escapeHtml(laudo.reading.narrative)}</p>`;
  const findings = laudo.findings.map((finding) => {
    const areas = `${finding.areas} ${finding.areas === 1 ? 'área afetada' : 'áreas afetadas'}`;
    const marks = supportMarks(finding.support);
    const dots = Array.from({ length: marks }, () => '<i></i>').join('');
    const href = finding.destination === 'readiness'
      ? `${urls.reportBase}/readiness`
      : `${urls.capabilityBase}/${finding.nodeId}`;
    return `<article class="report-finding"><div class="report-finding-path"><span>${escapeHtml(finding.path)}</span><span>${finding.order}</span></div><p class="report-finding-fact">${escapeHtml(finding.title)}</p><p>${escapeHtml(finding.reading)}</p><p class="report-finding-meta"><span>${escapeHtml(areas)}</span><span class="report-support"><span aria-hidden="true">${dots}</span>${escapeHtml(finding.support)}</span></p><a href="${escapeHtml(href)}">Ver ficha →</a></article>`;
  }).join('');
  const others = laudo.otherFindings.length
    ? `<ul class="report-other">${laudo.otherFindings.map((title) => `<li>${escapeHtml(title)}</li>`).join('')}</ul>`
    : '';
  const divergences = Array.isArray(laudo.divergences)
    ? `<p>Divergência mostra que as perspectivas vivem sistemas diferentes. Não mostra quem está certo.</p>${laudo.divergences.map((item) => `<article class="report-divergence"><h3>${escapeHtml(item.title)}</h3><div class="report-divergence-sides"><p>${escapeHtml(item.left)}</p><p>${escapeHtml(item.right)}</p></div></article>`).join('')}`
    : `<p class="report-gap">${escapeHtml(laudo.divergences.gap)}</p>`;
  const constraint = 'gap' in laudo.constraint
    ? `<p class="report-gap">${escapeHtml(laudo.constraint.gap)}</p>`
    : `<h3>${escapeHtml(laudo.constraint.title)}</h3><p>${escapeHtml(laudo.constraint.body)}</p>`;
  const conduct = laudo.conduct.map((item, index) => renderConduct(item, index + 1)).join('')
    || '<p class="report-gap">Nenhuma conduta de 30 dias foi publicada.</p>';
  const unknowns = laudo.unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const exams = laudo.exams.length
    ? `<ul>${laudo.exams.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '<p class="report-gap">Nenhum exame complementar foi sugerido nesta leitura.</p>';
  return `<header class="report-hero"><p class="report-kicker">Laudo · primeira página</p><h1>Diagnóstico da área de tecnologia</h1><p class="report-note">Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas nem como meta de bônus.</p><p class="report-context">${escapeHtml(laudo.context)}</p><p>${escapeHtml(laudo.footer.sample)}</p></header>
    <section class="report-block"><h2>Motivo da avaliação</h2>${complaint}</section>
    <section class="report-block"><h2>Leitura geral</h2>${mechanism}${queue}${reading}</section>
    <section class="report-block"><h2>Achados</h2><p>O que está acontecendo, em ordem de impacto no motivo da avaliação.</p>${findings}${others}</section>
    <section class="report-block"><h2>Divergências</h2>${divergences}</section>
    <section class="report-block"><h2>Restrição principal</h2>${constraint}</section>
    <section class="report-block"><h2>Conduta para 30 dias</h2>${conduct}<p><a href="${escapeHtml(`${urls.reportBase}/treatment`)}">Ver o plano de tratamento completo →</a></p></section>
    <section class="report-block"><h2>Prognóstico</h2><p class="report-gap">${escapeHtml(laudo.prognosis.gap)}</p></section>
    <section class="report-block"><h2>O que ainda não sabemos</h2><h3>Lacunas</h3><ul>${unknowns}</ul><h3>Exames complementares sugeridos</h3>${exams}</section>
    ${renderFooter(laudo)}`;
}

function supportMarks(support: string): number {
  if (support === 'Sustentação forte' || support === 'Achado de risco') return 3;
  if (support === 'Sustentação moderada') return 2;
  return 1;
}

function renderConduct(item: TreatmentConduct, order: number): string {
  const cynefin = item.cynefin ? `<p>${escapeHtml(cynefinLine(item.cynefin))}</p>` : '';
  const grade = item.evidenceGrade
    ? `<p>Evidência ${item.evidenceGrade}. ${escapeHtml(evidenceGradeReading[item.evidenceGrade])}.</p>${item.evidenceGrade === 'D' ? '<p>Conduta D entra como experimento explícito.</p>' : ''}`
    : '';
  const dependency = item.dependency ? `<p class="treatment-depends">${escapeHtml(item.dependency)}</p>` : '';
  const archetype = item.archetype
    ? `<p>Arquétipo (padrão provável): ${escapeHtml(item.archetype)}.${item.prognosisWithoutTreatment ? ` Sem tratamento: ${escapeHtml(item.prognosisWithoutTreatment)}` : ''}</p>`
    : '';
  const learning = item.learningMode
    ? `<p>Modalidade de aprendizado: ${escapeHtml(learningModeReading[item.learningMode])}.</p>`
    : '';
  const unlocks = item.unlocks?.length
    ? `<p>Desbloqueia: ${escapeHtml(item.unlocks.join('; '))}.</p>`
    : '';
  const transfer = item.lowTransferWarning
    ? '<p class="report-gap">Aviso: baixa transferência — treinamento sem mudar o ambiente raramente vira prática.</p>'
    : '';
  const limit = item.doesNotSolve ? `<p><strong>O que este caminho não resolve.</strong> ${escapeHtml(item.doesNotSolve)}</p>` : '';
  return `<article class="report-conduct"><p class="report-kicker">${order || ''} Experimento</p><p class="report-conduct-action">${escapeHtml(item.action)}</p><p>Dono provável: ${escapeHtml(item.owner)}</p><p>Critério de sucesso: ${escapeHtml(item.success)}</p>${cynefin}${grade}${dependency}${archetype}${learning}${unlocks}${transfer}${limit}</article>`;
}

function renderFooter(laudo: DiagnosticLaudo): string {
  return `<footer class="report-footer"><p>Aviso de uso. Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas nem como meta de bônus.</p><p>Amostra desta leitura. ${escapeHtml(laudo.footer.sample)}</p><p>${escapeHtml(laudo.footer.instrument)} · ${escapeHtml(laudo.footer.calibration)}</p></footer>`;
}

export function renderMapPage(input: {
  map: OrganizationalAreaMap;
  cut: 'cap' | 'est' | 'per';
  areaBase: string;
  capabilityBase: string;
  structure?: StructureMatrix;
  perspectives?: PerspectiveMatrix;
  legend?: MapLegend;
}): string {
  const tabs = [
    ['cap', 'Por capacidade'],
    ['est', 'Por estrutura'],
    ['per', 'Por perspectiva'],
  ].map(([id, label]) => `<a role="tab" aria-selected="${input.cut === id ? 'true' : 'false'}" href="?cut=${id}">${label}</a>`).join('');
  const body = input.cut === 'est'
    ? renderStructureCut(input.structure)
    : input.cut === 'per'
      ? renderPerspectiveCut(input.perspectives)
      : renderCapabilityCut(input.map, input.areaBase, input.capabilityBase);
  return `<header class="report-hero"><p class="report-kicker">Mapa navegável</p><h1>Onde está cada parte do sistema</h1><p>Abra um bloco para descer até a capacidade. Célula sem cobertura não é zero.</p></header>
    <div class="report-tabs" role="tablist" aria-label="Corte">${tabs}</div>
    ${body}
    ${input.legend ? renderLegend(input.legend) : ''}`;
}

function renderLegend(legend: MapLegend): string {
  const marks = legend.marks.map((mark) => `<p><span class="legend-mark legend-${mark.id}" aria-hidden="true"></span>${escapeHtml(mark.label)} ${escapeHtml(mark.value)}</p>`).join('');
  const gap = legend.gap ? `<p>${escapeHtml(legend.gap)}</p>` : '';
  return `<div class="report-matrix-legend" aria-label="Legenda do mapa">${marks}${gap}</div>`;
}

function renderCapabilityCut(map: OrganizationalAreaMap, areaBase: string, capabilityBase: string): string {
  const tiles = projectSystemTiles(map).map((tile) => {
    const chips = tile.disciplines.map((child) => `<a class="area-chip" href="${escapeHtml(childHref(child, areaBase, capabilityBase))}">${escapeHtml(child.label)}</a>`).join('');
    return `<article class="area-tile${tile.observed ? ' observed' : ' unobserved'}" data-area="${escapeHtml(tile.id)}"><a href="${escapeHtml(`${areaBase}/${tile.id}`)}"><h3>${escapeHtml(tile.label)}</h3></a><p class="muted">${escapeHtml(tile.status)}</p>${chips ? `<p class="area-chips">${chips}</p>` : ''}</article>`;
  }).join('');
  return `<section class="area-map" aria-label="Sistemas da organização"><h2>Sistemas da organização</h2><div class="area-map-systems">${tiles}</div></section>`;
}

function childHref(child: OrganizationalAreaNode, areaBase: string, capabilityBase: string): string {
  if (child.kind === 'leaf' && child.leafId) return `${capabilityBase}/${child.leafId}`;
  return `${areaBase}/${child.id}`;
}

function renderStructureCut(matrix: StructureMatrix | undefined): string {
  if (!matrix?.rows.length) return '<p class="report-gap">Nenhuma unidade com leitura publicada.</p>';
  const headers = matrix.columns.map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`).join('');
  const rows = matrix.rows.map((row) => `<tr><th scope="row">${escapeHtml(row.label)} (${row.completed})</th>${renderCells(row.cells)}</tr>`).join('');
  return `<section class="report-matrix-block"><div class="report-matrix-legend"><p>${escapeHtml(mapCopy.structureLead)}</p><p><span class="coverage-swatch" aria-hidden="true"></span>${escapeHtml(mapCopy.uncovered)}</p></div><table class="report-matrix"><thead><tr><th></th>${headers}</tr></thead><tbody>${rows}</tbody></table></section>`;
}

function renderPerspectiveCut(matrix: PerspectiveMatrix | undefined): string {
  if (!matrix?.rows.length && !matrix?.withoutOwnRow.length) return `<p class="report-gap">${escapeHtml(mapCopy.noDivergence)}</p>`;
  const headers = matrix.columns.map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`).join('');
  const rows = matrix.rows.map((row) => `<tr><th scope="row">${escapeHtml(row.label)} (${row.completed})</th>${renderCells(row.cells)}</tr>`).join('');
  const withheld = matrix.withheld
    ? `<p class="report-gap"><strong>${escapeHtml(mapCopy.noOwnRow)}.</strong> ${escapeHtml(matrix.withheld)}</p>`
    : '';
  const table = matrix.rows.length
    ? `<p>${escapeHtml(matrix.notice)}</p><table class="report-matrix"><thead><tr><th></th>${headers}</tr></thead><tbody>${rows}</tbody></table>`
    : '';
  return `<section class="report-matrix-block">${table}${withheld}</section>`;
}

function renderCells(cells: Array<{ kind: 'uncovered' | 'unpublished' | 'divergence'; left?: string; right?: string }>): string {
  return cells.map((cell) => {
    if (cell.kind === 'divergence') return `<td class="divergence-cell"><p>${escapeHtml(cell.left ?? '')}</p><p>${escapeHtml(cell.right ?? '')}</p></td>`;
    if (cell.kind === 'unpublished') return `<td class="index-gap">${escapeHtml(mapCopy.unpublished)}</td>`;
    return `<td class="coverage-gap">${escapeHtml(mapCopy.uncovered)}</td>`;
  }).join('');
}

export function renderNodeCard(input: { title: string; trail: FichaCrumb[]; definition: NodeDefinition; how: HowItIs; reported: ReportedReadings; detail?: string; preserve: PreservePublication; close: FichaClose }): string {
  const block = (heading: string, body: string) => `<section class="report-block"><h2>${escapeHtml(heading)}</h2>${body}</section>`;
  const trail = input.trail.map((crumb, index) => {
    const separator = index === 0 ? '' : '<span aria-hidden="true">›</span>';
    const item = crumb.href
      ? `<a href="${escapeHtml(crumb.href)}">${escapeHtml(crumb.label)}</a>`
      : `<span>${escapeHtml(crumb.label)}</span>`;
    return `${separator}${item}`;
  }).join('');
  return `<header class="report-hero"><nav class="ficha-trail" aria-label="Caminho">${trail}</nav><p class="report-kicker">Ficha do nó</p><h1>${escapeHtml(input.title)}</h1></header>
    ${block('O que é e por que importa', `<p>${escapeHtml(input.definition.what)}</p><p>${escapeHtml(input.definition.why)}</p>`)}
    ${block('Como está', renderHowItIs(input.how))}
    ${block('O que as pessoas relataram', `${renderReported(input.reported)}${input.detail ?? ''}`)}
    ${block('Por que provavelmente acontece', renderFichaLine(input.close.cause))}
    ${block('Onde se resolve', renderFichaLine(input.close.place))}
    ${block('O que fazer', renderFichaLine(input.close.action))}
    ${block('Como saber se funcionou', renderFichaLine(input.close.check))}
    ${block('O que já funciona', `<p class="${input.preserve.shown ? '' : 'report-gap'}">${escapeHtml(input.preserve.body)}</p>`)}
    ${block('Relações com outros nós', renderFichaLine(input.close.relations))}
    ${block('O que não sabemos', renderFichaLine(input.close.unknown))}
    ${block('Referências', renderFichaLine(input.close.references))}`;
}

function renderFichaLine(line: FichaLine): string {
  const tone = line.published ? 'ficha-card' : 'ficha-card report-gap';
  return `<article class="${tone}"><p>${escapeHtml(line.body)}</p></article>`;
}

function renderReported(readings: ReportedReadings): string {
  if (readings.gap) return `<p class="report-gap">${escapeHtml(readings.gap)}</p>`;
  const list = (title: string, accounts: ReportedReadings['perspectives']) => accounts.length === 0
    ? ''
    : `<h3>${escapeHtml(title)}</h3>${accounts.map((account) => `<p><strong>${escapeHtml(account.label)}</strong> ${escapeHtml(account.body)}</p>`).join('')}`;
  const withheld = readings.withheld.map((line) => `<p class="report-gap">${escapeHtml(line)}</p>`).join('');
  return `${list('Por perspectiva', readings.perspectives)}${list('Por time', readings.units)}${withheld}`;
}

function renderHowItIs(how: HowItIs): string {
  const stage = how.stage.published
    ? `<p>${how.stage.shares.map((share, index) => `Estágio ${index}: ${share}`).join(' · ')}</p>`
    : `<p class="report-gap">${escapeHtml(how.stage.gap)}</p>`;
  const quadrant = how.quadrant.published ? `<p>${escapeHtml(how.quadrant.conduct)}</p>` : '';
  return `${stage}${quadrant}`;
}

export function renderTreatmentPage(plan: {
  active: TreatmentConduct[];
  waiting: TreatmentConduct[];
  deferred: TreatmentConduct[];
  pulse: PulseCatalogItem[];
}, evidenceGap?: string): string {
  const list = (items: TreatmentConduct[]) => items.map((item, index) => renderConduct(item, index + 1)).join('') || '<p class="report-gap">Nenhuma conduta neste horizonte.</p>';
  const grades = evidenceGap
    ? `<p class="report-gap">${escapeHtml(evidenceGap)}</p>`
    : '<p>O grau A–D descreve a base da prática, não o suporte local da amostra. Condutas D só entram como experimento explícito.</p>';
  const pulse = plan.pulse.length
    ? `<p>3 a 6 itens-âncora das folhas tratadas, nas mesmas unidades. Mudança só com P(melhora) ≥ 0,8.</p><ul>${plan.pulse.map((item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.prompt)} <span class="report-meta">(${item.intervalWeeks.min}–${item.intervalWeeks.max} semanas · ${escapeHtml(item.leafId)})</span></li>`).join('')}</ul>`
    : '<p class="report-gap">Ainda não há folhas tratadas com item-âncora de pulso no catálogo.</p>';
  const domains = (['clear', 'complicated', 'complex', 'chaotic'] as const).map((domain) => `<li>${escapeHtml(cynefinLine(domain))}</li>`).join('');
  return `<header class="report-hero"><p class="report-kicker">Plano de tratamento</p><h1>Quem faz o quê, e em que ordem</h1></header>
    <section class="report-block"><h2>0–30 dias · ativas agora</h2>${list(plan.active)}</section>
    <section class="report-block"><h2>Setas</h2><p>A conduta de destino depende da de origem. O que espera começa quando a dependência mostrar resultado.</p>${list(plan.waiting)}</section>
    <section class="report-block"><h2>Depois</h2>${list(plan.deferred)}</section>
    <section class="report-block"><h2>Pulso · 4–8 semanas</h2>${pulse}</section>
    <section class="report-block"><h2>Domínio Cynefin</h2><ul>${domains}</ul>${grades}</section>`;
}

export function renderAudiencePage(readings: AudienceReading[]): string {
  const field = (item: AudienceReading['direction'][number]) => item.published
    ? `<p><strong>${escapeHtml(item.label)}.</strong> ${escapeHtml(item.body)}</p>`
    : `<p class="report-gap"><strong>${escapeHtml(item.label)}.</strong> ${escapeHtml(item.body)}</p>`;
  const body = readings.length
    ? readings.map((reading) => `<section class="report-block"><h2>${escapeHtml(reading.title)}</h2><div>
        <p class="${reading.pathPublished ? 'report-kicker' : 'report-gap'}">${escapeHtml(reading.path)}</p>
        <p>${escapeHtml(reading.fact)}</p>
        <div class="audience-side"><h3>Versão para a direção</h3><p class="report-note">Para quem autoriza.</p>${reading.direction.map(field).join('')}</div>
        <div class="audience-side"><h3>Versão para o time</h3><p class="report-note">Para quem executa no recorte.</p>${reading.team.map(field).join('')}</div>
        <div class="audience-side"><h3>A quem recorrer</h3><p class="${reading.rolesPublished ? '' : 'report-gap'}">${escapeHtml(reading.roles)}</p></div>
      </div></section>`).join('')
    : '<p class="report-gap">Nenhum achado publicado para reescrever por público.</p>';
  const bonus = readings.length
    ? `<aside class="report-block"><h2>Acompanhamento</h2><p>${escapeHtml(readings[0]!.bonus)}</p></aside>`
    : '';
  return `<header class="report-hero"><p class="report-kicker">Visão por público</p><h1>O mesmo achado, para quem decide e para quem faz</h1><p>O conteúdo é o mesmo. Muda o que cada público precisa fazer com ele.</p></header>${body}${bonus}`;
}

export function renderWalkthrough(input: AreaWalkthrough): string {
  const list = (heading: string, lines: string[]) =>
    `<section class="report-block"><h2>${heading}</h2><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul></section>`;
  const block = (heading: string, body: string) => `<section class="report-block"><h2>${heading}</h2><p>${escapeHtml(body)}</p></section>`;
  const opening = 'gap' in input.opening
    ? `<p class="report-gap">${escapeHtml(input.opening.gap)}</p>`
    : `<p class="walk-state">${escapeHtml(input.opening.state)}</p>${input.opening.chip ? `<p class="walk-chip">${escapeHtml(input.opening.chip)}</p>` : `<p class="report-gap">${escapeHtml(input.opening.chipGap ?? '')}</p>`}`;
  const step = 'gap' in input.step
    ? `<p class="report-gap">${escapeHtml(input.step.gap)}</p>`
    : `<article class="readiness-card"><p class="report-conduct-action">${escapeHtml(input.step.label)}</p><p>Quando chegarmos lá, veremos…</p><p>${escapeHtml(input.step.expect)}</p></article>`;
  const trail = `<ol class="walk-trail">${input.trail.map((item) => {
    const body = item.gap
      ? `<p class="report-gap">${escapeHtml(item.gap)}</p>`
      : `<p>${escapeHtml(item.action ?? '')}</p><p>O que esperar: ${escapeHtml(item.expect ?? '')}</p>`;
    return `<li><p class="walk-horizon">${escapeHtml(item.horizon)}</p>${body}</li>`;
  }).join('')}</ol>`;
  return `<header class="report-hero"><p class="report-kicker">Walkthrough da área · ${escapeHtml(input.areaLabel)}</p><h1>${escapeHtml(input.areaLabel)}: do esforço de poucos para um sistema</h1>${opening}<p>${escapeHtml(input.summary)}</p></header>
    ${list('Onde estamos', input.sections.where)}
    ${block('Como chegamos aqui', input.sections.arrived)}
    ${block('O que já funciona', input.sections.working)}
    <section class="report-block"><h2>Próxima fase</h2>${step}</section>
    <section class="report-block"><h2>Caminho</h2>${trail}</section>
    ${list('Marcos', input.sections.milestones)}
    ${list('Riscos de regressão', input.sections.risks)}
    ${list('Premissas a revisar', input.sections.assumptions)}`;
}

export function renderReadinessPage(items: Array<{ id?: string; label: string; assessment?: ReadinessAssessment; gap?: string; verdict?: ReturnType<typeof bottleneckStatus>; nextStep?: string; withheld?: string; premature?: boolean }>): string {
  const bandLabel = (band: ReadinessAssessment['band']) => band === 'ready' ? 'Pronto' : band === 'near' ? 'Perto' : 'Não pronto';
  const cards = items.map((item) => {
    if (item.gap || !item.assessment) return `<article class="report-block"><h2>${escapeHtml(item.label)}</h2><p class="report-gap">${escapeHtml(item.gap ?? 'Sem posterior.')}</p></article>`;
    const verdict = item.verdict ?? bottleneckStatus(item.assessment);
    const checklist = item.assessment.checklist?.length
      ? `<ul class="readiness-checklist">${item.assessment.checklist.map((row) => (
        `<li>${escapeHtml(row.label)}${row.essential ? ' (essencial)' : ''}${row.label === verdict.bottleneck ? ' · gargalo' : ''}: p_k ${row.probability.toFixed(2)}</li>`
      )).join('')}</ul>`
      : '';
    const premature = item.premature || item.assessment.premature
      ? '<p>Adoção prematura: a fase técnica está à frente de um pré-requisito essencial. É risco do sistema de trabalho, não culpa de uma pessoa.</p>'
      : '';
    const step = item.withheld
      ? `<p class="report-gap">${escapeHtml(item.withheld)}</p>`
      : item.nextStep
        ? `<p>${escapeHtml(item.nextStep)}</p>`
        : '';
    return `<article class="readiness-card"><h2>${escapeHtml(item.label)}</h2><p>${bandLabel(verdict.band)}</p><p>${escapeHtml(verdict.line)}</p><p>P(pronto) ${item.assessment.probability}. Isto não é índice da organização.</p>${premature}<p>Pré-requisitos</p>${checklist}${step}</article>`;
  }).join('');
  return `<header class="report-hero"><p class="report-kicker">Prontidão para práticas avançadas</p><h1>Prontidão para práticas avançadas</h1><p>A probabilidade de pronto nunca passa a ser índice da organização. O gargalo decide.</p></header>
    <p><span class="readiness ready">Pronto</span> pré-requisitos atendidos · <span class="readiness near">Perto</span> um pré-requisito faltando · <span class="readiness blocked">Não pronto</span> gargalo sem conduta que destrave</p>
    ${cards}`;
}

export function renderFrontierPage(input: FrontierBrief & { readinessHref?: string; gap?: string }): string {
  const place = (items: FrontierBrief['mastered'], empty: string, line: (item: FrontierBrief['mastered'][number]) => string) => (
    items.length ? `<ul>${items.map((item) => `<li>${line(item)}</li>`).join('')}</ul>` : `<p class="report-gap">${escapeHtml(empty)}</p>`
  );
  const start = 'gap' in input.start
    ? `<p class="report-gap">${escapeHtml(input.start.gap)}</p>`
    : `<article class="readiness-card"><p class="report-conduct-action">${escapeHtml(input.start.step)}</p><p>Destrava: ${escapeHtml(input.start.unlocks)}</p></article>`;
  const parallel = input.parallel.map((item) => `<p><strong>${escapeHtml(item.label)}.</strong> ${escapeHtml(item.body)}</p>`).join('')
    || '<p class="report-gap">Nenhuma condição humana publicada neste grafo.</p>';
  const href = input.readinessHref ?? '/readiness';
  const gap = input.gap ? `<p class="report-gap">${escapeHtml(input.gap)}</p>` : '';
  return `<header class="report-hero"><p class="report-kicker">Fronteira de aprendizado</p><h1>O que a organização pode aprender agora</h1><p>Degraus com P(desbloqueado) ≥ 0,6 entram na fronteira; abaixo de 0,25 ficam bloqueados.</p></header>${gap}
    <section class="report-block"><h2>Dominado</h2>${place(input.mastered, 'Nenhum degrau dominado nesta leitura.', (item) => escapeHtml(item.label))}</section>
    <section class="report-block"><h2>Pode aprender agora</h2>${place(input.learnable, 'Nenhum degrau desbloqueado para aprender agora.', (item) => `${escapeHtml(item.label)} — pode aprender agora`)}</section>
    <section class="report-block"><h2>Ainda bloqueado</h2>${place(input.blocked, 'Nenhum degrau bloqueado nesta leitura.', (item) => `${escapeHtml(item.label)} — ainda bloqueado${item.blockedBy.length ? ` · bloqueado por ${escapeHtml(item.blockedBy.join(', '))}` : ''}`)}</section>
    <section class="report-block"><h2>Comece por</h2>${start}</section>
    <section class="report-block"><h2>Em paralelo</h2>${parallel}<p>${escapeHtml(input.advancedAside)}</p><p><a href="${escapeHtml(href)}">Ver prontidão →</a></p></section>`;
}

export function renderHistoryPage(input: {
  change?: string;
  gap?: string;
  pImprove?: number;
  pRegress?: number;
  pStable?: number;
  threshold?: number;
  evolution?: EvolutionReport;
  options?: Array<{ id: string; label: string; selected: boolean }>;
  caution?: string;
  capabilityGap?: string;
} = {}): string {
  const { change, gap, pImprove, pRegress, pStable, threshold = 0.8, evolution, caution, capabilityGap } = input;
  const options = input.options ?? [];
  const selector = options.length > 1
    ? `<nav class="history-selector" aria-label="Leitura anterior">${options.map((item) => `<a href="?previous=${escapeHtml(item.id)}"${item.selected ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a>`).join('')}</nav>`
    : '';
  const probs = pImprove !== undefined && pRegress !== undefined
    ? `<p>P(melhora) ${pImprove.toFixed(2)} · P(piora) ${pRegress.toFixed(2)}${pStable !== undefined ? ` · P(estável) ${pStable.toFixed(2)}` : ''} · limiar ${threshold.toFixed(2)} (05 §9).</p>`
    : '';
  const changeLine = change === 'improved'
    ? 'Melhorou: P(melhora) atingiu o limiar de publicação.'
    : change === 'regressed'
      ? 'Piorou: P(piora) atingiu o limiar de publicação.'
      : change === 'stable'
        ? 'Estável: P(|S₂−S₁| < 1) atingiu o limiar — sem direção nova.'
        : 'Incerto: ainda não há evidência suficiente de melhora, piora ou estabilidade.';
  const body = gap
    ? `<p class="report-gap">${escapeHtml(gap)}</p>`
    : `<p>${changeLine}</p>${probs}`;
  const note = !gap && caution
    ? `<aside class="report-block"><h2>Atenção</h2><p>${escapeHtml(caution)}</p></aside>`
    : '';
  const leaves = capabilityGap ? `<p class="report-gap">${escapeHtml(capabilityGap)}</p>` : '';
  return `<header class="report-hero"><p class="report-kicker">Histórico e reavaliação</p><h1>Compare duas leituras</h1><p>Cada avaliação fica guardada como uma leitura. Mudança só com P(melhora), P(piora) ou P(estável) ≥ ${threshold.toFixed(2)}.</p>${selector}</header>${body}${evolution ? renderEvolution(evolution) : ''}${leaves}${note}`;
}

function renderEvolution(report: EvolutionReport): string {
  const stateLabel = { advanced: 'Avançou', regressed: 'Regrediu', stable: 'Estável', uncertain: 'Incerto' } as const;
  const nodes = report.nodes.length
    ? `<p>Estados publicados: Avançou, Regrediu, Estável, Incerto. Direção só entra quando a probabilidade chega ao limiar.</p><ul>${report.nodes.map((node) => `<li><strong>${escapeHtml(node.label)}</strong> — ${stateLabel[node.state]}. ${escapeHtml(node.reading)}</li>`).join('')}</ul>`
    : '<p class="report-gap">Sem nós comparáveis entre as duas leituras.</p>';
  const closed = report.findings.closed.length
    ? `<p>Achados encerrados: ${report.findings.closed.map(escapeHtml).join(', ')}.</p>`
    : '<p>Nenhum achado encerrado entre as leituras.</p>';
  const opened = report.findings.opened.length
    ? `<p>Achados novos: ${report.findings.opened.map(escapeHtml).join(', ')}.</p>`
    : '<p>Nenhum achado novo entre as leituras.</p>';
  const kindLabel = {
    same: 'mesma',
    renamed: 'renomeada',
    merged: 'fundida',
    split: 'dividida',
    extinct: 'extinta',
    new: 'nova',
  } as const;
  const units = report.units.length
    ? `<ul>${report.units.map((row) => {
      const from = row.previousLabel ?? '—';
      const to = row.currentLabel ?? '—';
      const pub = row.publishesEvolution ? 'com evolução' : 'sem evolução publicada';
      return `<li>${escapeHtml(from)} → ${escapeHtml(to)} (${kindLabel[row.kind]}, ${pub})</li>`;
    }).join('')}</ul>`
    : '<p class="report-gap">Sem tabela de correspondência de unidades.</p>';
  return `<section class="report-block"><h2>Relatório de evolução</h2>${nodes}${closed}${opened}<p>${escapeHtml(report.constraint.reading)}</p></section>
    <section class="report-block"><h2>Correspondência de unidades</h2>${units}</section>`;
}
