import type { FastifyInstance } from 'fastify';
import { escapeHtml, layout } from '../../shared/html.js';
import { profiles, graph } from '../catalog/assessment-graph.js';
import { InferenceService } from '../inference/inference-service.js';
import { PilotService } from '../inference/pilot-service.js';
import { INITIAL_COGNITIVE_PILOT_SIZE, PILOT_THRESHOLDS } from '../inference/domain/pilot-policy.js';
import { InvitationService } from '../assessments/invitation-service.js';
import { ProjectService } from './project-service.js';
import type { Database } from '../../shared/database.js';
import type { DiagnosticPosterior } from '../inference/domain/bayesian-inference-engine.js';
import { CapabilityTaxonomy, organizationalCapabilityIds } from '../inference/domain/capability-taxonomy.js';
import { findAreaPath, type OrganizationalAreaMap, type OrganizationalAreaNode } from '../inference/domain/organizational-areas.js';
import { decideReportOutcome, distinctiveScopes, findingScopeOccurrences, uniqueConfirmedCauses, uniqueFindingsByPattern, type ConfirmedCause, type FindingScopeOccurrence, type OutcomeFinding, type ReportOutcome } from '../inference/domain/report-outcome.js';
import { guidanceFor, type SolutionGuidance } from '../inference/domain/solution-guidance.js';
import type { PilotReport } from '../inference/domain/pilot-evaluation.js';
import { DomainValidationError, ResourceNotFoundError } from '../../shared/errors.js';
import { diagnosticSystemFor, groupFindingsByDiagnosticSystem } from '../inference/domain/problem-system.js';
import { classifyPortfolioLevel, type DiagnosticPortfolioLevel } from '../inference/domain/diagnostic-portfolio.js';
import { TransformationPortfolioPlanner, type TransformationPhase } from '../inference/domain/transformation-portfolio.js';
import { AudienceReportProjector, audienceAsk, type AudienceReports, type UnitManagementReport } from '../inference/domain/audience-report.js';
import { projectFindingNarrative, type FindingNarrativeSection } from '../inference/domain/finding-narrative.js';
import { WAVE_SIX_SHOWCASE_CASES, type HumanShowcaseValidationReport } from '../inference/domain/showcase-validation.js';

type Params = { publicId: string; adminSecret: string };

export function renderAudienceNavigation(counts: { executiveDecisions: number; technologyConstraints: number; localReports: number; specialistFindings: number }): string {
  const destination = (href: string, title: string, body: string) => `<a class="audience-link" href="${href}"><h3>${title}</h3><p>${body}</p><span>Ir para esta leitura →</span></a>`;
  const specialistTarget = counts.specialistFindings > 1 ? '#report-portfolio' : '#report-diagnosis';
  const destinations = [
    ...(counts.executiveDecisions ? [destination('#report-executive', 'Diretoria', `${counts.executiveDecisions} ${counts.executiveDecisions === 1 ? 'decisão organizacional' : 'decisões organizacionais'} sobre política, estrutura ou investimento.`)] : []),
    ...(counts.technologyConstraints ? [destination('#report-technology', 'Liderança de tecnologia', `${counts.technologyConstraints} ${counts.technologyConstraints === 1 ? 'restrição sistêmica' : 'restrições sistêmicas'} de arquitetura, plataforma, segurança, fluxo ou confiabilidade.`)] : []),
    ...(counts.localReports ? [destination('#report-units', 'Gerência local', `${counts.localReports} ${counts.localReports === 1 ? 'recorte' : 'recortes'} com ações próprias, dependências recebidas e escaladas.`)] : []),
    ...(counts.specialistFindings ? [destination(specialistTarget, 'Especialistas e times', `${counts.specialistFindings} ${counts.specialistFindings === 1 ? 'diagnóstico explicável' : 'diagnósticos explicáveis'} com evidências, hipóteses e experimentos.`)] : []),
  ];
  if (destinations.length < 2) return '';
  return `<nav class="card audience-navigation" aria-label="Escolher leitura do relatório"><p class="eyebrow">Visões para decisão</p><h2>Escolha por onde avaliar</h2><p>Estas leituras projetam os mesmos diagnósticos e o mesmo portfólio; muda apenas o que cada público precisa decidir.</p><div class="grid">${destinations.join('')}</div></nav>`;
}

export function renderAudienceBriefs(reports: AudienceReports, capabilityBase: string): string {
  const cards = (findings: OutcomeFinding[], audience: 'executive' | 'technology-leadership') => findings.map((finding) => {
    const ask = audienceAsk(finding, audience);
    const happening = guidanceFor(finding.pattern, finding.foundation, finding.title).plainExplanation;
    const everyday = happening && happening !== finding.title ? `<p>${escapeHtml(happening)}</p>` : '';
    return `<article class="audience-brief-card"><h3>${escapeHtml(finding.title)}</h3>${everyday}<p><strong>O que essa pessoa precisa decidir.</strong> ${escapeHtml(ask)}</p><p class="muted"><strong>Quem autoriza:</strong> ${escapeHtml(authorityLabel(finding.decisionAuthority ?? 'undetermined'))}.</p><p><a href="${escapeHtml(findingDetailHref(capabilityBase, finding))}">Ver detalhe</a></p></article>`;
  }).join('');
  const executiveHasContent = reports.executive.decisions.length > 0 || reports.executive.sharedConstraints.length > 0;
  const executive = executiveHasContent ? `<article class="card" id="report-executive"><p class="eyebrow">O que a diretoria precisa decidir</p><h2>Briefing para diretoria</h2>${reports.executive.decisions.length ? `<h3>Decisões organizacionais</h3>${cards(reports.executive.decisions, 'executive')}` : ''}${reports.executive.sharedConstraints.length ? `<h3>Restrições compartilhadas que podem exigir investimento comum</h3>${cards(reports.executive.sharedConstraints, 'executive')}` : ''}</article>` : '';
  const technology = reports.technology.systemicConstraints.length ? `<article class="card" id="report-technology"><p class="eyebrow">O que a liderança técnica precisa decidir</p><h2>Briefing para liderança de tecnologia</h2>${cards(reports.technology.systemicConstraints, 'technology-leadership')}</article>` : '';
  return executive || technology ? `<section class="audience-briefs">${executive}${technology}</section>` : '';
}

const projectForm = () => layout('Novo projeto', `
  <header><p class="eyebrow">Diagnóstico de engenharia</p><h1>Crie um mapa do sistema de trabalho</h1>
  <p class="lead">Configure a estrutura, distribua convites anônimos e observe gargalos sem avaliar pessoas ou premiar ferramentas.</p></header>
  <form class="card" method="post" action="/projects">
    <label for="name">Nome do projeto</label><input id="name" name="name" required maxlength="100" placeholder="Assessment da Tribo Digital">
    <fieldset class="hierarchy-editor" data-hierarchy-editor>
      <legend>Estrutura organizacional</legend>
      <p class="muted">Monte a árvore com os nomes usados na sua organização. Convites serão gerados somente para as unidades finais.</p>
      <div data-hierarchy-tree></div>
      <button class="button secondary compact" type="button" data-add-root>Adicionar unidade raiz</button>
      <p class="form-error" role="alert" data-hierarchy-error></p>
    </fieldset>
    <input type="hidden" name="hierarchy" data-hierarchy-value required>
    <button type="submit" data-create-project disabled>Criar projeto</button>
  </form>
  <script>
    (()=>{
      const tree=document.querySelector('[data-hierarchy-tree]');
      const value=document.querySelector('[data-hierarchy-value]');
      const error=document.querySelector('[data-hierarchy-error]');
      const submit=document.querySelector('[data-create-project]');
      let sequence=2;
      let nodes=[{id:'1',parentId:null,name:''},{id:'2',parentId:'1',name:''}];
      const descendants=(id)=>nodes.filter(node=>node.parentId===id).flatMap(node=>[node.id,...descendants(node.id)]);
      const depth=(node)=>node.parentId?1+depth(nodes.find(candidate=>candidate.id===node.parentId)):1;
      const path=(node)=>node.parentId?path(nodes.find(candidate=>candidate.id===node.parentId)).concat(node.name.trim()):[node.name.trim()];
      const button=(label,action,className='button secondary compact')=>{const element=document.createElement('button');element.type='button';element.className=className;element.textContent=label;element.dataset.action=action;return element};
      const validate=()=>{
        let message='';
        if(nodes.some(node=>!node.name.trim())) message='Preencha o nome de todas as unidades.';
        else if(nodes.some(node=>node.name.includes('/'))) message='Os nomes não podem conter barras.';
        else if(nodes.some(node=>depth(node)>12)) message='A estrutura pode ter no máximo 12 níveis.';
        else if(nodes.some(node=>nodes.some(other=>other.id!==node.id&&other.parentId===node.parentId&&other.name.trim().toLocaleLowerCase('pt-BR')===node.name.trim().toLocaleLowerCase('pt-BR')))) message='Unidades no mesmo nível precisam ter nomes diferentes.';
        const leaves=nodes.filter(node=>!nodes.some(candidate=>candidate.parentId===node.id));
        value.value=message?'':leaves.map(node=>path(node).join('/')).join('\\n');
        error.textContent=message;
        submit.disabled=Boolean(message)||!leaves.length;
      };
      const render=()=>{
        tree.replaceChildren();
        const visit=(parentId,level)=>nodes.filter(node=>node.parentId===parentId).forEach(node=>{
          const row=document.createElement('div');row.className='hierarchy-row';row.style.setProperty('--level',String(level));
          const branch=document.createElement('span');branch.className='hierarchy-branch';branch.textContent=level?'↳':'●';
          const input=document.createElement('input');input.value=node.name;input.maxLength=80;input.placeholder=level?'Nome da unidade':'Nome da organização ou unidade raiz';input.setAttribute('aria-label','Nome da unidade');input.addEventListener('input',()=>{node.name=input.value;validate()});
          const controls=document.createElement('div');controls.className='hierarchy-actions';
          const add=button('Adicionar unidade abaixo','add');add.addEventListener('click',()=>{if(nodes.length>=200)return;nodes.push({id:String(++sequence),parentId:node.id,name:''});render()});controls.append(add);
          const remove=button('Remover','remove','button danger compact');remove.disabled=nodes.length===1;remove.addEventListener('click',()=>{const removed=new Set([node.id,...descendants(node.id)]);nodes=nodes.filter(candidate=>!removed.has(candidate.id));render()});controls.append(remove);
          row.append(branch,input,controls);tree.append(row);visit(node.id,level+1);
        });
        visit(null,0);validate();
      };
      document.querySelector('[data-add-root]').addEventListener('click',()=>{if(nodes.length>=200)return;nodes.push({id:String(++sequence),parentId:null,name:''});render()});
      render();
    })();
  </script><p><a href="/projects/access">Já possui um projeto? Acessar painel</a></p>`);

const projectAccessForm = () => layout('Acessar projeto', `
  <header><p class="eyebrow">Projeto existente</p><h1>Acesse o painel protegido</h1><p class="lead">Use o identificador e a chave administrativa entregues na criação do projeto.</p></header>
  <form class="card" method="post" action="/projects/access">
    <label for="publicId">Identificador do projeto</label><input id="publicId" name="publicId" required autocomplete="off">
    <label for="adminSecret">Chave administrativa</label><input id="adminSecret" name="adminSecret" type="password" required autocomplete="current-password">
    <button type="submit">Acessar relatório</button>
  </form><p><a href="/projects/new">Criar outro projeto</a></p>`);

export function registerProjectRoutes(app: FastifyInstance, db: Database): void {
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const inference = new InferenceService(db);
  const pilot = new PilotService(db);

  app.get('/', async (_request, reply) => reply.type('text/html').send(projectForm()));
  app.get('/projects/new', async (_request, reply) => reply.type('text/html').send(projectForm()));
  app.get('/projects/access', async (_request, reply) => reply.type('text/html').send(projectAccessForm()));
  app.post('/projects/access', async (request, reply) => {
    const body = (request.body ?? {}) as { publicId?: string; adminSecret?: string };
    const publicId = body.publicId?.trim() ?? '';
    const adminSecret = body.adminSecret?.trim() ?? '';
    if (!projects.authorize(publicId, adminSecret)) throw new ResourceNotFoundError('Confira os dados administrativos.');
    return reply.redirect(`/projects/${publicId}/manage/${adminSecret}`);
  });
  app.post('/projects', async (request, reply) => {
    const body = (request.body ?? {}) as { name?: string; hierarchy?: string };
    const created = projects.create(body.name ?? '', body.hierarchy ?? '');
    return reply.redirect(`/projects/${created.publicId}/manage/${created.adminSecret}`);
  });

  app.get('/p/:publicId', async (request, reply) => {
    const { publicId } = request.params as { publicId: string };
    const project = db.prepare('SELECT name FROM projects WHERE public_id = ?').get(publicId) as { name: string } | undefined;
    if (!project) throw new ResourceNotFoundError('Projeto não encontrado.');
    return reply.type('text/html').send(layout(project.name, `<div class="card"><p class="eyebrow">${escapeHtml(project.name)}</p><h1>Diagnóstico da organização</h1><p class="lead">Para responder, use seu convite individual. O link geral do projeto não registra participação.</p><p class="notice">As respostas são anônimas e só aparecem de forma agregada quando o grupo mínimo é atingido.</p></div>`));
  });

  const requireProject = (params: Params) => {
    const project = projects.authorize(params.publicId, params.adminSecret);
    if (!project) throw new ResourceNotFoundError('Confira o link administrativo.');
    return { params, project };
  };

  app.get('/projects/:publicId/manage/:adminSecret', async (request, reply) => {
    const auth = requireProject(request.params as Params);
    const projectId = String(auth.project.id);
    const units = projects.listUnits(projectId);
    const report = inference.report(projectId, Number(auth.project.minimum_group_size));
    const batches = invitations.listBatches(projectId);
    const cognitiveReadiness = pilot.cognitiveReadiness(projectId, INITIAL_COGNITIVE_PILOT_SIZE, Number(auth.project.minimum_group_size));
    const sampleProgress = pilot.sampleProgress(projectId);
    const humanShowcaseValidation = pilot.humanShowcaseValidation();
    const unitOptions = units.filter((unit) => unit.isLeaf).map((unit) => `<option value="${escapeHtml(unit.id)}">${escapeHtml(unit.path)}</option>`).join('');
    const reportAvailability = report.completed < report.minimum
      ? `<p class="notice">O relatório será liberado com ${report.minimum} respostas concluídas. Atualmente: ${report.completed}.</p>`
      : report.findings.length ? '' : report.outcome.kind === 'preserve'
        ? '<p class="notice">A leitura principal é preservar a prática observada. Os pilares sem cobertura continuam não avaliados.</p>'
        : '<p class="notice">Ainda não há um padrão problemático com evidência agregada suficiente.</p>';
    const perspectives = renderPerspectiveSynthesis(report.perspectiveGaps, report.visibilityGaps);
    const previous = report.previousMeasurement
      ? `<article class="card"><span class="tag">reaplicação</span><h3>Comparação com a medição anterior</h3><p class="muted">${report.previousMeasurement.previousCompleted} jornadas na captura anterior. Padrões abaixo mostram suporte coletivo, nunca pessoas.</p>${report.previousMeasurement.patternDeltas.length ? `<ul>${report.previousMeasurement.patternDeltas.map((delta) => `<li><code>${escapeHtml(delta.pattern)}</code>: ${delta.previous} → ${delta.current}</li>`).join('')}</ul>` : '<p>O suporte dos padrões publicados não mudou entre as capturas.</p>'}</article>`
      : '';
    const capabilityBase = `/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/capabilities`;
    const areaBase = `/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/areas`;
    const scopeOccurrences = findingScopeOccurrences(report.scopes);
    const primaryOccurrence = scopeOccurrences.find((item) => item.pattern === report.outcome.finding?.pattern);
    const distinctive = distinctiveScopes(report.scopes, report.classification?.level ?? 0);
    const orderedFindings = uniqueFindingsByPattern(report.findings);
    const competingFinding = orderedFindings.find((finding) => finding.pattern !== report.outcome.finding?.pattern);
    const firstScreen = renderFirstScreen({
      outcome: report.outcome,
      ...(report.classification ? { classification: report.classification } : {}),
      organizationalAreas: report.organizationalAreas,
      findings: report.findings,
      scopes: distinctive,
      areaBase,
      capabilityBase,
      confirmedProblemCount: orderedFindings.length,
      sample: {
        completed: report.completed,
        units: report.scopes
          .filter((scope) => scope.path.split('/').length > 1)
          .map((scope) => ({ path: scope.path, completed: scope.completed })),
      },
      ...(primaryOccurrence ? { occurrence: primaryOccurrence } : {}),
      ...(competingFinding ? { competingFinding } : {}),
      capabilityGroups: report.capabilityGroups,
    });
    const probabilisticSummary = renderProbabilisticSummary(report.hypotheses, report.modelVersion, 'Causas deste limitador', report.outcome.limiterId);
    const audienceNavigation = renderAudienceNavigation({ executiveDecisions: report.audienceReports.executive.decisions.length, technologyConstraints: report.audienceReports.technology.systemicConstraints.length, localReports: distinctive.length, specialistFindings: report.audienceReports.specialist.findings.length });
    const audienceBriefs = renderAudienceBriefs(report.audienceReports, capabilityBase);
    const batchCards = batches.map((batch) => `<article class="card"><span class="tag">${escapeHtml(batch.status)}</span><h3>${escapeHtml(batch.unitPath)}</h3><p class="muted">${batch.quantity} convites no lote · perfil escolhido por cada participante</p>${batch.status === 'issued' || batch.status === 'partially_used' ? `<form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitation-batches/${batch.id}/revoke"><button type="submit">Revogar links disponíveis</button></form>` : ''}${batch.status === 'revoked' || batch.status === 'expired' || batch.status === 'partially_used' ? `<form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitation-batches/${batch.id}/reissue"><button class="button secondary" type="submit">Reemitir indisponíveis</button></form>` : ''}</article>`).join('');
    const audienceArchive = audienceNavigation || audienceBriefs || perspectives
      ? `<details class="methodology"><summary>Leituras por público</summary>${audienceNavigation}${audienceBriefs}${perspectives}</details>`
      : '';
    return reply.type('text/html').send(layout(String(auth.project.name), `
      <div class="report-home">
      <header><p class="eyebrow">Diagnóstico</p><h1>${escapeHtml(auth.project.name)}</h1></header>
      <section id="report-diagnosis">${firstScreen}${reportAvailability}</section>
      <details class="methodology admin-footer"><summary>Operação do piloto</summary><div class="grid"><div class="card"><div class="metric">${report.completed}</div><span class="muted">concluídas</span></div><div class="card"><div class="metric">${batches.reduce((sum,item)=>sum+item.quantity,0)}</div><span class="muted">convites emitidos</span></div></div>
      <section class="card"><h2>Gerar convites individuais</h2><p class="muted">Os links servem para qualquer integrante da unidade. Cada pessoa informa sua perspectiva ao iniciar.</p><form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitations">
        <label for="unitId">Unidade final</label><select id="unitId" name="unitId">${unitOptions}</select>
        <label for="count">Quantidade</label><input id="count" name="count" type="number" min="1" max="100" value="5">
        <button type="submit">Gerar links</button></form></section>
      ${batchCards ? `<section><h2>Lotes de convites</h2>${batchCards}</section>` : ''}
      <details class="methodology"><summary>Instrumento e calibração</summary>${renderSampleProgress(sampleProgress)}${renderCognitivePilotReadiness(cognitiveReadiness)}${renderPilotStatus(report.calibration)}${renderCognitiveReview(report.calibration, humanShowcaseValidation, auth.params)}</details></details>
      ${audienceArchive}
      ${probabilisticSummary ? `<details class="methodology"><summary>Outras hipóteses do recorte</summary>${probabilisticSummary}</details>` : ''}
      ${previous}
      <p><a class="button secondary" href="/p/${auth.params.publicId}">Ver página pública</a></p>
      </div>`));
  });

  app.get('/projects/:publicId/manage/:adminSecret/capabilities/:capabilityId', async (request, reply) => {
    const params = request.params as Params & { capabilityId: string };
    const auth = requireProject(params);
    const report = inference.report(String(auth.project.id), Number(auth.project.minimum_group_size));
    const scopeId = (request.query as { scope?: string }).scope;
    const source = scopeId ? report.scopes.find((scope) => scope.id === scopeId) : undefined;
    if (scopeId && !source) throw new ResourceNotFoundError('Recorte não disponível.');
    const groups = source?.capabilityGroups ?? report.capabilityGroups;
    const path = findCapabilityPath(groups, params.capabilityId);
    if (!path) throw new ResourceNotFoundError('Capacidade não encontrada.');
    const selected = path.at(-1)!;
    const findings = source?.findings ?? report.findings;
    const hypotheses = source?.hypotheses ?? report.hypotheses;
    const relevantIds = new Set(flattenCapabilityIds(selected));
    const relevant = findings.filter((finding) => relevantIds.has(finding.detailCapability) || finding.affectedCapabilities?.some((id) => relevantIds.has(id)));
    const outcome = decideReportOutcome({
      classification: source?.classification ?? report.classification,
      branches: groups,
      findings: relevant,
      perspectiveGaps: source?.perspectiveGaps ?? report.perspectiveGaps,
      focusId: selected.id,
    });
    const base = `/projects/${params.publicId}/manage/${params.adminSecret}/capabilities`;
    const scopeQuery = scopeId ? `?scope=${encodeURIComponent(scopeId)}` : '';
    const dashboardUrl = `/projects/${params.publicId}/manage/${params.adminSecret}`;
    const breadcrumbItems = path.map((item, index) => index === path.length - 1
      ? `<span class="breadcrumb-current" aria-current="page">${escapeHtml(item.label)}</span>`
      : `<a href="${base}/${item.id}${scopeQuery}">${escapeHtml(item.label)}</a>`).join('<span class="breadcrumb-separator" aria-hidden="true">›</span>');
    const parent = path.at(-2);
    const backUrl = parent ? `${base}/${parent.id}${scopeQuery}` : dashboardUrl;
    const coverage = `<p class="coverage"><strong>${coverageLabel(selected.coverage)}</strong><span class="coverage-track"><span style="width:${Math.round(selected.coverage * 100)}%"></span></span></p>`;
    const assessedChildren = selected.children.filter((child) => child.assessed).length;
    const breadth = selected.children.length ? ` ${assessedChildren} de ${selected.children.length} subcapacidades possuem cobertura suficiente.` : '';
    const status = selected.assessed
      ? `<div class="classification-level">${executiveStage(selected.level)}</div>${coverage}<p class="executive-reading">${escapeHtml(capabilityReading(selected.level))}</p><details class="methodology"><summary>Ver evidências da avaliação</summary><p>Estimativa ordinal interna: ${formatMaturityLevel(selected.level)} de 4. Faixa compatível com as evidências: ${formatMaturityLevel(selected.interval?.lower ?? selected.level)} a ${formatMaturityLevel(selected.interval?.upper ?? selected.level)} · ${selected.observers ?? 0} pessoas e ${selected.evidence} sinais agregados · cobertura temática ${Math.round(selected.coverage * 100)}%.${selected.hasContradiction ? ' Há evidências contraditórias; o resultado é inconclusivo até discriminar contextos e causas.' : ''}</p></details>`
      : `${coverage}<p class="notice">Esta capacidade ainda não possui variedade temática suficiente para publicar uma nota.${breadth} Ela não foi calculada como zero.</p>`;
    const diagnosis = selected.children.length
      ? renderCapabilityRadar(selected.children, base, scopeId)
      : scopeId && groups.length
        ? renderCapabilityRadar(groups, base, scopeId)
        : '';
    const probabilisticDetail = renderProbabilisticSummary(hypotheses.filter((item) => relevantIds.has(item.capability)), report.modelVersion, 'Causas deste recorte', selected.children.length ? undefined : selected.id);
    return reply.type('text/html').send(layout(selected.label, `<nav class="capability-navigation" aria-label="Navegação da capacidade"><a class="back-link" href="${backUrl}"><span aria-hidden="true">←</span> Voltar</a><div class="breadcrumb"><a href="${dashboardUrl}">Projeto</a><span class="breadcrumb-separator" aria-hidden="true">›</span>${breadcrumbItems}</div></nav><header><p class="eyebrow">${escapeHtml(source?.path ?? 'Visão global')}</p><h1>${escapeHtml(selected.label)}</h1></header>${renderOutcome(outcome)}<details class="methodology consistency-detail"><summary>Consistência do comportamento neste recorte</summary>${status}</details>${diagnosis}${probabilisticDetail ? `<details class="methodology"><summary>Como medimos neste recorte</summary>${probabilisticDetail}</details>` : ''}`));
  });

  app.get('/projects/:publicId/manage/:adminSecret/areas/:areaId', async (request, reply) => {
    const params = request.params as Params & { areaId: string };
    const auth = requireProject(params);
    const report = inference.report(String(auth.project.id), Number(auth.project.minimum_group_size));
    const scopeId = (request.query as { scope?: string }).scope;
    const source = scopeId ? report.scopes.find((scope) => scope.id === scopeId) : undefined;
    if (scopeId && !source) throw new ResourceNotFoundError('Recorte não disponível.');
    const map = source?.organizationalAreas ?? report.organizationalAreas;
    const path = findAreaPath(map, params.areaId);
    if (!path) throw new ResourceNotFoundError('Área não encontrada.');
    const selected = path.at(-1)!;
    const areaBase = `/projects/${params.publicId}/manage/${params.adminSecret}/areas`;
    const capabilityBase = `/projects/${params.publicId}/manage/${params.adminSecret}/capabilities`;
    const scopeQuery = scopeId ? `?scope=${encodeURIComponent(scopeId)}` : '';
    if (selected.kind === 'leaf' && !selected.children.some((child) => child.observed)) {
      return reply.redirect(`${capabilityBase}/${selected.leafId ?? selected.id}${scopeQuery}`);
    }
    const dashboardUrl = `/projects/${params.publicId}/manage/${params.adminSecret}`;
    const parent = path.at(-2);
    const backUrl = parent ? `${areaBase}/${parent.id}${scopeQuery}` : dashboardUrl;
    const breadcrumbItems = path.map((item, index) => index === path.length - 1
      ? `<span class="breadcrumb-current" aria-current="page">${escapeHtml(item.label)}</span>`
      : `<a href="${areaBase}/${item.id}${scopeQuery}">${escapeHtml(item.label)}</a>`).join('<span class="breadcrumb-separator" aria-hidden="true">›</span>');
    const groups = source?.capabilityGroups ?? report.capabilityGroups;
    return reply.type('text/html').send(layout(selected.label, `<nav class="capability-navigation" aria-label="Navegação da área"><a class="back-link" href="${backUrl}"><span aria-hidden="true">←</span> Voltar</a><div class="breadcrumb"><a href="${dashboardUrl}">Projeto</a><span class="breadcrumb-separator" aria-hidden="true">›</span>${breadcrumbItems}</div></nav><header><p class="eyebrow">${escapeHtml(source?.path ?? 'Visão global')}</p><h1>${escapeHtml(selected.label)}</h1></header>${renderAreaRecorte(path, { areaBase, capabilityBase, scopeQuery, capabilities: groups })}`));
  });

  app.post('/projects/:publicId/manage/:adminSecret/invitations', async (request, reply) => {
    const auth = requireProject(request.params as Params);
    const body = (request.body ?? {}) as { unitId?: string; count?: string };
    const units = projects.listUnits(String(auth.project.id));
    if (!body.unitId || !units.some((unit) => unit.id === body.unitId)) throw new DomainValidationError();
    const batch = invitations.createBatch(String(auth.project.id), body.unitId, Number(body.count ?? 1));
    return reply.type('text/html').send(invitationLinksPage(request.protocol, request.host, batch.tokens, auth.params));
  });

  app.post('/projects/:publicId/manage/:adminSecret/invitation-batches/:batchId/revoke', async (request, reply) => {
    const auth = requireProject(request.params as Params);
    const { batchId } = request.params as Params & { batchId: string };
    invitations.revokeBatch(String(auth.project.id), batchId);
    return reply.redirect(`/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}`);
  });

  app.post('/projects/:publicId/manage/:adminSecret/invitation-batches/:batchId/reissue', async (request, reply) => {
    const auth = requireProject(request.params as Params);
    const { batchId } = request.params as Params & { batchId: string };
    const batch = invitations.reissueBatch(String(auth.project.id), batchId);
    return reply.type('text/html').send(invitationLinksPage(request.protocol, request.host, batch.tokens, auth.params));
  });

  app.post('/projects/:publicId/manage/:adminSecret/item-reviews', async (request, reply) => {
    const auth = requireProject(request.params as Params);
    const body = (request.body ?? {}) as { showcaseCaseId?: string; nodeKey?: string; profile?: string; comprehensionOk?: string; interpretationMatch?: string; optionFit?: string; optionOverlap?: string; retrievalDifficulty?: string; goldOptionBias?: string; visibilityExitUsed?: string; autonomyRecognition?: string; guidanceUseful?: string; guidanceSafe?: string; foundationExplained?: string; confusingTerm?: string };
    pilot.recordCognitiveReview({
      ...(body.showcaseCaseId ? { showcaseCaseId: body.showcaseCaseId } : {}),
      nodeKey: body.nodeKey ?? '',
      profile: body.profile ?? '',
      comprehensionOk: body.comprehensionOk === 'yes',
      interpretationMatch: body.interpretationMatch === 'yes', optionFit: body.optionFit === 'yes',
      optionOverlap: body.optionOverlap === 'yes', retrievalDifficulty: body.retrievalDifficulty === 'yes',
      goldOptionBias: body.goldOptionBias === 'yes',
      visibilityExitUsed: body.visibilityExitUsed === 'yes',
      autonomyRecognition: body.autonomyRecognition === 'yes', guidanceUseful: body.guidanceUseful === 'yes',
      guidanceSafe: body.guidanceSafe === 'yes', foundationExplained: body.foundationExplained === 'yes',
      ...(body.confusingTerm?.trim() ? { confusingTerm: body.confusingTerm } : {}),
    });
    return reply.redirect(`/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}`);
  });
}

function renderSampleProgress(progress: import('../inference/domain/diagnostic-sample-plan.js').SampleProgress): string {
  const status = progress.readyToDiagnose ? 'Amostra suficiente para o diagnóstico organizacional.' : 'Amostra ainda insuficiente para o experimento real.';
  const roles = progress.target.units.map((unit) => `<li>${escapeHtml(unit.id)}: ${unit.people} pessoas — ${escapeHtml([...new Set(unit.roles.map((role) => role.workContext))].join(', '))}</li>`).join('');
  const blockers = progress.blockers.length ? `<ul>${progress.blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  return `<section class="card sample-progress"><h2>Amostra para o experimento real</h2><p><strong>${escapeHtml(status)}</strong> ${escapeHtml(progress.summary)}</p><p>${progress.completed} respostas concluídas · ${progress.invited} convites ativos · alvo ${progress.target.totalPeople} pessoas em duas unidades.</p>${blockers}<p class="muted">Checagem de linguagem: 8 pessoas em uma unidade. Comparação entre squads: 10 pessoas (5+5). Triangulação das nove lentes: 45. Calibração: 50–100 jornadas rotuladas. Um radar de quinze eixos não aumenta precisão; o que publica pilares é trilha complementar e dois padrões independentes por folha.</p><details><summary>Composição sugerida</summary><ul>${roles}</ul></details></section>`;
}

function renderCognitivePilotReadiness(readiness: import('../inference/domain/cognitive-pilot-readiness.js').CognitivePilotReadinessReport): string {
  const status = readiness.status === 'ready_to_collect'
    ? 'Pronto para iniciar a coleta.'
    : readiness.status === 'collecting_complete'
      ? 'Coleta inicial concluída.'
      : readiness.status === 'unsafe_allocation'
        ? 'Distribuição incompatível com o limiar de anonimato.'
        : 'Convites ainda não preparados.';
  const blockers = readiness.blockers.length ? `<ul>${readiness.blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '';
  return `<section class="card cognitive-pilot-readiness"><h2>Preflight do piloto inicial</h2><p><strong>${escapeHtml(status)}</strong> ${escapeHtml(readiness.summary)}</p><p>${readiness.invitedParticipants} de ${INITIAL_COGNITIVE_PILOT_SIZE} convites ativos · ${readiness.completedParticipants} respostas concluídas.</p>${blockers}<p class="muted">Este piloto de oito pessoas avalia compreensão, percurso e utilidade inicial. Ele não calibra probabilidades nem autoriza comparar squads abaixo do limiar de anonimato.</p></section>`;
}

function renderPilotStatus(calibration: PilotReport): string {
  const policy = calibration.policy;
  const gate = calibration.gate === 'ready_for_revision'
    ? 'Há massa rotulada dentro dos limiares; uma revisão de priors ainda precisa ser publicada explicitamente.'
    : 'Calibração bloqueada. O posterior exibido permanece provisório.';
  const blockers = calibration.blockers.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<details class="methodology"><summary>Calibração do modelo</summary><p>${escapeHtml(gate)}</p><p>Rótulos cegos: ${calibration.labeledCases} / ${policy.minLabeledCases}. Entrevistas cognitivas: ${calibration.cognitiveReviews}.</p><p>Limiares pré-declarados antes da análise: falso positivo ≤ ${Math.round(policy.maxFalsePositiveRate * 100)}%, parada incorreta ≤ ${Math.round(policy.maxIncorrectStopRate * 100)}%, ECE ≤ ${policy.maxExpectedCalibrationError}, Brier ≤ ${policy.maxBrierScore}, discordância entre avaliadores ≤ ${Math.round(policy.maxRaterDisagreement * 100)}%.</p>${blockers ? `<ul>${blockers}</ul>` : ''}<p>Clique, frequência de resposta e aceitação de recomendação não são rótulos. O modelo publicado não se atualiza sozinho.</p></details>`;
}

function renderCognitiveReview(calibration: PilotReport, showcase: HumanShowcaseValidationReport, params: Params): string {
  const minimum = PILOT_THRESHOLDS.minCognitiveReviewsPerProfile;
  const coverage = Object.keys(profiles).map((profile) => {
    const count = calibration.cognitiveCoverage[profile] ?? 0;
    return `<li>${escapeHtml(profiles[profile as keyof typeof profiles])}: ${count} de ${minimum}</li>`;
  }).join('');
  const nodes = graph.map((node) => `<option value="${escapeHtml(node.id)}">${escapeHtml(node.title)}</option>`).join('');
  const profileOptions = Object.entries(profiles).map(([id, label]) => `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`).join('');
  const caseOptions = WAVE_SIX_SHOWCASE_CASES.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join('');
  const caseCoverage = WAVE_SIX_SHOWCASE_CASES.map((item) => `<li>${escapeHtml(item.title)}: ${showcase.caseCoverage[item.id]} entrevistas${showcase.problematicCaseIds.includes(item.id) ? ' · requer revisão de linguagem' : ''}</li>`).join('');
  const humanGate = showcase.humanValidationSatisfied
    ? 'Cobertura humana concluída; a onda 7 ainda depende dos demais gates de piloto e revisão cega.'
    : `Validação humana pendente: ${showcase.missingCaseIds.length} contrastes sem observação, ${showcase.missingPerspectives.length} perspectivas abaixo do mínimo e ${showcase.problematicCaseIds.length} contrastes com problema aberto.`;
  const issues = calibration.cognitiveIssues;
  return `<section class="card"><h2>Revisão cognitiva do instrumento</h2><p class="muted">Use este registro depois de uma entrevista real. Não identifique pessoas e não vincule a uma participação. Massa sintética não é aceita.</p><h3>Cobertura humana dos seis contrastes</h3><p class="notice">${escapeHtml(humanGate)}</p><ul>${caseCoverage}</ul><h3>Cobertura por perspectiva</h3><ul>${coverage}</ul><p class="muted">Problemas observados: compreensão ${issues.comprehension ?? 0}, interpretação ${issues.interpretation ?? 0}, alternativa ausente ${issues.optionFit ?? 0}, alternativas sobrepostas ${issues.optionOverlap ?? 0}, dificuldade de lembrar ${issues.retrieval ?? 0}, resposta desejável evidente ${issues.desirability ?? 0}, autonomia não reconhecida ${issues.autonomy ?? 0}, orientação sem utilidade ${issues.utility ?? 0}, orientação insegura ${issues.safety ?? 0}, fundamento não explicado ${issues.foundation ?? 0}.</p><form method="post" action="/projects/${params.publicId}/manage/${params.adminSecret}/item-reviews">
    <label for="showcaseCaseId">Contraste validado na entrevista</label><select id="showcaseCaseId" name="showcaseCaseId" required>${caseOptions}</select>
    <label for="nodeKey">Cenário revisado</label><select id="nodeKey" name="nodeKey" required>${nodes}</select>
    <label for="reviewProfile">Perspectiva de quem revisou a linguagem</label><select id="reviewProfile" name="profile" required>${profileOptions}</select>
    <label for="comprehensionOk">O cenário foi compreendido sem jargão?</label><select id="comprehensionOk" name="comprehensionOk" required><option value="yes">Sim</option><option value="no">Não</option></select>
    <label for="interpretationMatch">A pessoa explicou a intenção esperada com as próprias palavras?</label><select id="interpretationMatch" name="interpretationMatch" required><option value="yes">Sim</option><option value="no">Não</option></select>
    <label for="optionFit">Uma alternativa representou o caso lembrado?</label><select id="optionFit" name="optionFit" required><option value="yes">Sim</option><option value="no">Não</option></select>
    <label for="optionOverlap">Duas ou mais alternativas pareceram igualmente válidas?</label><select id="optionOverlap" name="optionOverlap" required><option value="no">Não</option><option value="yes">Sim</option></select>
    <label for="retrievalDifficulty">Foi difícil lembrar uma situação concreta?</label><select id="retrievalDifficulty" name="retrievalDifficulty" required><option value="no">Não</option><option value="yes">Sim</option></select>
    <label for="goldOptionBias">Alguma opção revela a resposta desejada?</label><select id="goldOptionBias" name="goldOptionBias" required><option value="no">Não</option><option value="yes">Sim</option></select>
    <label for="visibilityExitUsed">A pessoa usou ou considerou “não observo”?</label><select id="visibilityExitUsed" name="visibilityExitUsed" required><option value="no">Não</option><option value="yes">Sim</option></select>
    <label for="autonomyRecognition">A pessoa reconheceu sua responsabilidade e autonomia reais?</label><select id="autonomyRecognition" name="autonomyRecognition" required><option value="yes">Sim</option><option value="no">Não</option></select>
    <label for="guidanceUseful">A orientação seria útil no trabalho descrito?</label><select id="guidanceUseful" name="guidanceUseful" required><option value="yes">Sim</option><option value="no">Não</option></select>
    <label for="guidanceSafe">A orientação preserva limites e responsabilidades sem sugerir um atalho inseguro?</label><select id="guidanceSafe" name="guidanceSafe" required><option value="yes">Sim</option><option value="no">Não</option></select>
    <label for="foundationExplained">A pessoa explicou com as próprias palavras por que o teste pode atacar o problema?</label><select id="foundationExplained" name="foundationExplained" required><option value="yes">Sim</option><option value="no">Não</option></select>
    <label for="confusingTerm">Palavra ou expressão confusa (opcional, sem identificar a pessoa)</label><input id="confusingTerm" name="confusingTerm" maxlength="120">
    <button type="submit">Registrar revisão</button></form></section>`;
}

export function renderClassification(classification: { level: number; label: string; limitingCapabilities: string[] }, outcome?: ReportOutcome): string {
  const limiter = outcome?.limiterLabel ?? summarizeLimiters(classification.limitingCapabilities);
  const divergent = outcome?.kind === 'discriminate' && /^Perspectivas divergem/i.test(outcome.limiterLabel);
  const label = divergent ? 'Inconclusivo' : `${classification.level} · ${classification.label}`;
  const explanation = divergent
    ? 'A divergência de perspectivas suspende a classificação ordinal: primeiro é necessário distinguir visibilidade, fronteira e poder de decisão.'
    : 'Consistência do comportamento no elo mais frágil com evidência suficiente. Capacidades fortes não ocultam gargalos nem unidades descendentes. Cloud e infraestrutura aninhadas só ocupam o palco quando o finding é desse recorte.';
  const reading = divergent
    ? 'Não há uma leitura única segura enquanto as perspectivas descrevem sistemas diferentes.'
    : 'Este estágio descreve o elo que limita o sistema, não a organização inteira. Os demais pilares podem estar em estágios diferentes.';
  return `<details class="card methodology consistency-detail ${divergent ? 'maturity-inconclusive' : `maturity-level-${classification.level}`}"><summary>Consistência do comportamento no elo limitante</summary><div class="classification-level">${escapeHtml(label)}</div><p>${escapeHtml(reading)}</p><dl class="executive-facts"><div><dt>Elo limitante</dt><dd>${escapeHtml(limiter)}</dd></div></dl><p class="muted">${escapeHtml(explanation)}</p></details>`;
}

export function renderDiagnosticFirstPlane(input: {
  classification: { level: number; label: string; limitingCapabilities: string[] };
  outcome: ReportOutcome;
  findings: OutcomeFinding[];
  confirmedProblemCount?: number;
  occurrence?: FindingScopeOccurrence;
  occurrences?: FindingScopeOccurrence[];
  capabilityBase?: string;
  scopeId?: string;
}): string {
  const ordered = uniqueFindingsByPattern(input.findings);
  const competingFinding = ordered.find((finding) => finding.pattern !== input.outcome.finding?.pattern);
  const context = {
    density: 'compact' as const,
    ...(input.confirmedProblemCount !== undefined ? { confirmedProblemCount: input.confirmedProblemCount } : {}),
    ...(input.occurrence ? { occurrence: input.occurrence } : {}),
    ...(competingFinding ? { competingFinding } : {}),
  };
  return `${renderOutcome(input.outcome, context)}${renderClassification(input.classification, input.outcome)}`;
}

export function renderFirstScreen(input: {
  outcome: ReportOutcome;
  classification?: { level: number; label: string; limitingCapabilities: string[] };
  organizationalAreas: OrganizationalAreaMap;
  findings: OutcomeFinding[];
  scopes: ScopeReportView[];
  areaBase: string;
  capabilityBase: string;
  confirmedProblemCount?: number;
  occurrence?: FindingScopeOccurrence;
  competingFinding?: OutcomeFinding;
  sample?: { completed: number; units: Array<{ path: string; completed: number }> };
  capabilityGroups?: CapabilityRadarNode[];
}): string {
  const ordered = uniqueFindingsByPattern(input.findings);
  const competingFinding = input.competingFinding ?? ordered.find((finding) => finding.pattern !== input.outcome.finding?.pattern);
  const card = renderOutcome(input.outcome, {
    density: 'compact',
    ...(input.confirmedProblemCount !== undefined ? { confirmedProblemCount: input.confirmedProblemCount } : {}),
    ...(input.occurrence ? { occurrence: input.occurrence } : {}),
    ...(competingFinding ? { competingFinding } : {}),
  });
  const classification = input.classification ? renderClassification(input.classification, input.outcome) : '';
  const systems = `<section class="card first-screen-systems"><h2>Sistemas da organização</h2>${renderOrganizationalAreaMap(input.organizationalAreas, { areaBase: input.areaBase, capabilityBase: input.capabilityBase })}</section>`;
  const radar = input.capabilityGroups?.length
    ? renderCapabilityRadar(input.capabilityGroups, input.capabilityBase)
    : '';
  return `${card}${renderSampleStrip(input.sample)}${systems}${radar}${renderFindingIndex(input.findings, input.outcome.finding?.pattern, input.organizationalAreas, input.capabilityBase)}${renderScopeIndex(input.scopes, input.capabilityBase)}${classification}`;
}

function renderSampleStrip(sample?: { completed: number; units: Array<{ path: string; completed: number }> }): string {
  if (!sample || sample.completed < 1) return '';
  const units = sample.units.map((unit) => {
    const name = unit.path.split('/').at(-1) ?? unit.path;
    return `${escapeHtml(name)} (${unit.completed})`;
  }).join(' · ');
  const unitCount = sample.units.length || 1;
  return `<section class="card sample-strip" aria-label="Amostra desta leitura"><p><strong>Amostra desta leitura.</strong> ${sample.completed} pessoas em ${unitCount} ${unitCount === 1 ? 'unidade' : 'unidades'}${units ? ` — ${units}` : ''}. Trilhas complementares: entrega, ciclo completo, risco, plataforma, arquitetura, produto, portfólio e dados; cada papel ao menos duas vezes.</p><p class="muted">Para repetir com dados reais: 18 pessoas em duas unidades, no mínimo 5 em cada uma. Sem essa composição o cartão não fecha decisão. Calibração (50–100 jornadas rotuladas) é um gate separado.</p></section>`;
}

type PerspectiveGapView = { title: string; capability: string; strongerProfiles: string[]; constrainedProfiles: string[] };
type VisibilityGapView = { title: string; profiles: string[]; count: number };

export function renderPerspectiveSynthesis(gaps: PerspectiveGapView[], visibilityGaps: VisibilityGapView[]): string {
  if (!gaps.length && !visibilityGaps.length) return '';
  const stronger = [...new Set(gaps.flatMap((gap) => gap.strongerProfiles))];
  const constrained = [...new Set(gaps.flatMap((gap) => gap.constrainedProfiles))];
  const capabilities = [...new Set(gaps.map((gap) => perspectiveCapabilityLabel(gap.capability)))];
  const divergence = gaps.length ? `<article class="card perspective-synthesis"><span class="tag">divergência agregada</span><h3>Uma fronteira produz leituras diferentes em ${capabilities.length} ${capabilities.length === 1 ? 'capacidade' : 'capacidades'}</h3><p><strong>${escapeHtml(stronger.join(', '))}</strong> percebe comportamento mais sustentável; <strong>${escapeHtml(constrained.join(', '))}</strong> encontra restrições no mesmo sistema.</p><p>Capacidades onde a diferença reaparece: ${capabilities.map(escapeHtml).join(' · ')}.</p><h4>Próxima discriminação</h4><p>Reconstrua um evento recente compartilhado pelas duas lentes: decisão tomada, espera encontrada, consequência observada e autoridade disponível. Não abra uma iniciativa por capacidade antes dessa reconstrução.</p></article>` : '';
  const visibility = visibilityGaps.length ? `<details class="methodology"><summary>Lacunas de visibilidade agregadas</summary><ul>${visibilityGaps.map((gap) => `<li>${escapeHtml(gap.title)}: ${gap.count} jornadas em ${escapeHtml(gap.profiles.join(', '))}.</li>`).join('')}</ul></details>` : '';
  return `<section><h2>Perspectivas</h2>${divergence}${visibility}</section>`;
}

function perspectiveCapabilityLabel(capability: string): string {
  const labels: Record<string, string> = {
    aprendizado: 'Aprendizado', arquitetura: 'Arquitetura', confiabilidade: 'Confiabilidade',
    engenharia: 'Engenharia', entrega: 'Entrega', fluxo: 'Fluxo', governanca: 'Governança',
    observabilidade: 'Observabilidade', organizacao: 'Organização', plataforma: 'Plataforma',
    produto: 'Produto', qualidade: 'Qualidade', seguranca: 'Segurança',
  };
  return labels[capability] ?? CapabilityTaxonomy.labelFor(capability);
}

const solutionKindLabels: Record<SolutionGuidance['solutionKind'], string> = {
  practice: 'prática',
  policy: 'política',
  'org-design': 'desenho organizacional',
  'platform-capability': 'capacidade de plataforma',
  'tool-class': 'família de ferramenta',
};

export function renderOutcome(outcome: ReportOutcome, context: { confirmedProblemCount?: number; occurrence?: FindingScopeOccurrence; competingFinding?: OutcomeFinding; density?: 'compact' | 'full' } = {}): string {
  const guidance = outcome.finding ? guidanceFor(outcome.finding.pattern, outcome.finding.foundation, outcome.finding.title) : undefined;
  const readiness = outcome.finding?.solutionReadiness;
  const evidence = outcome.finding?.recommendationEvidence;
  const evidenceBlock = evidence ? renderRecommendationEvidence(evidence, outcome.finding?.title ?? outcome.reading) : '';
  const narrativeEvidenceBlock = evidence?.strength ? `<details class="decision-evidence"><summary>Como interpretar a força desta evidência</summary>${renderEvidenceStrength(evidence.strength)}</details>` : '';
  const readinessText = readiness?.stage === 'not-demonstrated'
    ? `As entrevistas ainda não mostraram esse caminho funcionando. Isso não significa que ele não exista.`
    : readiness ? `${readiness.label}: ${readiness.explanation}` : '';
  const readinessBlock = readiness ? `<section><h3>A organização já consegue fazer isso?</h3><p><strong>${escapeHtml(outcome.finding?.solutionCapability ?? 'Capacidade coletiva compatível com a causa.')}</strong></p><p>${escapeHtml(readinessText)}</p></section>` : '';
  const relatedCapabilities = outcome.finding?.affectedCapabilities?.filter((id) => id !== outcome.finding?.detailCapability) ?? [];
  const affected = outcome.finding
    ? `<p class="muted">${relatedCapabilities.length ? `<strong>Efeitos relacionados:</strong> ${relatedCapabilities.map((id) => escapeHtml(CapabilityTaxonomy.labelFor(id))).join(' · ')}.` : ''}</p>` : '';
  const diagnosticContext = outcome.finding?.mechanism
    ? `<details class="methodology diagnostic-context-detail"><summary>${outcome.finding.prescription?.status === 'investigate' ? 'Por que ainda não indicamos uma solução' : 'Por que esta orientação cabe aqui'}</summary><dl class="diagnostic-context"><div><dt>O que parece manter o problema</dt><dd>${escapeHtml(restrictionLabel(outcome.finding.mechanism))}</dd></div><div><dt>Onde a mudança precisa acontecer</dt><dd>${escapeHtml(containmentLabel(outcome.finding.containment ?? 'undetermined'))}</dd></div><div><dt>Quem pode decidir</dt><dd>${escapeHtml(authorityLabel(outcome.finding.decisionAuthority ?? 'undetermined'))}</dd></div><div><dt>Gravidade demonstrada</dt><dd>${escapeHtml(severityLabel(outcome.finding.severity ?? 'undetermined'))}</dd></div><div><dt>O que pode ser afetado</dt><dd>${escapeHtml(outcome.finding.severity && outcome.finding.severity !== 'undetermined' && (outcome.finding.impacts?.length ?? 0) ? (outcome.finding.impacts ?? []).map(impactLabel).join(' · ') : 'Impacto ainda não medido nas entrevistas')}</dd></div></dl><p><strong>O que ainda precisamos confirmar:</strong> ${escapeHtml(outcome.finding.missingEvidence ?? 'Ainda falta confirmar onde a restrição é contida.')}</p>${outcome.finding.prescription ? `<p><strong>Por que ${outcome.finding.prescription.status === 'investigate' ? 'investigar primeiro' : 'podemos testar'}:</strong> ${escapeHtml(outcome.finding.prescription.reason)}</p>` : ''}</details>`
    : '';
  const causalAnalysis = renderCausalAnalysis(outcome.finding?.causalAnalysis);
  const technicalDirection = renderTechnicalDirection(outcome.finding?.technicalDirection);
  const priority = outcome.finding && context.confirmedProblemCount
    ? `<p><strong>Prioridade 1 entre ${context.confirmedProblemCount} ${context.confirmedProblemCount === 1 ? 'comportamento recorrente' : 'comportamentos recorrentes'}.</strong> Os demais continuam no panorama para sequenciamento.</p><details class="decision-evidence priority-rationale"><summary>Por que esta é a primeira decisão</summary><section><h3>Critério de prioridade</h3><p>O motor a colocou primeiro pela combinação de intensidade do sinal e alcance.</p>${outcome.finding.priorityFactors ? `<dl class="evidence-strength"><div><dt>Intensidade do sinal observado</dt><dd>${qualitativeFactor(outcome.finding.priorityFactors.intensity)}</dd></div><div><dt>Alcance entre pessoas aplicáveis</dt><dd>${qualitativeFactor(outcome.finding.priorityFactors.reach)}</dd></div></dl>` : ''}${priorityComparison(outcome.finding, context.competingFinding)}${context.occurrence ? `<p class="muted">${renderFindingScope(context.occurrence).trim()}</p>` : ''}</section></details>`
    : '';
  const metaSystem = organizationalCapabilityIds.has(outcome.limiterId ?? '')
    ? '<p class="muted">O sistema organizacional é um meta-sistema: a restrição aqui explica espera, handoff ou decisão nos demais pilares, não um oitavo eixo técnico.</p>'
    : '';
  const compact = context.density === 'compact';
  const briefing = guidance && outcome.finding && (outcome.kind === 'correct' || outcome.kind === 'evolve')
    ? renderFindingNarrative(outcome.finding, { guidance, affected, priority, evidenceBlock: narrativeEvidenceBlock, causalAnalysis, readinessBlock, technicalDirection, metaSystem }, compact)
    : compact
      ? `<section data-narrative="observation"><h3>O que está acontecendo</h3><h2 class="executive-reading">${escapeHtml(outcome.reading || outcome.finding?.title || outcome.nextStepTitle)}</h2></section><section class="decision-request"><h3>O que fazer agora</h3><p>${escapeHtml(outcome.nextStepBody)}</p></section>`
      : `<section><h3>O que está acontecendo</h3><p class="executive-reading">${escapeHtml(outcome.reading)}</p></section>${affected}${priority}${evidenceBlock}${diagnosticContext}${causalAnalysis}
      ${evidenceBlock ? '' : `<section><h3>O que as entrevistas mostraram</h3><p>${escapeHtml(interviewReading(outcome))}</p></section>`}${metaSystem}
      <section><h3>O que fazer agora</h3><p>${escapeHtml(outcome.nextStepBody)}</p></section>
      <section><h3>Como saber se funcionou</h3><p>${escapeHtml(successReading(outcome))}</p></section>`;
  const headline = guidance?.plainExplanation && compact
    ? ''
    : `<h2>${escapeHtml(outcome.finding?.title ?? outcome.nextStepTitle)}</h2>`;
  return `<article class="card outcome-card${compact ? ' compact' : ''}"><p class="eyebrow">O que as entrevistas mostraram</p><p class="tag">${escapeHtml(outcome.kindLabel)}</p>${headline}${briefing}<p class="muted outcome-scope">Onde aparece: ${escapeHtml(outcome.limiterLabel)}</p></article>`;
}

function renderFindingNarrative(finding: OutcomeFinding, fragments: {
  guidance: SolutionGuidance; affected: string; priority: string; evidenceBlock: string; causalAnalysis: string;
  readinessBlock: string; technicalDirection: string; metaSystem: string;
}, compact = false): string {
  const narrative = projectFindingNarrative(finding);
  if (!compact) return narrative.sections.map((section) => renderNarrativeSection(section, finding, fragments)).join('');
  const visible = new Set(['observation', 'mechanism', 'decision', 'experiment', 'investigation']);
  const foreground = narrative.sections.filter((section) => visible.has(section.id));
  const rest = narrative.sections.filter((section) => !visible.has(section.id));
  const compactFragments = { ...fragments, affected: '', priority: '', evidenceBlock: '', causalAnalysis: '', readinessBlock: '', technicalDirection: '', metaSystem: '' };
  const foundation = finding.foundation
    ? `<p><strong>${escapeHtml(fragments.guidance.solutionClass)}</strong> (${escapeHtml(solutionKindLabels[fragments.guidance.solutionKind])}). ${escapeHtml(fragments.guidance.whyItWorks)}</p><p><strong>Princípio aplicado:</strong> ${escapeHtml(finding.foundation.principle)}. ${escapeHtml(finding.foundation.why)} Fonte: ${escapeHtml(finding.foundation.source)}.</p>`
    : `<p><strong>${escapeHtml(fragments.guidance.solutionClass)}</strong> (${escapeHtml(solutionKindLabels[fragments.guidance.solutionKind])}). ${escapeHtml(fragments.guidance.whyItWorks)}</p>`;
  const detail = [
    foundation,
    ...rest.map((section) => renderNarrativeSection(section, finding, fragments)),
    fragments.priority,
    fragments.affected,
    fragments.evidenceBlock,
    fragments.causalAnalysis,
    fragments.readinessBlock,
    fragments.technicalDirection,
    fragments.metaSystem,
  ].join('');
  return `${foreground.map((section) => renderNarrativeSection(section, finding, compactFragments, true)).join('')}<details class="methodology" data-narrative="detail"><summary>Fundamento e evidência</summary>${detail}</details>`;
}

function renderNarrativeSection(section: FindingNarrativeSection, finding: OutcomeFinding, fragments: {
  guidance: SolutionGuidance; affected: string; priority: string; evidenceBlock: string; causalAnalysis: string;
  readinessBlock: string; technicalDirection: string; metaSystem: string;
}, compact = false): string {
  if (section.id === 'decision') {
    const action = finding.experiment?.action ?? finding.intervention;
    const remainder = section.body.startsWith(action) ? section.body.slice(action.length).trim() : section.body;
    const extra = remainder && remainder !== action ? `<p>${escapeHtml(remainder)}</p>` : '';
    return compact
      ? `<section data-narrative="decision" class="decision-request"><h3>${section.title}</h3><p><strong>${escapeHtml(action)}</strong></p>${extra}</section>`
      : `<section data-narrative="decision" class="decision-request"><h3>${section.title}</h3><p><strong>${escapeHtml(action)}</strong></p>${extra}</section>`;
  }
  if (section.id === 'observation') {
    const catalog = finding.title && finding.title !== fragments.guidance.plainExplanation
      ? `<p class="muted catalog-title">${escapeHtml(finding.title)}</p>`
      : '';
    return compact
      ? `<section data-narrative="observation"><h3>${section.title}</h3><h2 class="executive-reading">${escapeHtml(fragments.guidance.plainExplanation)}</h2>${catalog}</section>`
      : `<section data-narrative="observation"><h3>${section.title}</h3><p class="executive-reading">${escapeHtml(fragments.guidance.plainExplanation)}</p>${catalog}</section>`;
  }
  if (section.id === 'importance') return `<section data-narrative="importance"><h3>${section.title}</h3><p>${escapeHtml(section.body)}</p>${fragments.priority}${fragments.metaSystem}</section>`;
  if (section.id === 'capability') return `<section data-narrative="capability"><h3>${section.title}</h3><p>${escapeHtml(section.body)}</p>${fragments.affected}</section>`;
  if (section.id === 'evidence') return `<section data-narrative="evidence"><h3>${section.title}</h3><p>${escapeHtml(section.body)}</p>${fragments.evidenceBlock}</section>`;
  if (section.id === 'mechanism') {
    const body = compact ? section.body.split(' Hipóteses concorrentes:')[0] ?? section.body : section.body;
    return `<section data-narrative="mechanism"><h3>${section.title}</h3><p>${escapeHtml(body)}</p>${compact ? '' : fragments.causalAnalysis}</section>`;
  }
  if (section.id === 'containment') return `<section data-narrative="containment"><h3>${section.title}</h3><p>${escapeHtml(section.body)}</p></section>`;
  if (section.id === 'existing-strength') return `<section data-narrative="existing-strength"><h3>${section.title}</h3><p>${escapeHtml(section.body)}</p>${fragments.readinessBlock}</section>`;
  if (section.id === 'experiment') {
    const foundation = finding.foundation
      ? `<p><strong>${escapeHtml(fragments.guidance.solutionClass)}</strong> (${escapeHtml(solutionKindLabels[fragments.guidance.solutionKind])}). ${escapeHtml(fragments.guidance.whyItWorks)}</p><p><strong>Princípio aplicado:</strong> ${escapeHtml(finding.foundation.principle)}. ${escapeHtml(finding.foundation.why)} Fonte: ${escapeHtml(finding.foundation.source)}.</p>`
      : `<p><strong>${escapeHtml(fragments.guidance.solutionClass)}</strong> (${escapeHtml(solutionKindLabels[fragments.guidance.solutionKind])}). ${escapeHtml(fragments.guidance.whyItWorks)}</p><p>Referência: ${escapeHtml(fragments.guidance.matureReference)}.</p>`;
    const testBody = compact
      ? `<h3>${section.title}</h3><p><strong>Teste:</strong> observe ${escapeHtml(finding.experiment?.metric ?? fragments.guidance.metric)}.</p><p><strong>O que esta decisão não resolve:</strong> ${escapeHtml(fragments.guidance.doesNotSolve)}</p><p class="notice">Não faça: ${escapeHtml(fragments.guidance.antiPattern)}</p>`
      : `<p class="eyebrow">Decisão solicitada</p><h3>${section.title}</h3><p><strong>${escapeHtml(finding.experiment?.action ?? section.body)}</strong></p><p>Quem conduz: ${escapeHtml(finding.experiment?.owner ?? 'Pessoas responsáveis pelo recorte com o grupo afetado')} · revisão ${escapeHtml(finding.experiment?.reviewHorizon ?? 'na próxima mudança equivalente')}.</p><p><strong>Como saber se funcionou:</strong> observe ${escapeHtml(finding.experiment?.metric ?? fragments.guidance.metric)}. Critério: ${escapeHtml(finding.experiment?.successCriterion ?? fragments.guidance.successCriterion)}.</p><p><strong>O que esta decisão não resolve:</strong> ${escapeHtml(fragments.guidance.doesNotSolve)}</p><p class="notice">Não faça: ${escapeHtml(fragments.guidance.antiPattern)}</p>${foundation}`;
    return `<section data-narrative="experiment"${compact ? '' : ' class="decision-request"'}>${testBody}</section>`;
  }
  if (section.id === 'investigation') return `<section data-narrative="investigation"><h3>${section.title}</h3><p>${escapeHtml(section.body)}</p></section>`;
  if (section.id === 'technical-options') return `<section data-narrative="technical-options"><h3>${section.title}</h3>${fragments.technicalDirection}</section>`;
  return `<details class="methodology" data-narrative="methodology"><summary>${section.title}</summary><p>${escapeHtml(section.body)}</p><p>Exemplo de mecanismo: ${escapeHtml(fragments.guidance.examples)}</p></details>`;
}

function renderTechnicalDirection(direction?: OutcomeFinding['technicalDirection']): string {
  if (!direction) return '';
  const tools = direction.toolFamilies.length
    ? `<h4>Famílias de ferramenta opcionais</h4><ul>${direction.toolFamilies.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '<h4>Famílias de ferramenta opcionais</h4><p>Nenhuma família é necessária para o primeiro experimento.</p>';
  const cost = ({ low: 'baixo', medium: 'médio', high: 'alto' } as const)[direction.qualitativeCost];
  return `<details class="technical-direction" open><summary>Opções técnicas condicionadas</summary><h4>Prática-alvo</h4><p>${escapeHtml(direction.practiceTarget)}</p><h4>Técnicas compatíveis</h4><ul>${direction.techniques.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><h4>Mecanismo habilitador</h4><p>${escapeHtml(direction.enablingMechanism)}</p>${tools}<h4>Pré-condições</h4><ul>${direction.prerequisites.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><p><strong>O que não resolve:</strong> ${escapeHtml(direction.doesNotSolve)}</p><p><strong>Custo qualitativo:</strong> ${cost}. <strong>Risco:</strong> ${escapeHtml(direction.risk)}</p><h4>Menor experimento útil</h4><p>${escapeHtml(direction.smallestExperiment)}</p><p><strong>Indicador:</strong> ${escapeHtml(direction.indicator)}</p><p><strong>Critério:</strong> ${escapeHtml(direction.successCriterion)}</p><h4>Fundamento e limite</h4><p>${escapeHtml(direction.foundation.source)} — ${escapeHtml(direction.foundation.principle)} (${escapeHtml(direction.foundation.versionOrDate)}). ${escapeHtml(direction.foundation.limitation)}</p></details>`;
}

function renderEvidenceStrength(strength: NonNullable<NonNullable<OutcomeFinding['recommendationEvidence']>['strength']>): string {
  const label = (value: 'low' | 'medium' | 'high') => ({ low: 'Baixa', medium: 'Média', high: 'Alta' })[value];
  const status = ({ 'local-hypothesis': 'Ainda é uma hipótese local', directional: 'Os relatos apontam nesta direção. Ainda não é confirmação', triangulated: 'Várias perspectivas descrevem o mesmo comportamento' })[strength.executiveStatus];
  return `<div class="evidence-assessment"><p><strong>${status}.</strong></p><dl class="evidence-strength"><div><dt>Acordo entre os relatos</dt><dd><strong>${label(strength.convergence)}</strong> — quantas respostas classificáveis apontam na mesma direção.</dd></div><div><dt>Tamanho da base</dt><dd><strong>${label(strength.populationBreadth)}</strong> — quantas pessoas sustentam a leitura; por isso 7 de 7 ainda pode ser uma base moderada.</dd></div><div><dt>Variedade de funções</dt><dd><strong>${label(strength.perspectiveDiversity)}</strong> — quantas funções diferentes observaram o comportamento.</dd></div><div><dt>Se alguém explicou o porquê</dt><dd><strong>${label(strength.causalCoverage)}</strong> — se as entrevistas explicam por que o comportamento acontece, e não apenas que ele ocorreu.</dd></div></dl></div>`;
}

function renderRecommendationEvidence(evidence: NonNullable<OutcomeFinding['recommendationEvidence']>, findingTitle: string): string {
  const patternCount = evidence.patterns.length;
  const perspectives = evidence.profiles.map(profileLabel).join(' · ') || 'não diferenciadas';
  const unclassified = evidence.unclassifiedParticipants
    ?? Math.max(0, evidence.applicablePopulation - evidence.supportingParticipants - evidence.contradictingParticipants);
  const contradiction = evidence.contradictingParticipants
    ? `${evidence.contradictingParticipants} ${evidence.contradictingParticipants === 1 ? 'pessoa relatou' : 'pessoas relataram'} uma situação que contradiz especificamente essa leitura.`
    : 'Nenhuma contradição específica atingiu o limiar de publicação. Isso não significa que as demais pessoas concordaram com a hipótese.';
  const remainder = unclassified
    ? `<p><strong>${unclassified} ${unclassified === 1 ? 'pessoa não aparece' : 'pessoas não aparecem'} neste agregado como apoio nem como contradição específica.</strong> Isso pode significar que não observaram o comportamento, não produziram um sinal classificável ou não geraram evidência publicável; não significa que concordaram com a hipótese.</p>`
    : '';
  return `<details class="decision-evidence"><summary>Base da decisão nas entrevistas</summary><section><h3>O que as entrevistas mostraram</h3><h4>O que foi identificado</h4><p><strong>O comportamento identificado foi:</strong> ${escapeHtml(findingTitle)}.</p><p><strong>${evidence.supportingParticipants} de ${evidence.applicablePopulation} pessoas que poderiam observar essa situação</strong> relataram ${patternCount} ${patternCount === 1 ? 'padrão de resposta relacionado' : 'padrões de resposta relacionados'} a esse comportamento.</p><p><strong>Perspectivas que sustentam a leitura:</strong> ${escapeHtml(perspectives)}.</p><h4>O que as demais respostas permitem concluir</h4><p>${escapeHtml(contradiction)}</p>${remainder}${evidence.strength ? renderEvidenceStrength(evidence.strength) : ''}</section></details>`;
}

function renderCausalAnalysis(causal?: OutcomeFinding['causalAnalysis']): string {
  if (!causal) return '';
  const alternatives = causal.alternatives.length
    ? `<h4>Outras explicações que ainda competem</h4><ul>${causal.alternatives.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '<p>Nenhuma hipótese concorrente foi materializada para este padrão.</p>';
  const contrary = causal.evidenceAgainst.length
    ? `<ul>${causal.evidenceAgainst.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
    : '<p>Nenhuma evidência contrária específica atingiu o limiar neste recorte.</p>';
  const loop = causal.sociotechnicalPattern ? renderSociotechnicalPattern(causal.sociotechnicalPattern) : '';
  return `<details class="methodology causal-analysis"><summary>Hipóteses e limites do diagnóstico</summary><p><strong>Hipótese mais sustentada:</strong> ${escapeHtml(causal.hypothesis)}</p>${alternatives}<h4>Evidência a favor</h4><ul>${causal.evidenceFor.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><h4>Evidência que contraria</h4>${contrary}${loop}<p><strong>O que ainda falta:</strong> ${escapeHtml(causal.missingEvidence)}</p><p><strong>Limite desta orientação:</strong> ${escapeHtml(causal.limitations)}</p><p class="muted">Versão do conhecimento: ${escapeHtml(causal.knowledgeVersion)}.</p></details>`;
}

function renderSociotechnicalPattern(pattern: NonNullable<NonNullable<OutcomeFinding['causalAnalysis']>['sociotechnicalPattern']>): string {
  const incentive = pattern.incentive ? `<p><strong>Incentivo observado:</strong> ${escapeHtml(pattern.incentive.effectOnDecision)}</p>` : '';
  const compensation = pattern.compensatingBehavior
    ? `<p><strong>Comportamento compensatório:</strong> ${escapeHtml(pattern.compensatingBehavior.description)} ${escapeHtml(pattern.compensatingBehavior.masks)}</p>`
    : '';
  return `<section class="sociotechnical-pattern"><h4>Ciclo sociotécnico em investigação</h4><p><strong>Comportamento:</strong> ${escapeHtml(pattern.behavior)}</p><p><strong>Decisão localmente racional:</strong> ${escapeHtml(pattern.localRationale)}</p><p><strong>Efeito no sistema:</strong> ${escapeHtml(pattern.systemicEffect)}</p>${incentive}${compensation}<p><strong>Hipótese de reforço:</strong> ${escapeHtml(pattern.loop.plainLanguage)}</p><dl><dt>Quem observa</dt><dd>${escapeHtml(pattern.boundary.observes)}</dd><dt>Quem recomenda</dt><dd>${escapeHtml(pattern.boundary.recommends)}</dd><dt>Quem decide</dt><dd>${escapeHtml(pattern.boundary.decides)}</dd><dt>Quem executa</dt><dd>${escapeHtml(pattern.boundary.executes)}</dd></dl><p><strong>Limite de escopo:</strong> ${escapeHtml(pattern.scope.limit)}</p><p class="notice">Decisão, consequência e hipótese organizam a investigação; não comprovam causalidade.</p></section>`;
}

function qualitativeFactor(value: number): string {
  return value >= .8 ? 'Alta' : value >= .5 ? 'Moderada' : 'Baixa';
}

function priorityComparison(primary: OutcomeFinding, competing?: OutcomeFinding): string {
  if (!competing) return '';
  const primaryFactors = primary.priorityFactors;
  const competingFactors = competing.priorityFactors;
  if (!primaryFactors || !competingFactors) return `<p><strong>Comparação com a próxima frente:</strong> ${escapeHtml(competing.title)}. Consulte os fatores detalhados antes de ampliar a decisão.</p>`;
  const reason = primaryFactors.intensity > competingFactors.intensity
    ? 'A decisão principal venceu pela intensidade mais alta do sinal, embora a próxima frente possa ter maior alcance.'
    : primaryFactors.reach > competingFactors.reach
      ? 'A decisão principal venceu pelo alcance mais alto entre as pessoas que podiam observar.'
      : 'A decisão principal venceu pela combinação dos dois fatores; a diferença é pequena e deve ser revista com evidência nova.';
  return `<p><strong>Comparação com a próxima frente:</strong> ${escapeHtml(competing.title)}. ${escapeHtml(reason)}</p>`;
}

function restrictionLabel(value: string): string {
  return ({ none: 'Nenhum mecanismo restritivo demonstrado', undetermined: 'Ainda não determinado', knowledge: 'Conhecimento', capacity: 'Capacidade disponível', process: 'Processo', policy: 'Política', tooling: 'Ferramenta', platform: 'Plataforma', access: 'Acesso', architecture: 'Arquitetura', organization: 'Estrutura organizacional', governance: 'Governança', culture: 'Cultura', incentive: 'Incentivo', priority: 'Prioridade ou alocação de capacidade', 'external-dependency': 'Dependência externa' } as Record<string, string>)[value] ?? value;
}

function containmentLabel(value: string): string {
  return ({ team: 'Time', 'shared-service': 'Serviço compartilhado', 'organizational-policy': 'Política organizacional', 'organizational-structure': 'Estrutura organizacional', external: 'Fornecedor ou regulador externo', undetermined: 'Ainda não determinada' } as Record<string, string>)[value] ?? value;
}

function authorityLabel(value: string): string {
  return ({ team: 'Liderança e pessoas do time', 'cross-team': 'Responsáveis dos times envolvidos', platform: 'Responsável pela capacidade compartilhada ou plataforma', architecture: 'Responsáveis pelas fronteiras e decisões arquiteturais', 'organizational-governance': 'Governança e liderança organizacional', 'portfolio-leadership': 'Liderança de produto, portfólio e orçamento', 'external-owner': 'Responsável pela relação externa', undetermined: 'Ainda não determinada' } as Record<string, string>)[value] ?? value;
}

function severityLabel(value: string): string { return ({ low: 'Baixa', moderate: 'Moderada', high: 'Alta', critical: 'Crítica', undetermined: 'Ainda não determinada pelas entrevistas' } as Record<string, string>)[value] ?? value; }
function impactLabel(value: string): string { return ({ security: 'Segurança', reliability: 'Confiabilidade', 'delivery-speed': 'Velocidade de entrega', quality: 'Qualidade', cost: 'Custo', 'customer-experience': 'Experiência do cliente', 'engineering-experience': 'Experiência de engenharia', 'change-capability': 'Capacidade de mudança', predictability: 'Previsibilidade' } as Record<string, string>)[value] ?? value; }

function interviewReading(outcome: ReportOutcome): string {
  if (outcome.kind === 'insufficient') return 'Ainda não há evidência coletiva suficiente — variedade temática ou grupo mínimo — para publicar um diagnóstico.';
  if (outcome.kind === 'preserve') return 'As entrevistas convergem para execução consistente, com revisão de efeito e adaptação do modo de trabalhar.';
  if (/divergem|não descrevem o mesmo sistema/i.test(outcome.reading)) return 'As lentes descrevem sistemas diferentes. Isso é o finding, não uma fragilidade automática.';
  if (/misturam/i.test(outcome.reading)) return 'Há relatos em direções opostas no mesmo elo; a contradição impede escolher uma causa.';
  if (/dispersas/i.test(outcome.reading)) return 'Há sinais frágeis, mas nenhum padrão se repetiu o suficiente para amarrar uma causa. O relatório não inventa uma causa.';
  return 'As entrevistas indicam fragilidade, mas ainda competem várias explicações.';
}

function successReading(outcome: ReportOutcome): string {
  if (outcome.kind === 'insufficient') return 'O recorte fica conclusivo quando houver evidência coletiva suficiente, sem inventar causa ou intervenção.';
  if (outcome.kind === 'preserve') return 'O sinal de regressão é decisões voltarem a depender de exceção, coordenação manual ou uma única pessoa.';
  return 'A próxima rodada fecha quando uma restrição recorrente fica visível ou a hipótese é encerrada.';
}

export function renderFindingIndex(findings: OutcomeFinding[], primaryPattern: string | undefined, _map: OrganizationalAreaMap, capabilityBase?: string): string {
  const unique = uniqueFindingsByPattern(findings).filter((finding) => finding.pattern !== primaryPattern);
  if (!unique.length) return '';
  const primarySystem = primaryPattern ? diagnosticSystemFor(primaryPattern) : undefined;
  const systems = groupFindingsByDiagnosticSystem(unique);
  const related = systems.filter((system) => primarySystem && system.id === primarySystem.id);
  const independent = systems.filter((system) => !primarySystem || system.id !== primarySystem.id);
  const card = (finding: OutcomeFinding) => {
    const stance = finding.prescription?.status === 'investigate' ? 'investigar' : 'decidir';
    const title = capabilityBase
      ? `<a href="${escapeHtml(findingDetailHref(capabilityBase, finding))}"><strong>${escapeHtml(finding.title)}</strong></a>`
      : `<strong>${escapeHtml(finding.title)}</strong>`;
    const explanation = guidanceFor(finding.pattern, finding.foundation, finding.title).plainExplanation;
    const mechanism = explanation && explanation !== finding.title ? `<p>${escapeHtml(explanation)}</p>` : '';
    return `<article class="observation-card">${title}${mechanism}<p class="muted">${escapeHtml(stance)}</p></article>`;
  };
  const group = (label: string, items: OutcomeFinding[], note?: string) => (
    `<div class="observation-group"><h3>${escapeHtml(label)}</h3>${note ? `<p class="muted">${escapeHtml(note)}</p>` : ''}<div class="observation-grid">${items.map(card).join('')}</div></div>`
  );
  const relatedBlock = related.map((system) => group(
    'Variações deste mecanismo',
    system.findings,
    'Não são problemas novos: são o mesmo limitador visto em outro recorte.',
  ));
  const independentBlock = independent.map((system) => group(system.label, system.findings));
  return `<section class="card finding-index" id="report-portfolio"><h2>Outras restrições</h2><p>Tratar só o ponto acima não remove as frentes abaixo. Cada grupo é um mecanismo distinto — empacotamento, fila, lote, cerimônia sem fechamento ou fluxo que esconde espera.</p>${relatedBlock.join('')}${independentBlock.join('')}</section>`;
}

export function renderFindingPortfolio(findings: OutcomeFinding[], primaryPattern?: string, occurrences: FindingScopeOccurrence[] = [], capabilityBase?: string, scopeId?: string): string {
  const uniqueFindings = uniqueFindingsByPattern(findings);
  const systems = groupFindingsByDiagnosticSystem(uniqueFindings);
  const allSecondary = uniqueFindings.filter((finding) => finding.pattern !== primaryPattern);
  if (!allSecondary.length) return '';
  const portfolio = TransformationPortfolioPlanner.plan(allSecondary);
  const visibleSteps = portfolio.sequence;
  const visibleConditioned = portfolio.conditioned;
  const total = allSecondary.length;
  const item = (finding: OutcomeFinding) => {
    const evidence = finding.recommendationEvidence;
    const capabilities = finding.affectedCapabilities?.length ? finding.affectedCapabilities : [finding.detailCapability];
    const support = evidence ? `${evidence.supportingParticipants} de ${evidence.applicablePopulation} pessoas sustentam esta leitura` : 'Evidência agregada disponível no detalhamento';
    const scope = occurrences.find((candidate) => candidate.pattern === finding.pattern);
    const scopeText = scope ? renderFindingScope(scope) : '';
    const title = capabilityBase
      ? `<a href="${escapeHtml(findingDetailHref(capabilityBase, finding, scopeId))}"><strong>${escapeHtml(finding.title)}</strong></a>`
      : `<strong>${escapeHtml(finding.title)}</strong>`;
    return `<li>${title}<br><span class="muted">${capabilities.map((id) => escapeHtml(CapabilityTaxonomy.labelFor(id))).join(' · ')} · ${escapeHtml(support)}.${scopeText}</span></li>`;
  };
  const portfolioLabels: Record<DiagnosticPortfolioLevel, string> = {
    organizational: 'Decisões organizacionais',
    shared: 'Capacidades compartilhadas',
    local: 'Problemas locais',
    undetermined: 'Ainda precisamos localizar quem pode resolver',
  };
  const phaseLabels: Record<TransformationPhase, string> = {
    stabilize: 'estabilizar risco e ownership',
    'shorten-feedback': 'encurtar feedback',
    'shared-capability': 'remover restrições compartilhadas',
    'operating-model': 'ajustar decisões organizacionais',
    'adaptive-capability': 'desenvolver capacidade adaptativa',
  };
  const sequencedItems = visibleSteps.map((step, index) => {
    const finding = allSecondary.find((candidate) => candidate.pattern === step.pattern)!;
    const dependency = step.dependsOn.length ? ` <strong>Depende de:</strong> ${escapeHtml(allSecondary.find((candidate) => candidate.pattern === step.dependsOn[0])?.title ?? step.dependsOn[0]!)}.` : '';
    const moment = index === 0 ? 'Agora' : 'Depois';
    return `<section class="finding-portfolio-group"><h3>${moment} · ${phaseLabels[step.phase]}</h3><p class="muted">${portfolioLabels[classifyPortfolioLevel(finding)]} · decisão: ${escapeHtml(authorityLabel(step.authority))}.${dependency}</p><ol>${item(finding)}</ol><details><summary>Condições e riscos deste passo</summary><p><strong>Antes de começar:</strong> ${escapeHtml(step.prerequisites.join(' '))}</p><p><strong>Não é compatível com:</strong> ${escapeHtml(step.incompatibilities.join(' '))}</p><p><strong>Risco que pode ser deslocado:</strong> ${escapeHtml(step.riskDisplacement)}</p><p class="muted">Custo ${qualitativeLabel(step.cost)} · risco ${qualitativeLabel(step.risk)} · reversibilidade ${qualitativeLabel(step.reversibility)}</p></details></section>`;
  }).join('');
  const conditionedItems = visibleConditioned.length
    ? `<section class="finding-portfolio-group"><h3>Antes de ampliar · reduzir incerteza</h3><ol>${visibleConditioned.map((candidate) => {
      const finding = allSecondary.find((item) => item.pattern === candidate.pattern)!;
      return item({ ...finding, title: `${candidate.title} — ${candidate.condition}` });
    }).join('')}</ol></section>`
    : '';
  const readyCount = portfolio.sequence.length;
  const investigateCount = portfolio.conditioned.length;
  const visibleCount = visibleSteps.length + visibleConditioned.length;
  const truncation = total > visibleCount ? ` O relatório está mostrando os ${visibleCount} de ${total} padrões publicados.` : '';
  const attention = readyCount
    ? `${readyCount} ${primaryPattern ? (readyCount === 1 ? 'outra decisão pronta exige' : 'outras decisões prontas exigem') : (readyCount === 1 ? 'decisão pronta exige' : 'decisões prontas exigem')} atenção.`
    : 'Ainda não há decisão pronta neste recorte.';
  const uncertainty = investigateCount
    ? ` ${investigateCount} ${investigateCount === 1 ? 'padrão ainda pede' : 'padrões ainda pedem'} discriminação de causa — isso não entra como decisão para diretoria.`
    : '';
  const systemSummary = systems.length < uniqueFindings.length
    ? `<p><strong>${uniqueFindings.length} padrões formam ${systems.length} ${systems.length === 1 ? 'frente diagnóstica' : 'frentes diagnósticas'}:</strong> ${systems.map((system) => `${escapeHtml(system.label)} (${system.findings.length})`).join(' · ')}. O agrupamento organiza padrões relacionados; não declara que uma causa única já foi comprovada.</p>`
    : '';
  return `<section class="card finding-portfolio"><p class="eyebrow">Panorama de comportamentos recorrentes</p><h2>${primaryPattern ? 'Outros problemas que exigem decisão' : 'Problemas que exigem decisão'}</h2>${systemSummary}<p>${escapeHtml(attention)}${escapeHtml(uncertainty)}${escapeHtml(truncation)}</p>${readyCount ? '<h3>Sequência de transformação</h3><p>A ordem considera dependências, risco e quem possui autoridade. Ela não autoriza todas as frentes ao mesmo tempo.</p>' : ''}${sequencedItems}${conditionedItems}</section>`;
}

function renderScopeCompanionFindings(findings: OutcomeFinding[], primaryPattern: string | undefined, capabilityBase: string, scopeId: string): string {
  const companions = uniqueFindingsByPattern(findings).filter((finding) => finding.pattern !== primaryPattern);
  if (!companions.length) return '';
  const items = companions.map((finding) => `<li><a href="${escapeHtml(findingDetailHref(capabilityBase, finding, scopeId))}">${escapeHtml(finding.title)}</a></li>`).join('');
  const truncation = '';
  return `<section class="scope-companion-findings"><h3>Outros comportamentos neste recorte</h3><ul>${items}</ul>${truncation}</section>`;
}

function qualitativeLabel(value: 'low' | 'moderate' | 'high'): string {
  return { low: 'baixo', moderate: 'moderado', high: 'alto' }[value];
}

function findingAnchor(pattern: string | undefined): string {
  return `finding-${(pattern ?? 'diagnostic').replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function findingDetailHref(capabilityBase: string, finding: OutcomeFinding, scopeId?: string): string {
  const query = scopeId ? `?scope=${encodeURIComponent(scopeId)}` : '';
  return `${capabilityBase}/${encodeURIComponent(finding.detailCapability)}${query}#${findingAnchor(finding.pattern)}`;
}

type ScopeReportView = {
  id: string;
  path: string;
  classification: { level: number; label: string; limitingCapabilities: string[] };
  capabilityGroups: Parameters<typeof renderCapabilityRadar>[0];
  findings: OutcomeFinding[];
  perspectiveGaps: Array<{ title: string; capability?: string }>;
  audienceReport?: UnitManagementReport;
};

export function renderScopeIndex(scopes: ScopeReportView[], _capabilityBase: string): string {
  if (!scopes.length) return '';
  const items = scopes.map((scope) => {
    const outcome = decideReportOutcome({ classification: scope.classification, branches: scope.capabilityGroups, findings: scope.findings, perspectiveGaps: scope.perspectiveGaps });
    const change = outcome.finding?.title ?? outcome.nextStepTitle;
    const firstCapability = flattenRadarNodes(scope.capabilityGroups)[0];
    const coverage = firstCapability
      ? `<a href="${escapeHtml(`${_capabilityBase}/${firstCapability.id}?scope=${encodeURIComponent(scope.id)}`)}">Ver cobertura deste time</a>`
      : '';
    return `<li class="scope-line"><strong>${escapeHtml(scope.path)}</strong> <span class="tag">${escapeHtml(scope.classification.label)}</span> <span class="muted">${escapeHtml(change)}</span> ${coverage}</li>`;
  }).join('');
  return `<section class="card scope-index" id="report-units"><h2>Unidades</h2><ul>${items}</ul></section>`;
}

export function renderScopeReport(scope: ScopeReportView, capabilityBase: string): string {
  const outcome = decideReportOutcome({ classification: scope.classification, branches: scope.capabilityGroups, findings: scope.findings, perspectiveGaps: scope.perspectiveGaps });
  const audienceReport = scope.audienceReport ?? AudienceReportProjector.projectUnit({ id: scope.id, path: scope.path, findings: scope.findings, portfolio: TransformationPortfolioPlanner.plan(scope.findings) });
  const empty = scope.findings.length ? '' : '<p class="muted">Sem padrão problemático recorrente com confiança suficiente.</p>';
  const gaps = scope.perspectiveGaps.map((gap) => `<article><h3>${escapeHtml(gap.title)}</h3><p>Diferença entre perspectivas elegíveis; valide assimetria de visibilidade e poder.</p></article>`).join('');
  const managerReading = renderUnitManagementReport(audienceReport, capabilityBase);
  const ordered = uniqueFindingsByPattern(scope.findings);
  const competingFinding = ordered.find((finding) => finding.pattern !== outcome.finding?.pattern);
  const outcomeContext = { confirmedProblemCount: ordered.length, ...(competingFinding ? { competingFinding } : {}) };
  return `<details class="card scope-report"><summary><strong>${escapeHtml(scope.path)}</strong> <span class="tag">${escapeHtml(scope.classification.label)}</span></summary>${managerReading}${renderOutcome(outcome, outcomeContext)}${renderScopeCompanionFindings(scope.findings, outcome.finding?.pattern, capabilityBase, scope.id)}${renderClassification(scope.classification, outcome)}${renderCapabilityRadar(scope.capabilityGroups, capabilityBase, scope.id)}${empty}${gaps}</details>`;
}

function renderUnitManagementReport(report: UnitManagementReport, capabilityBase: string): string {
  const list = (findings: OutcomeFinding[], empty: string) => findings.length
    ? `<ul>${findings.map((finding) => `<li><a href="${escapeHtml(findingDetailHref(capabilityBase, finding, report.id))}">${escapeHtml(finding.title)}</a><br><span class="muted">${escapeHtml(audienceAsk(finding, 'unit-management'))}</span></li>`).join('')}</ul>`
    : `<p class="muted">${escapeHtml(empty)}</p>`;
  const escalation = report.escalations.length
    ? `<ul>${report.escalations.map((step) => `<li>${escapeHtml(step.title)} — escalar para ${escapeHtml(authorityLabel(step.authority))}</li>`).join('')}</ul>`
    : '<p class="muted">Nenhuma escalada confirmada para este recorte.</p>';
  return `<section class="unit-management-report"><p class="eyebrow">Leitura da gerência local</p><h3>O que a unidade pode mudar</h3>${list(report.localActions, 'Nenhuma ação local foi confirmada.')}<h3>Restrições que a unidade recebe</h3>${list(report.receivedConstraints, 'Nenhuma restrição externa à autoridade da unidade foi confirmada.')}<h3>O que precisa ser escalado</h3>${escalation}</section>`;
}

function renderFindingScope(scope: FindingScopeOccurrence): string {
  const names = scope.scopePaths.map((path) => path.split('/').at(-1) ?? path);
  if (scope.eligibleScopeCount <= 1) return ` <strong>Escopo observado:</strong> ${escapeHtml(names.join(' · '))}.`;
  if (scope.scopePaths.length === 1) {
    const absent = (scope.eligibleScopePaths ?? []).filter((path) => !scope.scopePaths.includes(path)).map((path) => path.split('/').at(-1) ?? path);
    const absence = absent.length ? `na ${escapeHtml(absent.join(' · '))}` : (scope.eligibleScopeCount === 2 ? 'na outra unidade elegível' : `nas outras ${scope.eligibleScopeCount - 1} unidades elegíveis`);
    return ` <strong>Escopo local:</strong> ${escapeHtml(names[0]!)}; não foi demonstrado ${absence}.`;
  }
  if (scope.scopePaths.length === scope.eligibleScopeCount) return ` <strong>Escopo transversal:</strong> apareceu em todas as ${scope.eligibleScopeCount} unidades elegíveis.`;
  return ` <strong>Escopo compartilhado:</strong> ${escapeHtml(names.join(' · '))}; ${scope.eligibleScopeCount - scope.scopePaths.length} ${scope.eligibleScopeCount - scope.scopePaths.length === 1 ? 'unidade elegível não sustentou' : 'unidades elegíveis não sustentaram'} o padrão.`;
}

function profileLabel(id: string): string {
  return profiles[id as keyof typeof profiles] ?? id;
}

function summarizeLimiters(limiters: string[]): string {
  if (!limiters.length) return 'Nenhum limitador recorrente confirmado';
  return limiters[0] ?? 'Nenhum limitador recorrente confirmado';
}

type CapabilityRadarNode = { id: string; label: string; level: number; confidence: number; evidence: number; observers?: number; interval?: { lower: number; upper: number }; hasContradiction: boolean; assessed: boolean; coverage: number; children: CapabilityRadarNode[] };

export function renderOrganizationalAreaMap(
  map: OrganizationalAreaMap,
  urls: { areaBase: string; capabilityBase: string; scopeQuery?: string },
): string {
  const query = urls.scopeQuery ?? '';
  const tiles = map.systems.map((system) => {
    const chips = system.children.filter((child) => child.observed).map((child) => (
      `<a class="area-chip" href="${escapeHtml(areaChildHref(child, urls) + query)}">${escapeHtml(child.label)}</a>`
    )).join('');
    const status = system.observed
      ? (system.findingCount ? `${system.findingCount} ${system.findingCount === 1 ? 'problema' : 'problemas'}` : 'observado')
      : 'não observado';
    const heading = system.observed
      ? `<a href="${escapeHtml(`${urls.areaBase}/${system.id}${query}`)}"><h3>${escapeHtml(system.label)}</h3></a>`
      : `<h3>${escapeHtml(system.label)}</h3>`;
    const drill = system.observed
      ? `<p><a class="area-drill" href="${escapeHtml(`${urls.areaBase}/${system.id}${query}`)}">Ver disciplinas</a></p>`
      : '';
    return `<article class="area-tile${system.observed ? ' observed' : ' unobserved'}">${heading}<p class="muted">${escapeHtml(status)}</p>${chips ? `<p class="area-chips">${chips}</p>` : ''}${drill}</article>`;
  }).join('');
  const bandChildren = map.band.children.filter((child) => child.observed);
  const band = map.band.observed
    ? `<nav class="area-band" aria-label="Gestão"><p class="eyebrow">Gestão</p><p>${bandChildren.map((child) => `<a href="${escapeHtml(`${urls.capabilityBase}/${child.leafId ?? child.id}${query}`)}">${escapeHtml(child.label)}</a>`).join(' · ')}</p></nav>`
    : '';
  return `<section class="area-map" aria-label="Sistemas da organização"><div class="area-map-systems">${tiles}</div>${band}</section>`;
}

export function renderOrganizationalAreaIndex(
  path: OrganizationalAreaNode[],
  urls: { areaBase: string; capabilityBase: string; scopeQuery?: string },
): string {
  const selected = path.at(-1);
  if (!selected) return '';
  const query = urls.scopeQuery ?? '';
  const detailOf = (node: OrganizationalAreaNode) => node.findingCount
    ? `${node.findingCount} ${node.findingCount === 1 ? 'problema' : 'problemas'}`
    : 'observado';
  const self = selected.kind === 'leaf'
    ? `<a class="area-index-link" href="${escapeHtml(`${urls.capabilityBase}/${selected.leafId ?? selected.id}${query}`)}"><strong>${escapeHtml(selected.label)}</strong><span>${escapeHtml(detailOf(selected))}</span></a>`
    : '';
  const items = selected.children.filter((child) => child.observed).map((child) => (
    `<a class="area-index-link" href="${escapeHtml(areaChildHref(child, urls) + query)}"><strong>${escapeHtml(child.label)}</strong><span>${escapeHtml(detailOf(child))}</span></a>`
  )).join('');
  return `<nav class="area-index" aria-label="Disciplinas de ${escapeHtml(selected.label)}">${self}${items || (self ? '' : '<p class="muted">Nenhuma disciplina observada neste recorte.</p>')}</nav>`;
}

export function renderAreaRecorte(
  path: OrganizationalAreaNode[],
  urls: { areaBase: string; capabilityBase: string; scopeQuery?: string; capabilities?: CapabilityRadarNode[] },
): string {
  const selected = path.at(-1);
  if (!selected) return '';
  const index = renderOrganizationalAreaIndex(path, urls);
  const radarNodes = areaChildrenAsRadar(selected, urls.capabilities ?? []);
  const radar = radarNodes.length ? renderCapabilityRadar(radarNodes, urls.capabilityBase, urls.scopeQuery ? new URLSearchParams(urls.scopeQuery.replace(/^\?/, '')).get('scope') ?? undefined : undefined) : '';
  return `<section class="area-recorte"><p class="eyebrow">Recorte: ${escapeHtml(selected.label)}</p><h2>Disciplinas de ${escapeHtml(selected.label)}</h2><p>Abra uma disciplina para ver o que as entrevistas sustentam neste sistema. O mapa abaixo localiza cobertura; “?” não é fragilidade.</p>${index}${radar}</section>`;
}

function areaLeafIds(node: OrganizationalAreaNode): string[] {
  if (node.leafId && !node.children.length) return [node.leafId];
  const nested = node.children.flatMap(areaLeafIds);
  return node.leafId ? [node.leafId, ...nested] : nested;
}

function flattenRadarNodes(nodes: CapabilityRadarNode[]): CapabilityRadarNode[] {
  return nodes.flatMap((node) => [node, ...flattenRadarNodes(node.children)]);
}

function areaChildrenAsRadar(selected: OrganizationalAreaNode, capabilities: CapabilityRadarNode[]): CapabilityRadarNode[] {
  const flat = flattenRadarNodes(capabilities);
  const children = selected.children.length ? selected.children : [selected];
  return children.map((child) => {
    const ids = new Set(areaLeafIds(child));
    const matches = flat.filter((node) => ids.has(node.id));
    const assessed = matches.filter((node) => node.assessed);
    return {
      id: child.leafId ?? child.id,
      label: child.label,
      level: assessed.length ? Math.min(...assessed.map((node) => node.level)) : 0,
      confidence: assessed[0]?.confidence ?? 0,
      evidence: assessed.reduce((sum, node) => sum + node.evidence, 0),
      hasContradiction: assessed.some((node) => node.hasContradiction),
      assessed: assessed.length > 0,
      coverage: assessed.length ? assessed.reduce((sum, node) => sum + node.coverage, 0) / assessed.length : 0,
      children: [],
    };
  });
}

function areaChildHref(node: OrganizationalAreaNode, urls: { areaBase: string; capabilityBase: string }): string {
  if (node.kind === 'leaf' && !node.children.some((child) => child.observed)) {
    return `${urls.capabilityBase}/${node.leafId ?? node.id}`;
  }
  return `${urls.areaBase}/${node.id}`;
}

export function renderCapabilityRadar(
  capabilities: CapabilityRadarNode[],
  baseUrl: string,
  scopeId?: string,
): string {
  if (!capabilities.some((capability) => capability.assessed)) {
    return `<article class="card radar-card"><h3>Mapa de contraste e cobertura</h3><p><strong>Nenhum pilar possui cobertura temática suficiente.</strong></p><p class="muted">Isso não pede mais gente: as entrevistas não atravessaram dois padrões distintos nestes pilares. Isso não contradiz o diagnóstico: uma prática específica ainda pode ter evidência suficiente para orientar preservação ou investigação, enquanto os pilares amplos permanecem não avaliados.</p></article>`;
  }
  const center = 210;
  const radius = 130;
  const point = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / capabilities.length;
    return `${(center + Math.cos(angle) * radius * scale).toFixed(1)},${(center + Math.sin(angle) * radius * scale).toFixed(1)}`;
  };
  const axes = capabilities.map((_, index) => `<line x1="${center}" y1="${center}" x2="${point(index, 1).split(',')[0]}" y2="${point(index, 1).split(',')[1]}" />`).join('');
  const rings = [1, 2, 3, 4].map((level) => `<polygon points="${capabilities.map((_, index) => point(index, level / 4)).join(' ')}" />`).join('');
  const completeResult = capabilities.every((capability) => capability.assessed);
  const result = capabilities.map((capability, index) => point(index, capability.level / 4)).join(' ');
  const capabilityUrl = (id: string) => `${baseUrl}/${id}${scopeId ? `?scope=${encodeURIComponent(scopeId)}` : ''}`;
  const labels = capabilities.map((capability, index) => {
    const [labelX, labelY] = point(index, 1.14).split(',');
    if (!capability.assessed) {
      return `<text class="radar-axis-label radar-axis-unassessed" x="${labelX}" y="${labelY}">${escapeHtml(capability.label)}<tspan x="${labelX}" dy="12">sem cobertura temática</tspan></text>`;
    }
    return `<text class="radar-axis-label" x="${labelX}" y="${labelY}">${escapeHtml(capability.label)}</text>`;
  }).join('');
  const markers = capabilities.map((capability, index) => {
    if (!capability.assessed) {
      const [x, y] = point(index, .12).split(',');
      return `<g class="radar-marker radar-marker-unassessed" tabindex="0" role="img" aria-label="${escapeHtml(capability.label)}: sem cobertura temática; detalhe indisponível"><circle cx="${x}" cy="${y}" r="9"/><text class="radar-question" x="${x}" y="${Number(y) + 4}">?</text>${radarTooltip(x!, y!, capability.label, 'Sem cobertura temática', 'As entrevistas não passaram por dois padrões distintos nesta disciplina. Não é falta de pessoas.')}</g>`;
    }
    const [x, y] = point(index, Math.max(.12, capability.level / 4)).split(',');
    const status = radarStatus(capability.level);
    return `<a href="${capabilityUrl(capability.id)}" class="radar-point radar-status-${status.id}" aria-label="${escapeHtml(capability.label)}: ${executiveStage(capability.level)}. ${escapeHtml(status.summary)}"><circle cx="${x}" cy="${y}" r="8"/>${radarTooltip(x!, y!, capability.label, executiveStage(capability.level), status.summary)}</a>`;
  }).join('');
  const drillNavigation = capabilities.map((capability) => capability.assessed
    ? `<a class="radar-drill-link radar-status-${radarStatus(capability.level).id}" href="${capabilityUrl(capability.id)}">${escapeHtml(capability.label)} <span>${executiveStage(capability.level)} · ${coverageLabel(capability.coverage)}</span></a>`
    : `<span class="radar-drill-link disabled" aria-disabled="true">${escapeHtml(capability.label)} <span>Sem cobertura temática</span></span>`).join('');
  return `<article class="card radar-card"><h3>Mapa de contraste e cobertura</h3><p class="muted">Use o mapa para localizar contraste e aprofundar, não para comparar décimos. “?” significa que a entrevista não cobriu dois padrões desta disciplina. Não é falta de pessoas nem fragilidade.</p><svg class="radar" viewBox="0 0 420 420" role="img" aria-label="Mapa de contraste das capacidades observadas"><g class="radar-grid">${rings}${axes}</g>${completeResult ? `<polygon class="radar-result" points="${result}" />` : ''}<g class="radar-labels">${labels}</g><g class="radar-markers">${markers}</g></svg><nav class="radar-drill-navigation" aria-label="Aprofundar capacidades">${drillNavigation}</nav></article>`;
}

function radarStatus(level: number): { id: string; summary: string } {
  if (level < 1) return { id: 'critical', summary: 'Fragilidade confirmada; exige ação imediata.' };
  if (level < 2) return { id: 'reactive', summary: 'Prática reativa; prioridade para estabilização.' };
  if (level < 3) return { id: 'repeatable', summary: 'Prática repetível, ainda sensível ao contexto.' };
  if (level < 4) return { id: 'managed', summary: 'Prática gerenciada; há espaço para ganhar resiliência.' };
  return { id: 'adaptive', summary: 'Prática adaptativa; preserve e monitore sua consistência.' };
}

function radarTooltip(x: string, y: string, label: string, value: string, summary: string): string {
  const tooltipX = Math.min(325, Math.max(95, Number(x)));
  const tooltipY = Math.max(72, Number(y) - 20);
  return `<g class="radar-tooltip" transform="translate(${tooltipX} ${tooltipY})" aria-hidden="true"><rect x="-92" y="-58" width="184" height="52" rx="8"/><text x="0" y="-40"><tspan class="tooltip-title" x="0">${escapeHtml(label)} · ${escapeHtml(value)}</tspan><tspan x="0" dy="16">${escapeHtml(summary)}</tspan></text></g>`;
}

function capabilityReading(level: number): string {
  return radarStatus(level).summary;
}

function executiveStage(level: number): string {
  return ['Opaco', 'Reativo', 'Repetível', 'Gerenciado', 'Adaptativo'][Math.max(0, Math.min(4, Math.floor(level)))]!;
}

function coverageLabel(coverage: number): string {
  if (coverage >= .85) return 'cobertura temática ampla';
  if (coverage >= .5) return 'cobertura temática parcial';
  return 'cobertura temática inicial';
}

function findCapabilityPath(nodes: CapabilityRadarNode[], id: string, ancestors: CapabilityRadarNode[] = []): CapabilityRadarNode[] | undefined {
  for (const node of nodes) {
    if (node.id === id) return [...ancestors, node];
    const nested = findCapabilityPath(node.children, id, [...ancestors, node]);
    if (nested) return nested;
  }
  return undefined;
}

function flattenCapabilityIds(node: CapabilityRadarNode): string[] {
  return [node.id, ...node.children.flatMap(flattenCapabilityIds)];
}

function renderProbabilisticSummary(posteriors: DiagnosticPosterior[], modelVersion: string | null, title = 'Causas e pontos de atenção', limiterId?: string): string {
  const confirmed: ConfirmedCause[] = posteriors.flatMap((item) => {
    if (limiterId && item.capability !== limiterId) return [];
    const leader = item.hypotheses[0];
    if (!leader || leader.id === 'unknown' || leader.probability < .7 || (item.population?.support ?? 0) < 2) return [];
    return [{ pattern: leader.id, label: leader.label, capability: item.capability, probability: leader.probability, support: item.population!.support, applicable: item.population!.applicable, profiles: item.population!.profiles }];
  });
  const unique = uniqueConfirmedCauses(confirmed);
  if (!unique.length) return '';
  const items = unique.map((cause) => `<li><strong>${escapeHtml(cause.label)}</strong><br><span class="muted">${escapeHtml(causeEvidenceReading(cause))} · ${cause.support} de ${cause.applicable} pessoas que poderiam observar a situação, em ${cause.profiles} perspectiva(s) · ${escapeHtml(CapabilityTaxonomy.labelFor(cause.capability))}.</span></li>`).join('');
  return `<section><h2>${title}</h2><p class="muted">Hipóteses distintas com suporte da opção observada. Cada padrão aparece uma vez. Use-as para entender o recorte, não para avaliar pessoas.</p><article class="card diagnostic-hypothesis"><span class="tag">leitura das causas</span><ul>${items}</ul></article><details class="methodology"><summary>Sobre a precisão desta análise</summary><p>Modelo ${escapeHtml(modelVersion ?? 'não publicado')}. As faixas são julgamentos especialistas apoiados pelas evidências; não representam probabilidade calibrada até o piloto produzir massa revisada.</p></details></section>`;
}

function causeEvidenceReading(cause: ConfirmedCause): string {
  if (cause.support < 5 || cause.profiles < 2) return 'Hipótese local; amplitude ou diversidade limitada';
  return diagnosticStrength(cause.probability);
}

type ReportFinding = {
  kind?: 'correction' | 'evolution'; pattern?: string; title: string; cause?: string; intervention: string; confidence?: number; priority?: number;
  detailCapability?: string; constraint?: string; reasons?: string[];
  experiment?: { action: string; owner: string; metric: string; reviewHorizon: string; successCriterion: string };
  foundation?: { source: string; principle: string; why: string };
  solutionCapability?: string;
  solutionReadiness?: { stage: string; label: string; explanation: string; evidence: number };
  causalAnalysis?: OutcomeFinding['causalAnalysis'];
};

export function renderCapabilityDiagnosis(findings: ReportFinding[], capability: CapabilityRadarNode): string {
  if (findings.length) {
    const grouped = [
      { title: 'Ações imediatas', items: findings.filter((finding) => finding.kind !== 'evolution' && (finding.priority ?? 0) >= .7) },
      { title: 'Melhorias de curto prazo', items: findings.filter((finding) => finding.kind !== 'evolution' && (finding.priority ?? 0) < .7) },
      { title: 'Evoluções recomendadas', items: findings.filter((finding) => finding.kind === 'evolution') },
    ].filter((group) => group.items.length);
    return `<section><h2>Prioridades e próximos passos</h2>${grouped.map((group) => `<div class="diagnostic-group"><h3>${group.title}</h3>${group.items.map((finding) => {
      const experiment = finding.experiment;
      const urgency = finding.kind === 'evolution' ? 'Próximo passo de evolução' : (finding.priority ?? 0) >= .7 ? 'Atenção imediata' : 'Melhoria de curto prazo';
      const readiness = finding.solutionReadiness ? `<div class="solution-readiness"><h4>Capacidade necessária para resolver</h4><p>${escapeHtml(finding.solutionCapability ?? 'Capacidade coletiva compatível com a causa observada.')}</p><p><strong>${escapeHtml(finding.solutionReadiness.label)}</strong> — ${escapeHtml(finding.solutionReadiness.explanation)}</p></div>` : '';
      const causal = renderCausalAnalysis(finding.causalAnalysis);
      return `<article id="${findingAnchor(finding.pattern)}" class="card diagnostic-problem"><span class="tag">${urgency} · ${escapeHtml(diagnosticStrength(finding.confidence ?? 0))}</span><h3>${escapeHtml(finding.title)}</h3><div class="executive-action-grid"><div><h4>Impacto no negócio</h4><p>${escapeHtml(executiveImpact(finding))}</p></div><div><h4>Ação recomendada</h4><p>${escapeHtml(experiment?.action ?? finding.intervention)}</p></div><div><h4>Como acompanhar</h4><p>${escapeHtml(experiment?.metric ?? 'Observe a redução de espera, falhas e retrabalho no fluxo afetado.')}</p></div></div>${readiness}${causal}${experiment ? `<dl class="diagnostic-experiment"><dt>Responsável sugerido</dt><dd>${escapeHtml(experiment.owner)}</dd><dt>Prazo de revisão</dt><dd>${escapeHtml(experiment.reviewHorizon)}</dd><dt>Resultado esperado</dt><dd>${escapeHtml(experiment.successCriterion)}</dd></dl>` : ''}<details class="methodology"><summary>Ver diagnóstico, evidências e fundamento</summary>${finding.cause ? `<h4>Causa provável</h4><p>${escapeHtml(finding.cause)}</p>` : ''}${finding.foundation ? `<h4>Fundamento</h4><p>${escapeHtml(finding.foundation.source)} — ${escapeHtml(finding.foundation.principle)}. ${escapeHtml(finding.foundation.why)}</p>` : ''}${finding.constraint && finding.constraint !== 'none' ? `<p>Tipo de restrição: ${escapeHtml(finding.constraint)}</p>` : ''}<ul>${(finding.reasons ?? []).map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul></details></article>`;
    }).join('')}</div>`).join('')}</section>`;
  }
  if (capability.hasContradiction) return '<p class="notice">Os sinais divergem e ainda não sustentam uma recomendação. A próxima entrevista deve discriminar contexto, acesso, competência, processo e estrutura.</p>';
  if (capability.confidence < .5) return '<p class="notice">A evidência ainda é insuficiente para afirmar ausência de problema ou recomendar preservação da prática.</p>';
  if (capability.level < 1) return `<article class="card diagnostic-problem"><span class="tag">atenção prioritária</span><h2>Capacidade em estado crítico</h2><p>${capability.evidence} sinais convergem para fragilidade, mas estão distribuídos entre padrões que não alcançaram recorrência mínima isoladamente. O relatório não atribui uma causa sem sustentação coletiva.</p><h3>Próximo aprofundamento</h3><p>Recolha outra rodada dirigida aos comportamentos divergentes antes de selecionar uma intervenção estrutural.</p></article>`;
  if (capability.level < 2) return '<p class="notice">A capacidade apresenta comportamento predominantemente reativo. A evidência confirma fragilidade, mas ainda não isolou uma causa recorrente para orientar uma correção específica.</p>';
  if (capability.level < 4) return '<p class="notice">A capacidade ainda não atingiu o estado adaptativo, mas as evidências coletadas não discriminam uma intervenção com confiança suficiente. A próxima rodada deve reconstruir um evento recente, sua consequência e a restrição que impediu a prática de avançar.</p>';
  return '<p class="notice positive-evidence">As evidências convergem para uma prática adaptativa. Nenhuma intervenção é adicionada apenas para preencher o relatório.</p>';
}

function executiveImpact(finding: ReportFinding): string {
  const capabilityImpacts: Record<string, string> = {
    'product-direction': 'Decisões podem consumir investimento sem manter alinhamento com o resultado que justificou o trabalho.',
    'discovery-validation': 'Hipóteses permanecem em execução por mais tempo antes que evidências de uso permitam corrigir a direção.',
    'portfolio-management': 'Novas iniciativas disputam capacidade sem reconciliar resultados anteriores, custo de atraso e trabalho já iniciado.',
    'planning-refinement': 'Riscos e dependências aparecem depois do compromisso, ampliando espera, mudança de escopo e retrabalho.',
    'work-management': 'Trabalho simultâneo e bloqueios alongam o tempo até valor e reduzem a previsibilidade do compromisso.',
    'continuous-integration': 'Mudanças se encontram tarde, tornando incompatibilidades maiores e mais caras de diagnosticar.',
    'release-feedback': 'A organização demora mais para aprender com uma mudança e acumula risco antes de chegar às pessoas usuárias.',
  };
  const contextualImpact = finding.detailCapability ? capabilityImpacts[finding.detailCapability] : undefined;
  if (contextualImpact) return contextualImpact;
  if (finding.kind === 'evolution') return 'A prática atual funciona, mas pode perder consistência ao mudar de escala, equipe ou contexto.';
  const impacts: Record<string, string> = {
    access: 'Filas de permissão aumentam o tempo de resposta e concentram risco em poucas pessoas.',
    tooling: 'Feedback tardio amplia retrabalho, tempo de entrega e chance de falhas chegarem ao cliente.',
    process: 'Variação no processo reduz previsibilidade e faz problemas semelhantes reaparecerem.',
    organization: 'Dependências entre equipes elevam espera, conflitos de prioridade e perda de responsabilidade ponta a ponta.',
    governance: 'Controles manuais atrasam decisões sem garantir segurança de forma consistente.',
    architecture: 'Mudanças ficam maiores e mais arriscadas, dificultando entrega frequente e recuperação rápida.',
    knowledge: 'Decisões dependem de conhecimento individual e variam entre pessoas ou situações.',
    culture: 'Riscos permanecem ocultos por mais tempo e o aprendizado tende a virar ação pontual.',
  };
  return impacts[finding.constraint ?? ''] ?? 'A limitação aumenta espera, retrabalho ou exposição operacional no fluxo de entrega.';
}

export function formatMaturityLevel(level: number): string {
  return Number.isInteger(level) ? String(level) : level.toFixed(1);
}

export function diagnosticStrength(probability: number): string {
  if (probability >= .85) return 'Hipótese fortemente sustentada';
  if (probability >= .7) return 'Hipótese bem sustentada';
  if (probability >= .5) return 'Hipótese possível; valide antes de ampliar';
  return 'Hipótese fraca; faltam evidências';
}

function invitationLinksPage(protocol: string, host: string, tokens: string[], params: Params): string {
  const origin = `${protocol}://${host}`;
  const links = tokens.map((token) => `${origin}/invite/${token}`);
  return layout('Convites gerados', `<header><p class="eyebrow">Convites únicos</p><h1>Distribua um link por pessoa</h1><p class="lead">Esta é a única vez em que os tokens aparecem juntos. Não associe nomes aos links na plataforma.</p></header><p class="notice">Peça que cada pessoa guarde o endereço depois do primeiro acesso para retomar. O convite original não reabre a entrevista.</p><div class="card"><ol id="invitation-links">${links.map((link) => `<li><code>${escapeHtml(link)}</code></li>`).join('')}</ol><button type="button" data-copy-links>Copiar todos os links</button><p class="muted" role="status" data-copy-status></p></div><a class="button" href="/projects/${params.publicId}/manage/${params.adminSecret}">Voltar ao painel</a><script>document.querySelector('[data-copy-links]')?.addEventListener('click',async()=>{const status=document.querySelector('[data-copy-status]');try{const links=[...document.querySelectorAll('#invitation-links code')].map(element=>element.textContent).join('\\n');await navigator.clipboard.writeText(links);status.textContent='Links copiados.'}catch{status.textContent='Não foi possível copiar. Selecione os links manualmente.'}})</script>`);
}
