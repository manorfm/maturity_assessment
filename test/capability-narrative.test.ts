import assert from 'node:assert/strict';
import test from 'node:test';
import { capabilityLeafIds, CapabilityTaxonomy } from '../src/modules/inference/domain/capability-taxonomy.js';
import { investigationFor, preservationFor } from '../src/modules/inference/domain/capability-narrative.js';

test('cada capacidade publicável possui investigação e preservação escritas explicitamente', () => {
  for (const capabilityId of capabilityLeafIds) {
    const label = CapabilityTaxonomy.labelFor(capabilityId);
    const investigation = investigationFor(capabilityId);
    const preservation = preservationFor(capabilityId);
    assert.ok(investigation.uncertainty.length >= 80, capabilityId);
    assert.match(investigation.nextObservation, /últim|recent/i, capabilityId);
    assert.ok(preservation.reading.length >= 60, capabilityId);
    assert.ok(preservation.nextStep.length >= 60, capabilityId);
    assert.notEqual(investigation.uncertainty, `As respostas indicam fragilidade em ${label}, mas ainda não permitem escolher entre capacidade, autonomia, processo ou estrutura como explicação principal.`);
    assert.doesNotMatch(investigation.uncertainty, /As respostas mostram que/i, capabilityId);
    assert.doesNotMatch(investigation.uncertainty, /ainda competem/i, capabilityId);
  }
});

test('integração descreve o que acontece, sem resenha nem lista de hipóteses', () => {
  const investigation = investigationFor('continuous-integration');
  assert.match(investigation.uncertainty, /separad|junta as partes|conflito/i);
  assert.match(investigation.uncertainty, /Ainda não dá para dizer/);
  assert.doesNotMatch(investigation.uncertainty, /As respostas mostram que Mudanças permanecem/i);
});

test('capacidade sem narrativa falha na autoria em vez de gerar frase mecânica', () => {
  assert.throws(() => investigationFor('unknown-capability'), /narrativa/i);
  assert.throws(() => preservationFor('unknown-capability'), /narrativa/i);
});
