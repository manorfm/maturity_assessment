import type { FastifyInstance } from 'fastify';
import { escapeHtml, layout } from '../../shared/html.js';
import { profiles, type Profile } from '../catalog/assessment-graph.js';
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
    const body = request.body as { name?: string; hierarchy?: string };
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
    const issued = db.prepare('SELECT status, COUNT(*) total FROM invitations WHERE project_id = ? GROUP BY status').all(projectId) as Array<{ status: string; total: number }>;
    const unitOptions = units.map((unit) => `<option value="${escapeHtml(unit.id)}">${escapeHtml(unit.path)}</option>`).join('');
    const profileOptions = Object.entries(profiles).map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('');
    const findings = report.completed < report.minimum
      ? `<p class="notice">O relatório será liberado com ${report.minimum} respostas concluídas. Atualmente: ${report.completed}.</p>`
      : report.findings.length ? report.findings.map((finding) => `<article class="card"><span class="tag">padrão recorrente</span><h3>${escapeHtml(finding.title)}</h3><p>${escapeHtml(finding.intervention)}</p></article>`).join('')
      : '<p class="notice">Ainda não há um padrão problemático com evidência agregada suficiente.</p>';
    const gaps = report.perspectiveGaps.map((gap) => `<article class="card"><span class="tag">divergência agregada</span><h3>${escapeHtml(gap.title)}</h3><p>Uma prática aparece mais sustentável para ${escapeHtml(gap.strongerProfiles.join(', '))}, enquanto restrições são percebidas por ${escapeHtml(gap.constrainedProfiles.join(', '))}. Investigue visibilidade, fronteiras e autonomia antes de atribuir causa.</p></article>`).join('');
    const scopeReports = report.scopes.map((scope) => `<details class="card"><summary><strong>${escapeHtml(scope.path)}</strong> <span class="muted">· grupo elegível</span></summary>${scope.findings.length ? scope.findings.map((finding) => `<article><h3>${escapeHtml(finding.title)}</h3><p>${escapeHtml(finding.intervention)}</p></article>`).join('') : '<p class="muted">Sem padrão problemático recorrente com confiança suficiente.</p>'}${scope.perspectiveGaps.map((gap) => `<article><h3>${escapeHtml(gap.title)}</h3><p>Diferença entre perspectivas elegíveis; valide assimetria de visibilidade e poder.</p></article>`).join('')}</details>`).join('');
    return reply.type('text/html').send(layout(String(auth.project.name), `
      <header><p class="eyebrow">Painel protegido</p><h1>${escapeHtml(auth.project.name)}</h1><p class="lead">O painel mostra apenas estados e resultados agregados. Nenhuma resposta individual é acessível.</p></header>
      <div class="grid"><div class="card"><div class="metric">${report.completed}</div><span class="muted">concluídas</span></div><div class="card"><div class="metric">${issued.reduce((sum,item)=>sum+Number(item.total),0)}</div><span class="muted">convites emitidos</span></div></div>
      <section class="card"><h2>Gerar convites individuais</h2><form method="post" action="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}/invitations">
        <label for="unitId">Unidade</label><select id="unitId" name="unitId">${unitOptions}</select>
        <label for="profile">Perfil</label><select id="profile" name="profile">${profileOptions}</select>
        <label for="count">Quantidade</label><input id="count" name="count" type="number" min="1" max="100" value="5">
        <button type="submit">Gerar links</button></form></section>
      <section><h2>Mapa agregado</h2>${findings}</section>
      ${gaps ? `<section><h2>Perspectivas</h2>${gaps}</section>` : ''}
      ${scopeReports ? `<section><h2>Mapa por estrutura</h2><p class="muted">Somente partições que preservam o grupo mínimo aparecem. Contagens e alternativas individuais são suprimidas.</p>${scopeReports}</section>` : ''}
      <p><a class="button secondary" href="/p/${auth.params.publicId}">Ver página pública</a></p>`));
  });

  app.post('/projects/:publicId/manage/:adminSecret/invitations', async (request, reply) => {
    const auth = requireProject(request.params as Params);
    const body = request.body as { unitId?: string; profile?: Profile; count?: string };
    const units = projects.listUnits(String(auth.project.id));
    if (!body.unitId || !units.some((unit) => unit.id === body.unitId) || !body.profile || !profiles[body.profile]) throw new DomainValidationError();
    const tokens = invitations.issue(String(auth.project.id), body.unitId, body.profile, Number(body.count ?? 1));
    const origin = `${request.protocol}://${request.host}`;
    return reply.type('text/html').send(layout('Convites gerados', `<header><p class="eyebrow">Convites únicos</p><h1>Distribua um link por pessoa</h1><p class="lead">Esta é a única vez em que os tokens aparecem juntos. Não associe nomes aos links na plataforma.</p></header><div class="card"><ol>${tokens.map((token) => `<li><code>${escapeHtml(`${origin}/invite/${token}`)}</code></li>`).join('')}</ol></div><a class="button" href="/projects/${auth.params.publicId}/manage/${auth.params.adminSecret}">Voltar ao painel</a>`));
  });
}
