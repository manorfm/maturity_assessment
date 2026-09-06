import assert from 'node:assert/strict';
import { test } from 'node:test';
import { capabilityIds, CapabilityTaxonomy } from '../src/modules/inference/domain/capability-taxonomy.js';
import { disciplineBrief, disciplineScope, presentationDisciplineIds } from '../src/modules/inference/domain/discipline-brief.js';
import { problemsForNode, projectProblemTree, systemicEffectFor } from '../src/modules/inference/domain/hierarchical-problems.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { projectDisciplineCrossings } from '../src/modules/inference/domain/discipline-crossing.js';
import { renderAreaRecorte, renderDisciplineDetail, renderFindingIndex, renderFirstScreen, renderOrganizationalAreaMap } from '../src/modules/projects/project-routes.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const SLOGAN = /chegam com autonomia|preservam sustentabilidade|recebem proteção|recebem feedback técnico|necessárias entram|pode ser investigado|altera decisões|são contidos e geram|pode ser reproduzida|orienta operação e investimento|muda o caminho da entrega|preservam escopo|Recuperação de infraestrutura é/;

const finding = (pattern: string, title: string, detailCapability: string, intervention = 'Teste o menor caminho visível.'): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  title,
  detailCapability,
  cause: 'A restrição se repete no caminho compartilhado.',
  intervention,
  confidence: .8,
  priority: .8,
  prescription: { status: 'ready', reason: 'Mecanismo discriminado.' },
});

const leafNode = (id: string, label: string, children: ReturnType<typeof leafNode>[] = []) => ({
  id, label, level: 1, confidence: .8, evidence: 4, hasContradiction: false, assessed: true, coverage: 1, children,
});

test('rótulos de disciplina são substantivos, não o estado desejado', () => {
  for (const id of capabilityIds) {
    const label = CapabilityTaxonomy.labelFor(id);
    assert.doesNotMatch(label, SLOGAN, id);
    assert.ok(label.length <= 42, `${id}: ${label}`);
  }
  assert.equal(CapabilityTaxonomy.labelFor('platform-autonomy'), 'Acesso a capacidades');
  assert.doesNotMatch(CapabilityTaxonomy.labelFor('platform-autonomy'), /chegam com autonomia/i);
});

test('toda disciplina declara o que abrange, o que trata e o que não é', () => {
  for (const id of [...capabilityIds, ...presentationDisciplineIds]) {
    const scope = disciplineScope(id);
    assert.ok(scope.covers.length >= 70, id);
    assert.ok(scope.treats.length >= 50, id);
    assert.ok(scope.not.length >= 40, id);
    assert.match(scope.covers, /abrang|inclui|reúne|cobre/i, id);
    assert.match(scope.treats, /trata|olha para|discrimina/i, id);
    assert.match(scope.not, /não é|não diagnostica|não confunde/i, id);
    assert.doesNotMatch(`${scope.covers} ${scope.treats} ${scope.not}`, SLOGAN, id);
    assert.equal(disciplineBrief(id), scope.covers);
  }
});

test('efeito no sistema não copia o título da folha', () => {
  const wound = finding('provisionamento-em-fila', 'Para ter ambiente ou permissão, o time pede e espera outro grupo', 'platform-autonomy');
  const fever = systemicEffectFor(wound);
  assert.notEqual(fever.toLowerCase(), wound.title.toLowerCase());
  assert.match(fever, /espalh|sistema|disciplina|entrega/i);
  assert.doesNotMatch(fever, /Para ter ambiente ou permissão, o time pede e espera outro grupo/);
  const node = problemsForNode('platform-experience', ['platform-autonomy'], [wound]);
  assert.equal(node.local.length, 0);
  assert.equal(node.descendants[0]?.localTitle, wound.title);
  assert.notEqual(node.systemicEffects[0], wound.title);
});

test('árvore exaustiva lista o mapa inteiro e marca o que não foi atravessado', () => {
  const findings = [
    finding('provisionamento-em-fila', 'Pedido de ambiente espera outro grupo', 'platform-autonomy'),
    finding('war-room-como-gestao', 'O war room virou o modo de gestão', 'leadership-management'),
    finding('caminho-de-versao-sem-origem', 'A versão sai sem origem recuperável', 'release-feedback'),
  ];
  const map = OrganizationalAreaProjector.project({
    capabilities: [
      { id: 'platform-autonomy', label: 'Acesso', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'leadership-management', label: 'Liderança', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'release-feedback', label: 'Publicação', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
    ],
    findings,
  });
  const compact = projectProblemTree(findings, map);
  assert.equal(flattenIds(compact).includes('product'), false);
  const tree = projectProblemTree(findings, map, { exhaustive: true });
  const ids = flattenIds(tree);
  assert.ok(ids.includes('engineering'));
  assert.ok(ids.includes('platform'));
  assert.ok(ids.includes('platform-autonomy'));
  assert.ok(ids.includes('management'));
  assert.ok(ids.includes('product'));
  assert.ok(ids.includes('operations'));
  assert.equal(countProblems(tree), 3);
  const product = tree.find((node) => node.id === 'product');
  assert.equal(product?.status, 'not-traversed');
  const platform = findId(tree, 'platform-autonomy');
  assert.equal(platform?.status, 'published-problem');
});

test('página da disciplina explica o recorte, depois a dor local, depois a solução', () => {
  const wound = finding('provisionamento-em-fila', 'Para ter ambiente ou permissão, o time pede e espera outro grupo', 'platform-autonomy');
  const html = renderDisciplineDetail({
    selected: leafNode('platform-autonomy', 'Acesso a capacidades'),
    findings: [wound],
  });
  const scopeAt = html.indexOf('O que esta disciplina abrange');
  const treatsAt = html.indexOf('O que trata');
  const problemAt = html.indexOf('Problemas desta disciplina');
  const generateAt = html.indexOf('O que isso gera no sistema');
  const solutionAt = html.indexOf('O que fazer');
  assert.ok(scopeAt >= 0 && treatsAt > scopeAt && problemAt > treatsAt && generateAt > problemAt && solutionAt > generateAt);
  assert.match(html, /O que não é/);
  assert.ok(html.includes(disciplineScope('platform-autonomy').covers.slice(0, 28)));
  assert.match(html, /Para ter ambiente ou permissão/);
  assert.doesNotMatch(html, /Capacidades chegam com autonomia/);
  const fever = html.slice(generateAt, solutionAt);
  assert.doesNotMatch(fever, /Para ter ambiente ou permissão, o time pede e espera outro grupo/);
});

test('página-pai mostra a febre do nível e as dores das folhas, textos distintos', () => {
  const wound = finding('provisionamento-em-fila', 'Para ter ambiente ou permissão, o time pede e espera outro grupo', 'platform-autonomy');
  const html = renderDisciplineDetail({
    selected: leafNode('platform-experience', 'Plataforma e experiência de engenharia', [
      leafNode('platform-autonomy', 'Acesso a capacidades'),
    ]),
    findings: [wound],
  });
  assert.match(html, /Efeito neste nível/);
  assert.match(html, /Dores nas disciplinas abaixo/);
  assert.match(html, /Acesso a capacidades/);
  assert.match(html, /Para ter ambiente ou permissão/);
  const feverBlock = html.slice(html.indexOf('Efeito neste nível'), html.indexOf('Dores nas disciplinas abaixo'));
  assert.doesNotMatch(feverBlock, /Para ter ambiente ou permissão, o time pede e espera outro grupo/);
});

test('cruzamento liga a dor de uma disciplina ao efeito na outra', () => {
  const edges = projectDisciplineCrossings([
    finding('provisionamento-em-fila', 'Pedido de ambiente espera outro grupo', 'platform-autonomy'),
    finding('war-room-como-gestao', 'O war room virou o modo de gestão', 'leadership-management'),
    finding('empacotamento-manual', 'A versão para no passo de preparar', 'release-feedback'),
    finding('espera-normalizada', 'O time compensa espera iniciando mais trabalho', 'work-management'),
  ], 'war-room-como-gestao');
  assert.ok(edges.length >= 1 && edges.length <= 3);
  assert.ok(edges.every((edge) => edge.fromId !== edge.toId));
  assert.ok(new Set(edges.map((edge) => edge.fromId)).size >= Math.min(2, edges.length));
  assert.ok(edges.some((edge) => edge.fromId === 'platform-autonomy' && edge.toId === 'leadership-management'));
  assert.match(edges.find((edge) => edge.fromId === 'platform-autonomy')?.generates ?? '', /Fila de ambiente|pedido/i);
  assert.doesNotMatch(edges.map((edge) => edge.generates).join(' '), /Pedido de ambiente espera outro grupo em Acesso/);
  assert.doesNotMatch(edges.map((edge) => edge.generates).join(' '), /ainda não|provisório|não dá para dizer/i);
  assert.equal(edges.filter((edge) => /war room virou o modo/i.test(edge.generates)).length, 0);
});

test('first screen lista todos os problemas por hierarquia e não trata vazio como ausência', () => {
  const findings = [
    finding('provisionamento-em-fila', 'Pedido de ambiente espera outro grupo', 'platform-autonomy'),
    finding('empacotamento-manual', 'A versão para no passo de preparar', 'release-feedback'),
  ];
  const map = OrganizationalAreaProjector.project({
    capabilities: [
      { id: 'platform-autonomy', label: 'Acesso', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'release-feedback', label: 'Publicação', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
    ],
    findings,
  });
  const html = renderFindingIndex(findings, findings[0]!.pattern, map, '/capabilities', { exhaustive: true, reading: 'problem' });
  assert.match(html, /Problemas por nível/);
  assert.match(html, /A dor da folha gera o efeito do sistema/);
  assert.match(html, /Pedido de ambiente espera outro grupo/);
  assert.match(html, /A versão para no passo de preparar/);
  assert.match(html, /Engenharia/);
  assert.match(html, /Produto/);
  assert.match(html, /Operação/);
  assert.match(html, /entrevista não atravessou/);
  assert.ok(html.includes(disciplineBrief('product').slice(0, 18)));
  assert.match(html, /Plataforma|Publicação|Entrega/);
  assert.doesNotMatch(html, /Outras restrições/);
  const mapHtml = renderOrganizationalAreaMap(map, { areaBase: '/areas', capabilityBase: '/capabilities' });
  assert.match(mapHtml, /entrevista não atravessou/);
  assert.doesNotMatch(mapHtml, />não observado</);
});

test('recorte de área abre com o que a disciplina é e os problemas do nível', () => {
  const wound = finding('provisionamento-em-fila', 'Pedido de ambiente espera outro grupo', 'platform-autonomy');
  const map = OrganizationalAreaProjector.project({
    capabilities: [{ id: 'platform-autonomy', label: 'Acesso', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 }],
    findings: [wound],
  });
  const path = map.systems.filter((system) => system.id === 'engineering');
  const html = renderAreaRecorte(path, {
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    findings: [wound],
    capabilities: [leafNode('platform-autonomy', 'Acesso a capacidades')],
  });
  assert.match(html, /O que esta disciplina abrange/);
  assert.ok(html.includes(disciplineScope('engineering').covers.slice(0, 24)));
  assert.match(html, /Pedido de ambiente espera outro grupo/);
  assert.match(html, /Disciplinas de Engenharia/);
});

test('cobertura sem finding, no recorte com problemas, não se lê como disciplina saudável', () => {
  const wound = finding('provisionamento-em-fila', 'Pedido de ambiente espera outro grupo', 'platform-autonomy');
  const map = OrganizationalAreaProjector.project({
    capabilities: [
      { id: 'platform-autonomy', label: 'Acesso', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'software-security', label: 'Segurança', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
    ],
    findings: [wound],
  });
  const html = renderFindingIndex([wound], wound.pattern, map, '/capabilities', { exhaustive: true, reading: 'problem' });
  assert.match(html, /ainda sem causa isolada|não leia como disciplina saudável/);
  assert.doesNotMatch(html, /Segurança[\s\S]{0,80}cobertura sem problema publicado/);
});

function flattenIds(nodes: { id: string; children: { id: string; children: never[] }[] }[]): string[] {
  return nodes.flatMap((node) => [node.id, ...flattenIds(node.children)]);
}

function findId(nodes: { id: string; children: { id: string; children: never[] }[] }[], id: string): { id: string; status?: string } | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = findId(node.children, id);
    if (nested) return nested;
  }
  return undefined;
}

function countProblems(nodes: { problems: unknown[]; children: { problems: unknown[]; children: never[] }[] }[]): number {
  return nodes.reduce((total, node) => total + node.problems.length + countProblems(node.children), 0);
}
