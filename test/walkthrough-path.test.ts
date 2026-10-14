import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { projectAreaWalkthrough } from '../src/modules/inference/domain/area-walkthrough.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import { renderWalkthrough } from '../src/modules/projects/diagnostic-report-view.js';

const finding = (detailCapability: string, title: string): OutcomeFinding => ({
  kind: 'correction',
  pattern: 'conhecimento-concentrado',
  detailCapability,
  title,
  cause: title,
  intervention: 'Difundir a investigação.',
  confidence: 0.9,
  priority: 0.8,
  experiment: {
    action: 'Escrever o que aconteceu no último incidente',
    owner: 'Operação',
    metric: 'pessoas',
    reviewHorizon: '30 dias',
    successCriterion: 'O próximo incidente muda o modo de investigar.',
  },
});

test('abertura traz o estado da área e a lacuna do índice, sem o caso do protótipo', () => {
  const findings = [finding('incident-management', 'Investigar depende de poucas pessoas')];
  const capabilities = [
    { id: 'incident-management', label: 'Incidentes', level: 1, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
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
      action: 'Escrever o que aconteceu no último incidente',
      owner: 'Operação',
      success: 'O próximo incidente muda o modo de investigar.',
      horizon: '0-30',
      authority: 'team',
    }],
    pulse: [],
  });
  assert.equal('gap' in walk.opening, false);
  if (!('gap' in walk.opening)) {
    assert.match(walk.opening.state, /Investigar depende de poucas pessoas/);
    assert.match(walk.opening.chipGap ?? '', /quando o modelo publicar/);
  }
  assert.doesNotMatch(JSON.stringify(walk.opening), /29%|alvo 45|2 pessoas/);
  assert.match(walk.trail[0]?.expect ?? '', /O próximo incidente muda o modo de investigar/);
  assert.match(walk.trail[1]?.gap ?? '', /Sem conduta/);
  assert.match(walk.trail[2]?.gap ?? '', /Sem conduta/);
  assert.ok(walk.sections.milestones.some((line) => /modo de investigar/.test(line)));
  assert.doesNotMatch(walk.sections.milestones.join(' '), /6 meses|38%/);
});

test('próxima fase não sobe quando a fronteira bloqueia o degrau', () => {
  const findings = [finding('incident-management', 'Investigar depende de poucas pessoas')];
  const capabilities = [
    { id: 'incident-management', label: 'Incidentes', level: 1, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
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
    enablementEdges: [{
      from: 'observability-practice',
      to: 'incident-management:1→2',
      probability: 0.1,
      unlocks: 'incident-management:1→2',
      fromLabel: 'Observabilidade',
    }],
  });
  assert.equal('gap' in walk.step, true);
  if ('gap' in walk.step) assert.match(walk.step.gap, /fora da fronteira/);
  const html = renderWalkthrough(walk);
  assert.match(html, /class="walk-trail"/);
  assert.match(html, /fora da fronteira/);
  assert.doesNotMatch(html, /1 → 2|1→2/);
  const trail = html.indexOf('walk-trail');
  const risks = html.indexOf('Riscos de regressão');
  const assumptions = html.indexOf('Premissas a revisar');
  assert.ok(trail >= 0 && trail < risks && risks < assumptions);
});
