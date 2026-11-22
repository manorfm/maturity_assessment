import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  projectFichaClose,
  projectHowItIs,
  projectNodeDefinition,
  projectPreserve,
  projectReportedReadings,
} from '../src/modules/inference/domain/ficha-node.js';
import {
  cynefinLine,
  evidenceGradeReading,
  learningModeReading,
  type CynefinDomain,
  type EvidenceGrade,
  type LearningMode,
} from '../src/modules/inference/domain/treatment-contract.js';
import { renderNodeCard } from '../src/modules/projects/diagnostic-report-view.js';

const SECTION_TITLES = [
  'O que é e por que importa',
  'Como está',
  'O que as pessoas relataram',
  'Por que provavelmente acontece',
  'Onde se resolve',
  'O que fazer',
  'Como saber se funcionou',
  'O que já funciona',
  'Relações com outros nós',
  'O que não sabemos',
  'Referências',
] as const;

function minimalCard(close = projectFichaClose({})) {
  return {
    title: 'Entrega',
    trail: [],
    definition: projectNodeDefinition('delivery'),
    how: projectHowItIs({}),
    reported: projectReportedReadings({ capabilityIds: ['delivery'], minimum: 5, samples: [], units: [] }),
    preserve: projectPreserve('correct'),
    close,
  };
}

function sectionHtml(html: string, title: string): string {
  const blocks = [...html.matchAll(/<section class="report-block">([\s\S]*?)<\/section>/g)].map((m) => m[1]!);
  const block = blocks.find((body) => body.includes(title));
  assert.ok(block, `seção "${title}" não encontrada`);
  return block!;
}

test('ficha numera seções 1–11 com report-section-num na ordem canônica', () => {
  const html = renderNodeCard(minimalCard());
  const hero = /<header class="report-hero">[\s\S]*?<\/header>/.exec(html)?.[0] ?? '';
  assert.ok(hero);
  assert.doesNotMatch(hero, /report-section-num/);

  const blocks = [...html.matchAll(/<section class="report-block">([\s\S]*?)<\/section>/g)].map((m) => m[1]!);
  assert.equal(blocks.length, 11);
  for (const [i, expected] of SECTION_TITLES.entries()) {
    const heading = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(blocks[i]!)?.[1] ?? '';
    assert.match(heading, new RegExp(`<span class="report-section-num" aria-hidden="true">${i + 1}</span>`));
    assert.match(heading, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('lacuna da ficha não embute Orbital, 13%, 24% nem Integração contínua', () => {
  const html = renderNodeCard(minimalCard(projectFichaClose({})));
  assert.doesNotMatch(html, /\bOrbital\b/);
  assert.doesNotMatch(html, /\b13%/);
  assert.doesNotMatch(html, /\b24%/);
  assert.doesNotMatch(html, /Integração contínua/);
});

test('projectFichaClose com só action publica body sem inventar meta', () => {
  const filled = projectFichaClose({ action: 'Encurte um lote.' });
  assert.equal(filled.action.published, true);
  assert.equal(filled.action.body, 'Encurte um lote.');
  assert.equal(filled.action.cynefin, undefined);
  assert.equal(filled.action.evidenceGrade, undefined);
  assert.equal(filled.action.learningMode, undefined);

  const empty = projectFichaClose({ action: '   ' });
  assert.equal(empty.action.published, false);
  assert.equal(empty.action.body, 'Sem conduta publicada.');
  assert.equal(empty.action.cynefin, undefined);
  assert.equal(empty.action.evidenceGrade, undefined);
  assert.equal(empty.action.learningMode, undefined);
});

test('projectFichaClose propaga cynefin, evidenceGrade e learningMode só com action publicada', () => {
  const cynefin: CynefinDomain = 'complex';
  const evidenceGrade: EvidenceGrade = 'B';
  const learningMode: LearningMode = 'work-experiment';
  const published = projectFichaClose({
    action: 'Encurte um lote.',
    cynefin,
    evidenceGrade,
    learningMode,
  });
  assert.equal(published.action.published, true);
  assert.equal(published.action.body, 'Encurte um lote.');
  assert.equal(published.action.cynefin, cynefin);
  assert.equal(published.action.evidenceGrade, evidenceGrade);
  assert.equal(published.action.learningMode, learningMode);

  const withoutBody = projectFichaClose({
    cynefin: 'clear',
    evidenceGrade: 'A',
    learningMode: 'course',
  });
  assert.equal(withoutBody.action.published, false);
  assert.equal(withoutBody.action.body, 'Sem conduta publicada.');
  assert.equal(withoutBody.action.cynefin, undefined);
  assert.equal(withoutBody.action.evidenceGrade, undefined);
  assert.equal(withoutBody.action.learningMode, undefined);

  const blankBody = projectFichaClose({
    action: '  ',
    cynefin: 'chaotic',
    evidenceGrade: 'D',
    learningMode: 'pair',
  });
  assert.equal(blankBody.action.published, false);
  assert.equal(blankBody.action.cynefin, undefined);
  assert.equal(blankBody.action.evidenceGrade, undefined);
  assert.equal(blankBody.action.learningMode, undefined);
});

test('O que fazer publicado com meta vira ficha-experiment com kicker e três campos', () => {
  const close = projectFichaClose({
    action: 'Encurte um lote.',
    cynefin: 'complex',
    evidenceGrade: 'B',
    learningMode: 'work-experiment',
  });
  const html = renderNodeCard(minimalCard(close));
  const section = sectionHtml(html, 'O que fazer');
  assert.match(section, /class="ficha-experiment"/);
  assert.match(section, /Menor experimento/);
  assert.match(section, /Encurte um lote\./);
  assert.match(section, /Cynefin/);
  assert.match(section, new RegExp(cynefinLine('complex').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(section, /Grau de evidência/);
  assert.match(section, /\bB\b/);
  assert.match(section, /Forma de aprendizado/);
  assert.match(section, new RegExp(learningModeReading['work-experiment'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('O que fazer publicado só com body não inventa Cynefin nem grau nem modo', () => {
  const close = projectFichaClose({ action: 'Encurte um lote.' });
  const html = renderNodeCard(minimalCard(close));
  const section = sectionHtml(html, 'O que fazer');
  assert.match(section, /class="ficha-experiment"/);
  assert.match(section, /Menor experimento/);
  assert.match(section, /Encurte um lote\./);
  assert.doesNotMatch(section, /Cynefin/);
  assert.doesNotMatch(section, /Grau de evidência/);
  assert.doesNotMatch(section, /Forma de aprendizado/);
  assert.doesNotMatch(section, /Complexo — experimentar/);
  assert.doesNotMatch(section, /Opinião ou analogia/);
  assert.doesNotMatch(section, /Experimento no trabalho real/);
  for (const grade of ['A', 'B', 'C', 'D'] as const) {
    assert.doesNotMatch(section, new RegExp(evidenceGradeReading[grade].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('O que fazer não publicado permanece report-gap sem cartão de experimento', () => {
  const html = renderNodeCard(minimalCard(projectFichaClose({})));
  const section = sectionHtml(html, 'O que fazer');
  assert.doesNotMatch(section, /ficha-experiment/);
  assert.doesNotMatch(section, /Menor experimento/);
  assert.match(section, /report-gap/);
  assert.match(section, /Sem conduta publicada/);
});

test('evidenceGrade na action inclui legenda A–D curta; sem grau, sem legenda', () => {
  const withGrade = renderNodeCard(minimalCard(projectFichaClose({
    action: 'Encurte um lote.',
    evidenceGrade: 'C',
  })));
  const withSection = sectionHtml(withGrade, 'O que fazer');
  for (const grade of ['A', 'B', 'C', 'D'] as const) {
    assert.match(withSection, new RegExp(evidenceGradeReading[grade].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const withoutGrade = renderNodeCard(minimalCard(projectFichaClose({
    action: 'Encurte um lote.',
    cynefin: 'clear',
    learningMode: 'kata',
  })));
  const withoutSection = sectionHtml(withoutGrade, 'O que fazer');
  for (const grade of ['A', 'B', 'C', 'D'] as const) {
    assert.doesNotMatch(withoutSection, new RegExp(evidenceGradeReading[grade].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
