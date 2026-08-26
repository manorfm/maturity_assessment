import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { graph } from '../src/modules/catalog/assessment-graph.js';
import { CatalogService, validateGraphDefinition } from '../src/modules/catalog/catalog-service.js';

test('convite é consumido uma vez e não mantém vínculo com a participação', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const created = projects.create('Piloto', 'Empresa/Tribo/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.issue(String(project.id), unit.id, 'engineering', 1);

  const first = invitations.claim(token!);
  assert.notEqual(first, 'invalid');
  assert.notEqual(first, 'used');
  assert.equal(invitations.claim(token!), 'used');

  const invitationColumns = db.prepare('PRAGMA table_info(invitations)').all() as Array<{ name: string }>;
  assert.equal(invitationColumns.some((column) => column.name === 'participation_id'), false);
  assert.equal((db.prepare('SELECT COUNT(*) total FROM participations').get() as { total: number }).total, 1);
});

test('relatório respeita limiar e encontra padrão agregado', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const inference = new InferenceService(db);
  const created = projects.create('Piloto', 'Empresa/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const tokens = invitations.issue(String(project.id), unit.id, 'engineering', 5);

  for (const token of tokens) {
    const claimed = invitations.claim(token);
    assert.equal(typeof claimed, 'object');
    const resumeToken = (claimed as { resumeToken: string }).resumeToken;
    while (participations.find(resumeToken)?.status === 'in_progress') {
      const current = participations.find(resumeToken)!;
      const node = new CatalogService(db).getNode(current.graph_version, current.current_node)!;
      const option = node.id === 'shared-change' ? 'before-release' : node.options[0]!.id;
      participations.answer(resumeToken, option);
    }
  }

  const report = inference.report(String(project.id), 5);
  assert.equal(report.completed, 5);
  assert.equal(report.findings.some((finding) => finding.pattern === 'integracao-tardia'), true);
  assert.equal(report.scopes.some((item) => item.path === 'Empresa/Time A'), true);
});

test('grafo publicado é persistido e ramifica conforme a resposta', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  assert.equal((db.prepare('SELECT COUNT(*) total FROM assessment_nodes').get() as { total: number }).total, graph.length);
  assert.ok((db.prepare('SELECT COUNT(*) total FROM assessment_edges WHERE option_key IS NOT NULL').get() as { total: number }).total >= 4);

  const created = projects.create('Piloto', 'Empresa/Time A');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.issue(String(project.id), unit.id, 'quality', 1);
  const claimed = invitations.claim(token!) as { resumeToken: string };
  participations.answer(claimed.resumeToken, 'replan-together');
  participations.answer(claimed.resumeToken, 'continuous');
  participations.answer(claimed.resumeToken, 'test-queue');
  const current = participations.find(claimed.resumeToken)!;
  assert.equal(current.current_node, 'quality-probe');
  assert.equal(catalog.getNode(current.graph_version, current.current_node)?.type, 'probe');
});

test('validador rejeita ciclos e nós inalcançáveis antes da publicação', () => {
  const node = (id: string) => ({ id, title: id, scenario: id, prompt: id, options: [{ id: 'ok', label: 'ok', signals: [] }] });
  assert.throws(() => validateGraphDefinition([node('a'), node('b')], [{ from: 'a', to: 'a' }], 'a'), /cycle/);
  assert.throws(() => validateGraphDefinition([node('a'), node('b')], [], 'a'), /unreachable/);
});

test('suprime toda a cadeia quando uma partição irmã é pequena', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const inference = new InferenceService(db);
  const created = projects.create('Estrutura', 'Empresa/Time A\nEmpresa/Time B');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const units = projects.listUnits(String(project.id));
  const timeA = units.find((unit) => unit.path === 'Empresa/Time A')!;
  const timeB = units.find((unit) => unit.path === 'Empresa/Time B')!;

  const complete = (token: string) => {
    const claimed = invitations.claim(token) as { resumeToken: string };
    while (participations.find(claimed.resumeToken)?.status === 'in_progress') {
      const current = participations.find(claimed.resumeToken)!;
      const node = new CatalogService(db).getNode(current.graph_version, current.current_node)!;
      participations.answer(claimed.resumeToken, node.options[0]!.id);
    }
  };
  invitations.issue(String(project.id), timeA.id, 'engineering', 5).forEach(complete);
  invitations.issue(String(project.id), timeB.id, 'engineering', 1).forEach(complete);
  assert.deepEqual(inference.report(String(project.id), 5).scopes, []);

  invitations.issue(String(project.id), timeB.id, 'engineering', 4).forEach(complete);
  const paths = inference.report(String(project.id), 5).scopes.map((scope) => scope.path);
  assert.deepEqual(paths, ['Empresa', 'Empresa/Time A', 'Empresa/Time B']);
});
