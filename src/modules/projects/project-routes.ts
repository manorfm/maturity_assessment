import type { FastifyInstance } from 'fastify';
import { escapeHtml, layout } from '../../shared/html.js';
import { InferenceService } from '../inference/inference-service.js';
import { InvitationService } from '../assessments/invitation-service.js';
import { ProjectService } from './project-service.js';
import type { Database } from '../../shared/database.js';
import { DomainValidationError, ResourceNotFoundError } from '../../shared/errors.js';

type Params = { publicId: string; adminSecret: string };

const projectForm = () => layout('Novo projeto', `
  <header><p class="eyebrow">Assessment comportamental</p><h1>Crie um mapa do sistema de trabalho</h1>
  <p class="lead">Configure a estrutura, distribua convites anônimos e observe gargalos sem avaliar pessoas ou premiar ferramentas.</p></header>
  <form class="card" method="post" action="/projects">
    <label for="name">Nome do projeto</label><input id="name" name="name" required maxlength="100" placeholder="Assessment da Tribo Digital">
    <label for="hierarchy">Estrutura organizacional</label>
    <textarea id="hierarchy" name="hierarchy" required placeholder="Empresa/Tribo Pagamentos/Cluster Core/Time Checkout&#10;Empresa/Tribo Pagamentos/Cluster Core/Time Antifraude"></textarea>
    <small>Uma unidade final por linha, separando níveis com /. Nomes e profundidade são livres.</small><br>
    <button type="submit">Criar projeto</button>
  </form>`);

export function registerProjectRoutes(app: FastifyInstance, db: Database): void {
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const inference = new InferenceService(db);

  app.get('/', async (_request, reply) => reply.type('text/html').send(projectForm()));
  app.get('/projects/new', async (_request, reply) => reply.type('text/html').send(projectForm()));
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
    const unitOptions = units.map((unit) => `<option value="${escapeHtml(unit.id)}">${escapeHtml(unit.path)}</option>`).join('');
    const findings = report.completed < report.minimum
      ? `<p class="notice">O relatório será liberado com ${report.minimum} respostas concluídas. Atualmente: ${report.completed}.</p>`
      : report.findings.length ? report.findings.map((finding) => `<article class="card"><span class="tag">padrão recorrente</span><h3>${escapeHtml(finding.title)}</h3><p>${escapeHtml(finding.intervention)}</p></article>`).join('')
      : '<p class="notice">Ainda não há um padrão problemático com evidência agregada suficiente.</p>';
    const gaps = report.perspectiveGaps.map((gap) => `<article class="card"><span class="tag">divergência agregada</span><h3>${escapeHtml(gap.title)}</h3><p>Uma prática aparece mais sustentável para ${escapeHtml(gap.strongerProfiles.join(', '))}, enquanto restrições são percebidas por ${escapeHtml(gap.constrainedProfiles.join(', '))}. Investigue visibilidade, fronteiras e autonomia antes de atribuir causa.</p></article>`).join('');
    const capabilityMap = report.capabilities.length ? renderCapabilityRadar(report.capabilities, report.findings, 'global') : '';
    const classification = report.classification ? renderClassification(report.classification) : '';
    const scopeReports = report.scopes.map((scope, index) => `<details class="card"><summary><strong>${escapeHtml(scope.path)}</strong> <span class="tag">${escapeHtml(scope.classification.label)}</span></summary>${renderClassification(scope.classification)}${scope.capabilities.length ? renderCapabilityRadar(scope.capabilities, scope.findings, `scope-${index}`) : ''}${scope.findings.length ? scope.findings.map((finding) => `<article><h3>${escapeHtml(finding.title)}</h3><p>${escapeHtml(finding.intervention)}</p></article>`).join('') : '<p class="muted">Sem padrão problemático recorrente com confiança suficiente.</p>'}${scope.perspectiveGaps.map((gap) => `<article><h3>${escapeHtml(gap.title)}</h3><p>Diferença entre perspectivas elegíveis; valide assimetria de visibilidade e poder.</p></article>`).join('')}</details>`).join('');
    const batchCards = batches.map((batch) => `<article class="card"><span class="tag">${escapeHtml(batch.status)}</span><h3>${escapeHtml(batch.unitPath)}</h3><p class="muted">${batch.quantity} convites no lote · perfil escolhido por cada participante</p>${batch.status === 'issued' || batch.status === 'partially_used' ? `<form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitation-batches/${batch.id}/revoke"><button type="submit">Revogar links disponíveis</button></form>` : ''}${batch.status === 'revoked' || batch.status === 'expired' || batch.status === 'partially_used' ? `<form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitation-batches/${batch.id}/reissue"><button class="button secondary" type="submit">Reemitir indisponíveis</button></form>` : ''}</article>`).join('');
    return reply.type('text/html').send(layout(String(auth.project.name), `
      <header><p class="eyebrow">Painel protegido</p><h1>${escapeHtml(auth.project.name)}</h1><p class="lead">O painel mostra apenas estados e resultados agregados. Nenhuma resposta individual é acessível.</p></header>
      <div class="grid"><div class="card"><div class="metric">${report.completed}</div><span class="muted">concluídas</span></div><div class="card"><div class="metric">${batches.reduce((sum,item)=>sum+item.quantity,0)}</div><span class="muted">convites emitidos</span></div></div>
      <section class="card"><h2>Gerar convites individuais</h2><p class="muted">Os links servem para qualquer integrante da unidade. Cada pessoa informa sua perspectiva ao iniciar.</p><form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitations">
        <label for="unitId">Unidade</label><select id="unitId" name="unitId">${unitOptions}</select>
        <label for="count">Quantidade</label><input id="count" name="count" type="number" min="1" max="100" value="5">
        <button type="submit">Gerar links</button></form></section>
      ${batchCards ? `<section><h2>Lotes de convites</h2>${batchCards}</section>` : ''}
      <section><h2>Mapa agregado</h2>${classification}${capabilityMap}${findings}</section>
      ${gaps ? `<section><h2>Perspectivas</h2>${gaps}</section>` : ''}
      ${scopeReports ? `<section><h2>Mapa por estrutura</h2><p class="muted">Somente partições que preservam o grupo mínimo aparecem. Contagens e alternativas individuais são suprimidas.</p>${scopeReports}</section>` : ''}
      <p><a class="button secondary" href="/p/${auth.params.publicId}">Ver página pública</a></p>`));
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
  return `<article class="classification"><p class="eyebrow">Classificação sociotécnica</p><div class="classification-level">${classification.level} · ${escapeHtml(classification.label)}</div><p>Limitada por: ${escapeHtml(classification.limitingCapabilities.join(', '))}.</p><p class="muted">O nível representa o elo mais frágil com evidência suficiente; capacidades fortes não compensam gargalos nem unidades descendentes.</p></article>`;
}

function renderCapabilityRadar(
  capabilities: Array<{ id: string; label: string; level: number; confidence: number; evidence: number; hasContradiction: boolean }>,
  findings: Array<{ capability: string; title: string; intervention: string }>,
  prefix: string,
): string {
  const center = 210;
  const radius = 130;
  const point = (index: number, scale: number) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / capabilities.length;
    return `${(center + Math.cos(angle) * radius * scale).toFixed(1)},${(center + Math.sin(angle) * radius * scale).toFixed(1)}`;
  };
  const axes = capabilities.map((_, index) => `<line x1="${center}" y1="${center}" x2="${point(index, 1).split(',')[0]}" y2="${point(index, 1).split(',')[1]}" />`).join('');
  const rings = [1, 2, 3, 4].map((level) => `<polygon points="${capabilities.map((_, index) => point(index, level / 4)).join(' ')}" />`).join('');
  const result = capabilities.map((capability, index) => point(index, capability.level / 4)).join(' ');
  const points = capabilities.map((capability, index) => {
    const [x, y] = point(index, Math.max(.12, capability.level / 4)).split(',');
    const [labelX, labelY] = point(index, 1.14).split(',');
    return `<a href="#${prefix}-${capability.id}" class="radar-point"><circle cx="${x}" cy="${y}" r="8"><title>${escapeHtml(capability.label)}: ${capability.level.toFixed(1)} de 4, confiança ${Math.round(capability.confidence * 100)}%</title></circle><text x="${labelX}" y="${labelY}">${escapeHtml(capability.label)}</text></a>`;
  }).join('');
  const groupByCapability: Record<string, string> = { fluxo: 'fluxo', entrega: 'fluxo', engenharia: 'engenharia', qualidade: 'engenharia', arquitetura: 'arquitetura', confiabilidade: 'confiabilidade', observabilidade: 'confiabilidade', plataforma: 'plataforma', organizacao: 'organizacao', governanca: 'governanca', aprendizado: 'aprendizado' };
  const details = capabilities.map((capability) => {
    const related = findings.filter((finding) => groupByCapability[finding.capability] === capability.id);
    const actions = related.length ? related.map((finding) => `<article><h5>${escapeHtml(finding.title)}</h5><p>${escapeHtml(finding.intervention)}</p></article>`).join('') : '<p>Nenhum gargalo recorrente atingiu confiança suficiente; preserve a prática e procure evidência em situações de pressão.</p>';
    return `<section class="radar-detail" id="${prefix}-${capability.id}"><h4>${escapeHtml(capability.label)} · ${capability.level.toFixed(1)} / 4</h4><p>Confiança ${Math.round(capability.confidence * 100)}% com ${capability.evidence} sinais agregados.${capability.hasContradiction ? ' Há sinais contraditórios; investigue variação de contexto antes de concluir.' : ''}</p>${actions}</section>`;
  }).join('');
  return `<article class="card radar-card"><h3>Radar de capacidades observadas</h3><p class="muted">Selecione um eixo para ver confiança, contradições e por onde começar. A estimativa é agregada e não combina pilares em nota individual.</p><svg class="radar" viewBox="0 0 420 420" role="img" aria-label="Radar interativo das capacidades observadas"><g class="radar-grid">${rings}${axes}</g><polygon class="radar-result" points="${result}" />${points}</svg><div class="radar-details">${details}</div></article>`;
}

function invitationLinksPage(protocol: string, host: string, tokens: string[], params: Params): string {
  const origin = `${protocol}://${host}`;
  const links = tokens.map((token) => `${origin}/invite/${token}`);
  return layout('Convites gerados', `<header><p class="eyebrow">Convites únicos</p><h1>Distribua um link por pessoa</h1><p class="lead">Esta é a única vez em que os tokens aparecem juntos. Não associe nomes aos links na plataforma.</p></header><div class="card"><ol id="invitation-links">${links.map((link) => `<li><code>${escapeHtml(link)}</code></li>`).join('')}</ol><button type="button" data-copy-links>Copiar todos os links</button><p class="muted" role="status" data-copy-status></p></div><a class="button" href="/projects/${params.publicId}/manage/${params.adminSecret}">Voltar ao painel</a><script>document.querySelector('[data-copy-links]')?.addEventListener('click',async()=>{const status=document.querySelector('[data-copy-status]');try{const links=[...document.querySelectorAll('#invitation-links code')].map(element=>element.textContent).join('\\n');await navigator.clipboard.writeText(links);status.textContent='Links copiados.'}catch{status.textContent='Não foi possível copiar. Selecione os links manualmente.'}})</script>`);
}
