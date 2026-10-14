import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import {
  nextPhaseStage,
  projectAreaWalkthrough,
} from '../src/modules/inference/domain/area-walkthrough.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import { renderWalkthrough } from '../src/modules/projects/diagnostic-report-view.js';

const ready = (pattern: string, title: string, detailCapability: string, extras: Partial<OutcomeFinding> = {}): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  detailCapability,
  title,
  cause: title,
  intervention: extras.intervention ?? 'Difundir a capacidade sem herói.',
  confidence: extras.confidence ?? 0.88,
  priority: extras.priority ?? 0.8,
  prescription: { status: 'ready', reason: 'Mecanismo discriminado.' },
  experiment: {
    action: extras.intervention ?? 'Difundir a capacidade sem herói.',
    owner: 'Quem autoriza o recorte',
    metric: 'pessoas distintas investigam',
    reviewHorizon: 'no próximo incidente',
    successCriterion: '≥ 4 pessoas diferentes investigaram',
  },
  ...extras,
});

test('próxima fase sobe um degrau e respeita o alvo', () => {
  assert.equal(nextPhaseStage(1), 2);
  assert.equal(nextPhaseStage(3, 3), 3);
  assert.equal(nextPhaseStage(4), 4);
  assert.equal(nextPhaseStage(0, 2), 1);
});

test('walkthrough da Operação projeta as 8 seções e a próxima fase da rubrica', () => {
  const findings = [
    ready('conhecimento-concentrado', 'Investigar depende de poucas pessoas', 'incident-management', {
      foundation: { source: 'Accelerate', principle: 'conhecimento compartilhado', why: 'Concentração cria risco.' },
    }),
  ];
  const capabilities = [
    { id: 'incident-management', label: 'Incidentes', level: 1, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
    { id: 'reliability-practice', label: 'Confiabilidade', level: 2, confidence: 0.7, evidence: 3, hasContradiction: false, coverage: 1 },
  ];
  const map = OrganizationalAreaProjector.project({ capabilities, findings });
  const operations = map.systems.find((system) => system.id === 'operations')!;
  const walk = projectAreaWalkthrough({
    area: operations,
    findings,
    capabilities,
    organizationalAreas: map,
    outcomeKind: 'correct',
    conducts: [{
      action: 'Escrever runbook dos 3 incidentes mais frequentes',
      owner: 'Time de operação',
      success: 'runbooks usados no próximo evento',
      horizon: '0-30',
      authority: 'team',
    }, {
      action: 'Plantão com rodízio',
      owner: 'Gestão',
      success: 'rodízio cobrindo uma semana',
      horizon: '1-3',
      authority: 'management',
    }],
    pulse: [{
      prompt: 'Quem conseguiu investigar o último problema?',
      leafId: 'incident-management',
    }],
  });

  assert.equal(walk.version, 'area-walkthrough-v1');
  assert.equal(walk.areaId, 'operations');
  assert.ok(walk.sections.where.length >= 1);
  assert.match(walk.sections.where[0]!, /Incidentes|estágio|Reativo/i);
  assert.match(walk.sections.arrived, /poucas pessoas|conhecimento|herói|padrão|Transferência/i);
  assert.ok(walk.sections.next.some((line) => /1\s*→\s*2|Reativo.*Repetível|investiga/i.test(line)));
  assert.match(walk.sections.path.d30, /runbook/i);
  assert.match(walk.sections.path.d90, /plantão|rodízio/i);
  assert.ok(walk.sections.milestones.some((line) => /investigar|pulso/i.test(line)));
  assert.ok(walk.sections.risks.length);
  assert.ok(walk.sections.assumptions.length);

  const html = renderWalkthrough(walk);
  assert.match(html, /Onde estamos/);
  assert.match(html, /Como chegamos aqui/);
  assert.match(html, /O que já funciona/);
  assert.match(html, /Próxima fase/);
  assert.match(html, /Caminho/);
  assert.match(html, /Marcos/);
  assert.match(html, /Riscos de regressão/);
  assert.match(html, /Premissas a revisar/);
  assert.doesNotMatch(html, /O protótipo só desenhou Operação/);
});

test('próxima fase pode mirar prática avançada pelo gargalo de prontidão', () => {
  const findings = [
    ready('conhecimento-concentrado', 'Investigar depende de poucas pessoas', 'incident-management'),
  ];
  const capabilities = [
    { id: 'incident-management', label: 'Incidentes', level: 1, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
    { id: 'observability-practice', label: 'Observabilidade', level: 1, confidence: 0.7, evidence: 3, hasContradiction: false, coverage: 1 },
    { id: 'reliability-practice', label: 'Confiabilidade', level: 1, confidence: 0.7, evidence: 3, hasContradiction: false, coverage: 1 },
    { id: 'release-feedback', label: 'Liberação', level: 2, confidence: 0.7, evidence: 3, hasContradiction: false, coverage: 1 },
    { id: 'organizational-learning', label: 'Aprendizado', level: 2, confidence: 0.7, evidence: 3, hasContradiction: false, coverage: 1 },
  ];
  const map = OrganizationalAreaProjector.project({ capabilities, findings });
  const operations = map.systems.find((system) => system.id === 'operations')!;
  const walk = projectAreaWalkthrough({
    area: operations,
    findings,
    capabilities,
    organizationalAreas: map,
    outcomeKind: 'correct',
    conducts: [],
    pulse: [],
    leaves: Object.fromEntries(capabilities.map((cap) => [cap.id, { level: cap.level, coverage: 1 }])),
    targetPracticeIds: ['chaos-engineering'],
  });
  assert.ok(walk.sections.next.some((line) => /Chaos engineering/i.test(line) && /gargalo|próximo degrau/i.test(line)));
});

test('área sem achados locais declara lacuna sem inventar próxima fase', () => {
  const findings = [ready('war-room-como-gestao', 'O war room virou a gestão', 'leadership-management')];
  const capabilities = [
    { id: 'leadership-management', label: 'Liderança', level: 1, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
  ];
  const map = OrganizationalAreaProjector.project({ capabilities, findings });
  const operations = map.systems.find((system) => system.id === 'operations')!;
  const walk = projectAreaWalkthrough({
    area: operations,
    findings,
    capabilities,
    organizationalAreas: map,
    outcomeKind: 'insufficient',
    conducts: [],
    pulse: [],
  });
  assert.match(walk.sections.next[0]!, /Sem próxima fase|ainda não/i);
  assert.match(walk.sections.where[0]!, /ainda não|sem achado|sem índice/i);
});
