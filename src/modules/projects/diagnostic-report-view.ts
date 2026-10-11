import { escapeHtml } from '../../shared/html.js';
import type { DiagnosticLaudo, AudienceVerb } from '../inference/domain/diagnostic-report.js';
import type { TreatmentConduct } from '../inference/domain/treatment-contract.js';
import { cynefinReading, evidenceGradeReading } from '../inference/domain/treatment-contract.js';
import type { PulseCatalogItem } from '../catalog/item-catalog.js';
import type { OrganizationalAreaMap, OrganizationalAreaNode } from '../inference/domain/organizational-areas.js';
import type { ReadinessAssessment } from '../inference/domain/advanced-readiness.js';
import type { FrontierNode } from '../inference/domain/learning-frontier.js';
import type { AreaWalkthrough } from '../inference/domain/area-walkthrough.js';

export type ReportPageId = 'laudo' | 'map' | 'node' | 'readiness' | 'frontier' | 'treatment' | 'walkthrough' | 'history' | 'audiences';

const NAV: Array<{ id: ReportPageId; label: string; href: (base: string) => string }> = [
  { id: 'laudo', label: 'Laudo', href: (base) => base },
  { id: 'map', label: 'Mapa', href: (base) => `${base}/map` },
  { id: 'readiness', label: 'Prontidão para práticas avançadas', href: (base) => `${base}/readiness` },
  { id: 'frontier', label: 'Fronteira de aprendizado', href: (base) => `${base}/frontier` },
  { id: 'treatment', label: 'Plano de tratamento', href: (base) => `${base}/treatment` },
  { id: 'walkthrough', label: 'Área: Produto', href: (base) => `${base}/walkthrough/product` },
  { id: 'walkthrough', label: 'Área: Engenharia', href: (base) => `${base}/walkthrough/engineering` },
  { id: 'walkthrough', label: 'Área: Operação', href: (base) => `${base}/walkthrough/operations` },
  { id: 'walkthrough', label: 'Área: Organização', href: (base) => `${base}/walkthrough/organization` },
  { id: 'history', label: 'Histórico e reavaliação', href: (base) => `${base}/history` },
  { id: 'audiences', label: 'Visão por público', href: (base) => `${base}/audiences` },
];

export function renderReportShell(input: {
  page: ReportPageId;
  base: string;
  projectName: string;
  body: string;
  nodeLabel?: string;
}): string {
  const links = NAV.map((item) => {
    const current = item.id === input.page ? ' aria-current="page"' : '';
    return `<a${current} href="${escapeHtml(item.href(input.base))}">${escapeHtml(item.label)}</a>`;
  }).join('');
  const node = input.nodeLabel
    ? `<a href="${escapeHtml(`${input.base}/nodes/${encodeURIComponent(input.nodeLabel)}`)}">Ficha: ${escapeHtml(input.nodeLabel)}</a>`
    : '';
  return `<div class="diagnostic-report" data-theme="claro">
    <aside class="report-sidebar">
      <div class="report-brand"><strong>Anamnese de Tecnologia</strong><span>${escapeHtml(input.projectName)}</span></div>
      <nav aria-label="Relatório">${links}${node}</nav>
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
  const complaint = `<section class="report-block"><h2>Motivo da avaliação</h2><p class="report-gap">${escapeHtml(laudo.complaint.gap)}</p></section>`;
  const reading = 'gap' in laudo.reading
    ? `<section class="report-block"><h2>Leitura geral</h2><p class="report-gap">${escapeHtml(laudo.reading.gap)}</p></section>`
    : `<section class="report-block"><h2>Leitura geral</h2><p class="report-index">${laudo.reading.index}%</p><p>faixa ${laudo.reading.band[0]}–${laudo.reading.band[1]}% · cobertura ${Math.round(laudo.reading.coverage * 100)}%${laudo.reading.target !== undefined ? ` · alvo ${laudo.reading.target}%` : ''}</p><p>${escapeHtml(laudo.reading.narrative)}</p></section>`;
  const findings = laudo.findings.map((finding) => (
    `<article class="report-finding"><p class="report-kicker">${finding.order}</p><h3 class="executive-reading">${escapeHtml(finding.title)}</h3><p>${escapeHtml(finding.reading)}</p><p>${escapeHtml(finding.path)} · ${finding.areas} ${finding.areas === 1 ? 'área afetada' : 'áreas afetadas'} · ${escapeHtml(finding.support)}</p><p><a href="${escapeHtml(`${urls.capabilityBase}/${finding.nodeId}`)}">Ver ficha →</a></p></article>`
  )).join('');
  const others = laudo.otherFindings.length
    ? `<ul class="report-other">${laudo.otherFindings.map((title) => `<li>${escapeHtml(title)}</li>`).join('')}</ul>`
    : '';
  const divergences = Array.isArray(laudo.divergences)
    ? laudo.divergences.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join('')
    : `<p class="report-gap">${escapeHtml(laudo.divergences.gap)}</p>`;
  const constraint = 'gap' in laudo.constraint
    ? `<p class="report-gap">${escapeHtml(laudo.constraint.gap)}</p>`
    : `<h3>${escapeHtml(laudo.constraint.title)}</h3><p>${escapeHtml(laudo.constraint.body)}</p>`;
  const conduct = laudo.conduct.map((item, index) => renderConduct(item, index + 1)).join('')
    || '<p class="report-gap">Nenhuma conduta de 30 dias foi publicada.</p>';
  const unknowns = laudo.unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<header class="report-hero"><p class="report-kicker">Laudo · primeira página</p><h1>Diagnóstico da área de tecnologia</h1><p class="report-note">Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas nem como meta de bônus.</p></header>
    ${complaint}${reading}
    <section class="report-block"><h2>Achados</h2><p>O que está acontecendo, em ordem de impacto no que as entrevistas sustentaram.</p>${findings}${others}</section>
    <section class="report-block"><h2>Divergências</h2>${divergences}</section>
    <section class="report-block"><h2>Restrição principal</h2>${constraint}</section>
    <section class="report-block"><h2>Conduta para 30 dias</h2>${conduct}<p><a href="${escapeHtml(`${urls.reportBase}/treatment`)}">Ver o plano de tratamento completo →</a></p></section>
    <section class="report-block"><h2>Prognóstico</h2><p class="report-gap">${escapeHtml(laudo.prognosis.gap)}</p></section>
    <section class="report-block"><h2>O que ainda não sabemos</h2><ul>${unknowns}</ul><p>Exames complementares sugeridos ficam neste bloco até existir página própria.</p></section>
    ${renderFooter(laudo)}`;
}

function renderConduct(item: TreatmentConduct, order: number): string {
  const cynefin = item.cynefin ? `<p>Domínio: ${escapeHtml(cynefinReading[item.cynefin])}.</p>` : '';
  const grade = item.evidenceGrade
    ? `<p>Grau de evidência ${item.evidenceGrade}: ${escapeHtml(evidenceGradeReading[item.evidenceGrade])}.</p>`
    : '';
  const archetype = item.archetype
    ? `<p>Arquétipo (padrão provável): ${escapeHtml(item.archetype)}.${item.prognosisWithoutTreatment ? ` Sem tratamento: ${escapeHtml(item.prognosisWithoutTreatment)}` : ''}</p>`
    : '';
  const limit = item.doesNotSolve ? `<p><strong>O que este caminho não resolve.</strong> ${escapeHtml(item.doesNotSolve)}</p>` : '';
  return `<article class="report-conduct"><p class="report-kicker">${order || ''}</p><p><strong>${escapeHtml(item.action)}</strong></p><p>Dono provável: ${escapeHtml(item.owner)}</p><p>Critério de sucesso: ${escapeHtml(item.success)}</p>${cynefin}${grade}${archetype}${limit}</article>`;
}

function renderFooter(laudo: DiagnosticLaudo): string {
  return `<footer class="report-footer"><p>Aviso de uso. Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas nem como meta de bônus.</p><p>Amostra desta leitura. ${escapeHtml(laudo.footer.sample)}</p><p>${escapeHtml(laudo.footer.instrument)} · ${escapeHtml(laudo.footer.calibration)}</p></footer>`;
}

export function renderMapPage(input: {
  map: OrganizationalAreaMap;
  cut: 'cap' | 'est' | 'per';
  areaBase: string;
  capabilityBase: string;
  units: Array<{ path: string; completed: number }>;
  perspectives: Array<{ title: string }>;
}): string {
  const tabs = [
    ['cap', 'Por capacidade'],
    ['est', 'Por estrutura'],
    ['per', 'Por perspectiva'],
  ].map(([id, label]) => `<a role="tab" aria-selected="${input.cut === id ? 'true' : 'false'}" href="?cut=${id}">${label}</a>`).join('');
  const body = input.cut === 'est'
    ? renderStructureCut(input.units, input.map)
    : input.cut === 'per'
      ? renderPerspectiveCut(input.perspectives)
      : renderCapabilityCut(input.map, input.areaBase, input.capabilityBase);
  return `<header class="report-hero"><p class="report-kicker">Mapa navegável</p><h1>Onde está cada parte do sistema</h1><p>Abra um bloco para descer até a capacidade. Célula sem cobertura não é zero.</p></header>
    <div class="report-tabs" role="tablist" aria-label="Corte">${tabs}</div>
    ${body}
    <p class="report-gap">Índice com faixa ainda não entra na célula. O modelo em execução é m1.</p>`;
}

function renderCapabilityCut(map: OrganizationalAreaMap, areaBase: string, capabilityBase: string): string {
  const tiles = map.systems.map((system) => {
    const chips = system.children.map((child) => `<a class="area-chip" href="${escapeHtml(childHref(child, areaBase, capabilityBase))}">${escapeHtml(child.label)}</a>`).join('');
    return `<article class="area-tile${system.observed ? ' observed' : ' unobserved'}" data-area="${escapeHtml(system.id)}"><a href="${escapeHtml(`${areaBase}/${system.id}`)}"><h3>${escapeHtml(system.label)}</h3></a><p class="muted">${system.observed ? `${system.findingCount} ${system.findingCount === 1 ? 'problema' : 'problemas'}` : 'entrevista não atravessou — não conclui ausência'}</p><p class="area-chips">${chips}</p></article>`;
  }).join('');
  return `<section class="area-map" aria-label="Sistemas da organização"><h2>Sistemas da organização</h2><div class="area-map-systems">${tiles}</div></section>`;
}

function childHref(child: OrganizationalAreaNode, areaBase: string, capabilityBase: string): string {
  if (child.kind === 'leaf' && child.leafId) return `${capabilityBase}/${child.leafId}`;
  return `${areaBase}/${child.id}`;
}

function renderStructureCut(units: Array<{ path: string; completed: number }>, map: OrganizationalAreaMap): string {
  if (!units.length) return '<p class="report-gap">Nenhuma unidade com leitura publicada.</p>';
  const headers = map.systems.map((system) => `<th>${escapeHtml(system.label)}</th>`).join('');
  const rows = units.map((unit) => {
    const name = unit.path.split('/').at(-1) ?? unit.path;
    const cells = map.systems.map(() => `<td class="na-cell">${unit.completed < 5 ? 'sem cobertura' : 'agregado'}</td>`).join('');
    return `<tr><th>${escapeHtml(name)} (${unit.completed})</th>${cells}</tr>`;
  }).join('');
  return `<table class="report-matrix"><caption>Times × capacidades. Célula neutra não tem cobertura própria.</caption><thead><tr><th>Unidade</th>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}

function renderPerspectiveCut(perspectives: Array<{ title: string }>): string {
  if (!perspectives.length) return '<p class="report-gap">Nenhuma divergência de perspectiva publicada acima do limiar.</p>';
  return `<ul>${perspectives.map((item) => `<li>${escapeHtml(item.title)}</li>`).join('')}</ul>`;
}

export function renderNodeCard(input: { title: string; path: string; definition: string; reported: string; why: string; where: string; action: string; check: string; preserve: string; relations: string; unknown: string; references: string }): string {
  const block = (heading: string, body: string) => `<section class="report-block"><h2>${escapeHtml(heading)}</h2>${body}</section>`;
  return `<header class="report-hero"><p class="report-kicker">Ficha do nó</p><h1>${escapeHtml(input.title)}</h1><p>${escapeHtml(input.path)}</p></header>
    ${block('O que é e por que importa', `<p>${escapeHtml(input.definition)}</p>`)}
    ${block('Como está', '<p class="report-gap">Distribuição de estágio 0–4 ainda não é publicada. A estimativa ordinal interna continua no detalhe abaixo, sem índice percentual.</p>')}
    ${block('O que as pessoas relataram', input.reported)}
    ${block('Por que provavelmente acontece', `<p>${escapeHtml(input.why)}</p>`)}
    ${block('Onde se resolve', `<p>${escapeHtml(input.where)}</p>`)}
    ${block('O que fazer', `<p>${escapeHtml(input.action)}</p>`)}
    ${block('Como saber se funcionou', `<p>${escapeHtml(input.check)}</p>`)}
    ${block('O que já funciona', `<p>${escapeHtml(input.preserve)}</p>`)}
    ${block('Relações com outros nós', `<p>${escapeHtml(input.relations)}</p>`)}
    ${block('O que não sabemos', `<p>${escapeHtml(input.unknown)}</p>`)}
    ${block('Referências', `<p>${escapeHtml(input.references)}</p>`)}`;
}

export function renderTreatmentPage(
  active: TreatmentConduct[],
  later: TreatmentConduct[],
  evidenceGap?: string,
  pulse: PulseCatalogItem[] = [],
): string {
  const list = (items: TreatmentConduct[]) => items.map((item, index) => renderConduct(item, index + 1)).join('') || '<p class="report-gap">Nenhuma conduta neste horizonte.</p>';
  const grades = evidenceGap
    ? `<p class="report-gap">${escapeHtml(evidenceGap)}</p>`
    : '<p>O grau A–D descreve a base da prática, não o suporte local da amostra. Condutas D só entram como experimento explícito.</p>';
  const pulseList = pulse.length
    ? `<ul>${pulse.map((item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.prompt)} <span class="report-meta">(${item.intervalWeeks.min}–${item.intervalWeeks.max} semanas · ${escapeHtml(item.leafId)})</span></li>`).join('')}</ul>`
    : '<p class="report-gap">Ainda não há folhas tratadas com item-âncora de pulso no catálogo.</p>';
  return `<header class="report-hero"><p class="report-kicker">Plano de tratamento</p><h1>Quem faz o quê, e em que ordem</h1></header>
    <section class="report-block"><h2>0–30 dias · ativas agora</h2>${list(active)}</section>
    <section class="report-block"><h2>Depois</h2>${list(later)}</section>
    <section class="report-block"><h2>Pulso · 4–8 semanas</h2><p>3 a 6 itens-âncora das folhas tratadas, nas mesmas unidades. Mudança só com P(melhora) ≥ 0,8.</p>${pulseList}</section>
    <section class="report-block"><h2>Domínio Cynefin</h2><ul><li>Claro — a resposta é conhecida: aplicar</li><li>Complicado — exige análise de especialista</li><li>Complexo — só se descobre testando: experimento pequeno</li><li>Caótico — agir primeiro para estabilizar</li></ul>${grades}</section>`;
}

export function renderAudiencePage(groups: Array<{ title: string; verbs: AudienceVerb[] }>): string {
  const body = groups.length
    ? groups.map((group) => `<section class="report-block"><h2>${escapeHtml(group.title)}</h2>${group.verbs.map((verb) => `<p><strong>${escapeHtml(verb.label)}.</strong> ${escapeHtml(verb.ask)}</p>`).join('')}</section>`).join('')
    : '<p class="report-gap">Nenhum achado publicado para reescrever por público.</p>';
  return `<header class="report-hero"><p class="report-kicker">Visão por público</p><h1>O mesmo achado, para quem decide e para quem faz</h1><p>O conteúdo é o mesmo. Muda o que cada público precisa fazer com ele.</p></header>${body}`;
}

export function renderWalkthrough(input: AreaWalkthrough): string {
  const list = (heading: string, lines: string[]) =>
    `<section class="report-block"><h2>${heading}</h2><ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul></section>`;
  const block = (heading: string, body: string) => `<section class="report-block"><h2>${heading}</h2><p>${escapeHtml(body)}</p></section>`;
  const path = input.sections.path;
  return `<header class="report-hero"><p class="report-kicker">Walkthrough da área · ${escapeHtml(input.areaLabel)}</p><h1>${escapeHtml(input.areaLabel)}: do que as entrevistas sustentaram para o próximo passo</h1><p>${escapeHtml(input.summary)}</p></header>
    ${list('Onde estamos', input.sections.where)}
    ${block('Como chegamos aqui', input.sections.arrived)}
    ${block('O que já funciona', input.sections.working)}
    ${list('Próxima fase', input.sections.next)}
    ${list('Caminho', [
      `30 dias: ${path.d30}`,
      `90 dias: ${path.d90}`,
      `180 dias: ${path.d180}`,
    ])}
    ${list('Marcos', input.sections.milestones)}
    ${list('Riscos de regressão', input.sections.risks)}
    ${list('Premissas a revisar', input.sections.assumptions)}`;
}

export function renderReadinessPage(items: Array<{ label: string; assessment?: ReadinessAssessment; gap?: string }>): string {
  const cards = items.map((item) => {
    if (item.gap || !item.assessment) return `<article class="report-block"><h2>${escapeHtml(item.label)}</h2><p class="report-gap">${escapeHtml(item.gap ?? 'Sem posterior.')}</p></article>`;
    const band = item.assessment.band === 'ready' ? 'Pronto' : item.assessment.band === 'near' ? 'Perto' : 'Não pronto';
    return `<article class="report-block"><h2>${escapeHtml(item.label)}</h2><p>${band} · P(pronto) ${item.assessment.probability}</p>${item.assessment.premature ? '<p>Adoção prematura: a fase técnica está à frente de um pré-requisito essencial.</p>' : ''}</article>`;
  }).join('');
  return `<header class="report-hero"><p class="report-kicker">Prontidão para práticas avançadas</p><h1>Prontidão para práticas avançadas</h1><p>A probabilidade de pronto nunca passa a ser índice da organização.</p></header>
    <p><span class="readiness ready">Pronto</span> pré-requisitos atendidos · <span class="readiness near">Perto</span> um pré-requisito faltando · <span class="readiness blocked">Não pronto</span> gargalo sem conduta que destrave</p>
    ${cards}`;
}

export function renderFrontierPage(nodes: FrontierNode[], gap?: string): string {
  const list = nodes.length
    ? `<ul>${nodes.map((node) => `<li>${escapeHtml(node.id)} — ${node.learnable ? 'pode aprender agora' : `bloqueado por ${escapeHtml(node.blockedBy.join(', '))}`}</li>`).join('')}</ul>`
    : `<p class="report-gap">${escapeHtml(gap ?? 'Sem fronteira publicada.')}</p>`;
  return `<header class="report-hero"><p class="report-kicker">Fronteira de aprendizado</p><h1>O que a organização pode aprender agora</h1></header>${list}`;
}

export function renderHistoryPage(input: {
  change?: string;
  gap?: string;
  pImprove?: number;
  pRegress?: number;
  threshold?: number;
} = {}): string {
  const { change, gap, pImprove, pRegress, threshold = 0.8 } = input;
  const probs = pImprove !== undefined && pRegress !== undefined
    ? `<p>P(melhora) ${pImprove.toFixed(2)} · P(piora) ${pRegress.toFixed(2)} · limiar ${threshold.toFixed(2)} (05 §9).</p>`
    : '';
  const body = gap
    ? `<p class="report-gap">${escapeHtml(gap)}</p>`
    : `<p>${change === 'improved' ? 'Melhorou: P(melhora) atingiu o limiar de publicação.' : change === 'regressed' ? 'Piorou: P(piora) atingiu o limiar de publicação.' : 'Incerto: ainda não há evidência suficiente de melhora ou piora.'}</p>${probs}`;
  return `<header class="report-hero"><p class="report-kicker">Histórico e reavaliação</p><h1>Compare duas leituras</h1><p>Cada avaliação fica guardada como uma leitura. Mudança só com P(melhora) ou P(piora) ≥ ${threshold.toFixed(2)}.</p></header>${body}`;
}
