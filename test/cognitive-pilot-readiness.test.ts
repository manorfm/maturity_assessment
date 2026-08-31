import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CognitivePilotReadiness } from '../src/modules/inference/domain/cognitive-pilot-readiness.js';

test('oito pessoas em uma unidade elegível liberam piloto cognitivo sem alegar calibração', () => {
  const result = CognitivePilotReadiness.evaluate({
    targetParticipants: 8,
    minimumGroupSize: 5,
    units: [{ id: 'squad-a', invited: 8, completed: 0 }],
  });

  assert.equal(result.status, 'ready_to_collect');
  assert.equal(result.supportedScope, 'single-unit');
  assert.equal(result.calibrationReady, false);
  assert.match(result.summary, /uma unidade/i);
});

test('divisão quatro por quatro não promete comparação entre squads', () => {
  const result = CognitivePilotReadiness.evaluate({
    targetParticipants: 8,
    minimumGroupSize: 5,
    units: [
      { id: 'squad-a', invited: 4, completed: 0 },
      { id: 'squad-b', invited: 4, completed: 0 },
    ],
  });

  assert.equal(result.status, 'unsafe_allocation');
  assert.equal(result.supportedScope, 'none');
  assert.ok(result.blockers.some((item) => /5 participantes por unidade/i.test(item)));
});

test('comparação local exige duas unidades acima do limiar, não apenas oito respostas globais', () => {
  const result = CognitivePilotReadiness.evaluate({
    targetParticipants: 10,
    minimumGroupSize: 5,
    units: [
      { id: 'squad-a', invited: 5, completed: 5 },
      { id: 'squad-b', invited: 5, completed: 5 },
    ],
  });

  assert.equal(result.status, 'collecting_complete');
  assert.equal(result.supportedScope, 'cross-unit');
  assert.equal(result.completedParticipants, 10);
});
