import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { graph } from '../src/modules/catalog/assessment-graph.js';

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
    for (const node of graph) {
      const option = node.id === 'shared-change' ? 'before-release' : node.options[0]!.id;
      participations.answer(resumeToken, option);
    }
  }

  const report = inference.report(String(project.id), 5);
  assert.equal(report.completed, 5);
  assert.equal(report.findings.some((finding) => finding.pattern === 'integracao-tardia'), true);
  assert.equal(report.units.some((item) => item.path === 'Empresa/Time A'), true);
});

