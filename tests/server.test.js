const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const store = path.join(os.tmpdir(), `nevoa-test-${Date.now()}.db`);
process.env.NEVOA_DB_PATH = store;
process.env.NEVOA_STORE_PATH = path.join(os.tmpdir(), `nevoa-no-legacy-${Date.now()}.json`);
process.env.NEVOA_WEBHOOK_SECRET = 'test-webhook-secret';
const { createServer } = require('../server');
let server; let baseUrl; let sessionCookie;

test.before(async () => {
  server = createServer(); await new Promise(resolve => server.listen(0, resolve)); baseUrl = `http://127.0.0.1:${server.address().port}`;
  const session = await fetch(`${baseUrl}/api/auth/dev-session`, { method: 'POST' });
  assert.equal(session.status, 201); sessionCookie = session.headers.get('set-cookie').split(';')[0];
});
test.after(async () => { await new Promise(resolve => server.close(resolve)); for (const suffix of ['', '-shm', '-wal']) fs.rmSync(`${store}${suffix}`, { force: true }); });
function request(pathname, options = {}) { return fetch(`${baseUrl}${pathname}`, { ...options, headers: { cookie: sessionCookie, ...(options.headers || {}) } }); }

test('protege rotas de domínio sem uma sessão válida', async () => {
  const result = await fetch(`${baseUrl}/api/appointments`);
  assert.equal(result.status, 401); assert.equal((await result.json()).error.code, 'AUTHENTICATION_REQUIRED');
});

test('processa webhook assinado apenas uma vez', async () => {
  const timestamp = new Date().toISOString();
  const payload = JSON.stringify({ type: 'appointment.created', appointment: { externalId: 'external-909', patient: 'Maria Silva', doctor: 'Dra. Camila Mendes', date: '2026-08-26', start: '14:00', duration: 45, status: 'scheduled', updatedAt: timestamp } });
  const signature = crypto.createHmac('sha256', process.env.NEVOA_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest('hex');
  const headers = { 'content-type': 'application/json', 'x-nevoa-event-id': 'event_909000', 'x-nevoa-timestamp': timestamp, 'x-nevoa-signature': signature };
  const first = await fetch(`${baseUrl}/api/webhooks/sandbox`, { method: 'POST', headers, body: payload });
  assert.equal(first.status, 202); assert.equal((await first.json()).result.created, true);
  const duplicated = await fetch(`${baseUrl}/api/webhooks/sandbox`, { method: 'POST', headers, body: payload });
  assert.equal(duplicated.status, 200); assert.equal((await duplicated.json()).duplicate, true);
});

test('cria consulta, impede double booking e respeita idempotência', async () => {
  const payload = { patient: 'Beatriz Lima', doctor: 'Dra. Camila Mendes', date: '2026-08-26', start: '09:00', duration: 45 };
  const headers = { 'content-type': 'application/json', 'idempotency-key': 'create-beatriz' };
  const created = await request('/api/appointments', { method: 'POST', headers, body: JSON.stringify(payload) });
  assert.equal(created.status, 201); const appointment = (await created.json()).appointment;
  const repeated = await request('/api/appointments', { method: 'POST', headers, body: JSON.stringify(payload) });
  assert.equal(repeated.status, 200); assert.equal((await repeated.json()).appointment.id, appointment.id);
  const conflict = await request('/api/appointments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...payload, patient: 'Outra pessoa' }) });
  assert.equal(conflict.status, 409); assert.equal((await conflict.json()).error.code, 'APPOINTMENT_SLOT_UNAVAILABLE');
});

test('remarcação rejeita versão antiga e horário ocupado', async () => {
  const stale = await request('/api/appointments/apt_marcelo/reschedule', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: 99, date: '2026-08-23', start: '09:00' }) });
  assert.equal(stale.status, 409);
  const occupied = await request('/api/appointments/apt_marcelo/reschedule', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: 1, date: '2026-08-23', start: '09:00' }) });
  assert.equal(occupied.status, 409); assert.equal((await occupied.json()).error.code, 'APPOINTMENT_SLOT_UNAVAILABLE');
});

test('edita, confirma, remarca, filtra e cancela uma consulta', async () => {
  const create = await request('/api/appointments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ patient: 'Paciente Fluxo', doctor: 'Dr. Rafael Costa', date: '2026-08-28', start: '10:00', duration: 45 }) });
  const appointment = (await create.json()).appointment; assert.equal(create.status, 201);
  const edit = await request(`/api/appointments/${appointment.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: 1, doctor: appointment.doctor, date: appointment.date, start: '11:00', duration: 60 }) });
  const edited = (await edit.json()).appointment; assert.equal(edit.status, 200); assert.equal(edited.duration, 60);
  const confirmedResponse = await request(`/api/appointments/${appointment.id}/confirm`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: edited.version }) }); const confirmed = (await confirmedResponse.json()).appointment; assert.equal(confirmed.status, 'CONFIRMED');
  const rescheduledResponse = await request(`/api/appointments/${appointment.id}/reschedule`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: confirmed.version, date: '2026-08-29', start: '14:00' }) }); const rescheduled = (await rescheduledResponse.json()).appointment; assert.equal(rescheduled.status, 'RESCHEDULED');
  const filtered = await request('/api/appointments?date=2026-08-29&doctor=Dr.%20Rafael%20Costa'); assert.ok((await filtered.json()).some(item => item.id === appointment.id));
  const cancelledResponse = await request(`/api/appointments/${appointment.id}/cancel`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: rescheduled.version }) }); assert.equal((await cancelledResponse.json()).appointment.status, 'CANCELLED');
  const detail = await request(`/api/appointments/${appointment.id}`); assert.equal((await detail.json()).status, 'CANCELLED');
});

test('mensagem recebida classifica intenção e confirma a consulta vinculada', async () => {
  const result = await request('/api/conversations/conv_marcelo/incoming', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: 'Pode confirmar, vou sim.' }) });
  const data = await result.json(); assert.equal(result.status, 201); assert.equal(data.intent, 'CONFIRM_APPOINTMENT');
  const appointment = await request('/api/appointments'); assert.equal((await appointment.json()).find(item => item.id === 'apt_marcelo').status, 'CONFIRMED');
});

test('expõe a trilha de auditoria apenas para a sessão autorizada', async () => {
  const logs = await request('/api/audit-logs');
  assert.equal(logs.status, 200); assert.ok((await logs.json()).some(log => log.action === 'appointment.create'));
});

test('fornece dados reais para painel, cadastros, pendências e integrações', async () => {
  const [patients, pending, reports, automations, integrations] = await Promise.all([
    request('/api/patients'), request('/api/pending'), request('/api/reports'), request('/api/automation-rules'), request('/api/integrations')
  ]);
  assert.equal(patients.status, 200); assert.ok((await patients.json()).items.length > 0);
  assert.equal(pending.status, 200); assert.ok(Array.isArray((await pending.json()).appointments));
  assert.equal(reports.status, 200); assert.equal(typeof (await reports.json()).total, 'number');
  assert.equal(automations.status, 200); assert.equal((await automations.json()).length, 3);
  assert.equal(integrations.status, 200); assert.equal((await integrations.json())[0].status, 'SANDBOX');
});

test('cadastra, busca, edita e arquiva paciente com persistência', async () => {
  const created = await request('/api/patients', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Carla Nunes', phone: '+5511999999999', email: 'carla@example.com' }) });
  assert.equal(created.status, 201); const patient = (await created.json()).patient;
  const search = await request('/api/patients?q=Carla&page=1&pageSize=5'); assert.equal((await search.json()).items[0].id, patient.id);
  const updated = await request(`/api/patients/${patient.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'Carla Nunes Silva' }) });
  assert.equal(updated.status, 200); assert.equal((await updated.json()).patient.name, 'Carla Nunes Silva');
  const archived = await request(`/api/patients/${patient.id}/archive`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  assert.equal(archived.status, 200); assert.equal((await archived.json()).patient.archived, true);
  const after = await request('/api/patients?q=Carla'); assert.equal((await after.json()).pagination.total, 0);
});
