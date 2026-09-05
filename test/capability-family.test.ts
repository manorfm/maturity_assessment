import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  capabilityFamilyCatalog,
  ceremonyLearning,
  familyGapFromEvent,
  supportForHypothesis,
} from '../src/modules/inference/domain/capability-family.js';
import { causalKnowledgeGraph } from '../src/modules/inference/inference-service.js';

const vendorName = /JFrog|Nexus|Harbor|ECR|GitHub|GitLab|AWS|Azure|GCP|Ansible|Actions|Vault|Spinnaker/i;

test('cinco packs declaram fatos, hipótese, reforço, prática, família e fundamento', () => {
  assert.deepEqual(capabilityFamilyCatalog.map((pack) => pack.id), [
    'version-promotion',
    'cloud-access-change',
    'incident-reversal',
    'ceremony-with-effect',
    'error-climate-leadership',
  ]);
  for (const pack of capabilityFamilyCatalog) {
    assert.ok(pack.facts.length >= 2, pack.id);
    assert.ok(pack.hypothesis, pack.id);
    assert.ok(pack.reinforces.length >= 2, pack.id);
    assert.ok(pack.practiceTarget, pack.id);
    assert.ok(pack.toolFamilies.length >= 1 || pack.id === 'error-climate-leadership' || pack.id === 'ceremony-with-effect', pack.id);
    assert.ok(pack.foundation.source && pack.foundation.principle, pack.id);
    const published = [pack.label, pack.path, pack.practiceTarget, pack.toolFamilies.join(' '), pack.foundation.source];
    for (const text of published) assert.doesNotMatch(text, vendorName, `${pack.id}: ${text}`);
  }
});

test('duas respostas em ramos distintos aumentam a mesma hipótese', () => {
  const hypothesis = 'caminho-de-versao-sem-origem';
  const oneBranch = supportForHypothesis(hypothesis, [
    { pattern: 'empacotamento-manual', branch: 'delivery', participantId: 'p1' },
  ]);
  const twoBranches = supportForHypothesis(hypothesis, [
    { pattern: 'empacotamento-manual', branch: 'delivery', participantId: 'p1' },
    { pattern: 'fonte-nao-confiavel', branch: 'inception', participantId: 'p2' },
  ]);
  assert.equal(oneBranch.reinforced, false);
  assert.equal(twoBranches.reinforced, true);
  assert.ok(twoBranches.weight > oneBranch.weight);
  assert.deepEqual(twoBranches.branches.sort(), ['delivery', 'inception']);
  assert.ok(causalKnowledgeGraph.pathFor(hypothesis)?.edges.some((edge) => edge.relation === 'reinforces'));
});

test('post-mortem nominal sem mudança no próximo incidente não pontua aprendizado', () => {
  const nominal = ceremonyLearning({
    ritePresent: true,
    nextEquivalentEventChanged: false,
    actionHadOwner: false,
  });
  assert.equal(nominal.scoresLearning, false);
  assert.equal(nominal.pattern, 'postmortem-sem-efeito');

  const learned = ceremonyLearning({
    ritePresent: true,
    nextEquivalentEventChanged: true,
    actionHadOwner: true,
  });
  assert.equal(learned.scoresLearning, true);
  assert.equal(learned.pattern, 'aprendizado-blameless');
});

test('ausência de caminho de artefato no evento de promoção publica a família sem marca', () => {
  const missing = familyGapFromEvent({
    family: 'version-promotion',
    eventOccurred: true,
    pathPresent: false,
  });
  assert.equal(missing?.pattern, 'caminho-de-versao-sem-origem');
  assert.equal(missing?.kind, 'missing-family');
  assert.match(missing?.title ?? '', /versão|artefato|origem/i);
  const published = `${missing?.title} ${missing?.explanation} ${missing?.toolFamilies.join(' ')}`;
  assert.doesNotMatch(published, vendorName);

  assert.equal(familyGapFromEvent({ family: 'version-promotion', eventOccurred: false, pathPresent: false }), undefined);
  assert.equal(familyGapFromEvent({ family: 'version-promotion', eventOccurred: true, pathPresent: true }), undefined);
});
