import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bottleneckStatus, type ReadinessAssessment } from '../src/modules/inference/domain/advanced-readiness.js';
import { renderReadinessPage } from '../src/modules/projects/diagnostic-report-view.js';
import { layout } from '../src/shared/html.js';

function assessmentFixture(overrides: Partial<ReadinessAssessment> = {}): ReadinessAssessment {
  return {
    probability: 0.1,
    comfort: 0.1,
    band: 'not-ready',
    premature: false,
    missing: ['Observabilidade'],
    checklist: [
      { id: 'obs', label: 'Observabilidade', essential: true, probability: 0.12 },
      { id: 'slo', label: 'Estado estável', essential: true, probability: 0.8 },
    ],
    ...overrides,
  };
}

function pct(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

test('cartão publicado: tag, kicker, % herói, trilho e lead', () => {
  const assessment = assessmentFixture();
  const verdict = bottleneckStatus(assessment);
  const html = renderReadinessPage([{
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    assessment,
    verdict,
  }]);

  assert.match(html, /class="readiness-card"/);
  assert.match(html, /<h2>Chaos engineering<\/h2>/);
  assert.match(html, /class="[^"]*\breadiness\b[^"]*\bblocked\b[^"]*"/);
  assert.match(html, /Não pronto/);
  assert.match(html, /Probabilidade de estar pronto hoje/);
  assert.match(html, /class="readiness-probability"[^>]*>\s*10%/);
  assert.match(html, /class="readiness-probability-track"/);
  assert.equal(html.includes(verdict.line), true);
  assert.doesNotMatch(html, /P\(pronto\)\s*0\.1/);

  const near = renderReadinessPage([{
    id: 'near-practice',
    label: 'Prática perto',
    assessment: assessmentFixture({
      probability: 0.4,
      band: 'near',
      checklist: [
        { id: 'a', label: 'Pré A', essential: true, probability: 0.4 },
        { id: 'b', label: 'Pré B', essential: true, probability: 0.7 },
      ],
    }),
  }]);
  assert.match(near, /class="[^"]*\breadiness\b[^"]*\bnear\b[^"]*"/);
  assert.match(near, /Perto/);

  const ready = renderReadinessPage([{
    id: 'ready-practice',
    label: 'Prática pronta',
    assessment: assessmentFixture({
      probability: 0.85,
      band: 'ready',
      checklist: [
        { id: 'a', label: 'Pré A', essential: true, probability: 0.85 },
        { id: 'b', label: 'Pré B', essential: true, probability: 0.9 },
      ],
    }),
  }]);
  assert.match(ready, /class="[^"]*\breadiness\b[^"]*\bready\b[^"]*"/);
  assert.match(ready, /Pronto/);
});

test('grade substitui checklist de p_k', () => {
  const assessment = assessmentFixture();
  const html = renderReadinessPage([{
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    assessment,
  }]);

  assert.match(html, /class="readiness-prereq-grid"/);
  assert.match(html, /Pré-requisito/);
  assert.match(html, /Probabilidade de atendido/);
  const rows = [...html.matchAll(/class="[^"]*\breadiness-prereq-row\b[^"]*"/g)];
  assert.equal(rows.length, assessment.checklist.length);
  assert.doesNotMatch(html, /readiness-checklist/);
  assert.doesNotMatch(html, /p_k 0\.12/);
  assert.doesNotMatch(html, /p_k 0\.80/);
});

test('markers e status seguem limiares 0.25 e 0.6', () => {
  const checklist = [
    { id: 'a', label: 'Abaixo', essential: true, probability: 0.24 },
    { id: 'b', label: 'Limiar parcial baixo', essential: true, probability: 0.25 },
    { id: 'c', label: 'Limiar parcial alto', essential: true, probability: 0.59 },
    { id: 'd', label: 'Atendido', essential: true, probability: 0.6 },
  ];
  const html = renderReadinessPage([{
    id: 'thresholds',
    label: 'Limiares',
    assessment: assessmentFixture({
      probability: 0.24,
      band: 'not-ready',
      checklist,
    }),
  }]);

  const expected = [
    { label: 'Abaixo', marker: '○', status: 'não atendido' },
    { label: 'Limiar parcial baixo', marker: '◐', status: 'parcial' },
    { label: 'Limiar parcial alto', marker: '◐', status: 'parcial' },
    { label: 'Atendido', marker: '●', status: 'atendido' },
  ] as const;

  for (const row of expected) {
    const rowMatch = [...html.matchAll(/<[^>]*class="[^"]*\breadiness-prereq-row\b[^"]*"[^>]*>[\s\S]*?<\/(?:div|li|tr)>/g)]
      .map((m) => m[0]!)
      .find((chunk) => chunk.includes(row.label));
    assert.ok(rowMatch, `row de ${row.label} ausente`);
    assert.equal(rowMatch.includes(row.marker), true, `${row.label} sem marker ${row.marker}`);
    assert.equal(rowMatch.includes(row.status), true, `${row.label} sem status ${row.status}`);
  }
});

test('gargalo só na row do bottleneck', () => {
  const assessment = assessmentFixture();
  const verdict = bottleneckStatus(assessment);
  const html = renderReadinessPage([{
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    assessment,
    verdict,
  }]);

  const rowChunks = [...html.matchAll(/<[^>]*class="[^"]*\breadiness-prereq-row\b[^"]*"[^>]*>[\s\S]*?<\/(?:div|li|tr)>/g)]
    .map((m) => m[0]!);
  const weak = rowChunks.find((chunk) => chunk.includes(verdict.bottleneck));
  const other = rowChunks.find((chunk) => chunk.includes('Estado estável'));
  assert.ok(weak, 'row do gargalo ausente');
  assert.ok(other, 'row não-gargalo ausente');
  assert.match(weak, /readiness-prereq-bottleneck/);
  assert.match(weak, /gargalo/);
  assert.doesNotMatch(other, /readiness-prereq-bottleneck/);
});

test('barras e percentuais das rows usam round(p*100)%', () => {
  const checklist = [
    { id: 'obs', label: 'Observabilidade', essential: true, probability: 0.12 },
    { id: 'slo', label: 'Estado estável', essential: true, probability: 0.8 },
  ];
  const html = renderReadinessPage([{
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    assessment: assessmentFixture({ checklist, probability: 0.12 }),
  }]);

  for (const row of checklist) {
    const percent = pct(row.probability);
    const rowMatch = [...html.matchAll(/<[^>]*class="[^"]*\breadiness-prereq-row\b[^"]*"[^>]*>[\s\S]*?<\/(?:div|li|tr)>/g)]
      .map((m) => m[0]!)
      .find((chunk) => chunk.includes(row.label));
    assert.ok(rowMatch, `row de ${row.label} ausente`);
    assert.match(rowMatch, /class="[^"]*\breadiness-prereq-bar\b[^"]*"/);
    assert.match(rowMatch, new RegExp(`width:\\s*${percent.replace('%', '\\%')}`));
    assert.match(rowMatch, new RegExp(`${percent.replace('%', '\\%')}`));
    assert.doesNotMatch(rowMatch, new RegExp(`p_k ${row.probability.toFixed(2)}`));
  }
});

test('lacuna sem assessment não inventa card, grade nem percentuais', () => {
  const html = renderReadinessPage([{
    id: 'ai-dlc',
    label: 'AI DLC',
    gap: 'Sem posterior das folhas essenciais. Prontidão não vira índice.',
  }]);

  assert.doesNotMatch(html, /class="readiness-card"/);
  assert.doesNotMatch(html, /readiness-prereq-grid/);
  assert.doesNotMatch(html, /readiness-probability/);
  assert.doesNotMatch(html, /readiness-probability-track/);
  assert.doesNotMatch(html, /P\(pronto\)/);
  assert.doesNotMatch(html, /\bOrbital\b/);
  assert.doesNotMatch(html, /\b13%/);
  assert.doesNotMatch(html, /\b24%/);
  assert.doesNotMatch(html, /\b45%/);
  assert.match(html, /report-gap/);
});

test('conduta, withheld, premature e nota de índice permanecem no cartão', () => {
  const assessment = assessmentFixture({ premature: true });
  const conduct = 'Para Chaos engineering: próximo degrau é Observabilidade; um degrau por vez até a prática.';
  const withheld = 'Observabilidade dos serviços críticos está bloqueado na fronteira e não é o próximo passo.';
  const html = renderReadinessPage([{
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    assessment,
    conduct,
    withheld,
    premature: true,
  }]);

  assert.equal(html.includes(withheld), true);
  assert.equal(html.includes(conduct), false);
  assert.match(html, /não culpa de uma pessoa/);
  assert.match(html, /não é índice da organização|nunca passa a ser índice/i);
  assert.match(html, /A média não decide/);

  const withConduct = renderReadinessPage([{
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    assessment: assessmentFixture(),
    conduct,
  }]);
  assert.equal(withConduct.includes(conduct), true);
});

test('CSS estrutural: título do card 30px e probabilidade 48px', () => {
  const served = layout('Prontidão', '');
  const cardH2 = [...served.matchAll(/\.readiness-card\s+h2\s*\{([^}]+)\}/g)][0]?.[1]?.replace(/\s+/g, ' ') ?? '';
  assert.match(cardH2, /font-size:\s*30px/);

  const probability = [...served.matchAll(/\.readiness-probability\s*\{([^}]+)\}/g)][0]?.[1]?.replace(/\s+/g, ' ') ?? '';
  assert.match(probability, /font-size:\s*48px/);
});
