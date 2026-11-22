import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import { runRealFlowCohort } from '../src/modules/inference/domain/real-flow-cohort.js';

test('A — real-flow cohort manage HTML baseline shows war-room finding', async () => {
  const db = createDatabase(':memory:');
  const { created } = runRealFlowCohort(db, { caseId: 'engineering-practice' });
  const app = await createApp(db);
  const response = await app.inject({
    method: 'GET',
    url: `/projects/${created.publicId}/manage/${created.adminSecret}`,
  });
  await app.close();

  assert.equal(response.statusCode, 200);
  assert.match(String(response.headers['content-type'] ?? ''), /text\/html/);
  assert.match(response.body, /id="report-diagnosis"/);
  assert.match(response.body, /Laudo · primeira página/);
  assert.match(response.body, / Achados<\/h2>/);
  assert.match(response.body, /Diagnóstico da área de tecnologia/);
  assert.match(response.body, /O war room virou o modo de ver e gerir o sistema/);
  assert.ok(
    /data-finding-pattern="war-room-como-gestao"/.test(response.body),
    'expected data-finding-pattern="war-room-como-gestao"',
  );
});

test('B — real-flow cohort manage HTML contrast omits war-room finding', async () => {
  const db = createDatabase(':memory:');
  const { created } = runRealFlowCohort(db, {
    caseId: 'engineering-practice',
    optionOverrides: [{ nodeId: 'team-pressure', optionId: 'system-learning' }],
  });
  const app = await createApp(db);
  const response = await app.inject({
    method: 'GET',
    url: `/projects/${created.publicId}/manage/${created.adminSecret}`,
  });
  await app.close();

  assert.equal(response.statusCode, 200);
  assert.match(String(response.headers['content-type'] ?? ''), /text\/html/);
  assert.match(response.body, /id="report-diagnosis"/);
  assert.match(response.body, /Achados|Laudo/);
  assert.ok(
    !/O war room virou o modo de ver e gerir o sistema/.test(response.body),
    'must not contain war room title',
  );
  assert.ok(
    !/data-finding-pattern="war-room-como-gestao"/.test(response.body),
    'must not contain data-finding-pattern="war-room-como-gestao"',
  );
});
