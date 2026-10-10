import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  classifyEvidenceGrade,
  foundationIsReplicated,
} from '../src/modules/inference/domain/treatment-contract.js';
import { projectDiagnosticLaudo, projectTreatmentPlan } from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import { pulseItems, selectPulseItems } from '../src/modules/catalog/item-catalog.js';
import { auditItemCatalog } from '../src/modules/catalog/item-type-audit.js';

test('grau A exige fonte forte e replicated explícito ou inferido de Accelerate/DORA', () => {
  assert.equal(foundationIsReplicated({ source: 'Accelerate / DORA' }), true);
  assert.equal(foundationIsReplicated({ source: 'Continuous Delivery / SLSA' }), false);
  assert.equal(foundationIsReplicated({ source: 'Continuous Delivery', replicated: true }), true);
  assert.equal(classifyEvidenceGrade({
    foundationSource: 'Accelerate / DORA',
    replicated: foundationIsReplicated({ source: 'Accelerate / DORA' }),
  }), 'A');
  assert.equal(classifyEvidenceGrade({
    foundationSource: 'Continuous Delivery / SLSA',
    replicated: foundationIsReplicated({ source: 'Continuous Delivery / SLSA' }),
  }), 'B');
});

test('laudo publica grau A quando o fundamento é Accelerate/DORA replicado', () => {
  const withDora: OutcomeFinding = {
    kind: 'correction', pattern: 'controle-sem-feedback', detailCapability: 'enabling-governance',
    title: 'Aprovação sem feedback', cause: 'gate', intervention: 'revisão por par', confidence: 0.9, priority: 0.8,
    foundation: { source: 'Accelerate / DORA', principle: 'streamlining change approval', why: 'vários anos' },
    prescription: { status: 'ready', reason: 'ok' },
  };
  const laudo = projectDiagnosticLaudo({
    outcome: {
      kind: 'correct', kindLabel: 'Precisa de correção', limiterLabel: 'Governança',
      reading: '', nextStepTitle: '', nextStepBody: '', finding: withDora,
    },
    findings: [withDora],
    organizationalAreas: OrganizationalAreaProjector.empty(),
  });
  assert.equal(laudo.conduct[0]?.evidenceGrade, 'A');
});

test('pulso oferece 3 a 6 itens-âncora das folhas tratadas', () => {
  assert.ok(pulseItems.length >= 3);
  assert.equal(auditItemCatalog(pulseItems).filter((issue) => issue.severity === 'error').length, 0);
  const selected = selectPulseItems(['release-feedback', 'organizational-learning', 'enabling-governance', 'work-management']);
  assert.ok(selected.length >= 3);
  assert.ok(selected.length <= 6);
  assert.ok(selected.every((item) => item.kind === 'pulse'));
  assert.ok(selected.every((item) => item.intervalWeeks.min >= 4 && item.intervalWeeks.max <= 8));
});

test('plano de tratamento anexa pulso das folhas das condutas ativas', () => {
  const findings: OutcomeFinding[] = [
    {
      kind: 'correction', pattern: 'empacotamento-manual', detailCapability: 'release-feedback',
      title: 'Empacotamento', cause: 'manual', intervention: 'automatizar', confidence: 0.9, priority: 0.8,
      foundation: { source: 'Continuous Delivery', principle: 'mesmo artefato', why: 'variação' },
      prescription: { status: 'ready', reason: 'ok' },
    },
    {
      kind: 'correction', pattern: 'postmortem-sem-efeito', detailCapability: 'organizational-learning',
      title: 'Post-mortem', cause: 'lista', intervention: 'fechar mudança', confidence: 0.85, priority: 0.7,
      foundation: { source: 'SRE', principle: 'aprendizado', why: 'próximo incidente' },
      prescription: { status: 'ready', reason: 'ok' },
    },
  ];
  const plan = projectTreatmentPlan(findings);
  assert.ok(plan.active.length >= 1);
  assert.ok(plan.pulse.length >= 1);
  assert.ok(plan.pulse.every((item) => ['release-feedback', 'organizational-learning'].includes(item.leafId!)));
});
