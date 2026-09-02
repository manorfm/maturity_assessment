import assert from 'node:assert/strict';
import { test } from 'node:test';
import { auditInstrument, auditInstrumentVersion } from '../src/modules/catalog/instrument-audit.js';
import { graph, nodeVariants, profiles, type AssessmentNode } from '../src/modules/catalog/assessment-graph.js';
import type { InterventionDefinition } from '../src/modules/inference/domain/group-recommendation-engine.js';
import { evolutionCatalog, interventionCatalog } from '../src/modules/inference/inference-service.js';
import { interventionFoundations } from '../src/modules/inference/domain/intervention-foundations.js';

test('auditoria relata todos os problemas editoriais sem parar no primeiro', () => {
  const nodes: AssessmentNode[] = [{ id: 'example', title: 'Exemplo', scenario: 'Pense no trabalho.', prompt: 'Qual é a capacidade ideal?', options: [{ id: 'gold', label: 'Faz tudo corretamente; mede; aprende; melhora.', signals: Array.from({ length: 5 }, (_, index) => ({ capability: 'x', pattern: `p${index}`, weight: 1, details: ['x'], layer: 'practice', constraint: 'none' })) }] }];
  const intervention = { title: 'Problema', cause: 'Causa suficientemente descrita.', action: 'Agir.', intervention: 'Agir.', owner: 'Responsável pela capacidade com o time', metric: 'tempo de espera, recorrência e efeito observado na capacidade afetada', reviewHorizon: '30 dias', successCriterion: 'a métrica escolhida melhora no período sem deslocar risco ou espera para outra etapa', evidencePatterns: ['p'], contradictionPatterns: [], foundation: { source: 'Melhoria contínua', principle: 'Revisar', why: 'A intervenção ataca o comportamento observado, não um inventário de práticas.' } } satisfies InterventionDefinition;
  const issues = auditInstrument(nodes, { p: intervention });
  assert.ok(issues.length >= 6);
  assert.deepEqual(new Set(issues.map((item) => item.code)), new Set(['missing-observation-anchor', 'missing-visibility-exit', 'abstract-prompt', 'compound-option', 'desirability-cue', 'signal-overload', 'generic-success', 'generic-metric', 'generic-owner', 'generic-foundation']));
});

test('pergunta sem saída de visibilidade é bloqueada', () => {
  const node: AssessmentNode = { id: 'without-exit', title: 'Mudança', scenario: 'Na última mudança.', prompt: 'O que aconteceu?', options: [{ id: 'answer', label: 'O grupo esperou outra área.', signals: [] }] };
  assert.ok(auditInstrument([node], {}).some((issue) => issue.code === 'missing-visibility-exit'));
});

test('jargão exposto à pessoa respondente exige tradução cotidiana', () => {
  const node: AssessmentNode = { id: 'jargon', title: 'Mudança', scenario: 'Depois do último deploy.', prompt: 'Como o handoff aconteceu?', options: [{ id: 'answer', label: 'O rollback dependeu do runbook.', signals: [] }, { id: 'cannot-observe', label: 'Não acompanho.', observation: 'visibility', signals: [] }] };
  const issues = auditInstrument([node], {});
  assert.equal(issues.filter((issue) => issue.code === 'exposed-jargon').length, 3);
});

test('cenário publica fato e reserva padrão causal para probe', () => {
  const scenario: AssessmentNode = { id: 'wait', type: 'scenario', title: 'Espera', scenario: 'Na última mudança.', prompt: 'O que ocorreu?', options: [{ id: 'ticket', label: 'Outro grupo executou depois do chamado.', signals: [{ capability: 'plataforma', pattern: 'causa-politica-espera', weight: -1, details: ['platform-autonomy'], layer: 'practice', constraint: 'governance' }] }] };
  const probe: AssessmentNode = { ...scenario, id: 'wait-cause', type: 'probe' };
  assert.ok(auditInstrument([scenario], {}).some((issue) => issue.code === 'premature-causal-signal'));
  assert.equal(auditInstrument([probe], {}).some((issue) => issue.code === 'premature-causal-signal'), false);
});

test('probe causal precisa declarar o mecanismo em vez de none', () => {
  const probe: AssessmentNode = { id: 'wait-cause', type: 'probe', title: 'Origem da espera', scenario: 'Na última mudança.', prompt: 'O que impediu o avanço?', options: [{ id: 'policy', label: 'Uma regra exigiu aguardar outra área.', signals: [{ capability: 'governanca', pattern: 'causa-politica-espera', weight: -1, details: ['enabling-governance'], layer: 'system', constraint: 'none' }] }] };
  assert.ok(auditInstrument([probe], {}).some((issue) => issue.code === 'missing-causal-constraint'));
});

test('auditoria versionada centraliza issues e linha de base de autoria', () => {
  const interventions = { ...interventionCatalog, ...evolutionCatalog };
  const report = auditInstrumentVersion({ graph, nodeVariants, profiles, interventions, foundations: interventionFoundations });
  assert.equal(report.errors, 0);
  assert.equal(report.warnings, 0);
  assert.equal(report.baseline.nodes.total, graph.length);
  assert.equal(report.baseline.direction.totalInterventions, Object.keys(interventions).length);
  assert.equal(report.baseline.direction.genericFoundations, 53);
});
