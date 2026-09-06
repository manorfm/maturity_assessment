import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector, findAreaPath } from '../src/modules/inference/domain/organizational-areas.js';
import { projectAreaChapter } from '../src/modules/inference/domain/area-chapter.js';
import { renderAreaRecorte } from '../src/modules/projects/project-routes.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const ready = (pattern: string, title: string, detailCapability: string, extras: Partial<OutcomeFinding> = {}): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  detailCapability,
  title,
  cause: title,
  intervention: extras.intervention ?? 'Testar o caminho deste recorte.',
  confidence: extras.confidence ?? .88,
  priority: extras.priority ?? .8,
  prescription: { status: 'ready', reason: 'Mecanismo discriminado.' },
  experiment: {
    action: extras.intervention ?? 'Testar o caminho deste recorte.',
    owner: 'Quem autoriza o recorte',
    metric: 'efeito no próximo evento',
    reviewHorizon: 'no próximo evento',
    successCriterion: 'o próximo evento equivalente muda',
  },
  ...extras,
});

const queue = ready('provisionamento-em-fila', 'Pedido de ambiente espera outro grupo', 'platform-autonomy', {
  intervention: 'Teste um caminho que o próprio time conclua, com limite visível.',
});
const warRoom = ready('war-room-como-gestao', 'O war room virou a gestão', 'leadership-management', {
  intervention: 'Pare de autorizar caça ao culpado no próximo incidente.',
});

const mapFor = (findings: OutcomeFinding[]) => OrganizationalAreaProjector.project({
  capabilities: findings.map((finding) => ({
    id: finding.detailCapability, label: finding.detailCapability, level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1,
  })),
  findings,
});

test('capítulo de Engenharia observa o recorte e nomeia a fila como pedido e espera', () => {
  const findings = [queue, warRoom];
  const map = mapFor(findings);
  const engineering = map.systems.find((system) => system.id === 'engineering')!;
  const chapter = projectAreaChapter({ area: engineering, findings, organizationalAreas: map });
  assert.equal(chapter.version, 'area-chapter-v1');
  assert.match(chapter.observes, /espera|origem|pedido/i);
  assert.doesNotMatch(chapter.observes, /O que esta disciplina abrange/);
  const pain = chapter.problems.find((problem) => problem.pattern === 'provisionamento-em-fila')!;
  assert.match(pain.localTitle, /chamado|espera outro grupo|fila do outro grupo/i);
  assert.equal(chapter.problems.some((problem) => problem.pattern === 'war-room-como-gestao'), false);
  assert.ok(pain.arrivals.some((arrival) => arrival.areaId === 'management' && /crise|war room|pressão/i.test(arrival.localTitle)));
});

test('capítulo de Gestão nomeia a mesma evidência como war room, sem inventar Plataforma', () => {
  const findings = [queue, warRoom];
  const map = mapFor(findings);
  const chapter = projectAreaChapter({ area: map.band, findings, organizationalAreas: map });
  const pain = chapter.problems.find((problem) => problem.pattern === 'war-room-como-gestao')!;
  assert.match(pain.localTitle, /crise|pressão|cala/i);
  assert.equal(chapter.problems.some((problem) => problem.pattern === 'provisionamento-em-fila'), false);
  assert.ok(pain.arrivals.some((arrival) => arrival.areaId === 'engineering' && /chamado|espera|fila/i.test(arrival.localTitle)));
});

test('sem o finding publicado no outro recorte, não inventa a intersecção', () => {
  const findings = [queue];
  const map = mapFor(findings);
  const engineering = map.systems.find((system) => system.id === 'engineering')!;
  const chapter = projectAreaChapter({ area: engineering, findings, organizationalAreas: map });
  assert.equal(chapter.problems[0]!.arrivals.length, 0);
  assert.equal(projectAreaChapter({ area: map.band, findings, organizationalAreas: map }).problems.length, 0);
});

test('página de área é capítulo: uma linha, dores locais, mesma evidência com outro nome', () => {
  const findings = [queue, warRoom];
  const map = mapFor(findings);
  const engineering = renderAreaRecorte(findAreaPath(map, 'engineering')!, {
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    findings,
    organizationalAreas: map,
    capabilities: [{
      id: 'platform-autonomy', label: 'Acesso a capacidades', level: 1, confidence: .8, evidence: 4,
      hasContradiction: false, assessed: true, coverage: 1, children: [],
    }],
  });
  assert.match(engineering, /class="area-chapter"/);
  assert.match(engineering, /espera|origem da versão|pedido/i);
  assert.match(engineering, /chamado|fila do outro grupo/i);
  assert.match(engineering, /Em Gestão/);
  assert.match(engineering, /crise|pressão|cala/i);
  assert.doesNotMatch(engineering, /O que esta disciplina abrange/);
  assert.doesNotMatch(engineering, /O que trata/);
  assert.doesNotMatch(engineering, /Como as disciplinas se cruzam/);
  assert.doesNotMatch(engineering, /<h3>Plataforma<\/h3>/);

  const management = renderAreaRecorte(findAreaPath(map, 'management')!, {
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    findings,
    organizationalAreas: map,
  });
  assert.match(management, /crise|pressão|cala/i);
  assert.match(management, /Em Engenharia/);
  assert.match(management, /chamado|fila do outro grupo/i);
});
