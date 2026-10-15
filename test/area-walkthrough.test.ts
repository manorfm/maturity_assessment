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

function milestoneSection(html: string): string {
  const start = html.indexOf('<h2>Marcos</h2>');
  const end = html.indexOf('<h2>Riscos de regressão</h2>');
  return html.slice(start, end < 0 ? undefined : end);
}

test('marco da Operação repete ação, horizonte e critério da conduta', () => {
  const findings = [
    ready('conhecimento-concentrado', 'Investigar depende de poucas pessoas', 'incident-management'),
  ];
  const capabilities = [
    { id: 'incident-management', label: 'Incidentes', level: 1, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
  ];
  const map = OrganizationalAreaProjector.project({ capabilities, findings });
  const operations = map.systems.find((system) => system.id === 'operations')!;
  const conducts = [
    {
      action: 'Escrever runbook dos incidentes frequentes',
      owner: 'Time de operação',
      success: 'runbooks usados no próximo evento',
      horizon: '0-30' as const,
      authority: 'team' as const,
    },
    {
      action: 'Plantão com rodízio semanal',
      owner: 'Gestão',
      success: 'rodízio cobrindo uma semana inteira',
      horizon: '1-3' as const,
      authority: 'management' as const,
    },
    {
      action: 'Comunidade de investigação entre times',
      owner: 'Operação',
      success: 'investigação compartilhada sem herói fixo',
      horizon: '3-12' as const,
      authority: 'team' as const,
    },
  ];
  const pulse = [{ prompt: 'Quem investigou o último problema?', leafId: 'incident-management' }];
  const base = {
    area: operations,
    findings,
    capabilities,
    organizationalAreas: map,
    outcomeKind: 'correct' as const,
    conducts,
    pulse,
  };
  const publishedWithoutTarget = {
    published: true as const,
    index: 28,
    band: [20, 40] as [number, number],
    coverage: 60,
  };
  const walk = projectAreaWalkthrough({ ...base, index: publishedWithoutTarget });
  for (const conduct of conducts) {
    assert.ok(
      walk.sections.milestones.some((line) => line.includes(conduct.action) && line.includes(conduct.horizon) && line.includes(conduct.success)),
      walk.sections.milestones.join(' | '),
    );
  }
  const pulseLine = walk.sections.milestones.find((line) => line.startsWith('Pulso:'));
  assert.ok(pulseLine?.includes('Quem investigou o último problema?'));
  assert.equal(pulseLine?.includes('%'), false);

  const milestones = milestoneSection(renderWalkthrough(walk));
  assert.ok(milestones.includes(conducts[2]!.success));
  assert.equal(milestones.includes('%'), false);
  assert.equal(milestones.includes('Orbital'), false);
  assert.equal(milestones.includes('45%'), false);
  assert.equal(milestones.includes('13%'), false);
  assert.equal(milestones.includes('alvo 45%'), false);

  const targeted = projectAreaWalkthrough({
    ...base,
    index: { ...publishedWithoutTarget, target: 62 },
  });
  const targetedMilestones = milestoneSection(renderWalkthrough(targeted));
  assert.ok(targetedMilestones.includes(conducts[2]!.success));
  assert.ok(targetedMilestones.includes('alvo 62%'));
  assert.equal(targetedMilestones.includes('45%'), false);
  assert.equal(targetedMilestones.includes('13%'), false);
  assert.equal(targetedMilestones.includes('Orbital'), false);
  assert.equal(targetedMilestones.includes('alvo 45%'), false);
  const targetedPulse = targeted.sections.milestones.find((line) => line.startsWith('Pulso:'));
  assert.equal(targetedPulse?.includes('%'), false);

  const empty = projectAreaWalkthrough({
    ...base,
    conducts: [],
    pulse: [],
    index: { ...publishedWithoutTarget, target: 62 },
  });
  const emptyMilestones = milestoneSection(renderWalkthrough(empty));
  assert.ok(empty.sections.milestones.some((line) => line.includes('conduta publicada')));
  assert.ok(emptyMilestones.includes('conduta publicada'));
  assert.equal(emptyMilestones.includes('%'), false);
  assert.equal(emptyMilestones.includes('Orbital'), false);
  assert.equal(emptyMilestones.includes('45%'), false);
  assert.equal(emptyMilestones.includes('13%'), false);
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
