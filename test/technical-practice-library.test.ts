import assert from 'node:assert/strict';
import { test } from 'node:test';
import { technicalDirectionFor } from '../src/modules/inference/domain/technical-practice-library.js';

const ready = { status: 'ready' as const, reason: 'Mecanismo discriminado.' };
const local = { stage: 'local' as const, label: 'Local', explanation: 'Executada localmente.', evidence: 2 };

test('feedback ferramental recebe prática, técnicas, habilitador e famílias em camadas', () => {
  const direction = technicalDirectionFor({ pattern: 'causa-ferramental-feedback', mechanism: 'tooling', prescription: ready, readiness: local })!;
  assert.equal(direction.library, 'delivery-feedback');
  assert.match(direction.practiceTarget, /feedback/i);
  assert.ok(direction.techniques.some((item) => /testes? de contrato|caminho rápido/i.test(item)));
  assert.match(direction.enablingMechanism, /tempo da decisão/i);
  assert.ok(direction.toolFamilies.includes('integração e build'));
  assert.doesNotMatch(direction.toolFamilies.join(' '), /github|gitlab|jenkins/i);
  assert.ok(direction.foundation.versionOrDate);
  assert.ok(direction.foundation.limitation);
});

test('mesmo sintoma com política de lote não recomenda esteira', () => {
  assert.equal(technicalDirectionFor({ pattern: 'causa-processo-lote', mechanism: 'policy', prescription: ready, readiness: local }), undefined);
});

test('ameaça não reconstruída indica modelagem e não SAST', () => {
  const direction = technicalDirectionFor({ pattern: 'ameaca-so-em-checklist', mechanism: 'process', prescription: ready, readiness: local })!;
  assert.equal(direction.library, 'security-in-flow');
  assert.ok(direction.techniques.some((item) => /modelagem de ameaça/i.test(item)));
  assert.deepEqual(direction.toolFamilies, []);
  assert.match(direction.doesNotSolve, /autorização|acesso/i);
});

test('acesso bloqueado recebe ambiente seguro sem sugerir privilégio irrestrito', () => {
  const direction = technicalDirectionFor({ pattern: 'caminho-conhecido-inacessivel', mechanism: 'access', prescription: ready, readiness: local })!;
  assert.equal(direction.library, 'safe-environment');
  assert.ok(direction.techniques.some((item) => /acesso mínimo|temporário/i.test(item)));
  assert.match(direction.prerequisites.join(' '), /risco/i);
  assert.match(direction.doesNotSolve, /adequação|irrestrito/i);
});

test('ausência nominal, mecanismo incerto ou capacidade não demonstrada suspendem opção técnica', () => {
  assert.equal(technicalDirectionFor({ pattern: 'sem-sast', mechanism: 'tooling', prescription: ready, readiness: local }), undefined);
  assert.equal(technicalDirectionFor({ pattern: 'causa-ferramental-feedback', mechanism: 'undetermined', prescription: { status: 'investigate', reason: 'Falta causa.' }, readiness: local }), undefined);
  assert.equal(technicalDirectionFor({ pattern: 'causa-ferramental-feedback', mechanism: 'tooling', prescription: ready, readiness: { stage: 'not-demonstrated', label: 'Não demonstrada', explanation: '', evidence: 0 } }), undefined);
});

test('cada contrato declara custo, risco, experimento, indicador e critério', () => {
  for (const [pattern, mechanism] of [
    ['causa-ferramental-feedback', 'tooling'],
    ['fonte-nao-confiavel', 'architecture'],
    ['ameaca-so-em-checklist', 'process'],
    ['caminho-conhecido-inacessivel', 'access'],
    ['provisionamento-em-fila', 'platform'],
  ] as const) {
    const direction = technicalDirectionFor({ pattern, mechanism, prescription: ready, readiness: local })!;
    assert.ok(direction.qualitativeCost && direction.risk && direction.smallestExperiment, pattern);
    assert.ok(direction.indicator && direction.successCriterion, pattern);
    assert.ok(direction.prerequisites.length && direction.foundation.source, pattern);
  }
});

test('descoberta colaborativa exige comportamento ou linguagem não reconstruível', () => {
  const direction = technicalDirectionFor({ pattern: 'legado-sem-modelo-recuperavel', mechanism: 'knowledge', prescription: ready, readiness: local })!;
  assert.equal(direction.library, 'domain-discovery');
  assert.ok(direction.techniques.some((item) => /Event Storming/i.test(item)));
  assert.match(direction.doesNotSolve, /acoplamento|autoridade|funding/i);
  assert.equal(technicalDirectionFor({ pattern: 'documentacao-ausente', mechanism: 'knowledge', prescription: ready, readiness: local }), undefined);
});

test('mapa arquitetural trata ownership e impacto, não bloqueio de acesso', () => {
  const direction = technicalDirectionFor({ pattern: 'servico-sem-responsavel', mechanism: 'organization', prescription: ready, readiness: local })!;
  assert.equal(direction.library, 'architecture-mapping');
  assert.ok(direction.techniques.some((item) => /C4|mapa de dependências|catálogo de serviços/i.test(item)));
  assert.notEqual(technicalDirectionFor({ pattern: 'caminho-conhecido-inacessivel', mechanism: 'access', prescription: ready, readiness: local })?.library, 'architecture-mapping');
});

test('caminho homologado só é orientado por inadequação observada na jornada', () => {
  const direction = technicalDirectionFor({ pattern: 'caminho-inadequado-ao-caso', mechanism: 'platform', prescription: ready, readiness: local })!;
  assert.equal(direction.library, 'approved-paths');
  assert.match(direction.prerequisites.join(' '), /consumidor|jornada/i);
  assert.match(direction.doesNotSolve, /obrigar|adoção/i);
  assert.equal(technicalDirectionFor({ pattern: 'ferramenta-nao-homologada', mechanism: 'platform', prescription: ready, readiness: local }), undefined);
});
