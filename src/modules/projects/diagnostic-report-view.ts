import { escapeHtml } from '../../shared/html.js';
import { CapabilityTaxonomy } from '../inference/domain/capability-taxonomy.js';
import { uniqueFindingsByPattern, type OutcomeFinding } from '../inference/domain/report-outcome.js';
import type { DiagnosticLaudo, AudienceReading } from '../inference/domain/diagnostic-report.js';
import type { EvidenceGrade, TreatmentConduct } from '../inference/domain/treatment-contract.js';
import { cynefinLine, evidenceGradeReading, learningModeReading, projectTreatmentMatrix } from '../inference/domain/treatment-contract.js';
import type { PulseCatalogItem } from '../catalog/item-catalog.js';
import type { FichaAction, FichaClose, FichaLine, FichaRelations, HowItIs, NodeDefinition, PreservePublication, ReportedReadings, StageReading } from '../inference/domain/ficha-node.js';
import { mapCopy, type EngineeringDomains, type MapLegend, type MapOverview, type MapRadarPanel, type MapRadars, type PerspectiveMatrix, type StructureMatrix } from '../inference/domain/map-matrix.js';
import { projectSystemTiles, type FichaCrumb, type OrganizationalAreaMap, type OrganizationalAreaNode } from '../inference/domain/organizational-areas.js';
import { bottleneckStatus, type ReadinessAssessment } from '../inference/domain/advanced-readiness.js';
import { projectFrontierLadder, type FrontierBrief, type FrontierLadderPlace } from '../inference/domain/learning-frontier.js';
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

function reportSectionTitle(order: number, title: string): string {
  return `<h2><span class="report-section-num" aria-hidden="true">${order}</span> ${escapeHtml(title)}</h2>`;
}

function laudoSectionTitle(order: number, title: string): string {
  return reportSectionTitle(order, title);
}

export function renderLaudo(laudo: DiagnosticLaudo, urls: { capabilityBase: string; reportBase: string }): string {
  const complaint = 'gap' in laudo.complaint
    ? `<p class="report-gap">${escapeHtml(laudo.complaint.gap)}</p>`
    : `<blockquote class="report-quote"><p>${escapeHtml(laudo.complaint.quote)}</p><footer>${escapeHtml(laudo.complaint.author)}</footer></blockquote>`;
  const mechanism = typeof laudo.mechanism === 'string'
    ? `<p class="report-mechanism">${escapeHtml(laudo.mechanism)}</p>`
    : `<p class="report-gap">${escapeHtml(laudo.mechanism.gap)}</p>`;
  const queue = 'gap' in laudo.constraint
    ? ''
    : '<p>Enquanto essa restrição existir, melhorar outras capacidades antes dela tende a aumentar a fila, não a velocidade.</p>';
  const reading = renderReading(laudo.reading);
  const findings = laudo.findings.map((finding) => {
    const areas = `${finding.areas} ${finding.areas === 1 ? 'área afetada' : 'áreas afetadas'}`;
    const marks = supportMarks(finding.support);
    const dots = Array.from({ length: marks }, () => '<i></i>').join('');
    const href = finding.destination === 'readiness'
      ? `${urls.reportBase}/readiness`
      : `${urls.capabilityBase}/${finding.nodeId}`;
    const patternAttr = finding.pattern
      ? ` data-finding-pattern="${escapeHtml(finding.pattern)}"`
      : '';
    return `<article class="report-finding"${patternAttr}><div class="report-finding-path"><span>${escapeHtml(finding.path)}</span><span>${finding.order}</span></div><p class="report-finding-fact">${escapeHtml(finding.title)}</p><p>${escapeHtml(finding.reading)}</p><p class="report-finding-meta"><span>${escapeHtml(areas)}</span><span class="report-support"><span aria-hidden="true">${dots}</span>${escapeHtml(finding.support)}</span></p><a href="${escapeHtml(href)}">Ver ficha →</a></article>`;
  }).join('');
  const findingsBlock = findings
    ? `<div class="report-findings">${findings}</div>`
    : '';
  const others = laudo.otherFindings.length
    ? `<ul class="report-other">${laudo.otherFindings.map((item) => {
      const patternAttr = item.pattern
        ? ` data-finding-pattern="${escapeHtml(item.pattern)}"`
        : '';
      return `<li${patternAttr}>${escapeHtml(item.title)}</li>`;
    }).join('')}</ul>`
    : '';
  const divergences = Array.isArray(laudo.divergences)
    ? `<p>Divergência mostra que as perspectivas vivem sistemas diferentes. Não mostra quem está certo.</p>${laudo.divergences.map(renderDivergence).join('')}`
    : `<p class="report-gap">${escapeHtml(laudo.divergences.gap)}</p>`;
  const constraint = 'gap' in laudo.constraint
    ? `<p class="report-gap">${escapeHtml(laudo.constraint.gap)}</p>`
    : renderConstraint(laudo.constraint);
  const thirtyDay = laudo.conduct.filter((item) => item.horizon === '0-30');
  const conduct = thirtyDay.length
    ? renderConductGrid(thirtyDay)
    : '<p class="report-gap">Nenhuma conduta de 30 dias foi publicada.</p>';
  const unknowns = laudo.unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const exams = laudo.exams.length
    ? `<ul>${laudo.exams.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '<p class="report-gap">Nenhum exame complementar foi sugerido nesta leitura.</p>';
  return `<header class="report-hero"><p class="report-kicker">Laudo · primeira página</p><h1>Diagnóstico da área de tecnologia</h1><p class="report-note" role="note">Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas nem como meta de bônus.</p><p class="report-context">${escapeHtml(laudo.context)}</p><p>${escapeHtml(laudo.footer.sample)}</p></header>
    <section class="report-block">${laudoSectionTitle(1, 'Motivo da avaliação')}${complaint}</section>
    <section class="report-block">${laudoSectionTitle(2, 'Leitura geral')}${mechanism}${queue}${reading}</section>
    <section class="report-block">${laudoSectionTitle(3, 'Achados')}<p>O que está acontecendo, em ordem de impacto no motivo da avaliação.</p>${findingsBlock}${others}</section>
    <section class="report-block">${laudoSectionTitle(4, 'Divergências')}${divergences}</section>
    <section class="report-block">${laudoSectionTitle(5, 'Restrição principal')}${constraint}</section>
    <section class="report-block">${laudoSectionTitle(6, 'Conduta para 30 dias')}${conduct}<p><a href="${escapeHtml(`${urls.reportBase}/treatment`)}">Ver o plano de tratamento completo →</a></p></section>
    <section class="report-block">${laudoSectionTitle(7, 'Prognóstico')}${renderPrognosis(laudo.prognosis)}</section>
    <section class="report-block">${laudoSectionTitle(8, 'O que ainda não sabemos')}<div class="report-unknowns-grid"><div><h3>Lacunas</h3><ul>${unknowns}</ul></div><div><h3>Exames complementares sugeridos</h3>${exams}</div></div></section>
    ${renderFooter(laudo)}`;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Zero length omits `%` so style geometry is not mistaken for a published 0% index. */
function cssPercent(value: number): string {
  const clamped = clampPercent(value);
  return clamped === 0 ? '0' : `${clamped}%`;
}

function renderGauge(index: number, band: [number, number]): string {
  const left = clampPercent(band[0]);
  const right = Math.max(left, clampPercent(band[1]));
  const marker = clampPercent(index);
  return `<div class="report-gauge"><div class="report-gauge-track"><div class="report-gauge-band" style="left:${cssPercent(left)};width:${cssPercent(right - left)}"></div><i class="report-gauge-marker" style="left:${cssPercent(marker)}"></i></div></div>`;
}

function renderGaugeGap(message: string): string {
  return `<div class="report-gauge report-gauge-gap"><p class="report-gap">${escapeHtml(message)}</p></div>`;
}

function renderReading(reading: DiagnosticLaudo['reading']): string {
  if ('gap' in reading) return renderGaugeGap(reading.gap);
  const target = reading.target !== undefined ? ` · alvo ${reading.target}%` : '';
  const overall = `${renderGauge(reading.index, reading.band)}<p class="report-index">${reading.index}%</p><p>faixa ${reading.band[0]}–${reading.band[1]}% · cobertura ${Math.round(reading.coverage * 100)}%${target}</p><p>${escapeHtml(reading.narrative)}</p>`;
  const slices = [
    renderMaturitySlice('Maturidade técnica', reading.technical, 'Esta leitura ainda não publica a maturidade técnica com faixa.'),
    renderMaturitySlice('Maturidade organizacional', reading.organizational, 'Esta leitura ainda não publica a maturidade organizacional com faixa.'),
  ].join('');
  return `${overall}<section class="report-slices" aria-labelledby="report-slices-title"><p class="report-kicker" id="report-slices-title">Técnica × organizacional</p><ul class="report-slice-list">${slices}</ul></section>`;
}

function renderMaturitySlice(label: string, slice: { index: number; band: [number, number] } | undefined, gap: string): string {
  if (!slice) return `<li class="report-slice report-slice-gap"><p class="report-slice-note">${escapeHtml(gap)}</p></li>`;
  return `<li class="report-slice">${renderGauge(slice.index, slice.band)}<p class="report-slice-reading">${escapeHtml(label)} ${slice.index}% · faixa ${slice.band[0]}–${slice.band[1]}%</p></li>`;
}

function renderDivergence(item: {
  title: string;
  left: string;
  right: string;
  leftMagnitude?: number;
  rightMagnitude?: number;
  distancePoints?: number;
}): string {
  const leftMagnitude = item.leftMagnitude;
  const rightMagnitude = item.rightMagnitude;
  const distancePoints = item.distancePoints;
  const published = leftMagnitude !== undefined
    && rightMagnitude !== undefined
    && distancePoints !== undefined;
  const bar = published
    ? `<div class="report-divergence-bar" aria-hidden="true"><i style="width:${cssPercent(leftMagnitude)}"></i><i style="width:${cssPercent(rightMagnitude)}"></i></div><p class="report-divergence-distance">${distancePoints} pontos de distância</p><p class="report-divergence-magnitudes">${leftMagnitude}% · ${rightMagnitude}%</p>`
    : '';
  return `<article class="report-divergence"><h3>${escapeHtml(item.title)}</h3>${bar}<div class="report-divergence-sides"><p>${escapeHtml(item.left)}</p><p>${escapeHtml(item.right)}</p></div></article>`;
}

function renderConstraint(constraint: { title: string; body: string; metric?: string }): string {
  const metric = constraint.metric
    ? `<p class="report-constraint-metric">${escapeHtml(constraint.metric)}</p>`
    : '';
  return `<article class="report-constraint"><div><h3 class="report-constraint-title">${escapeHtml(constraint.title)}</h3><p>${escapeHtml(constraint.body)}</p></div>${metric}</article>`;
}

function renderPrognosisSide(label: string, body: string): string {
  return `<article class="report-prognosis-card"><h3>${escapeHtml(label)}</h3>${body}</article>`;
}

function renderPublishedPrognosisSide(side: { index: number; band: [number, number]; coverage: number; target?: number }): string {
  const target = side.target !== undefined ? ` · alvo ${side.target}%` : '';
  return `${renderGauge(side.index, side.band)}<p class="report-prognosis-index">${side.index}%</p><p>faixa ${side.band[0]}–${side.band[1]}% · cobertura ${Math.round(side.coverage * 100)}%${target}</p>`;
}

function renderPrognosis(prognosis: DiagnosticLaudo['prognosis']): string {
  if ('gap' in prognosis) {
    const gap = `<p class="report-gap">${escapeHtml(prognosis.gap)}</p>`;
    return `<div class="report-prognosis">${renderPrognosisSide('Sem tratamento', gap)}${renderPrognosisSide('Com tratamento', gap)}</div>`;
  }
  return `<div class="report-prognosis">${renderPrognosisSide('Sem tratamento', renderPublishedPrognosisSide(prognosis.withoutTreatment))}${renderPrognosisSide('Com tratamento', renderPublishedPrognosisSide(prognosis.withTreatment))}</div>`;
}

function supportMarks(support: string): number {
  if (support === 'Sustentação forte' || support === 'Achado de risco') return 3;
  if (support === 'Sustentação moderada') return 2;
  return 1;
}

function renderConductNotes(item: TreatmentConduct): string {
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
  return `${cynefin}${grade}${dependency}${archetype}${learning}${unlocks}${transfer}${limit}`;
}

function renderConductGrid(items: TreatmentConduct[]): string {
  const header = '<p>Experimento</p><p>Dono</p><p>Critério</p>';
  const rows = items.map((item) => (
    `<p class="report-conduct-action">${escapeHtml(item.action)}</p><p>Dono provável: ${escapeHtml(item.owner)}</p><p>Critério de sucesso: ${escapeHtml(item.success)}</p>`
  )).join('');
  const notes = items.map((item, index) => {
    const body = renderConductNotes(item);
    return body ? `<article class="report-conduct"><p class="report-kicker">${index + 1} Experimento</p>${body}</article>` : '';
  }).join('');
  return `<div class="report-conduct-grid">${header}${rows}</div>${notes}`;
}

function renderFooter(laudo: DiagnosticLaudo): string {
  return `<footer class="report-footer"><div><h3>Sobre estas estimativas</h3><p>Amostra desta leitura. ${escapeHtml(laudo.footer.sample)}</p><p>${escapeHtml(laudo.footer.instrument)} · ${escapeHtml(laudo.footer.calibration)}</p></div><div><h3>Aviso de uso</h3><p>Aviso de uso. Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas nem como meta de bônus.</p></div></footer>`;
}

export function renderMapPage(input: {
  map: OrganizationalAreaMap;
  cut: 'cap' | 'est' | 'per';
  areaBase: string;
  capabilityBase: string;
  overview: MapOverview;
  engineeringDomains: EngineeringDomains;
  mapRadars: MapRadars;
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
  return `<header class="report-hero"><p class="report-kicker">Mapa navegável</p><h1>Onde está cada parte do sistema</h1><p>${escapeHtml(input.overview.lead)}</p></header>
    ${renderMapOverview(input.overview)}
    ${renderEngineeringDomains(input.engineeringDomains)}
    ${renderMapRadars(input.mapRadars)}
    <div class="report-tabs" role="tablist" aria-label="Corte">${tabs}</div>
    ${body}
    ${input.legend ? renderLegend(input.legend) : ''}`;
}

function renderMapRadars(radars: MapRadars): string {
  return `<section class="map-radars" aria-label="Radars do mapa">
    <div class="map-radars-grid">
      ${renderMapRadarPanel(radars.domains)}
      ${renderMapRadarPanel(radars.capabilities)}
    </div>
  </section>`;
}

function renderMapRadarPanel(panel: MapRadarPanel): string {
  return `<article class="map-radar-panel">
    <h3>${escapeHtml(panel.title)}</h3>
    <p>${escapeHtml(panel.notice)}</p>
    ${renderMapRadarSvg(panel)}
  </article>`;
}

function renderMapRadarSvg(panel: MapRadarPanel): string {
  const axes = panel.axes;
  const center = 210;
  const radius = 130;
  const point = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(axes.length, 1);
    return `${(center + Math.cos(angle) * radius * scale).toFixed(1)},${(center + Math.sin(angle) * radius * scale).toFixed(1)}`;
  };
  const rings = [1, 2, 3, 4].map((level) => (
    `<polygon points="${axes.map((_, index) => point(index, level / 4)).join(' ')}" />`
  )).join('');
  const spokes = axes.map((_, index) => {
    const [x, y] = point(index, 1).split(',');
    return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" />`;
  }).join('');
  const published = axes.flatMap((axis, index) => (
    axis.state === 'published' && axis.reading ? [{ index, reading: axis.reading }] : []
  ));
  const polygon = published.length >= 3
    ? `<polygon class="radar-result" points="${published.map(({ index, reading }) => point(index, reading.index / 100)).join(' ')}" />`
    : '';
  const labels = axes.map((axis, index) => {
    const [x, y] = point(index, 1.18).split(',');
    if (axis.state !== 'published' || !axis.reading) {
      return `<text class="radar-axis-label map-radar-unassessed" x="${x}" y="${y}">${escapeHtml(axis.label)}<tspan x="${x}" dy="12">${escapeHtml(axis.note ?? 'Não avaliado')}</tspan></text>`;
    }
    return `<text class="radar-axis-label" x="${x}" y="${y}">${escapeHtml(axis.label)}<tspan x="${x}" dy="12">${axis.reading.index}%</tspan></text>`;
  }).join('');
  const markers = axes.map((axis, index) => {
    if (axis.state !== 'published' || !axis.reading) {
      const [x, y] = point(index, 1.18).split(',');
      return `<g class="radar-marker map-radar-unassessed" role="img" aria-label="${escapeHtml(axis.label)}: Não avaliado"><circle cx="${x}" cy="${y}" r="6"/></g>`;
    }
    const [x, y] = point(index, axis.reading.index / 100).split(',');
    return `<g class="radar-point" role="img" aria-label="${escapeHtml(axis.label)}: ${axis.reading.index}%"><circle cx="${x}" cy="${y}" r="7"/></g>`;
  }).join('');
  return `<svg class="radar map-radar" viewBox="0 0 420 420" role="img" aria-label="${escapeHtml(panel.title)}"><g class="radar-grid">${rings}${spokes}</g>${polygon}<g class="radar-labels">${labels}</g><g class="radar-markers">${markers}</g></svg>`;
}

function renderEngineeringDomains(domains: EngineeringDomains): string {
  const rows = domains.domains.map((domain) => {
    if (domain.state === 'published' && domain.reading) {
      return `<article class="map-engineering-domain" data-domain="${escapeHtml(domain.id)}"><h3>${escapeHtml(domain.label)}</h3>${renderGauge(domain.reading.index, domain.reading.band)}<p>${domain.reading.index}%</p><p>faixa ${domain.reading.band[0]}–${domain.reading.band[1]}%</p></article>`;
    }
    return `<article class="map-engineering-domain map-engineering-domain--na" data-domain="${escapeHtml(domain.id)}"><h3>${escapeHtml(domain.label)}</h3><p class="coverage-gap report-gap">${escapeHtml(domain.note ?? 'Não avaliado')}</p></article>`;
  }).join('');
  return `<section class="map-engineering-domains" aria-label="${escapeHtml(domains.title)}">
    <h2>${escapeHtml(domains.title)}</h2>
    <p>${escapeHtml(domains.method)}</p>
    <p>${escapeHtml(domains.legend)}</p>
    <div class="map-engineering-domain-list">${rows}</div>
  </section>`;
}

function renderMapOverview(overview: MapOverview): string {
  const technology = overview.technology.published
    ? `${renderGauge(overview.technology.index, overview.technology.band)}<p class="map-overview-index">${overview.technology.index}%</p><p>faixa ${overview.technology.band[0]}–${overview.technology.band[1]}% · cobertura ${Math.round(overview.technology.coverage * 100)}%</p>`
    : `<p class="report-gap">${escapeHtml(overview.technology.gap)}</p>`;
  const systems = overview.systems.map((system) => {
    const reading = system.reading
      ? `<p>${system.reading.index}%</p>`
      : `<p class="report-gap">${escapeHtml(system.gap ?? system.status)}</p>`;
    return `<article><h3>${escapeHtml(system.label)}</h3>${reading}</article>`;
  }).join('');
  return `<section class="map-overview" aria-label="Visão geral do mapa">
    <div><h2>Tecnologia</h2>${technology}</div>
    <div class="map-overview-systems">${systems}</div>
    <p>${escapeHtml(overview.method)}</p>
    <p>${escapeHtml(overview.notice)}</p>
  </section>`;
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
  return `<section class="report-matrix-block"><div class="report-matrix-legend"><p>${escapeHtml(mapCopy.structureLead)}</p><p><span class="covered-swatch" aria-hidden="true"></span>${escapeHtml(mapCopy.unpublished)}</p><p><span class="coverage-swatch" aria-hidden="true"></span>${escapeHtml(mapCopy.uncovered)}</p></div><table class="report-matrix"><thead><tr><th></th>${headers}</tr></thead><tbody>${rows}</tbody></table></section>`;
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

function renderCells(cells: Array<{
  kind: 'uncovered' | 'unpublished' | 'estimate' | 'divergence';
  left?: string;
  right?: string;
  index?: number;
  band?: [number, number];
  coverage?: number;
  distancePoints?: number;
  interpretation?: string;
}>): string {
  return cells.map((cell) => {
    if (cell.kind === 'divergence') {
      const distance = typeof cell.distancePoints === 'number'
        ? `<p class="divergence-distance">divergência · ${cell.distancePoints} pts</p>`
        : '';
      const interpretationText = cell.interpretation ? escapeHtml(cell.interpretation) : '';
      const attrs = interpretationText
        ? ` title="${interpretationText}" aria-label="${interpretationText}"`
        : '';
      const interpretation = interpretationText
        ? `<span class="divergence-interpretation sr-only">${interpretationText}</span>`
        : '';
      return `<td class="divergence-cell"${attrs}><span aria-hidden="true">◆</span><p>${escapeHtml(cell.left ?? '')}</p><p>${escapeHtml(cell.right ?? '')}</p>${distance}${interpretation}</td>`;
    }
    if (cell.kind === 'estimate' && typeof cell.index === 'number') {
      const details = [
        cell.band ? `faixa ${cell.band[0]}–${cell.band[1]}%` : undefined,
        cell.coverage !== undefined ? `cobertura ${cell.coverage}` : undefined,
      ].filter(Boolean).join(' · ');
      const label = details ? `${cell.index}%. ${details}` : `${cell.index}%`;
      const attrs = details
        ? ` title="${escapeHtml(details)}" aria-label="${escapeHtml(label)}"`
        : ` aria-label="${escapeHtml(label)}"`;
      return `<td class="coverage-cell estimate-cell"${attrs}>${cell.index}%</td>`;
    }
    if (cell.kind === 'unpublished') return `<td class="coverage-cell index-gap">${escapeHtml(mapCopy.unpublished)}</td>`;
    return `<td class="coverage-gap">${escapeHtml(mapCopy.uncovered)}</td>`;
  }).join('');
}

export function renderNodeCard(input: { title: string; trail: FichaCrumb[]; definition: NodeDefinition; how: HowItIs; reported: ReportedReadings; detail?: string; preserve: PreservePublication; close: FichaClose }): string {
  const block = (order: number, heading: string, body: string) =>
    `<section class="report-block">${reportSectionTitle(order, heading)}${body}</section>`;
  const trail = input.trail.map((crumb, index) => {
    const separator = index === 0 ? '' : '<span aria-hidden="true">›</span>';
    const item = crumb.href
      ? `<a href="${escapeHtml(crumb.href)}">${escapeHtml(crumb.label)}</a>`
      : `<span>${escapeHtml(crumb.label)}</span>`;
    return `${separator}${item}`;
  }).join('');
  return `<header class="report-hero"><nav class="ficha-trail" aria-label="Caminho">${trail}</nav><p class="report-kicker">Ficha do nó</p><h1>${escapeHtml(input.title)}</h1></header>
    ${block(1, 'O que é e por que importa', `<p>${escapeHtml(input.definition.what)}</p><p>${escapeHtml(input.definition.why)}</p>`)}
    ${block(2, 'Como está', renderHowItIs(input.how))}
    ${block(3, 'O que as pessoas relataram', `${renderReported(input.reported)}${input.detail ?? ''}`)}
    ${block(4, 'Por que provavelmente acontece', renderFichaLine(input.close.cause))}
    ${block(5, 'Onde se resolve', renderFichaLine(input.close.place))}
    ${block(6, 'O que fazer', renderFichaAction(input.close.action))}
    ${block(7, 'Como saber se funcionou', renderFichaLine(input.close.check))}
    ${block(8, 'O que já funciona', `<p class="${input.preserve.shown ? '' : 'report-gap'}">${escapeHtml(input.preserve.body)}</p>`)}
    ${block(9, 'Relações com outros nós', renderRelations(input.close.relations))}
    ${block(10, 'O que não sabemos', renderFichaLine(input.close.unknown))}
    ${block(11, 'Referências', renderFichaLine(input.close.references))}`;
}

function renderFichaLine(line: FichaLine): string {
  const tone = line.published ? 'ficha-card' : 'ficha-card report-gap';
  return `<article class="${tone}"><p>${escapeHtml(line.body)}</p></article>`;
}

function renderFichaAction(action: FichaAction): string {
  if (!action.published) return renderFichaLine(action);
  const meta = [
    action.cynefin ? `<p><strong>Cynefin.</strong> ${escapeHtml(cynefinLine(action.cynefin))}</p>` : '',
    action.evidenceGrade ? `<p><strong>Grau de evidência.</strong> ${escapeHtml(action.evidenceGrade)}</p>` : '',
    action.learningMode ? `<p><strong>Forma de aprendizado.</strong> ${escapeHtml(learningModeReading[action.learningMode])}</p>` : '',
  ].join('');
  const grades = (['A', 'B', 'C', 'D'] as const satisfies readonly EvidenceGrade[]);
  const legend = action.evidenceGrade
    ? `<ul class="ficha-evidence-legend">${grades.map((grade) => `<li><strong>${grade}</strong> — ${escapeHtml(evidenceGradeReading[grade])}</li>`).join('')}</ul>`
    : '';
  return `<article class="ficha-experiment"><p class="report-kicker">Menor experimento</p><p>${escapeHtml(action.body)}</p>${meta}${legend}</article>`;
}

function renderRelations(relations: FichaRelations): string {
  if (!relations.published) return `<article class="ficha-card report-gap"><p>${escapeHtml(relations.body)}</p></article>`;
  const items = relations.edges.map((edge) => `<li>${escapeHtml(edge.text)}</li>`).join('');
  return `<article class="ficha-card"><ul class="ficha-relations">${items}</ul></article>`;
}

function renderReported(readings: ReportedReadings): string {
  if (readings.gap) return `<p class="report-gap">${escapeHtml(readings.gap)}</p>`;
  const list = (title: string, accounts: ReportedReadings['perspectives']) => accounts.length === 0
    ? ''
    : `<h3>${escapeHtml(title)}</h3>${accounts.map((account) => `<p><strong>${escapeHtml(account.label)}</strong> ${escapeHtml(account.body)}</p>`).join('')}`;
  const withheld = readings.withheld.map((line) => `<p class="report-gap">${escapeHtml(line)}</p>`).join('');
  return `${list('Por perspectiva', readings.perspectives)}${list('Por time', readings.units)}${withheld}`;
}

const howItIsLegend =
  'Estágio de 0 a 4 (0 Não existe · 1 Esporádico · 2 Repetível · 3 Consistente · 4 Adaptativo). Cada ponto é 1 de 20 cenários igualmente prováveis: quanto mais espalhados, menos certeza.';

function renderHowItIs(how: HowItIs): string {
  const quadrant = how.quadrant.published ? `<p>${escapeHtml(how.quadrant.conduct)}</p>` : '';
  if (!how.stage.published) {
    return `<p class="report-gap">${escapeHtml(how.stage.gap)}</p>${quadrant}`;
  }
  const columns = how.stage.series.length > 0
    ? how.stage.series.map((series) => renderPerspectiveColumn(series.label, series.reading, series.target))
    : [renderPerspectiveColumn('Combinado', how.stage.reading, how.stage.target)];
  const heading = how.stage.series.length > 0
    ? '<p class="report-kicker">Por perspectiva, lado a lado</p>'
    : '';
  const withheld = how.stage.withheld.map((line) => `<p class="report-gap">${escapeHtml(line)}</p>`).join('');
  return `<p>${escapeHtml(howItIsLegend)}</p>${heading}<div class="ficha-perspective-columns">${columns.join('')}</div>${withheld}${quadrant}`;
}

function renderPerspectiveColumn(label: string, reading: StageReading, target?: number): string {
  const targetLine = target === undefined ? '' : `<p>alvo ${target}%</p>`;
  const bins = ([0, 1, 2, 3, 4] as const)
    .map((stage) => {
      const dots = reading.cloud
        .filter((value) => value === stage)
        .map(() => `<i class="ficha-stage-dot" data-stage="${stage}"></i>`)
        .join('');
      return `<div class="ficha-stage-bin" data-stage="${stage}">${dots}</div>`;
    })
    .join('');
  return `<div class="ficha-perspective-column"><p><strong>${escapeHtml(label)}</strong></p><p class="ficha-stage-reading"><span class="ficha-stage-index">${reading.index}%</span><span class="ficha-stage-band">faixa ${reading.band[0]}–${reading.band[1]}%</span></p>${targetLine}<div class="ficha-stage-cloud" aria-hidden="true">${bins}</div></div>`;
}

export function renderTreatmentPage(plan: {
  active: TreatmentConduct[];
  waiting: TreatmentConduct[];
  deferred: TreatmentConduct[];
  pulse: PulseCatalogItem[];
}, evidenceGap?: string): string {
  const published = [...plan.active, ...plan.waiting, ...plan.deferred];
  const grades = evidenceGap
    ? `<p class="report-gap">${escapeHtml(evidenceGap)}</p>`
    : '<p>O grau A–D descreve a base da prática, não o suporte local da amostra. Condutas D só entram como experimento explícito.</p>';
  const pulse = plan.pulse.length
    ? `<p>3 a 6 itens-âncora das folhas tratadas, nas mesmas unidades. Mudança só com P(melhora) ≥ 0,8.</p><ul>${plan.pulse.map((item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.prompt)} <span class="report-meta">(${item.intervalWeeks.min}–${item.intervalWeeks.max} semanas · ${escapeHtml(item.leafId)})</span></li>`).join('')}</ul>`
    : '<p class="report-gap">Ainda não há folhas tratadas com item-âncora de pulso no catálogo.</p>';
  const domains = (['clear', 'complicated', 'complex', 'chaotic'] as const).map((domain) => `<li>${escapeHtml(cynefinLine(domain))}</li>`).join('');
  const matrix = published.length ? renderTreatmentMatrix(projectTreatmentMatrix(published)) : '';
  const gap = published.length ? '' : '<p class="report-gap">Ainda não há conduta publicada neste plano.</p>';
  return `<header class="report-hero"><p class="report-kicker">Plano de tratamento</p><h1>Quem faz o quê, e em que ordem</h1></header>
    ${matrix}${gap}
    <section class="report-block"><h2>Pulso · 4–8 semanas</h2>${pulse}</section>
    <section class="report-block"><h2>Domínio Cynefin</h2><ul>${domains}</ul>${grades}</section>`;
}

function renderMatrixCardNotes(item: TreatmentConduct): string {
  const parts = [
    item.cynefin ? `<p>${escapeHtml(cynefinLine(item.cynefin))}</p>` : '',
    item.evidenceGrade
      ? `<p>Evidência ${item.evidenceGrade}. ${escapeHtml(evidenceGradeReading[item.evidenceGrade])}.</p>${item.evidenceGrade === 'D' ? '<p>Conduta D entra como experimento explícito.</p>' : ''}`
      : '',
    item.archetype
      ? `<p>Arquétipo (padrão provável): ${escapeHtml(item.archetype)}.${item.prognosisWithoutTreatment ? ` Sem tratamento: ${escapeHtml(item.prognosisWithoutTreatment)}` : ''}</p>`
      : '',
    item.learningMode
      ? `<p>Modalidade de aprendizado: ${escapeHtml(learningModeReading[item.learningMode])}.</p>`
      : '',
    item.unlocks?.length
      ? `<p>Desbloqueia: ${escapeHtml(item.unlocks.join('; '))}.</p>`
      : '',
    item.lowTransferWarning
      ? '<p class="report-gap">Aviso: baixa transferência — treinamento sem mudar o ambiente raramente vira prática.</p>'
      : '',
    item.doesNotSolve
      ? `<p><strong>O que este caminho não resolve.</strong> ${escapeHtml(item.doesNotSolve)}</p>`
      : '',
  ].filter(Boolean);
  if (!parts.length) return '';
  return `<details class="treatment-matrix-card-notes"><summary>Notas</summary>${parts.join('')}</details>`;
}

function renderMatrixCard(item: TreatmentConduct, order: number, now: boolean): string {
  const dependency = item.dependency
    ? `<p class="treatment-matrix-card-depends">${escapeHtml(item.dependency)}</p>`
    : '';
  const cynefin = item.cynefin
    ? `<span class="treatment-matrix-pill treatment-matrix-pill--cynefin">${escapeHtml(cynefinLine(item.cynefin).split(' — ')[0]!)}</span>`
    : '';
  const evidence = item.evidenceGrade
    ? `<span class="treatment-matrix-pill treatment-matrix-pill--evidence">Evidência ${item.evidenceGrade}</span>`
    : '';
  const pills = cynefin || evidence
    ? `<div class="treatment-matrix-card-pills">${cynefin}${evidence}</div>`
    : '';
  const nowClass = now ? ' treatment-matrix-card--now' : '';
  return `<article class="treatment-matrix-card${nowClass}"><p class="treatment-matrix-card-order">${order}</p>${dependency}<p class="treatment-matrix-card-action">${escapeHtml(item.action)}</p><p class="treatment-matrix-card-owner">${escapeHtml(item.owner)}</p><p class="treatment-matrix-card-success">${escapeHtml(item.success)}</p>${pills}${renderMatrixCardNotes(item)}</article>`;
}

function renderAuthorityBars(activeCount: number, totalCount: number): string {
  if (totalCount <= 0) return '';
  const bars = Array.from({ length: totalCount }, (_, index) => {
    const on = index < activeCount ? ' treatment-matrix-bar--on' : '';
    return `<i class="treatment-matrix-bar${on}"></i>`;
  }).join('');
  return `<span class="treatment-matrix-bars" aria-hidden="true">${bars}</span>`;
}

function renderTreatmentMatrix(matrix: ReturnType<typeof projectTreatmentMatrix>): string {
  const horizons = ['0-30', '1-3', '3-12'] as const;
  const headers = horizons
    .map((horizon) => {
      const label = horizon === '0-30'
        ? `${matrix.horizonHeaders[horizon]} · ativas agora`
        : matrix.horizonHeaders[horizon];
      return `<div class="treatment-matrix-header">${escapeHtml(label)}</div>`;
    })
    .join('');
  const rows = matrix.rows.map((row) => {
    const cells = horizons.map((horizon) => {
      const items = row.cells[horizon];
      const now = horizon === '0-30';
      const body = items.map((item, index) => renderMatrixCard(item, index + 1, now)).join('');
      const nowClass = now ? ' treatment-matrix-cell--now' : ' treatment-matrix-cell--later';
      const nowStyle = now ? ' style="background:var(--accent-soft)"' : '';
      return `<div data-horizon="${horizon}" class="treatment-matrix-cell${nowClass}"${nowStyle}>${body}</div>`;
    }).join('');
    return `<div class="treatment-matrix-row" data-authority="${row.authority}"><div class="treatment-matrix-authority"><p class="treatment-matrix-label">${escapeHtml(row.label)}</p><p class="treatment-matrix-subtitle">${escapeHtml(row.subtitle)}</p><p class="treatment-matrix-active"><strong>Ativas: ${row.activeCount} de ${row.totalCount}</strong>${renderAuthorityBars(row.activeCount, row.totalCount)}</p></div>${cells}</div>`;
  }).join('');
  return `<div class="treatment-matrix"><div class="treatment-matrix-head"><div class="treatment-matrix-corner"></div>${headers}</div>${rows}</div>`;
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

function readinessBandMeta(band: ReadinessAssessment['band']): { className: 'ready' | 'near' | 'blocked'; label: string } {
  if (band === 'ready') return { className: 'ready', label: 'Pronto' };
  if (band === 'near') return { className: 'near', label: 'Perto' };
  return { className: 'blocked', label: 'Não pronto' };
}

function readinessPrereqMeta(probability: number): { marker: string; status: string } {
  if (probability >= 0.6) return { marker: '●', status: 'atendido' };
  if (probability >= 0.25) return { marker: '◐', status: 'parcial' };
  return { marker: '○', status: 'não atendido' };
}

function readinessPercent(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

export function renderReadinessPage(items: Array<{ id?: string; label: string; assessment?: ReadinessAssessment; gap?: string; verdict?: ReturnType<typeof bottleneckStatus>; nextStep?: string; conduct?: string; withheld?: string; premature?: boolean }>): string {
  const cards = items.map((item) => {
    if (item.gap || !item.assessment) return `<article class="report-block"><h2>${escapeHtml(item.label)}</h2><p class="report-gap">${escapeHtml(item.gap ?? 'Sem posterior.')}</p></article>`;
    const verdict = item.verdict ?? bottleneckStatus(item.assessment);
    const band = readinessBandMeta(verdict.band);
    const heroPercent = readinessPercent(item.assessment.probability);
    const heroTrack = cssPercent(Math.round(item.assessment.probability * 100));
    const grid = item.assessment.checklist?.length
      ? `<div class="readiness-prereq-grid"><div class="readiness-prereq-head" aria-hidden="true"><span></span><span>Pré-requisito</span><span>Probabilidade de atendido</span><span></span></div>${item.assessment.checklist.map((row) => {
        const { marker, status } = readinessPrereqMeta(row.probability);
        const percent = readinessPercent(row.probability);
        const isBottleneck = row.label === verdict.bottleneck;
        const rowClass = isBottleneck ? 'readiness-prereq-row readiness-prereq-bottleneck' : 'readiness-prereq-row';
        const statusLine = isBottleneck
          ? `${escapeHtml(status)} · <span class="readiness-prereq-bottleneck-label">gargalo</span>`
          : escapeHtml(status);
        return `<div class="${rowClass}"><span class="readiness-prereq-marker" aria-hidden="true">${marker}</span><span class="readiness-prereq-copy"><span class="readiness-prereq-label">${escapeHtml(row.label)}</span><span class="readiness-prereq-status">${statusLine}</span></span><span class="readiness-prereq-track" aria-hidden="true"><span class="readiness-prereq-bar" style="width:${cssPercent(Math.round(row.probability * 100))}"></span></span><span class="readiness-prereq-percent">${percent}</span></div>`;
      }).join('')}</div>`
      : '';
    const premature = item.premature || item.assessment.premature
      ? '<p>Adoção prematura: a fase técnica está à frente de um pré-requisito essencial. É risco do sistema de trabalho, não culpa de uma pessoa.</p>'
      : '';
    const conduct = item.nextStep ?? item.conduct;
    const step = item.withheld
      ? `<p class="report-gap">${escapeHtml(item.withheld)}</p>`
      : conduct
        ? `<p>${escapeHtml(conduct)}</p>`
        : '';
    const summary = `<div><h2>${escapeHtml(item.label)}</h2><span class="readiness ${band.className}">${band.label}</span><p class="readiness-probability-label">Probabilidade de estar pronto hoje</p><p class="readiness-probability">${heroPercent}</p><div class="readiness-probability-track" aria-hidden="true"><i style="width:${heroTrack}"></i></div><p>${escapeHtml(verdict.line)}</p><p>Isto não é índice da organização.</p>${premature}${step}</div>`;
    return `<article class="readiness-card">${summary}${grid}</article>`;
  }).join('');
  return `<header class="report-hero"><p class="report-kicker">Prontidão para práticas avançadas</p><h1>Prontidão para práticas avançadas</h1><p>A probabilidade de pronto nunca passa a ser índice da organização. O gargalo decide.</p></header>
    <p>O essencial mais fraco decide. <span class="readiness ready">Pronto</span> p_k ≥ 0,6 · <span class="readiness near">Perto</span> p_k ≥ 0,25 · <span class="readiness blocked">Não pronto</span> p_k abaixo de 0,25. A conduta é uma linha à parte.</p>
    ${cards}`;
}

export function renderFrontierPage(input: FrontierBrief & { readinessHref?: string; gap?: string }): string {
  const titled = (item: FrontierBrief['mastered'][number]) => (
    item.mark ? `${escapeHtml(item.label)} ${escapeHtml(item.mark)}` : escapeHtml(item.label)
  );
  const place = (items: FrontierBrief['mastered'], empty: string, line: (item: FrontierBrief['mastered'][number]) => string) => (
    items.length ? `<ul>${items.map((item) => `<li>${line(item)}</li>`).join('')}</ul>` : `<p class="report-gap">${escapeHtml(empty)}</p>`
  );
  const start = 'gap' in input.start
    ? `<p class="report-gap">${escapeHtml(input.start.gap)}</p>`
    : `<article class="readiness-card"><div><p class="report-conduct-action">${escapeHtml(input.start.step)}${input.start.mark ? ` ${escapeHtml(input.start.mark)}` : ''}</p><p>Destrava: ${escapeHtml(input.start.unlocks)}</p></div></article>`;
  const href = input.readinessHref ?? '/readiness';
  const gap = input.gap ? `<p class="report-gap">${escapeHtml(input.gap)}</p>` : '';
  const hasMark = [...input.mastered, ...input.learnable, ...input.blocked].some((item) => item.mark);
  if (!hasMark) {
    const parallel = input.parallel.map((item) => `<p><strong>${escapeHtml(item.label)}.</strong> ${escapeHtml(item.body)}</p>`).join('')
      || '<p class="report-gap">Nenhuma condição humana publicada neste grafo.</p>';
    return `<header class="report-hero"><p class="report-kicker">Fronteira de aprendizado</p><h1>O que a organização pode aprender agora</h1><p>Degraus com P(desbloqueado) ≥ 0,6 entram na fronteira; abaixo de 0,25 ficam bloqueados.</p></header>${gap}
    <section class="report-block"><h2>Dominado</h2>${place(input.mastered, 'Nenhum degrau dominado nesta leitura.', (item) => titled(item))}</section>
    <section class="report-block"><h2>Pode aprender agora</h2>${place(input.learnable, 'Nenhum degrau desbloqueado para aprender agora.', (item) => `${titled(item)} — pode aprender agora`)}</section>
    <section class="report-block"><h2>Ainda bloqueado</h2>${place(input.blocked, 'Nenhum degrau bloqueado nesta leitura.', (item) => `${titled(item)} — ainda bloqueado${item.blockedBy.length ? ` · bloqueado por ${escapeHtml(item.blockedBy.join(', '))}` : ''}`)}</section>
    <section class="report-block"><h2>Comece por</h2>${start}</section>
    <section class="report-block"><h2>Em paralelo</h2>${parallel}<p>${escapeHtml(input.advancedAside)}</p><p><a href="${escapeHtml(href)}">Ver prontidão →</a></p></section>`;
  }
  const ladder = projectFrontierLadder(input);
  const parallelLines = input.parallel.map((item) => `<p><strong>${escapeHtml(item.label)}.</strong> ${escapeHtml(item.body)}</p>`).join('');
  const humanConditions = parallelLines
    ? `<div class="frontier-human-conditions">${parallelLines}</div>`
    : '';
  const practiceStatus = (item: FrontierLadderPlace): string => {
    if (item.status === 'mastered') return 'dominado';
    if (item.status === 'learnable') return 'na fronteira: pode aprender agora';
    return item.blockedBy.length
      ? `bloqueado por ${escapeHtml(item.blockedBy.join(', '))}`
      : 'bloqueado';
  };
  const practice = (item: FrontierLadderPlace): string => (
    `<article class="frontier-practice frontier-practice-${item.status}"><p>${escapeHtml(item.label)}${item.mark ? ` ${escapeHtml(item.mark)}` : ''}</p><p>${practiceStatus(item)}</p></article>`
  );
  const rungs = ladder.rungs.map((rung) => {
    const extras = rung.phase === 0 ? humanConditions : '';
    const places = rung.places.map(practice).join('');
    return `<section class="frontier-rung" data-phase="${rung.phase}"><div class="frontier-rung-label"><span class="frontier-rung-phase">${rung.phase}</span><h2 class="frontier-rung-title">${escapeHtml(rung.label)}</h2></div><div>${extras}<div class="frontier-rung-practices">${places}</div></div></section>`;
  }).join('');
  const unplaced = ladder.unplaced.length
    ? `<section class="frontier-unplaced report-block"><h2>Sem marca de sofisticação</h2><ul>${ladder.unplaced.map((item) => `<li>${escapeHtml(item.label)}</li>`).join('')}</ul></section>`
    : '';
  const legend = `<div class="frontier-legend" aria-label="Legenda"><span class="frontier-legend-item"><span class="frontier-legend-swatch frontier-legend-mastered" aria-hidden="true"></span>dominado</span><span class="frontier-legend-item"><span class="frontier-legend-swatch frontier-legend-learnable" aria-hidden="true"></span>na fronteira: pode aprender agora</span><span class="frontier-legend-item"><span class="frontier-legend-swatch frontier-legend-blocked" aria-hidden="true"></span>bloqueado</span></div>`;
  const parallelCard = parallelLines
    || '<p class="report-gap">Nenhuma condição humana publicada neste grafo.</p>';
  const startGrid = `<section class="frontier-start-grid"><article class="frontier-start-card"><p class="frontier-start-kicker">Comece por</p>${start}</article><article class="frontier-start-card"><p class="frontier-start-kicker">Em paralelo</p>${parallelCard}</article><aside class="frontier-start-card"><p class="frontier-start-kicker">Ainda não</p><p>${escapeHtml(input.advancedAside)}</p><p><a href="${escapeHtml(href)}">Ver prontidão →</a></p></aside></section>`;
  return `<header class="report-hero"><p class="report-kicker">Fronteira de aprendizado</p><h1>O que a organização pode aprender agora</h1><p>Degraus com P(desbloqueado) ≥ 0,6 entram na fronteira; abaixo de 0,25 ficam bloqueados.</p></header>${gap}
    ${legend}<div class="frontier-ladder">${rungs}</div>${unplaced}${startGrid}`;
}

type HistoryReadingView = {
  label: string;
  index: number;
  band: [number, number];
  target?: number;
};

function renderHistoryCompare(previous: HistoryReadingView, current: HistoryReadingView): string {
  const row = (reading: HistoryReadingView, emphasis: boolean) => {
    const labelClass = emphasis ? 'history-compare-label history-compare-label--current' : 'history-compare-label';
    return `<div class="history-compare-row"><span class="${labelClass}">${escapeHtml(reading.label)}</span><span class="history-compare-index">${reading.index}%</span><span class="history-compare-band-text">faixa ${reading.band[0]}–${reading.band[1]}%</span></div>`;
  };
  const previousLeft = clampPercent(previous.band[0]);
  const previousWidth = Math.max(0, clampPercent(previous.band[1]) - previousLeft);
  const currentLeft = clampPercent(current.band[0]);
  const currentWidth = Math.max(0, clampPercent(current.band[1]) - currentLeft);
  const showTargets = previous.target !== undefined && current.target !== undefined;
  const targets = showTargets
    ? `<i class="history-compare-target" style="left:${cssPercent(previous.target!)}"></i><i class="history-compare-target" style="left:${cssPercent(current.target!)}"></i>`
    : '';
  const bands = `<div class="history-compare-bands" aria-hidden="true"><i class="history-compare-band history-compare-band--previous" style="left:${cssPercent(previousLeft)};width:${cssPercent(previousWidth)}"></i><i class="history-compare-marker history-compare-marker--previous" style="left:${cssPercent(previous.index)}"></i><i class="history-compare-band history-compare-band--current" style="left:${cssPercent(currentLeft)};width:${cssPercent(currentWidth)}"></i><i class="history-compare-marker history-compare-marker--current" style="left:${cssPercent(current.index)}"></i>${targets}</div>`;
  return `<section class="history-compare"><h2>Comparação</h2>${row(previous, false)}${row(current, true)}${bands}</section>`;
}

function renderHistoryChangeGrid(evolution?: EvolutionReport): string {
  const advanced = evolution?.nodes.filter((node) => node.state === 'advanced') ?? [];
  const regressed = evolution?.nodes.filter((node) => node.state === 'regressed') ?? [];
  const column = (heading: string, nodes: Array<{ label: string }>) => {
    const body = nodes.length
      ? `<ul>${nodes.map((node) => `<li>${escapeHtml(node.label)}</li>`).join('')}</ul>`
      : '<p class="report-gap">Nenhuma mudança publicada neste intervalo.</p>';
    return `<div class="history-change-column"><h3>${heading}</h3>${body}</div>`;
  };
  return `<section class="history-change-grid">${column('Melhorou', advanced)}${column('Piorou', regressed)}</section>`;
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
  targetChip?: string;
  previousReading?: HistoryReadingView;
  currentReading?: HistoryReadingView;
} = {}): string {
  const {
    change,
    gap,
    pImprove,
    pRegress,
    pStable,
    threshold = 0.8,
    evolution,
    caution,
    capabilityGap,
    targetChip,
    previousReading,
    currentReading,
  } = input;
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
  const chip = targetChip ? `<p class="history-target">${escapeHtml(targetChip)}</p>` : '';
  const hasPair = previousReading !== undefined && currentReading !== undefined;
  const compare = hasPair ? renderHistoryCompare(previousReading, currentReading) : '';
  const changeGrid = hasPair ? renderHistoryChangeGrid(evolution) : '';
  return `<header class="report-hero"><p class="report-kicker">Histórico e reavaliação</p><h1>Compare duas leituras</h1><p>Cada avaliação fica guardada como uma leitura. Mudança só com P(melhora), P(piora) ou P(estável) ≥ ${threshold.toFixed(2)}.</p>${selector}</header>${body}${chip}${compare}${evolution ? renderEvolution(evolution) : ''}${changeGrid}${leaves}${note}`;
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
