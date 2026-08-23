const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const unique = `${Date.now()}-${crypto.randomUUID()}`;
const databasePath = path.join(os.tmpdir(), `nevoa-backend-${unique}.db`);
process.env.NEVOA_DB_PATH = databasePath;
process.env.NEVOA_STORE_PATH = path.join(os.tmpdir(), `nevoa-backend-no-legacy-${unique}.json`);
process.env.NEVOA_WEBHOOK_SECRET = 'backend-workflows-secret';

const { createServer } = require('../server');
let server;
let baseUrl;
let sessionCookie;

test.before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const session = await fetch(`${baseUrl}/api/auth/dev-session`, { method: 'POST' });
  assert.equal(session.status, 201);
  sessionCookie = session.headers.get('set-cookie').split(';')[0];
});

test.after(async () => {
  await new Promise(resolve => server.close(resolve));
  for (const suffix of ['', '-shm', '-wal']) fs.rmSync(`${databasePath}${suffix}`, { force: true });
});

function request(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, { ...options, headers: { cookie: sessionCookie, ...(options.headers || {}) } });
}

function jsonRequest(pathname, method, payload) {
  return request(pathname, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
}

function dateAfter(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function signedWebhook(eventId, timestamp, payload) {
  const raw = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', process.env.NEVOA_WEBHOOK_SECRET).update(`${timestamp}.${raw}`).digest('hex');
  return fetch(`${baseUrl}/api/webhooks/sandbox`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-nevoa-event-id': eventId, 'x-nevoa-timestamp': timestamp, 'x-nevoa-signature': signature }, body: raw });
}

test('expõe saúde SQLite, valida datas/duração e nega rota desconhecida por padrão', async () => {
  const health = await fetch(`${baseUrl}/api/health`);
  const healthBody = await health.json();
  assert.equal(health.status, 200);
  assert.equal(healthBody.storage, 'sqlite');
  assert.equal(healthBody.channel, 'LOCAL_SANDBOX');
  assert.equal(healthBody.externalConnectors, false);

  const invalidDate = await jsonRequest('/api/appointments', 'POST', { patient: 'Data Inválida', doctor: 'Dra. Camila Mendes', date: '2026-02-31', start: '10:00', duration: 45 });
  assert.equal(invalidDate.status, 422);
  const invalidDuration = await request(`/api/slots?doctor=Dra.%20Camila%20Mendes&date=${dateAfter(2)}&duration=0`);
  assert.equal(invalidDuration.status, 400);
  const unknown = await request('/api/not-a-real-route');
  assert.equal(unknown.status, 404);

  const timestamp = 'not-a-date';
  const webhook = await signedWebhook('invalid_timestamp_001', timestamp, { type: 'appointment.created', appointment: { externalId: 'invalid-time', patient: 'Teste', doctor: 'Dra. Camila Mendes', date: dateAfter(3), start: '14:00' } });
  assert.equal(webhook.status, 401);
});

test('salva configurações e administra equipe protegendo o último OWNER', async () => {
  const current = await request('/api/settings');
  assert.equal(current.status, 200);
  const updated = await jsonRequest('/api/settings', 'PATCH', { clinicName: 'Clínica Teste', aiName: 'Névoa Teste', greeting: 'Olá, estamos em ambiente de teste.', reminderStart: '08:30', reminderEnd: '19:00' });
  const settings = (await updated.json()).settings;
  assert.equal(updated.status, 200);
  assert.equal(settings.clinicName, 'Clínica Teste');
  const invalidWindow = await jsonRequest('/api/settings', 'PATCH', { reminderStart: '20:00', reminderEnd: '08:00' });
  assert.equal(invalidWindow.status, 422);

  const created = await jsonRequest('/api/team', 'POST', { name: 'Secretária Teste', email: 'secretaria.teste@example.com', role: 'SECRETARY', active: true });
  const user = (await created.json()).user;
  assert.equal(created.status, 201);
  assert.equal(user.role, 'SECRETARY');
  const duplicate = await jsonRequest('/api/team', 'POST', { name: 'Duplicada', email: 'SECRETARIA.TESTE@example.com', role: 'VIEWER', active: true });
  assert.equal(duplicate.status, 409);
  const patched = await jsonRequest(`/api/team/${user.id}`, 'PATCH', { name: 'Secretária Atualizada', role: 'ADMIN' });
  assert.equal((await patched.json()).user.role, 'ADMIN');
  const lastOwner = await jsonRequest('/api/team/user_owner', 'PATCH', { active: false });
  assert.equal(lastOwner.status, 409);
  assert.equal((await lastOwner.json()).error.code, 'LAST_OWNER_REQUIRED');
  const team = await request('/api/team');
  assert.ok((await team.json()).some(item => item.id === user.id));
});

test('cadastra e atualiza profissionais com função e formação', async () => {
  const created = await jsonRequest('/api/professionals', 'POST', {
    name: 'Dra. Marina Duarte',
    role: 'Médica neurologista',
    education: 'Medicina · UFRGS',
    specialty: 'Neurologia',
    registration: 'CRM-RS 12345',
    email: 'marina.duarte@example.com'
  });
  assert.equal(created.status, 201);
  const professional = (await created.json()).professional;
  assert.equal(professional.role, 'Médica neurologista');
  assert.equal(professional.education, 'Medicina · UFRGS');

  const updated = await jsonRequest(`/api/professionals/${professional.id}`, 'PATCH', { education: 'Medicina · UFRGS · Residência em Neurologia' });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).professional.education, 'Medicina · UFRGS · Residência em Neurologia');

  const found = await request('/api/professionals?q=Resid%C3%AAncia');
  assert.ok((await found.json()).items.some(item => item.id === professional.id));
});

test('cria, filtra, anota, assume, resolve e reabre conversa somente no sandbox local', async () => {
  const created = await jsonRequest('/api/conversations', 'POST', { patient: 'Paciente Conversa' });
  const conversation = (await created.json()).conversation;
  assert.equal(created.status, 201);
  assert.equal(conversation.channel, 'LOCAL_SANDBOX');
  assert.equal(conversation.externalDelivery, false);

  const filtered = await request('/api/conversations?q=Paciente%20Conversa&status=OPEN&ownership=mine');
  assert.ok((await filtered.json()).some(item => item.id === conversation.id));
  const note = await jsonRequest(`/api/conversations/${conversation.id}/notes`, 'POST', { content: 'Paciente prefere contato pela manhã.' });
  assert.equal(note.status, 201);
  assert.equal((await note.json()).note.internal, true);
  const release = await jsonRequest(`/api/conversations/${conversation.id}/release`, 'POST', {});
  assert.equal((await release.json()).conversation.humanTakeover, false);
  const sent = await jsonRequest(`/api/conversations/${conversation.id}/messages`, 'POST', { content: 'Mensagem apenas local.' });
  const sentBody = await sent.json();
  assert.equal(sent.status, 201);
  assert.deepEqual(sentBody.delivery, { channel: 'LOCAL_SANDBOX', status: 'STORED_LOCALLY', external: false });
  const takeover = await jsonRequest(`/api/conversations/${conversation.id}/takeover`, 'POST', {});
  assert.equal((await takeover.json()).conversation.humanTakeover, true);
  const resolved = await jsonRequest(`/api/conversations/${conversation.id}/resolve`, 'POST', {});
  assert.equal((await resolved.json()).conversation.status, 'RESOLVED');
  const blockedMessage = await jsonRequest(`/api/conversations/${conversation.id}/messages`, 'POST', { content: 'Não deve enviar.' });
  assert.equal(blockedMessage.status, 409);
  const reopened = await jsonRequest(`/api/conversations/${conversation.id}/reopen`, 'POST', {});
  assert.equal((await reopened.json()).conversation.status, 'OPEN');

  const audit = await request('/api/audit-logs');
  const actions = (await audit.json()).map(item => item.action);
  assert.ok(actions.includes('conversation.note'));
  assert.ok(actions.includes('conversation.message_sent'));
  assert.ok(actions.includes('conversation.resolve'));
});

test('executa automação em consultas elegíveis e registra o histórico', async () => {
  const appointmentDate = dateAfter(2);
  const appointmentResponse = await jsonRequest('/api/appointments', 'POST', { patient: 'Paciente Automação', doctor: 'Dr. Rafael Costa', date: appointmentDate, start: '17:30', duration: 45 });
  assert.equal(appointmentResponse.status, 201);
  const appointment = (await appointmentResponse.json()).appointment;

  const created = await jsonRequest('/api/automation-rules', 'POST', { name: 'Confirmação de teste', active: true, triggerHours: 120, conditionStatus: 'SCHEDULED', actionType: 'REQUEST_CONFIRMATION' });
  const rule = (await created.json()).rule;
  assert.equal(created.status, 201);
  const run = await jsonRequest(`/api/automation-rules/${rule.id}/run`, 'POST', {});
  const runBody = await run.json();
  assert.equal(run.status, 200);
  assert.ok(runBody.matched >= 1);
  assert.ok(runBody.executed >= 1);
  assert.equal(runBody.channel, 'LOCAL_SANDBOX');
  assert.equal(runBody.externalDelivery, false);
  assert.ok(runBody.rule.executionsToday >= 1);

  const conversations = await request('/api/conversations?q=Paciente%20Automa%C3%A7%C3%A3o');
  const linked = (await conversations.json()).find(item => item.appointmentId === appointment.id);
  assert.ok(linked);
  const detail = await request(`/api/conversations/${linked.id}`);
  assert.ok((await detail.json()).messages.some(message => message.direction === 'OUTBOUND'));
  const history = await request('/api/automation-runs');
  assert.ok((await history.json()).some(item => item.ruleId === rule.id && item.result.messagesCreated >= 1));

  const patched = await jsonRequest(`/api/automation-rules/${rule.id}`, 'PATCH', { name: 'Encaminhamento de teste', active: true, triggerHours: 120, conditionStatus: 'SCHEDULED', actionType: 'FLAG_HUMAN' });
  assert.equal((await patched.json()).rule.actionType, 'FLAG_HUMAN');
  const humanRun = await jsonRequest(`/api/automation-rules/${rule.id}/run`, 'POST', {});
  assert.ok((await humanRun.json()).executed >= 1);
  const flaggedAppointment = await request(`/api/appointments/${appointment.id}`);
  assert.equal((await flaggedAppointment.json()).status, 'REQUIRES_HUMAN');
  const removed = await request(`/api/automation-rules/${rule.id}`, { method: 'DELETE' });
  assert.equal((await removed.json()).deleted, true);
});

test('gerencia integração genérica sem simular WhatsApp ou entrega externa', async () => {
  const created = await jsonRequest('/api/integrations', 'POST', { provider: 'GENERIC_WEBHOOK', environment: 'SANDBOX', config: { name: 'Agenda sandbox', endpoint: 'https://example.test/webhook' } });
  const integration = (await created.json()).integration;
  assert.equal(created.status, 201);
  assert.equal(integration.external, false);
  assert.equal(integration.channel, 'LOCAL_SANDBOX');
  const tested = await jsonRequest(`/api/integrations/${integration.id}/test`, 'POST', {});
  const testedBody = await tested.json();
  assert.equal(testedBody.result.ok, true);
  assert.equal(testedBody.result.external, false);
  const synced = await jsonRequest(`/api/integrations/${integration.id}/sync`, 'POST', {});
  const syncedBody = await synced.json();
  assert.equal(syncedBody.result.synced, 0);
  assert.ok(syncedBody.integration.lastSyncAt);
  const patched = await jsonRequest(`/api/integrations/${integration.id}`, 'PATCH', { status: 'DISCONNECTED', config: { name: 'Agenda pausada' } });
  assert.equal((await patched.json()).integration.status, 'DISCONNECTED');
  const persisted = await request('/api/integrations');
  assert.equal((await persisted.json()).find(item => item.id === integration.id).status, 'DISCONNECTED');
  const rejectedWhatsApp = await jsonRequest('/api/integrations', 'POST', { provider: 'WHATSAPP', environment: 'PRODUCTION' });
  assert.equal(rejectedWhatsApp.status, 422);
});

test('calcula relatório real por período e impede conflito em atualização de webhook', async () => {
  const reportDate = dateAfter(4);
  const appointment = await jsonRequest('/api/appointments', 'POST', { patient: 'Paciente Relatório', doctor: 'Dra. Camila Mendes', date: reportDate, start: '09:00', duration: 45 });
  assert.equal(appointment.status, 201);
  const report = await request(`/api/reports?dateFrom=${reportDate}&dateTo=${reportDate}`);
  const reportBody = await report.json();
  assert.equal(report.status, 200);
  assert.equal(reportBody.total, 1);
  assert.equal(reportBody.byStatus.SCHEDULED, 1);
  assert.ok(reportBody.aiResolutionRate === null || typeof reportBody.aiResolutionRate === 'number');
  const completeReport = await request('/api/reports');
  const completeReportBody = await completeReport.json();
  assert.equal(completeReportBody.resolvedConversations, 1);
  assert.equal(completeReportBody.aiResolved, 1);
  assert.equal(completeReportBody.aiResolutionRate, 100);
  const invalidReport = await request('/api/reports?dateFrom=2026-12-31&dateTo=2026-01-01');
  assert.equal(invalidReport.status, 400);

  const timestamp1 = new Date().toISOString();
  const externalId = `external-${unique}`;
  const first = await signedWebhook('backend_event_create_001', timestamp1, { type: 'appointment.created', appointment: { externalId, patient: 'Paciente Externo', doctor: 'Dra. Camila Mendes', date: reportDate, start: '14:00', duration: 45, status: 'scheduled', updatedAt: timestamp1 } });
  assert.equal(first.status, 202);
  const timestamp2 = new Date(Date.now() + 1000).toISOString();
  const conflicting = await signedWebhook('backend_event_update_002', timestamp2, { type: 'appointment.updated', appointment: { externalId, patient: 'Paciente Externo', doctor: 'Dra. Camila Mendes', date: reportDate, start: '09:00', duration: 45, status: 'scheduled', updatedAt: timestamp2 } });
  assert.equal(conflicting.status, 409);
  assert.equal((await conflicting.json()).error.code, 'APPOINTMENT_SLOT_UNAVAILABLE');
});
