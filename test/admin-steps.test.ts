import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import { projectBatchReading } from '../src/modules/projects/domain/admin-board.js';
import { renderTermsPanel } from '../src/modules/projects/admin-view.js';

test('criar projeto liga os quatro passos e não desenha contexto que o domínio não tem', async () => {
  const app = await createApp(createDatabase(':memory:'));
  const page = await app.inject({ method: 'GET', url: '/projects/new' });
  assert.equal(page.statusCode, 200);
  const stepLinks = [...page.body.matchAll(/<a class="admin-step[^"]*" href="[^"]+"[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
  assert.deepEqual(stepLinks.map((link) => link.replace(/<[^>]+>/g, '').trim()), [
    '1Projeto',
    '2Estrutura',
    '3Convites e participação',
    '4Termo de uso',
  ]);
  assert.equal(page.body.includes('hierarchy-row'), true);
  assert.equal(page.body.includes('Adicionar unidade abaixo'), true);
  assert.equal(page.body.includes('Remover'), true);
  assert.equal(/Porte da área|Setor regulado|Estágio da organização|Aceitar e liberar|Li e aceito|Orbital Pagamentos/.test(page.body), false);
  await app.close();
});

test('o painel liga os quatro passos, a amostra do lote e o termo sem aceite gravado', async () => {
  const db = createDatabase(':memory:');
  const app = await createApp(db);
  const created = await app.inject({
    method: 'POST',
    url: '/projects',
    payload: { name: 'Cooperativa Norte', hierarchy: 'Cooperativa/Conta' },
  });
  const manageUrl = created.headers.location!;
  const added = await app.inject({
    method: 'POST',
    url: `${manageUrl}/units`,
    payload: { parentPath: 'Cooperativa/Conta', name: 'Atendimento' },
  });
  assert.equal(added.statusCode, 302);
  const manage = await app.inject({ method: 'GET', url: manageUrl });
  assert.equal([...manage.body.matchAll(/<a class="admin-step[^"]*" href="[^"]+"[^>]*>/g)].length, 4);
  for (const id of ['id="projeto"', 'id="estrutura"', 'id="operacao"', 'id="termo"']) {
    assert.equal(manage.body.includes(id), true, id);
  }
  assert.match(manage.body, /Atendimento/);
  assert.match(manage.body, /Adicionar unidade abaixo/);
  assert.match(manage.body, /Remover/);
  assert.match(manage.body, /Pacto de uso entre Cooperativa Norte/);
  assert.match(manage.body, /Sem uso individual/);
  assert.match(manage.body, /Sem bônus/);
  assert.match(manage.body, /Mínimo de 5 pessoas/);
  assert.match(manage.body, /Sem ranking/);
  assert.match(manage.body, /Divulgação aos respondentes/);
  assert.match(manage.body, /aceite formal ainda não é gravado/);
  assert.doesNotMatch(manage.body, /Aceitar e liberar|Li e aceito|Porte da área|Setor regulado|Estágio da organização/);
  const removed = await app.inject({
    method: 'POST',
    url: `${manageUrl}/units/remove`,
    payload: { path: 'Cooperativa/Conta/Atendimento' },
  });
  assert.equal(removed.statusCode, 302);
  const after = await app.inject({ method: 'GET', url: manageUrl });
  assert.doesNotMatch(after.body, /Atendimento/);
  const unit = db.prepare("SELECT id FROM organization_units WHERE path = 'Cooperativa/Conta'").get() as { id: string };
  const batch = await app.inject({
    method: 'POST',
    url: `${manageUrl}/invitations`,
    payload: { unitId: unit.id, count: '4' },
  });
  assert.equal(batch.statusCode, 200);
  const invites = await app.inject({ method: 'GET', url: manageUrl });
  assert.match(invites.body, /Lembrar lote/);
  assert.match(invites.body, /Revogar links disponíveis/);
  assert.match(invites.body, /Emitido/);
  assert.match(invites.body, /Menos de 5: agregado/);
  assert.match(invites.body, /não envia a mensagem/);
  await app.close();
});

test('lote publica estado, amostra agregada e lembrete sem fingir envio', () => {
  const reading = projectBatchReading({
    status: 'issued',
    quantity: 8,
    claimed: 2,
    completed: 2,
    minimum: 5,
  });
  assert.equal(reading.statusLabel, 'Emitido');
  assert.match(reading.sample, /Menos de 5/);
  assert.match(reading.sample, /agregado/);
  assert.match(reading.remind, /já respondeu, obrigado/);
  assert.match(reading.remind, /não envia/);
  const html = renderTermsPanel('Cooperativa Norte');
  assert.match(html, /Cooperativa Norte/);
  assert.match(html, /aceite formal ainda não é gravado/);
  assert.doesNotMatch(html, /Aceitar e liberar|Li e aceito/);
});
