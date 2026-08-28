import assert from 'node:assert/strict';
import { test } from 'node:test';
import { auditInstrument } from '../src/modules/catalog/instrument-audit.js';
import type { AssessmentNode } from '../src/modules/catalog/assessment-graph.js';
import type { InterventionDefinition } from '../src/modules/inference/domain/group-recommendation-engine.js';

test('auditoria relata todos os problemas editoriais sem parar no primeiro', () => {
  const nodes: AssessmentNode[] = [{ id: 'example', title: 'Exemplo', scenario: 'Pense no trabalho.', prompt: 'Qual é a capacidade ideal?', options: [{ id: 'gold', label: 'Faz tudo corretamente; mede; aprende; melhora.', signals: Array.from({ length: 5 }, (_, index) => ({ capability: 'x', pattern: `p${index}`, weight: 1, details: ['x'], layer: 'practice', constraint: 'none' })) }] }];
  const intervention = { title: 'Problema', cause: 'Causa suficientemente descrita.', action: 'Agir.', intervention: 'Agir.', owner: 'Responsável pela capacidade com o time', metric: 'tempo de espera, recorrência e efeito observado na capacidade afetada', reviewHorizon: '30 dias', successCriterion: 'a métrica escolhida melhora no período sem deslocar risco ou espera para outra etapa', evidencePatterns: ['p'], contradictionPatterns: [], foundation: { source: 'Melhoria contínua', principle: 'Revisar', why: 'A intervenção ataca o comportamento observado, não um inventário de práticas.' } } satisfies InterventionDefinition;
  const issues = auditInstrument(nodes, { p: intervention });
  assert.ok(issues.length >= 6);
  assert.deepEqual(new Set(issues.map((item) => item.code)), new Set(['missing-observation-anchor', 'abstract-prompt', 'compound-option', 'desirability-cue', 'signal-overload', 'generic-success', 'generic-metric', 'generic-owner', 'generic-foundation']));
});
