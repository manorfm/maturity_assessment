import type { FastifyInstance } from 'fastify';
import { escapeHtml, layout } from '../../shared/html.js';
import { InferenceService } from '../inference/inference-service.js';
import { InvitationService } from '../assessments/invitation-service.js';
import { ProjectService } from './project-service.js';
import type { Database } from '../../shared/database.js';
import type { DiagnosticPosterior } from '../inference/domain/bayesian-inference-engine.js';
import { CapabilityTaxonomy } from '../inference/domain/capability-taxonomy.js';
import { DomainValidationError, ResourceNotFoundError } from '../../shared/errors.js';

type Params = { publicId: string; adminSecret: string };

const projectForm = () => layout('Novo projeto', `
  <header><p class="eyebrow">Assessment comportamental</p><h1>Crie um mapa do sistema de trabalho</h1>
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
    return reply.type('text/html').send(layout(project.name, `<div class="card"><p class="eyebrow">${escapeHtml(project.name)}</p><h1>Assessment da organização</h1><p class="lead">Para responder, use seu convite individual. O link geral do projeto não registra participação.</p><p class="notice">As respostas são anônimas e só aparecem de forma agregada quando o grupo mínimo é atingido.</p></div>`));
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
    const unitOptions = units.filter((unit) => unit.isLeaf).map((unit) => `<option value="${escapeHtml(unit.id)}">${escapeHtml(unit.path)}</option>`).join('');
    const reportAvailability = report.completed < report.minimum
      ? `<p class="notice">O relatório será liberado com ${report.minimum} respostas concluídas. Atualmente: ${report.completed}.</p>`
      : report.findings.length ? '' : '<p class="notice">Ainda não há um padrão problemático com evidência agregada suficiente.</p>';
    const gaps = report.perspectiveGaps.map((gap) => `<article class="card"><span class="tag">divergência agregada</span><h3>${escapeHtml(gap.title)}</h3><p>Uma prática aparece mais sustentável para ${escapeHtml(gap.strongerProfiles.join(', '))}, enquanto restrições são percebidas por ${escapeHtml(gap.constrainedProfiles.join(', '))}. Investigue visibilidade, fronteiras e autonomia antes de atribuir causa.</p></article>`).join('');
    const capabilityBase = `/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/capabilities`;
    const capabilityMap = renderCapabilityRadar(report.capabilityGroups, capabilityBase);
    const classification = report.classification ? renderClassification(report.classification) : '';
    const probabilisticSummary = renderProbabilisticSummary(report.hypotheses, report.modelVersion);
    const scopeReports = report.scopes.map((scope) => `<details class="card"><summary><strong>${escapeHtml(scope.path)}</strong> <span class="tag">${escapeHtml(scope.classification.label)}</span></summary>${renderClassification(scope.classification)}${renderCapabilityRadar(scope.capabilityGroups, capabilityBase, scope.id)}${scope.findings.length ? '' : '<p class="muted">Sem padrão problemático recorrente com confiança suficiente.</p>'}${scope.perspectiveGaps.map((gap) => `<article><h3>${escapeHtml(gap.title)}</h3><p>Diferença entre perspectivas elegíveis; valide assimetria de visibilidade e poder.</p></article>`).join('')}</details>`).join('');
    const batchCards = batches.map((batch) => `<article class="card"><span class="tag">${escapeHtml(batch.status)}</span><h3>${escapeHtml(batch.unitPath)}</h3><p class="muted">${batch.quantity} convites no lote · perfil escolhido por cada participante</p>${batch.status === 'issued' || batch.status === 'partially_used' ? `<form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitation-batches/${batch.id}/revoke"><button type="submit">Revogar links disponíveis</button></form>` : ''}${batch.status === 'revoked' || batch.status === 'expired' || batch.status === 'partially_used' ? `<form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitation-batches/${batch.id}/reissue"><button class="button secondary" type="submit">Reemitir indisponíveis</button></form>` : ''}</article>`).join('');
    return reply.type('text/html').send(layout(String(auth.project.name), `
      <header><p class="eyebrow">Painel protegido</p><h1>${escapeHtml(auth.project.name)}</h1><p class="lead">O painel mostra apenas estados e resultados agregados. Nenhuma resposta individual é acessível.</p></header>
      <div class="grid"><div class="card"><div class="metric">${report.completed}</div><span class="muted">concluídas</span></div><div class="card"><div class="metric">${batches.reduce((sum,item)=>sum+item.quantity,0)}</div><span class="muted">convites emitidos</span></div></div>
      <section class="card"><h2>Gerar convites individuais</h2><p class="muted">Os links servem para qualquer integrante da unidade. Cada pessoa informa sua perspectiva ao iniciar.</p><form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitations">
        <label for="unitId">Unidade final</label><select id="unitId" name="unitId">${unitOptions}</select>
        <label for="count">Quantidade</label><input id="count" name="count" type="number" min="1" max="100" value="5">
        <button type="submit">Gerar links</button></form></section>
      ${batchCards ? `<section><h2>Lotes de convites</h2>${batchCards}</section>` : ''}
      <section><h2>Mapa agregado</h2>${classification}${reportAvailability}${capabilityMap}</section>
      ${probabilisticSummary}
      ${gaps ? `<section><h2>Perspectivas</h2>${gaps}</section>` : ''}
      ${scopeReports ? `<section><h2>Mapa por estrutura</h2><p class="muted">Somente partições que preservam o grupo mínimo aparecem. Contagens e alternativas individuais são suprimidas.</p>${scopeReports}</section>` : ''}
      <p><a class="button secondary" href="/p/${auth.params.publicId}">Ver página pública</a></p>`));
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
    const relevant = findings.filter((finding) => relevantIds.has(finding.detailCapability));
    const base = `/projects/${params.publicId}/manage/${params.adminSecret}/capabilities`;
    const scopeQuery = scopeId ? `?scope=${encodeURIComponent(scopeId)}` : '';
    const dashboardUrl = `/projects/${params.publicId}/manage/${params.adminSecret}`;
    const breadcrumbItems = path.map((item, index) => index === path.length - 1
      ? `<span class="breadcrumb-current" aria-current="page">${escapeHtml(item.label)}</span>`
      : `<a href="${base}/${item.id}${scopeQuery}">${escapeHtml(item.label)}</a>`).join('<span class="breadcrumb-separator" aria-hidden="true">›</span>');
    const parent = path.at(-2);
    const backUrl = parent ? `${base}/${parent.id}${scopeQuery}` : dashboardUrl;
    const coverage = `<p class="coverage"><strong>Cobertura temática ${Math.round(selected.coverage * 100)}%</strong><span class="coverage-track"><span style="width:${Math.round(selected.coverage * 100)}%"></span></span></p>`;
    const assessedChildren = selected.children.filter((child) => child.assessed).length;
    const breadth = selected.children.length ? ` ${assessedChildren} de ${selected.children.length} subcapacidades possuem cobertura suficiente.` : '';
    const status = selected.assessed
      ? `<div class="classification-level">${formatMaturityLevel(selected.level)} / 4</div>${coverage}<p class="executive-reading">${escapeHtml(capabilityReading(selected.level))}</p><details class="methodology"><summary>Ver evidências da avaliação</summary><p>Confiança da medição de maturidade ${Math.round(selected.confidence * 100)}% · ${selected.evidence} sinais agregados.${selected.hasContradiction ? ' Há evidências contraditórias; o resultado é inconclusivo até discriminar contextos e causas.' : ''}</p></details>`
      : `${coverage}<p class="notice">Esta capacidade ainda não possui variedade temática suficiente para publicar uma nota.${breadth} Ela não foi calculada como zero.</p>`;
    const diagnosis = selected.children.length ? renderCapabilityRadar(selected.children, base, scopeId) : renderCapabilityDiagnosis(relevant, selected);
    const probabilisticDetail = renderProbabilisticSummary(hypotheses.filter((item) => relevantIds.has(item.capability)), report.modelVersion, 'Causas e pontos de atenção');
    return reply.type('text/html').send(layout(selected.label, `<nav class="capability-navigation" aria-label="Navegação da capacidade"><a class="back-link" href="${backUrl}"><span aria-hidden="true">←</span> Voltar</a><div class="breadcrumb"><a href="${dashboardUrl}">Projeto</a><span class="breadcrumb-separator" aria-hidden="true">›</span>${breadcrumbItems}</div></nav><header><p class="eyebrow">${escapeHtml(source?.path ?? 'Visão global')}</p><h1>${escapeHtml(selected.label)}</h1></header><article class="classification">${status}</article>${probabilisticDetail}${diagnosis}`));
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
}

function renderClassification(classification: { level: number; label: string; limitingCapabilities: string[] }): string {
  const narrative = classificationNarrative(classification.level);
  const limiter = summarizeLimiters(classification.limitingCapabilities);
  return `<article class="classification executive-summary maturity-level-${classification.level}"><p class="eyebrow">Resumo executivo</p><div class="classification-level">${classification.level} · ${escapeHtml(classification.label)}</div><p class="executive-reading">${escapeHtml(narrative.reading)}</p><dl class="executive-facts"><div><dt>Principal limitador</dt><dd>${escapeHtml(limiter)}</dd></div><div><dt>Risco gerencial</dt><dd>${escapeHtml(narrative.risk)}</dd></div><div><dt>Prioridade recomendada</dt><dd>${escapeHtml(narrative.priority)}</dd></div></dl><details class="methodology"><summary>Como esta classificação é calculada</summary><p>Classificação sociotécnica baseada no elo mais frágil com evidência suficiente. Capacidades fortes não ocultam gargalos nem unidades descendentes.</p></details></article>`;
}

function summarizeLimiters(limiters: string[]): string {
  if (!limiters.length) return 'Nenhum limitador recorrente confirmado';
  const visible = limiters.slice(0, 3).join(', ');
  const remaining = limiters.length - 3;
  return remaining > 0 ? `${visible} e mais ${remaining} capacidade(s)` : visible;
}

function classificationNarrative(level: number): { reading: string; risk: string; priority: string } {
  if (level <= 0) return { reading: 'O trabalho ainda não produz evidência suficiente de uma prática estável.', risk: 'Decisões dependem de reação e conhecimento individual.', priority: 'Tornar o fluxo visível e estabilizar controles básicos.' };
  if (level === 1) return { reading: 'A entrega acontece, mas perde previsibilidade quando surgem pressão, incidentes ou dependências.', risk: 'Atrasos, retrabalho e exposição operacional variam conforme o contexto.', priority: 'Remover o principal gargalo e criar uma rotina repetível.' };
  if (level === 2) return { reading: 'Há práticas repetíveis, porém elas ainda dependem de condições favoráveis e não cobrem todo o sistema.', risk: 'O desempenho pode regredir entre equipes, mudanças ou períodos de maior demanda.', priority: 'Ampliar consistência, feedback e autonomia com controles incorporados.' };
  if (level === 3) return { reading: 'O sistema é gerenciado por evidências e apresenta boa previsibilidade na maior parte das situações.', risk: 'Pontos isolados ainda podem limitar escala, adaptação ou resposta sob pressão.', priority: 'Fechar os limitadores restantes e validar resiliência em contextos diferentes.' };
  return { reading: 'As práticas observadas se adaptam com segurança e aprendizado contínuo.', risk: 'A principal ameaça é a perda gradual de disciplina ou visibilidade.', priority: 'Preservar os mecanismos e testar se resistem a mudanças de contexto.' };
}

type CapabilityRadarNode = { id: string; label: string; level: number; confidence: number; evidence: number; hasContradiction: boolean; assessed: boolean; coverage: number; children: CapabilityRadarNode[] };

export function renderCapabilityRadar(
  capabilities: CapabilityRadarNode[],
  baseUrl: string,
  scopeId?: string,
): string {
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
  const points = capabilities.map((capability, index) => {
    const [labelX, labelY] = point(index, 1.14).split(',');
    if (!capability.assessed) {
      const [x, y] = point(index, .12).split(',');
      return `<g class="radar-marker radar-marker-unassessed" tabindex="0" role="img" aria-label="${escapeHtml(capability.label)}: evidência insuficiente; detalhe indisponível"><circle cx="${x}" cy="${y}" r="9"/><text class="radar-question" x="${x}" y="${Number(y) + 4}">?</text>${radarTooltip(x!, y!, capability.label, 'Evidência insuficiente', 'Aguarde mais respostas para detalhar.')}</g><text class="radar-axis-label radar-axis-unassessed" x="${labelX}" y="${labelY}">${escapeHtml(capability.label)}<tspan x="${labelX}" dy="12">evidência insuficiente</tspan></text>`;
    }
    const [x, y] = point(index, Math.max(.12, capability.level / 4)).split(',');
    const status = radarStatus(capability.level);
    return `<a href="${capabilityUrl(capability.id)}" class="radar-point radar-status-${status.id}" aria-label="${escapeHtml(capability.label)}: ${formatMaturityLevel(capability.level)} de 4. ${escapeHtml(status.summary)}"><circle cx="${x}" cy="${y}" r="8"/>${radarTooltip(x!, y!, capability.label, `${formatMaturityLevel(capability.level)} de 4`, status.summary)}<text class="radar-axis-label" x="${labelX}" y="${labelY}">${escapeHtml(capability.label)}</text></a>`;
  }).join('');
  const drillNavigation = capabilities.map((capability) => capability.assessed
    ? `<a class="radar-drill-link radar-status-${radarStatus(capability.level).id}" href="${capabilityUrl(capability.id)}">${escapeHtml(capability.label)} <span>${formatMaturityLevel(capability.level)} · ${Math.round(capability.coverage * 100)}%</span></a>`
    : `<span class="radar-drill-link disabled" aria-disabled="true">${escapeHtml(capability.label)} <span>Evidência insuficiente</span></span>`).join('');
  return `<article class="card radar-card"><h3>Radar de capacidades</h3><p class="muted">Passe sobre um ponto para uma leitura rápida ou selecione-o para aprofundar. O marcador cinza com “?” indica evidência insuficiente e não representa baixa maturidade.</p><svg class="radar" viewBox="0 0 420 420" role="img" aria-label="Radar interativo das capacidades observadas"><g class="radar-grid">${rings}${axes}</g>${completeResult ? `<polygon class="radar-result" points="${result}" />` : ''}${points}</svg><nav class="radar-drill-navigation" aria-label="Aprofundar capacidades">${drillNavigation}</nav></article>`;
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

function renderProbabilisticSummary(posteriors: DiagnosticPosterior[], modelVersion: string | null, title = 'Causas e pontos de atenção'): string {
  const relevant = posteriors.filter((item) => item.evidenceUsed.length > 0);
  if (!relevant.length) return '';
  const byCapability = new Map<string, DiagnosticPosterior[]>();
  for (const posterior of relevant) byCapability.set(posterior.capability, [...(byCapability.get(posterior.capability) ?? []), posterior]);
  const cards = [...byCapability].map(([capability, items]) => {
    const isConfirmed = (item: DiagnosticPosterior) => item.hypotheses[0]?.id !== 'unknown' && item.hypotheses[0]!.probability >= .7 && (item.population?.support ?? 0) >= 2;
    const confirmed = items.filter(isConfirmed).sort((left, right) => right.hypotheses[0]!.probability - left.hypotheses[0]!.probability);
    const inconclusive = items.filter((item) => !isConfirmed(item));
    const findings = confirmed.slice(0, 3).map((posterior) => {
      const leader = posterior.hypotheses[0]!;
      const population = posterior.population ? `${posterior.population.support} de ${posterior.population.applicable} jornadas aplicáveis, em ${posterior.population.profiles} perspectiva(s)` : 'Base de observação não informada';
      return `<li><strong>${escapeHtml(leader.label)}</strong><br><span class="muted">Força do diagnóstico: ${Math.round(leader.probability * 100)}% · ${escapeHtml(population)}.</span></li>`;
    }).join('');
    const discriminators = [...new Map(inconclusive.flatMap((item) => item.nextQuestionKey && item.nextQuestionLabel ? [[item.nextQuestionKey, item.nextQuestionLabel] as const] : [])).values()];
    const gap = inconclusive.length ? `<p class="notice">Ainda faltam evidências para concluir ${inconclusive.length} ponto(s).${discriminators.length ? ` A próxima entrevista deve explorar: ${escapeHtml(discriminators[0]!)}.` : ' Amplie as situações observadas antes de definir uma intervenção.'}</p>` : '';
    const technical = items.map((item) => `<li>${escapeHtml(item.capability)} · incerteza ${item.entropy.toFixed(2)} bit · ${item.evidenceUsed.length} evidência(s)</li>`).join('');
    const score = Math.max(0, ...confirmed.map((item) => item.hypotheses[0]?.probability ?? 0));
    return { score, html: `<article class="card diagnostic-hypothesis"><span class="tag">leitura das causas</span><h3>${escapeHtml(CapabilityTaxonomy.labelFor(capability))}</h3>${findings ? `<ul>${findings}</ul>` : '<p>Nenhuma causa recorrente foi confirmada para orientar uma decisão.</p>'}${gap}<details class="methodology"><summary>Ver detalhes do modelo</summary><ul>${technical}</ul></details></article>` };
  }).sort((left, right) => right.score - left.score);
  const featured = cards.slice(0, 6).map((card) => card.html).join('');
  const additional = cards.slice(6).map((card) => card.html).join('');
  return `<section><h2>${title}</h2><p class="muted">Leitura das causas mais consistentes no conjunto de respostas. Use-a para orientar a próxima decisão, não para avaliar pessoas.</p><div class="grid">${featured}</div>${additional ? `<details class="methodology additional-analysis"><summary>Ver outras ${cards.length - 6} áreas analisadas</summary><div class="grid">${additional}</div></details>` : ''}<details class="methodology"><summary>Sobre a precisão desta análise</summary><p>Modelo ${escapeHtml(modelVersion ?? 'não publicado')}. Os percentuais indicam força relativa das hipóteses e ainda serão calibrados com massa real.</p></details></section>`;
}

type ReportFinding = {
  kind?: 'correction' | 'evolution'; title: string; cause?: string; intervention: string; confidence?: number; priority?: number;
  constraint?: string; reasons?: string[];
  experiment?: { action: string; owner: string; metric: string; reviewHorizon: string; successCriterion: string };
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
      return `<article class="card diagnostic-problem"><span class="tag">${urgency} · força do diagnóstico ${Math.round((finding.confidence ?? 0) * 100)}%</span><h3>${escapeHtml(finding.title)}</h3><div class="executive-action-grid"><div><h4>Impacto no negócio</h4><p>${escapeHtml(executiveImpact(finding))}</p></div><div><h4>Ação recomendada</h4><p>${escapeHtml(experiment?.action ?? finding.intervention)}</p></div><div><h4>Como acompanhar</h4><p>${escapeHtml(experiment?.metric ?? 'Observe a redução de espera, falhas e retrabalho no fluxo afetado.')}</p></div></div>${experiment ? `<dl class="diagnostic-experiment"><dt>Responsável sugerido</dt><dd>${escapeHtml(experiment.owner)}</dd><dt>Prazo de revisão</dt><dd>${escapeHtml(experiment.reviewHorizon)}</dd><dt>Resultado esperado</dt><dd>${escapeHtml(experiment.successCriterion)}</dd></dl>` : ''}<details class="methodology"><summary>Ver diagnóstico e evidências</summary>${finding.cause ? `<h4>Causa provável</h4><p>${escapeHtml(finding.cause)}</p>` : ''}${finding.constraint && finding.constraint !== 'none' ? `<p>Tipo de restrição: ${escapeHtml(finding.constraint)}</p>` : ''}<ul>${(finding.reasons ?? []).map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}</ul></details></article>`;
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

function invitationLinksPage(protocol: string, host: string, tokens: string[], params: Params): string {
  const origin = `${protocol}://${host}`;
  const links = tokens.map((token) => `${origin}/invite/${token}`);
  return layout('Convites gerados', `<header><p class="eyebrow">Convites únicos</p><h1>Distribua um link por pessoa</h1><p class="lead">Esta é a única vez em que os tokens aparecem juntos. Não associe nomes aos links na plataforma.</p></header><div class="card"><ol id="invitation-links">${links.map((link) => `<li><code>${escapeHtml(link)}</code></li>`).join('')}</ol><button type="button" data-copy-links>Copiar todos os links</button><p class="muted" role="status" data-copy-status></p></div><a class="button" href="/projects/${params.publicId}/manage/${params.adminSecret}">Voltar ao painel</a><script>document.querySelector('[data-copy-links]')?.addEventListener('click',async()=>{const status=document.querySelector('[data-copy-status]');try{const links=[...document.querySelectorAll('#invitation-links code')].map(element=>element.textContent).join('\\n');await navigator.clipboard.writeText(links);status.textContent='Links copiados.'}catch{status.textContent='Não foi possível copiar. Selecione os links manualmente.'}})</script>`);
}
