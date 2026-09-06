import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { projectInterviewReport, supportBandFor } from '../src/modules/inference/domain/interview-report.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const ready = (pattern: string, title: string, detailCapability: string, extras: Partial<OutcomeFinding> = {}): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  detailCapability,
  title,
  cause: title,
  intervention: extras.intervention ?? 'Testar o caminho deste recorte.',
  confidence: extras.confidence ?? .9,
  priority: extras.priority ?? .8,
  prescription: extras.prescription ?? { status: 'ready', reason: 'Mecanismo discriminado.' },
  experiment: extras.experiment ?? {
    action: extras.intervention ?? 'Testar o caminho deste recorte.',
    owner: 'Quem autoriza o recorte',
    metric: 'efeito no próximo evento equivalente',
    reviewHorizon: 'no próximo evento',
    successCriterion: 'o próximo evento equivalente muda',
  },
  foundation: extras.foundation ?? {
    source: 'SRE / blameless postmortem',
    principle: 'Aprendeu quando o sistema muda',
    why: 'O rito sem efeito não fecha aprendizado.',
  },
  recommendationEvidence: extras.recommendationEvidence ?? {
    supportingParticipants: 6, applicablePopulation: 8, contradictingParticipants: 0,
    patterns: [pattern], layers: ['system'], profiles: ['management'],
  },
  ...extras,
});

const mapFor = (findings: OutcomeFinding[]) => OrganizationalAreaProjector.project({
  capabilities: findings.map((finding) => ({
    id: finding.detailCapability, label: finding.detailCapability, level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1,
  })),
  findings,
});

test('faixa de sustentação acompanha o posterior, sem inventar outra probabilidade', () => {
  assert.equal(supportBandFor(.9), 'alta');
  assert.equal(supportBandFor(.65), 'média');
  assert.equal(supportBandFor(.52), 'baixa');
});

test('agrupa dores publicadas por área e amarra um caminho com sustentação', () => {
  const findings = [
    ready('causa-capacidade-tomada-pela-proxima-iniciativa', 'A próxima iniciativa come a revisão', 'portfolio-management', {
      intervention: 'Não autorize o ciclo seguinte sem reservar revisão.',
      foundation: { source: 'Lean portfolio management', principle: 'Capacidade condicionada à revisão', why: 'Medir sem decidir não muda o investimento.' },
    }),
    ready('provisionamento-em-fila', 'Ambiente chega por fila', 'platform-autonomy', {
      intervention: 'Abra um caminho em que o time completa o pedido sem a fila.',
      confidence: .7,
    }),
    ready('war-room-como-gestao', 'O war room virou a gestão', 'leadership-management', {
      intervention: 'Pare de autorizar caça ao culpado no próximo incidente.',
    }),
  ];
  const report = projectInterviewReport({ findings, organizationalAreas: mapFor(findings) });
  assert.equal(report.version, 'interview-report-v1');
  assert.deepEqual(report.chapters.map((chapter) => chapter.areaId), ['product', 'engineering', 'management']);
  assert.equal(report.problemCount, 3);
  const product = report.chapters[0]!.problems[0]!;
  assert.match(product.title, /próxima iniciativa|já foram alocadas|compromisso/i);
  assert.equal(product.solutions[0]!.leading, true);
  assert.match(product.solutions[0]!.action, /ciclo seguinte|reservar revisão/i);
  assert.equal(product.solutions[0]!.supportBand, 'alta');
  assert.equal(product.solutions[0]!.posterior, .9);
  assert.match(product.solutions[0]!.foundation.source, /Lean portfolio/);
  assert.match(product.solutions[0]!.expectedImpact, /evento equivalente|capacidade para uma decisão/i);
  assert.ok(product.solutions[0]!.doesNotSolve.length > 10);
  const engineering = report.chapters.find((chapter) => chapter.areaId === 'engineering')!.problems[0]!;
  assert.equal(engineering.solutions[0]!.supportBand, 'média');
  const management = report.chapters.find((chapter) => chapter.areaId === 'management')!.problems[0]!;
  assert.match(management.solutions[0]!.foundationReading.reading, /sem procurar culpado|não a pessoa/i);
  assert.doesNotMatch(management.solutions[0]!.foundationReading.sourceLabel, /blameless/i);
});

test('várias soluções na mesma dor só entram quando outra hipótese do sistema foi publicada', () => {
  const findings = [
    ready('postmortem-sem-efeito', 'A análise não fecha solução', 'organizational-learning', { priority: .9, confidence: .88 }),
    ready('retrospectiva-sem-fechamento', 'A lista de melhoria não fecha', 'organizational-learning', { priority: .7, confidence: .64 }),
    ready('provisionamento-em-fila', 'Ambiente chega por fila', 'platform-autonomy'),
  ];
  const report = projectInterviewReport({ findings, organizationalAreas: mapFor(findings) });
  const learning = report.chapters.find((chapter) => chapter.areaId === 'management')!.problems
    .find((problem) => problem.pattern === 'postmortem-sem-efeito')!;
  assert.equal(learning.solutions.length, 2);
  assert.equal(learning.solutions[0]!.pattern, 'postmortem-sem-efeito');
  assert.equal(learning.solutions[1]!.pattern, 'retrospectiva-sem-fechamento');
  assert.equal(learning.solutions[1]!.leading, false);
  assert.equal(learning.solutions[1]!.supportBand, 'média');
  const platform = report.chapters.find((chapter) => chapter.areaId === 'engineering')!.problems[0]!;
  assert.equal(platform.solutions.length, 1);
});

test('não inventa capítulo para disciplina sem finding', () => {
  const findings = [ready('war-room-como-gestao', 'O war room virou a gestão', 'leadership-management')];
  const report = projectInterviewReport({ findings, organizationalAreas: mapFor(findings) });
  assert.deepEqual(report.chapters.map((chapter) => chapter.areaId), ['management']);
  assert.equal(report.chapters[0]!.problems[0]!.evidence[0], '6 de 8 relatos aplicáveis sustentam este mecanismo.');
});
