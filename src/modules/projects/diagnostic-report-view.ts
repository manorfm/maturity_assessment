import { escapeHtml } from '../../shared/html.js';
import { CapabilityTaxonomy } from '../inference/domain/capability-taxonomy.js';
import { uniqueFindingsByPattern, type OutcomeFinding } from '../inference/domain/report-outcome.js';
import type { DiagnosticLaudo, AudienceVerb } from '../inference/domain/diagnostic-report.js';
import type { TreatmentConduct } from '../inference/domain/treatment-contract.js';
import { cynefinReading, evidenceGradeReading, learningModeReading } from '../inference/domain/treatment-contract.js';
import type { PulseCatalogItem } from '../catalog/item-catalog.js';
import type { OrganizationalAreaMap, OrganizationalAreaNode } from '../inference/domain/organizational-areas.js';
import type { ReadinessAssessment } from '../inference/domain/advanced-readiness.js';
import type { FrontierNode } from '../inference/domain/learning-frontier.js';
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
    return `<article class="report-finding"><div class="report-finding-path"><span>${escapeHtml(finding.path)}</span><span>${finding.order}</span></div><p class="report-finding-fact">${escapeHtml(finding.title)}</p><p>${escapeHtml(finding.reading)}</p><p class="report-finding-meta"><span>${escapeHtml(areas)}</span><span class="report-support"><span aria-hidden="true">${dots}</span>${escapeHtml(finding.support)}</span></p><a href="${escapeHtml(`${urls.capabilityBase}/${finding.nodeId}`)}">Ver ficha →</a></article>`;
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
  const cynefin = item.cynefin ? `<p>Domínio: ${escapeHtml(cynefinReading[item.cynefin])}.</p>` : '';
  const grade = item.evidenceGrade
    ? `<p>Grau de evidência ${item.evidenceGrade}: ${escapeHtml(evidenceGradeReading[item.evidenceGrade])}.</p>`
    : '';
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
  return `<article class="report-conduct"><p class="report-kicker">${order || ''} Experimento</p><p><strong>${escapeHtml(item.action)}</strong></p><p>Dono provável: ${escapeHtml(item.owner)}</p><p>Critério de sucesso: ${escapeHtml(item.success)}</p>${cynefin}${grade}${archetype}${learning}${unlocks}${transfer}${limit}</article>`;
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
  const columns = map.systems.flatMap((system) => system.children);
  const headers = columns.map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`).join('');
  const rows = units.map((unit) => {
    const name = unit.path.split('/').at(-1) ?? unit.path;
    const belowThreshold = unit.completed < 5;
    const cells = columns.map(() => belowThreshold
      ? '<td class="coverage-gap">sem cobertura</td>'
      : '<td class="index-gap">índice não publicado</td>').join('');
    return `<tr><th scope="row">${escapeHtml(name)} (${unit.completed})</th>${cells}</tr>`;
  }).join('');
  return `<section class="report-matrix-block"><div class="report-matrix-legend"><p>Times × capacidades, na ordem da estrutura, não por resultado.</p><p><span class="coverage-swatch" aria-hidden="true"></span>sem cobertura</p><p>Estimativa, faixa e alvo só entram quando o modelo publicar a célula.</p></div><table class="report-matrix"><thead><tr><th></th>${headers}</tr></thead><tbody>${rows}</tbody></table></section>`;
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
    const checklist = item.assessment.checklist?.length
      ? `<ul class="readiness-checklist">${item.assessment.checklist.map((row) => (
        `<li>${escapeHtml(row.label)}${row.essential ? ' (essencial)' : ''}: p_k ${row.probability.toFixed(2)}</li>`
      )).join('')}</ul>`
      : '';
    return `<article class="report-block"><h2>${escapeHtml(item.label)}</h2><p>${band} · P(pronto) ${item.assessment.probability}</p>${item.assessment.premature ? '<p>Adoção prematura: a fase técnica está à frente de um pré-requisito essencial.</p>' : ''}<p>Checklist de pré-requisitos</p>${checklist}</article>`;
  }).join('');
  return `<header class="report-hero"><p class="report-kicker">Prontidão para práticas avançadas</p><h1>Prontidão para práticas avançadas</h1><p>A probabilidade de pronto nunca passa a ser índice da organização.</p></header>
    <p><span class="readiness ready">Pronto</span> pré-requisitos atendidos · <span class="readiness near">Perto</span> um pré-requisito faltando · <span class="readiness blocked">Não pronto</span> gargalo sem conduta que destrave</p>
    ${cards}`;
}

export function renderFrontierPage(nodes: FrontierNode[], gap?: string): string {
  const list = nodes.length
    ? `<ul>${nodes.map((node) => {
      const title = escapeHtml(node.label ?? node.id);
      if (node.band === 'near') {
        return `<li>${title} — Perto${node.blockedBy.length ? ` · falta ${escapeHtml(node.blockedBy.join(', '))}` : ''}</li>`;
      }
      if (node.learnable || node.band === 'frontier') {
        return `<li>${title} — pode aprender agora</li>`;
      }
      return `<li>${title} — bloqueado por ${escapeHtml(node.blockedBy.join(', ') || 'pré-requisito sem evidência')}</li>`;
    }).join('')}</ul>`
    : `<p class="report-gap">${escapeHtml(gap ?? 'Sem fronteira publicada.')}</p>`;
  return `<header class="report-hero"><p class="report-kicker">Fronteira de aprendizado</p><h1>O que a organização pode aprender agora</h1><p>Degraus com P(desbloqueado) ≥ 0,6 entram na fronteira; abaixo de 0,25 ficam bloqueados.</p></header>${list}`;
}

export function renderHistoryPage(input: {
  change?: string;
  gap?: string;
  pImprove?: number;
  pRegress?: number;
  pStable?: number;
  threshold?: number;
  evolution?: EvolutionReport;
} = {}): string {
  const { change, gap, pImprove, pRegress, pStable, threshold = 0.8, evolution } = input;
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
  return `<header class="report-hero"><p class="report-kicker">Histórico e reavaliação</p><h1>Compare duas leituras</h1><p>Cada avaliação fica guardada como uma leitura. Mudança só com P(melhora), P(piora) ou P(estável) ≥ ${threshold.toFixed(2)}.</p></header>${body}${evolution ? renderEvolution(evolution) : ''}`;
}

function renderEvolution(report: EvolutionReport): string {
  const stateLabel = { advanced: 'Avançou', regressed: 'Regrediu', stable: 'Estável', uncertain: 'Incerto' } as const;
  const nodes = report.nodes.length
    ? `<ul>${report.nodes.map((node) => `<li><strong>${escapeHtml(node.label)}</strong> — ${stateLabel[node.state]}. ${escapeHtml(node.reading)}</li>`).join('')}</ul>`
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
