import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ARCHETYPE_CATALOG_VERSION,
  matchArchetypes,
  systemicArchetypes,
} from '../src/modules/inference/domain/systemic-archetypes.js';
import {
  identifyPrimaryConstraint,
  scoreCause,
} from '../src/modules/inference/domain/primary-constraint.js';
import { projectTreatmentPlan } from '../src/modules/inference/domain/diagnostic-report.js';
import { TransformationPortfolioPlanner } from '../src/modules/inference/domain/transformation-portfolio.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

function finding(partial: Partial<OutcomeFinding> & Pick<OutcomeFinding, 'pattern' | 'title'>): OutcomeFinding {
  return {
    kind: 'correction',
    detailCapability: 'continuous-integration',
    cause: partial.cause ?? partial.title,
    intervention: 'Menor experimento',
    confidence: 0.8,
    priority: 1,
    priorityFactors: { intensity: 0.8, reach: 0.7 },
    mechanism: 'policy',
    experiment: { action: 'Testar', owner: 'Gestão', metric: 'espera', reviewHorizon: '30 dias', successCriterion: 'espera cai' },
    foundation: { source: 'DORA', principle: 'x', why: 'y' },
    solutionCapability: 'continuous-integration',
    solutionReadiness: { status: 'local', label: 'Local', evidence: [] },
    causalAnalysis: { knowledgeVersion: 'causal-catalog-v11', hypothesis: partial.title, alternatives: [], evidenceFor: [], evidenceAgainst: [], missingEvidence: '', limitations: '' },
    ...partial,
  };
}

test('biblioteca de arquétipos está versionada e cobre os oito de 08 §3', () => {
  assert.equal(ARCHETYPE_CATALOG_VERSION, 'systemic-archetypes-v1');
  assert.equal(systemicArchetypes.length, 8);
  assert.ok(systemicArchetypes.every((item) => item.linkPatterns.length >= 2));
});

test('arquétipo só publica com pelo menos dois elos observados', () => {
  const one = matchArchetypes(['controle-sem-feedback']);
  assert.equal(one.length, 0);
  const two = matchArchetypes(['controle-sem-feedback', 'integracao-tardia', 'causa-processo-lote']);
  assert.ok(two.some((item) => item.id === 'fixes-that-fail'));
  assert.match(two[0]!.reading, /padrão provável/i);
});

test('escore de restrição pondera posterior, severidade e alcance', () => {
  const score = scoreCause({
    causeId: 'causa-processo-lote',
    probability: 0.8,
    explained: [
      { severity: 0.9, reach: 0.8 },
      { severity: 0.5, reach: 0.5 },
    ],
  });
  assert.ok(Math.abs(score - 0.8 * (0.9 * 0.8 + 0.5 * 0.5)) < 1e-9);
});

test('restrição principal é a causa de maior escore; portfólio a coloca primeiro', () => {
  const findings = [
    finding({
      pattern: 'integracao-tardia',
      title: 'Integração tardia',
      confidence: 0.6,
      priorityFactors: { intensity: 0.4, reach: 0.4 },
      severity: 'moderate',
    }),
    finding({
      pattern: 'causa-processo-lote',
      title: 'Política de lote',
      confidence: 0.9,
      priorityFactors: { intensity: 0.9, reach: 0.9 },
      severity: 'high',
      constraint: 'policy',
    }),
    finding({
      pattern: 'dependencia-de-heroi',
      title: 'Dependência de herói',
      confidence: 0.7,
      priorityFactors: { intensity: 0.5, reach: 0.5 },
      severity: 'moderate',
    }),
  ];
  const primary = identifyPrimaryConstraint(findings);
  assert.equal(primary?.causeId, 'causa-processo-lote');
  assert.ok((primary?.score ?? 0) > 0);

  const portfolio = TransformationPortfolioPlanner.plan(findings);
  assert.equal(portfolio.primaryConstraint?.causeId, 'causa-processo-lote');
  // Na mesma fase, a restrição principal vem antes das demais.
  const feedbackPhase = portfolio.sequence.filter((item) => item.phase === 'shorten-feedback');
  assert.equal(feedbackPhase[0]?.pattern, 'causa-processo-lote');
});

test('plano limita a 3 condutas ativas por autoridade e anexa arquétipo', () => {
  const findings = [
    finding({ pattern: 'controle-sem-feedback', title: 'Controle sem feedback', decisionAuthority: 'portfolio-leadership' }),
    finding({ pattern: 'integracao-tardia', title: 'Integração tardia', decisionAuthority: 'portfolio-leadership' }),
    finding({ pattern: 'causa-processo-lote', title: 'Lote', decisionAuthority: 'portfolio-leadership' }),
    finding({ pattern: 'dependencia-de-heroi', title: 'Herói', decisionAuthority: 'portfolio-leadership' }),
    finding({ pattern: 'mudanca-isolada', title: 'Isolada', decisionAuthority: 'team' }),
  ];
  const plan = projectTreatmentPlan(findings);
  const direction = plan.active.filter((item) => item.authority === 'direction');
  assert.ok(direction.length <= 3);
  assert.ok(plan.active.some((item) => item.archetype));
  assert.ok(plan.active.every((item) => item.evidenceGrade));
});
