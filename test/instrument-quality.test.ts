import assert from 'node:assert/strict';
import { test } from 'node:test';
import { graph } from '../src/modules/catalog/assessment-graph.js';
import { causalKnowledgeGraph, evolutionCatalog, interventionCatalog } from '../src/modules/inference/inference-service.js';

const recommendations = { ...interventionCatalog, ...evolutionCatalog };

test('catálogo não pede que participante escolha diretamente uma causa', () => {
  for (const node of graph) assert.doesNotMatch(node.prompt, /qual (causa provável|condição mais)/i, node.id);
});

test('alternativas evitam pistas julgadoras, tecnicismos e afirmações excessivamente compostas', () => {
  const forbidden = /prestígio técnico|moda da solução|tratado como fato|prova suficiente|guardrails|ownership|schema|FinOps|runbooks/i;
  for (const node of graph) for (const option of node.options) {
    assert.doesNotMatch(option.label, forbidden, `${node.id}/${option.id}`);
    assert.ok(option.label.split(/\s+/).length <= 24, `${node.id}/${option.id} possui texto composto demais`);
  }
});

test('diagnóstico separa causa de título do problema', () => {
  for (const [pattern, item] of Object.entries(recommendations)) {
    assert.notEqual(item.cause, item.title, pattern);
    assert.ok(item.cause.length >= 40, pattern);
    assert.match(item.cause, new RegExp(item.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), pattern);
  }
  assert.ok(new Set(Object.values(recommendations).map((item) => item.cause)).size >= Object.keys(recommendations).length * .9);
});

test('fundamento de IA só aparece em intervenções de assistência', () => {
  const assisted = Object.entries(recommendations).filter(([, item]) => item.foundation.source === 'Uso responsável de assistência');
  assert.deepEqual(assisted.map(([pattern]) => pattern).sort(), ['ia-diagnostico-como-fato', 'ia-sombra-sem-politica', 'ia-substitui-entendimento']);
});

test('toda intervenção possui fundamento explícito publicado', () => {
  for (const [pattern, item] of Object.entries(recommendations)) {
    assert.ok(item.foundation.source && item.foundation.principle && item.foundation.why, pattern);
  }
});

test('experimentos possuem mais de uma métrica, horizonte e critério contextual', () => {
  assert.ok(new Set(Object.values(recommendations).map((item) => item.metric)).size >= 10);
  assert.ok(new Set(Object.values(recommendations).map((item) => item.reviewHorizon)).size >= 4);
  assert.ok(new Set(Object.values(recommendations).map((item) => item.successCriterion)).size >= 8);
});

test('palavras incidentais não deslocam o experimento para outra família', () => {
  const recognition = recommendations['incentivo-segue-entrega']!;
  assert.match(recognition.metric, /reconhecimento/);
  assert.match(recognition.successCriterion, /reconhecimento/);

  const portfolio = recommendations['portfolio-sem-feedback']!;
  assert.match(portfolio.metric, /evidência/);
  assert.match(portfolio.successCriterion, /continuidade/);
});

test('padrões apresentados no showcase possuem contrato causal específico', () => {
  const required = [
    'solucao-entregue-pronta', 'correcao-direta-na-producao', 'contorno-acumula-divida',
    'concorrencia-coordenada-manualmente', 'credencial-em-configuracao',
    'seguranca-depende-de-reconhecimento-e-especialista', 'prestigio-tecnico',
    'mudanca-emergencial-reconciliada',
  ];
  for (const pattern of required) assert.equal(recommendations[pattern]?.guidanceStatus, 'explicit', pattern);
});

test('causas de operating model e funding possuem contratos específicos', () => {
  const patterns = ['causa-funding-temporario', 'causa-responsabilidade-encerra-no-aceite', 'causa-capacidade-tomada-pela-proxima-iniciativa', 'causa-resultado-sem-autoridade'];
  for (const pattern of patterns) assert.equal(recommendations[pattern]?.guidanceStatus, 'explicit', pattern);
});

test('contrato já compatível não gera recomendação contraditória de compatibilidade', () => {
  const node = graph.find((candidate) => candidate.id === 'data-contract-change');
  const option = node?.options.find((candidate) => candidate.id === 'compatible-evolution');
  assert.deepEqual(option?.signals.map((signal) => signal.pattern), ['contrato-e-dados-evoluem-compativeis']);
  assert.deepEqual(option?.signals[0]?.details, ['integration-data']);
});

test('rede especialista explicita comportamento, efeito, causa, ação e fundamento', () => {
  assert.equal(causalKnowledgeGraph.size, Object.keys(recommendations).length);
  for (const pattern of Object.keys(recommendations)) {
    const path = causalKnowledgeGraph.pathFor(pattern)!;
    assert.deepEqual(path.edges.map((edge) => edge.relation), ['observed_as', 'explained_by', 'addressed_by', 'grounded_in']);
  }
});
