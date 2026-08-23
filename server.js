const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createDatabaseStore } = require('./database');

const ROOT = __dirname;
const DB_PATH = process.env.NEVOA_DB_PATH || path.join(ROOT, 'data', 'nevoa.db');
const LEGACY_STORE_PATH = process.env.NEVOA_STORE_PATH || path.join(ROOT, 'data', 'store.json');
const TENANT_ID = 'tenant_aurora';
const MAX_BODY_BYTES = 100_000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const PRINCIPAL_UNIT_ID = `unit_principal_${TENANT_ID}`;
const CAMILA_PROFESSIONAL_ID = `professional_camila_${TENANT_ID}`;
const RAFAEL_PROFESSIONAL_ID = `professional_rafael_${TENANT_ID}`;
const ROLE_PERMISSIONS = {
  OWNER: ['*'],
  ADMIN: ['appointment.*', 'patient.*', 'professional.*', 'unit.*', 'conversation.*', 'automation.*', 'audit.read', 'integration.*', 'settings.*', 'team.*'],
  SECRETARY: ['appointment.read', 'appointment.create', 'appointment.update', 'patient.*', 'professional.read', 'unit.read', 'conversation.read', 'conversation.create', 'conversation.send', 'conversation.takeover', 'conversation.update', 'conversation.note'],
  VIEWER: ['appointment.read', 'patient.read', 'professional.read', 'unit.read', 'conversation.read']
};
const USER_ROLES = new Set(Object.keys(ROLE_PERMISSIONS));
const APPOINTMENT_STATUSES = new Set(['SCHEDULED', 'CONFIRMED', 'AWAITING_PATIENT_RESPONSE', 'RESCHEDULE_REQUESTED', 'CANCELLATION_REQUESTED', 'REQUIRES_HUMAN', 'RESCHEDULED', 'CANCELLED', 'COMPLETED']);
const AUTOMATION_ACTIONS = new Set(['SEND_REMINDER', 'SEND_CONFIRMATION_REQUEST', 'REQUEST_CONFIRMATION', 'FLAG_HUMAN']);
const LOCAL_CHANNEL = 'LOCAL_SANDBOX';
const WHATSAPP_CHANNEL = 'WHATSAPP_CLOUD_API';
const WHATSAPP_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v25.0';

const initialStore = {
  tenants: [{ id: TENANT_ID, name: 'Clínica Aurora', status: 'ACTIVE', timezone: 'America/Sao_Paulo' }],
  users: [{ id: 'user_owner', tenantId: TENANT_ID, name: 'Leonan', email: 'owner@clinica-aurora.local', role: 'OWNER', active: true }],
  sessions: {},
  integrations: [{ id: 'integration_sandbox', tenantId: TENANT_ID, provider: 'GENERIC_WEBHOOK', environment: 'SANDBOX', status: 'SANDBOX', lastSyncAt: null }],
  webhookEvents: [],
  patients: [],
  units: [{ id: PRINCIPAL_UNIT_ID, tenantId: TENANT_ID, name: 'Principal', address: null, phone: null, active: true, createdAt: '2026-08-23T00:00:00.000Z', updatedAt: '2026-08-23T00:00:00.000Z' }],
  professionals: [
    { id: CAMILA_PROFESSIONAL_ID, tenantId: TENANT_ID, name: 'Dra. Camila Mendes', role: 'Médica', education: 'Medicina', specialty: 'Clínica geral', registration: null, phone: null, email: null, active: true, createdAt: '2026-08-23T00:00:00.000Z', updatedAt: '2026-08-23T00:00:00.000Z' },
    { id: RAFAEL_PROFESSIONAL_ID, tenantId: TENANT_ID, name: 'Dr. Rafael Costa', role: 'Médico', education: 'Medicina', specialty: 'Clínica geral', registration: null, phone: null, email: null, active: true, createdAt: '2026-08-23T00:00:00.000Z', updatedAt: '2026-08-23T00:00:00.000Z' }
  ],
  settings: [{ tenantId: TENANT_ID, clinicName: 'Clínica Aurora', phone: '', timezone: 'America/Sao_Paulo', aiName: 'Névoa', greeting: 'Olá! Como posso ajudar?', reminderStart: '08:00', reminderEnd: '20:00' }],
  appointments: [
    { id: 'apt_ana', tenantId: TENANT_ID, patient: 'Ana Souza', doctor: 'Dra. Camila Mendes', professionalId: CAMILA_PROFESSIONAL_ID, unitId: PRINCIPAL_UNIT_ID, date: '2026-08-23', start: '09:00', duration: 60, status: 'CONFIRMED', version: 1 },
    { id: 'apt_pedro', tenantId: TENANT_ID, patient: 'Pedro Lima', doctor: 'Dr. Rafael Costa', professionalId: RAFAEL_PROFESSIONAL_ID, unitId: PRINCIPAL_UNIT_ID, date: '2026-08-23', start: '10:30', duration: 45, status: 'AWAITING_PATIENT_RESPONSE', version: 1 },
    { id: 'apt_julia', tenantId: TENANT_ID, patient: 'Júlia Martins', doctor: 'Dra. Camila Mendes', professionalId: CAMILA_PROFESSIONAL_ID, unitId: PRINCIPAL_UNIT_ID, date: '2026-08-23', start: '11:15', duration: 45, status: 'CONFIRMED', version: 1 },
    { id: 'apt_marcelo', tenantId: TENANT_ID, patient: 'Marcelo Ribeiro', doctor: 'Dra. Camila Mendes', professionalId: CAMILA_PROFESSIONAL_ID, unitId: PRINCIPAL_UNIT_ID, date: '2026-08-24', start: '14:00', duration: 45, status: 'RESCHEDULE_REQUESTED', version: 1 }
  ],
  conversations: [
    { id: 'conv_marcelo', tenantId: TENANT_ID, patient: 'Marcelo Ribeiro', appointmentId: 'apt_marcelo', channel: 'WHATSAPP', status: 'OPEN', humanTakeover: false, updatedAt: '2026-08-23T13:42:00.000Z', messages: [
      { id: 'msg_1', direction: 'OUTBOUND', sender: 'AI', content: 'Olá, Marcelo! Vi que você tem uma consulta com a Dra. Camila amanhã às 14h. Posso confirmar sua presença?', createdAt: '2026-08-23T13:24:00.000Z' },
      { id: 'msg_2', direction: 'INBOUND', sender: 'PATIENT', content: 'Oi! Amanhã não consigo. Tem quinta depois das 14?', createdAt: '2026-08-23T13:28:00.000Z' },
      { id: 'msg_3', direction: 'OUTBOUND', sender: 'AI', content: 'Tenho estes horários disponíveis na quinta-feira: 14:30, 16:00 ou 17:30.', createdAt: '2026-08-23T13:29:00.000Z' },
      { id: 'msg_4', direction: 'INBOUND', sender: 'PATIENT', content: 'Pode ser às 16h, por favor?', createdAt: '2026-08-23T13:42:00.000Z' }
    ] },
    { id: 'conv_helena', tenantId: TENANT_ID, patient: 'Helena Araújo', channel: 'WHATSAPP', status: 'OPEN', humanTakeover: true, updatedAt: '2026-08-23T13:17:00.000Z', messages: [] },
    { id: 'conv_vinicius', tenantId: TENANT_ID, patient: 'Vinícius Santos', channel: 'WHATSAPP', status: 'RESOLVED', humanTakeover: false, updatedAt: '2026-08-23T12:58:00.000Z', messages: [] }
  ],
  automationRules: [
    { id: 'rule_confirmation', tenantId: TENANT_ID, name: 'Confirmação 24 horas antes', active: true, executionsToday: 0, triggerHours: 24, conditionStatus: 'SCHEDULED', actionType: 'SEND_CONFIRMATION_REQUEST' },
    { id: 'rule_reschedule', tenantId: TENANT_ID, name: 'Encaminhar pedidos de remarcação', active: true, executionsToday: 0, triggerHours: 24, conditionStatus: 'RESCHEDULE_REQUESTED', actionType: 'FLAG_HUMAN' },
    { id: 'rule_final_reminder', tenantId: TENANT_ID, name: 'Lembrete final', active: true, executionsToday: 0, triggerHours: 3, conditionStatus: 'SCHEDULED', actionType: 'SEND_REMINDER' }
  ],
  auditLogs: [],
  idempotency: {}
};

let databaseStore;
function ensureStore() {
  if (databaseStore) return;
  let seed = initialStore;
  if (fs.existsSync(LEGACY_STORE_PATH)) {
    try { seed = JSON.parse(fs.readFileSync(LEGACY_STORE_PATH, 'utf8')); }
    catch (caught) { console.error('Não foi possível importar o armazenamento legado:', caught.message); }
  }
  migrateStore(seed);
  databaseStore = createDatabaseStore(DB_PATH, seed);
}
function migrateStore(store) {
  let changed = false;
  if (!Array.isArray(store.tenants)) { store.tenants = initialStore.tenants; changed = true; }
  if (!Array.isArray(store.users)) { store.users = initialStore.users; changed = true; }
  if (!store.sessions || typeof store.sessions !== 'object') { store.sessions = {}; changed = true; }
  if (!Array.isArray(store.integrations)) { store.integrations = initialStore.integrations; changed = true; }
  store.integrations.forEach(integration => { if (integration.provider === 'GENERIC_WEBHOOK' && integration.environment === 'SANDBOX' && !['SANDBOX', 'DISCONNECTED'].includes(integration.status)) { integration.status = 'SANDBOX'; changed = true; } });
  for (const conversation of store.conversations || []) {
    if (conversation.channel === 'WHATSAPP') { conversation.channel = LOCAL_CHANNEL; changed = true; }
  }
  if (!Array.isArray(store.webhookEvents)) { store.webhookEvents = []; changed = true; }
  if (!Array.isArray(store.patients)) { store.patients = []; changed = true; }
  if (!Array.isArray(store.units)) { store.units = initialStore.units.map(item => ({ ...item })); changed = true; }
  if (!Array.isArray(store.professionals)) { store.professionals = initialStore.professionals.map(item => ({ ...item })); changed = true; }
  for (const appointment of store.appointments || []) {
    if (appointment.professionalId === undefined) {
      appointment.professionalId = store.professionals.find(item => item.tenantId === appointment.tenantId && item.name.toLocaleLowerCase('pt-BR') === String(appointment.doctor || '').toLocaleLowerCase('pt-BR'))?.id || null;
      changed = true;
    }
    if (appointment.unitId === undefined) {
      appointment.unitId = store.units.find(item => item.tenantId === appointment.tenantId && item.active)?.id || null;
      changed = true;
    }
  }
  if (!Array.isArray(store.settings)) { store.settings = initialStore.settings; changed = true; }
  if (!Array.isArray(store.auditLogs)) { store.auditLogs = []; changed = true; }
  if (!store.idempotency || typeof store.idempotency !== 'object') { store.idempotency = {}; changed = true; }
  return changed;
}
function readStore() { ensureStore(); const store = databaseStore.read(); if (migrateStore(store)) databaseStore.write(store); return store; }
function writeStore(store) { ensureStore(); databaseStore.write(store); }
function id(prefix) { return `${prefix}_${crypto.randomUUID()}`; }
function now() { return new Date().toISOString(); }
function dateKey(date = new Date()) { return date.toISOString().slice(0, 10); }
function minutes(value) { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; }
function validTime(value) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function error(code, message, status = 400) { return { status, body: { error: { code, message, correlation_id: id('corr') } } }; }
function response(res, status, payload) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(payload)); }
function textResponse(res, status, value) { res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }); res.end(String(value)); }
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(item => item.trim().split('=').map(decodeURIComponent)).filter(item => item.length === 2)); }
function safeSecretEquals(left, right) {
  const first = Buffer.from(String(left || '')); const second = Buffer.from(String(right || ''));
  return first.length === second.length && first.length > 0 && crypto.timingSafeEqual(first, second);
}
function sessionCookie(sessionId) { return `nevoa_session=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`; }
function actorFromRequest(req, store) {
  const sessionId = cookies(req).nevoa_session;
  const session = sessionId && store.sessions[sessionId];
  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;
  const user = store.users.find(item => item.id === session.userId && item.active);
  return user ? { id: user.id, tenantId: user.tenantId, role: user.role, name: user.name } : null;
}
function isAllowed(actor, required) {
  if (!required) return true;
  const permissions = ROLE_PERMISSIONS[actor.role] || [];
  return permissions.some(permission => permission === '*' || permission === required || (permission.endsWith('.*') && required.startsWith(permission.slice(0, -1))));
}
function permissionFor(method, pathname) {
  if (method === 'GET' && pathname === '/api/auth/me') return null;
  if (method === 'GET' && ['/api/dashboard', '/api/appointments', '/api/slots'].includes(pathname)) return 'appointment.read';
  if (method === 'GET' && ['/api/patients', '/api/pending', '/api/reports'].includes(pathname)) return 'appointment.read';
  if (method === 'GET' && /^\/api\/professionals(?:\/[^/]+)?$/.test(pathname)) return 'professional.read';
  if (method === 'POST' && pathname === '/api/professionals') return 'professional.manage';
  if (method === 'PATCH' && /^\/api\/professionals\/[^/]+$/.test(pathname)) return 'professional.manage';
  if (method === 'POST' && /^\/api\/professionals\/[^/]+\/archive$/.test(pathname)) return 'professional.manage';
  if (method === 'GET' && /^\/api\/units(?:\/[^/]+)?$/.test(pathname)) return 'unit.read';
  if (method === 'POST' && pathname === '/api/units') return 'unit.manage';
  if (method === 'PATCH' && /^\/api\/units\/[^/]+$/.test(pathname)) return 'unit.manage';
  if (method === 'POST' && /^\/api\/units\/[^/]+\/archive$/.test(pathname)) return 'unit.manage';
  if (method === 'GET' && /^\/api\/patients\/[^/]+$/.test(pathname)) return 'patient.read';
  if (method === 'POST' && pathname === '/api/patients') return 'patient.create';
  if (method === 'PATCH' && /^\/api\/patients\/[^/]+$/.test(pathname)) return 'patient.update';
  if (method === 'POST' && /^\/api\/patients\/[^/]+\/archive$/.test(pathname)) return 'patient.archive';
  if (method === 'GET' && ['/api/automation-rules', '/api/automation-runs'].includes(pathname)) return 'automation.manage';
  if (method === 'GET' && /^\/api\/automation-rules\/[^/]+$/.test(pathname)) return 'automation.manage';
  if (method === 'POST' && pathname === '/api/automation-rules') return 'automation.manage';
  if (['PATCH', 'DELETE'].includes(method) && /^\/api\/automation-rules\/[^/]+$/.test(pathname)) return 'automation.manage';
  if (method === 'POST' && /^\/api\/automation-rules\/[^/]+\/run$/.test(pathname)) return 'automation.manage';
  if (method === 'GET' && pathname === '/api/integrations') return 'integration.read';
  if (method === 'POST' && pathname === '/api/integrations') return 'integration.manage';
  if (method === 'PATCH' && /^\/api\/integrations\/[^/]+$/.test(pathname)) return 'integration.manage';
  if (method === 'POST' && /^\/api\/integrations\/[^/]+\/(test|sync)$/.test(pathname)) return 'integration.manage';
  if (method === 'GET' && pathname === '/api/settings') return 'settings.read';
  if (method === 'PATCH' && pathname === '/api/settings') return 'settings.update';
  if (method === 'GET' && pathname === '/api/team') return 'team.read';
  if (method === 'POST' && pathname === '/api/team') return 'team.create';
  if (method === 'PATCH' && /^\/api\/team\/[^/]+$/.test(pathname)) return 'team.update';
  if (method === 'POST' && pathname === '/api/appointments') return 'appointment.create';
  if (method === 'GET' && /^\/api\/appointments\/[^/]+$/.test(pathname)) return 'appointment.read';
  if (method === 'PATCH' && /^\/api\/appointments\/[^/]+$/.test(pathname)) return 'appointment.update';
  if (method === 'POST' && /^\/api\/appointments\/[^/]+\/(confirm|reschedule|cancel)$/.test(pathname)) return 'appointment.update';
  if (method === 'GET' && /^\/api\/conversations(?:\/[^/]+)?$/.test(pathname)) return 'conversation.read';
  if (method === 'POST' && pathname === '/api/conversations') return 'conversation.create';
  if (method === 'POST' && /^\/api\/conversations\/[^/]+\/(messages|incoming)$/.test(pathname)) return 'conversation.send';
  if (method === 'POST' && /^\/api\/conversations\/[^/]+\/(takeover|release)$/.test(pathname)) return 'conversation.takeover';
  if (method === 'POST' && /^\/api\/conversations\/[^/]+\/(resolve|reopen)$/.test(pathname)) return 'conversation.update';
  if (method === 'POST' && /^\/api\/conversations\/[^/]+\/notes$/.test(pathname)) return 'conversation.note';
  if (method === 'GET' && pathname === '/api/audit-logs') return 'audit.read';
  return false;
}
function isLocalRequest(req) { return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress); }
function audit(store, action, subjectId, before, after, reason = 'user action') {
  const entry = { id: id('audit'), tenantId: TENANT_ID, action, subjectId, before, after, reason, correlationId: id('corr'), at: now() };
  store.auditLogs.push(entry);
  return entry;
}
function tenant(req) {
  const requested = req.headers['x-tenant-id'];
  return !requested || requested === TENANT_ID ? TENANT_ID : null;
}
function overlaps(appointments, candidate, ignoredId) {
  const start = minutes(candidate.start); const end = start + candidate.duration;
  return appointments.some(item => {
    const sameProfessional = candidate.professionalId && item.professionalId ? item.professionalId === candidate.professionalId : item.doctor.toLocaleLowerCase('pt-BR') === candidate.doctor.toLocaleLowerCase('pt-BR');
    return item.id !== ignoredId && item.tenantId === candidate.tenantId && sameProfessional && item.date === candidate.date && !['CANCELLED', 'COMPLETED'].includes(item.status) && start < minutes(item.start) + item.duration && end > minutes(item.start);
  });
}
function professionalByReference(store, tenantId, professionalId, doctor, activeOnly = true) {
  const professional = professionalId
    ? store.professionals.find(item => item.id === professionalId && item.tenantId === tenantId)
    : store.professionals.find(item => item.tenantId === tenantId && item.name.toLocaleLowerCase('pt-BR') === String(doctor || '').trim().toLocaleLowerCase('pt-BR'));
  return professional && (!activeOnly || professional.active) ? professional : null;
}
function defaultUnit(store, tenantId) {
  return store.units.find(item => item.tenantId === tenantId && item.active && item.name.toLocaleLowerCase('pt-BR') === 'principal') || store.units.find(item => item.tenantId === tenantId && item.active) || null;
}
function appointmentStructure(store, tenantId, input, current = null) {
  const professionalIdProvided = Object.prototype.hasOwnProperty.call(input, 'professionalId');
  const doctorProvided = Object.prototype.hasOwnProperty.call(input, 'doctor');
  const requestedProfessionalId = professionalIdProvided ? input.professionalId : (doctorProvided ? undefined : current?.professionalId);
  const requestedDoctor = professionalIdProvided ? null : (doctorProvided ? input.doctor : current?.doctor);
  if (requestedProfessionalId !== undefined && requestedProfessionalId !== null && typeof requestedProfessionalId !== 'string') throw error('VALIDATION_ERROR', 'Profissional inválido.', 422);
  const professional = professionalByReference(store, tenantId, requestedProfessionalId, requestedDoctor);
  if (!professional) throw error('PROFESSIONAL_NOT_AVAILABLE', 'Profissional não encontrado ou inativo.', 422);
  const unitIdProvided = Object.prototype.hasOwnProperty.call(input, 'unitId');
  const requestedUnitId = unitIdProvided ? input.unitId : (current?.unitId ?? defaultUnit(store, tenantId)?.id ?? null);
  if (requestedUnitId !== null && typeof requestedUnitId !== 'string') throw error('VALIDATION_ERROR', 'Unidade inválida.', 422);
  const unit = requestedUnitId === null ? null : store.units.find(item => item.id === requestedUnitId && item.tenantId === tenantId && item.active);
  if (requestedUnitId && !unit) throw error('UNIT_NOT_AVAILABLE', 'Unidade não encontrada ou inativa.', 422);
  return { professional, unit, professionalId: professional.id, unitId: unit?.id || null, doctor: professional.name };
}
function appointmentView(store, appointment) {
  const professional = appointment.professionalId ? store.professionals.find(item => item.id === appointment.professionalId && item.tenantId === appointment.tenantId) : null;
  const unit = appointment.unitId ? store.units.find(item => item.id === appointment.unitId && item.tenantId === appointment.tenantId) : null;
  return {
    ...appointment,
    doctor: professional?.name || appointment.doctor,
    professional: professional ? { id: professional.id, name: professional.name, role: professional.role || null, education: professional.education || null, specialty: professional.specialty, active: professional.active } : null,
    unit: unit ? { id: unit.id, name: unit.name, active: unit.active } : null
  };
}
function availableSlots(store, professionalReference, date, duration, tenantId = TENANT_ID) {
  const professional = professionalByReference(store, tenantId, professionalReference, professionalReference) || { id: null, name: professionalReference };
  const candidates = ['09:00', '10:00', '11:00', '14:00', '14:30', '15:00', '16:00', '17:00', '17:30'];
  return candidates.filter(start => !overlaps(store.appointments, { tenantId, professionalId: professional.id, doctor: professional.name, date, start, duration }, null));
}
function validateAppointment(input) {
  if (!input || typeof input !== 'object') return 'Dados de consulta inválidos.';
  if (typeof input.patient !== 'string' || input.patient.trim().length < 2 || input.patient.length > 120) return 'Informe o nome do paciente.';
  if (typeof input.doctor !== 'string' || input.doctor.trim().length < 2 || input.doctor.length > 120 || typeof input.professionalId !== 'string') return 'Profissional não disponível.';
  if (input.unitId !== null && input.unitId !== undefined && typeof input.unitId !== 'string') return 'Unidade inválida.';
  if (!validDate(input.date) || !validTime(input.start)) return 'Data ou horário inválido.';
  if (!Number.isInteger(input.duration) || input.duration < 15 || input.duration > 180) return 'Duração inválida.';
  return null;
}
function validateProfessional(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Dados do profissional inválidos.';
  const fields = ['name', 'role', 'education', 'specialty', 'registration', 'phone', 'email', 'active'];
  if (Object.keys(input).some(key => !fields.includes(key))) return 'O profissional contém campos não suportados.';
  if (!partial || input.name !== undefined) if (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.trim().length > 120) return 'Nome do profissional inválido.';
  const labels = { role: 'Função', education: 'Formação', specialty: 'Especialidade', registration: 'Registro' };
  for (const key of ['role', 'education', 'specialty', 'registration']) if (input[key] !== undefined && input[key] !== null && (typeof input[key] !== 'string' || input[key].trim().length > 160)) return `${labels[key]} inválida.`;
  if (input.phone !== undefined && input.phone !== null && input.phone !== '' && !/^\+?[1-9]\d{7,14}$/.test(String(input.phone).replace(/\s|\(|\)|-/g, ''))) return 'Telefone do profissional inválido.';
  if (input.email !== undefined && input.email !== null && input.email !== '' && (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254)) return 'E-mail do profissional inválido.';
  if (input.active !== undefined && typeof input.active !== 'boolean') return 'Estado do profissional inválido.';
  return null;
}
function validateUnit(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Dados da unidade inválidos.';
  const fields = ['name', 'address', 'phone', 'active'];
  if (Object.keys(input).some(key => !fields.includes(key))) return 'A unidade contém campos não suportados.';
  if (!partial || input.name !== undefined) if (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.trim().length > 120) return 'Nome da unidade inválido.';
  if (input.address !== undefined && input.address !== null && (typeof input.address !== 'string' || input.address.trim().length > 300)) return 'Endereço da unidade inválido.';
  if (input.phone !== undefined && input.phone !== null && input.phone !== '' && !/^\+?[1-9]\d{7,14}$/.test(String(input.phone).replace(/\s|\(|\)|-/g, ''))) return 'Telefone da unidade inválido.';
  if (input.active !== undefined && typeof input.active !== 'boolean') return 'Estado da unidade inválido.';
  return null;
}
function paginationFor(url) {
  const page = Number(url.searchParams.get('page') || 1); const pageSize = Number(url.searchParams.get('pageSize') || 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) return null;
  return { page, pageSize };
}
function paginated(items, page, pageSize) {
  return { items: items.slice((page - 1) * pageSize, page * pageSize), pagination: { page, pageSize, total: items.length, pages: Math.max(1, Math.ceil(items.length / pageSize)) } };
}
function validatePatient(input, partial = false) {
  if (!input || typeof input !== 'object') return 'Dados do paciente inválidos.';
  if (!partial || input.name !== undefined) if (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.trim().length > 120) return 'Informe um nome válido.';
  if (input.phone !== undefined && input.phone !== '' && !/^\+?[1-9]\d{7,14}$/.test(String(input.phone).replace(/\s|\(|\)|-/g, ''))) return 'Informe o telefone no formato internacional.';
  if (input.email !== undefined && input.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return 'Informe um e-mail válido.';
  return null;
}
function validTimezone(value) { try { new Intl.DateTimeFormat('pt-BR', { timeZone: value }).format(); return true; } catch { return false; } }
function validateSettings(input, current) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Configurações inválidas.';
  const allowed = new Set(['clinicName', 'phone', 'timezone', 'aiName', 'greeting', 'reminderStart', 'reminderEnd']);
  if (!Object.keys(input).length || Object.keys(input).some(key => !allowed.has(key))) return 'Informe apenas configurações suportadas.';
  const next = { ...current, ...input };
  if (typeof next.clinicName !== 'string' || next.clinicName.trim().length < 2 || next.clinicName.trim().length > 120) return 'Nome da clínica inválido.';
  if (next.phone !== null && (typeof next.phone !== 'string' || next.phone.length > 30)) return 'Telefone da clínica inválido.';
  if (!validTimezone(next.timezone)) return 'Fuso horário inválido.';
  if (typeof next.aiName !== 'string' || next.aiName.trim().length < 2 || next.aiName.trim().length > 60) return 'Nome da assistente inválido.';
  if (typeof next.greeting !== 'string' || !next.greeting.trim() || next.greeting.length > 500) return 'Saudação inválida.';
  if (!validTime(next.reminderStart) || !validTime(next.reminderEnd) || minutes(next.reminderStart) >= minutes(next.reminderEnd)) return 'Janela de lembretes inválida.';
  return null;
}
function validateTeamMember(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Dados da equipe inválidos.';
  if (Object.keys(input).some(key => !['name', 'email', 'role', 'active'].includes(key))) return 'Os dados da equipe contêm campos não suportados.';
  if (!partial || input.name !== undefined) if (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.trim().length > 120) return 'Nome inválido.';
  if (!partial || input.email !== undefined) if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254) return 'E-mail inválido.';
  if (!partial || input.role !== undefined) if (!USER_ROLES.has(input.role)) return 'Função inválida.';
  if (input.active !== undefined && typeof input.active !== 'boolean') return 'Estado do usuário inválido.';
  return null;
}
function validateAutomationRule(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Dados da automação inválidos.';
  if (Object.keys(input).some(key => !['name', 'active', 'triggerHours', 'conditionStatus', 'actionType'].includes(key))) return 'A automação contém campos não suportados.';
  if (!partial || input.name !== undefined) if (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.trim().length > 120) return 'Nome da automação inválido.';
  if (input.active !== undefined && typeof input.active !== 'boolean') return 'Estado da automação inválido.';
  if (!partial || input.triggerHours !== undefined) if (!Number.isInteger(input.triggerHours) || input.triggerHours < 0 || input.triggerHours > 720) return 'Antecedência da automação inválida.';
  if (!partial || input.conditionStatus !== undefined) if (!APPOINTMENT_STATUSES.has(input.conditionStatus)) return 'Condição da automação inválida.';
  if (!partial || input.actionType !== undefined) if (!AUTOMATION_ACTIONS.has(input.actionType)) return 'Ação da automação inválida.';
  return null;
}
function validateIntegration(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return 'Dados da integração inválidos.';
  if (Object.keys(input).some(key => !['provider', 'environment', 'status', 'config'].includes(key))) return 'A integração contém campos não suportados.';
  if (!partial || input.provider !== undefined) if (input.provider !== 'GENERIC_WEBHOOK') return 'Somente GENERIC_WEBHOOK está disponível neste sandbox.';
  if (!partial || input.environment !== undefined) if (input.environment !== 'SANDBOX') return 'Somente o ambiente SANDBOX está disponível.';
  if (input.status !== undefined && !['SANDBOX', 'DISCONNECTED'].includes(input.status)) return 'Estado da integração inválido.';
  if (input.config !== undefined) {
    if (!input.config || typeof input.config !== 'object' || Array.isArray(input.config)) return 'Configuração da integração inválida.';
    if (Object.keys(input.config).some(key => !['name', 'endpoint'].includes(key))) return 'A configuração contém campos não suportados.';
    if (input.config.name !== undefined && (typeof input.config.name !== 'string' || !input.config.name.trim() || input.config.name.length > 120)) return 'Nome da integração inválido.';
    if (input.config.endpoint !== undefined && input.config.endpoint !== '') { try { const target = new URL(input.config.endpoint); if (!['http:', 'https:'].includes(target.protocol)) return 'Endpoint da integração inválido.'; } catch { return 'Endpoint da integração inválido.'; } }
  }
  return null;
}
function localConversationView(conversation, includeMessages = false) {
  const { messages, ...summary } = conversation;
  const externalDelivery = conversation.channel === WHATSAPP_CHANNEL;
  const view = { ...summary, channel: conversation.channel || LOCAL_CHANNEL, externalDelivery };
  if (includeMessages) view.messages = messages;
  else view.lastMessage = messages.at(-1)?.content || 'Sem mensagens';
  return view;
}
function nextAvailability(store, appointment) {
  const start = new Date();
  for (let offset = 1; offset <= 30; offset += 1) {
    const candidate = new Date(start); candidate.setUTCDate(candidate.getUTCDate() + offset); const date = dateKey(candidate);
    const slots = availableSlots(store, appointment.professionalId || appointment.doctor, date, appointment.duration, appointment.tenantId);
    if (slots.length) return { date, slots };
  }
  return null;
}
async function body(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY_BYTES) throw error('PAYLOAD_TOO_LARGE', 'Corpo da requisição excede o limite.', 413); chunks.push(chunk); }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw error('INVALID_JSON', 'JSON inválido.'); }
}
async function rawBody(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY_BYTES) throw error('PAYLOAD_TOO_LARGE', 'Corpo da requisição excede o limite.', 413); chunks.push(chunk); }
  return Buffer.concat(chunks);
}
function webhookSignatureIsValid(raw, signature, timestamp) {
  const secret = process.env.NEVOA_WEBHOOK_SECRET;
  const parsedTimestamp = Date.parse(timestamp);
  if (!secret || !signature || !timestamp || !Number.isFinite(parsedTimestamp) || Math.abs(Date.now() - parsedTimestamp) > 5 * 60 * 1000) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${raw.toString('utf8')}`).digest('hex');
  const given = Buffer.from(signature, 'hex'); const expectedBuffer = Buffer.from(expected, 'hex');
  return given.length === expectedBuffer.length && crypto.timingSafeEqual(given, expectedBuffer);
}
function whatsappConfigured() { return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_APP_SECRET && process.env.WHATSAPP_VERIFY_TOKEN); }
function whatsappSignatureIsValid(raw, signature) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || typeof signature !== 'string' || !signature.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const provided = Buffer.from(signature.slice(7), 'hex'); const expectedBuffer = Buffer.from(expected, 'hex');
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(provided, expectedBuffer);
}
function whatsappRecipient(value) { return String(value || '').replace(/\D/g, ''); }
async function sendWhatsAppText(recipient, content) {
  if (!whatsappConfigured()) throw error('WHATSAPP_NOT_CONFIGURED', 'O WhatsApp Cloud API ainda não foi configurado no servidor.', 503);
  const to = whatsappRecipient(recipient); if (!/^\d{8,15}$/.test(to)) throw error('WHATSAPP_RECIPIENT_INVALID', 'O paciente não possui um número de WhatsApp válido.', 422);
  const endpoint = `https://graph.facebook.com/${WHATSAPP_GRAPH_VERSION}/${encodeURIComponent(process.env.WHATSAPP_PHONE_NUMBER_ID)}/messages`;
  let result;
  try {
    result = await fetch(endpoint, { method: 'POST', headers: { authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: content } }) });
  } catch { throw error('WHATSAPP_NETWORK_ERROR', 'Não foi possível alcançar a API do WhatsApp.', 502); }
  let payload = {}; try { payload = await result.json(); } catch { /* resposta não-JSON da Meta */ }
  if (!result.ok) { console.error('WhatsApp Cloud API recusou a mensagem:', result.status, payload?.error?.code); throw error('WHATSAPP_DELIVERY_FAILED', 'A Meta recusou o envio. Confira o token, o número e a janela de atendimento.', 502); }
  return { external: true, channel: WHATSAPP_CHANNEL, messageId: payload.messages?.[0]?.id || null };
}
async function receiveWhatsAppWebhook(req, res, url) {
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode'); const token = url.searchParams.get('hub.verify_token'); const challenge = url.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && challenge && process.env.WHATSAPP_VERIFY_TOKEN && token === process.env.WHATSAPP_VERIFY_TOKEN) return textResponse(res, 200, challenge);
    return textResponse(res, 403, 'Forbidden');
  }
  if (req.method !== 'POST') return textResponse(res, 405, 'Method Not Allowed');
  let raw;
  try { raw = await rawBody(req); } catch (caught) { return response(res, caught.status || 400, caught.body || error('INVALID_BODY', 'Corpo inválido.').body); }
  if (!whatsappSignatureIsValid(raw, req.headers['x-hub-signature-256'])) return textResponse(res, 401, 'Unauthorized');
  let payload; try { payload = JSON.parse(raw.toString('utf8')); } catch { return textResponse(res, 400, 'Invalid JSON'); }
  try {
    const store = readStore(); let received = 0;
    for (const entry of payload.entry || []) for (const change of entry.changes || []) {
      const value = change.value || {}; if (change.field !== 'messages') continue;
      const profiles = new Map((value.contacts || []).map(contact => [contact.wa_id, contact.profile?.name]));
      for (const incoming of value.messages || []) {
        if (incoming.type !== 'text' || !incoming.text?.body || !incoming.from || !incoming.id) continue;
        if (store.webhookEvents.some(event => event.tenantId === TENANT_ID && event.eventId === incoming.id)) continue;
        const phone = `+${whatsappRecipient(incoming.from)}`; let patient = store.patients.find(item => item.tenantId === TENANT_ID && whatsappRecipient(item.phone) === whatsappRecipient(incoming.from));
        if (!patient) { patient = { id: id('patient'), tenantId: TENANT_ID, name: String(profiles.get(incoming.from) || `WhatsApp ${incoming.from}`).slice(0, 120), phone, email: null, archived: false, createdAt: now(), updatedAt: now() }; store.patients.push(patient); }
        let conversation = store.conversations.find(item => item.tenantId === TENANT_ID && item.patientId === patient.id && item.channel === WHATSAPP_CHANNEL && item.status === 'OPEN');
        if (!conversation) { conversation = { id: id('conv'), tenantId: TENANT_ID, patientId: patient.id, patient: patient.name, appointmentId: null, channel: WHATSAPP_CHANNEL, status: 'OPEN', humanTakeover: true, updatedAt: now(), messages: [] }; store.conversations.push(conversation); }
        const message = { id: id('msg'), direction: 'INBOUND', sender: 'PATIENT', content: incoming.text.body.slice(0, 3000), createdAt: now(), internal: false }; conversation.messages.push(message); conversation.updatedAt = message.createdAt;
        store.webhookEvents.push({ id: id('webhook'), tenantId: TENANT_ID, eventId: incoming.id, type: 'whatsapp.message', receivedAt: now(), processedAt: now() }); audit(store, 'whatsapp.message_received', conversation.id, null, { messageId: message.id, from: phone }, 'Meta webhook'); received += 1;
      }
    }
    if (received) writeStore(store);
    return response(res, 200, { received });
  } catch (caught) { console.error('Falha no webhook do WhatsApp:', caught); return textResponse(res, 500, 'Internal Server Error'); }
}
function normalizeExternalStatus(value) {
  const mapping = { scheduled: 'SCHEDULED', confirmed: 'CONFIRMED', cancelled: 'CANCELLED', rescheduled: 'RESCHEDULED', completed: 'COMPLETED' };
  return mapping[String(value || '').toLowerCase()] || 'SCHEDULED';
}
function statusLabelForApi(status) { return ({ AWAITING_PATIENT_RESPONSE: 'aguarda resposta', RESCHEDULE_REQUESTED: 'solicitou remarcação', CANCELLATION_REQUESTED: 'solicitou cancelamento', REQUIRES_HUMAN: 'requer atendimento humano' })[status] || status.toLowerCase(); }
function ingestWebhook(store, payload) {
  if (!payload || !['appointment.created', 'appointment.updated', 'appointment.cancelled'].includes(payload.type) || !payload.appointment) throw error('WEBHOOK_SCHEMA_INVALID', 'Evento de integração inválido.', 422);
  const source = payload.appointment;
  if (typeof source.externalId !== 'string' || source.externalId.length < 1 || source.externalId.length > 120 || (!source.professionalId && typeof source.doctor !== 'string') || !validDate(source.date) || !validTime(source.start)) throw error('WEBHOOK_SCHEMA_INVALID', 'Dados da consulta externa são inválidos.', 422);
  const existing = store.appointments.find(item => item.tenantId === TENANT_ID && item.externalId === source.externalId);
  if (existing && source.updatedAt && existing.externalUpdatedAt && Date.parse(source.updatedAt) < Date.parse(existing.externalUpdatedAt)) return { appointment: existing, ignored: 'OUT_OF_ORDER' };
  const duration = source.duration === undefined ? 45 : source.duration;
  if (!Number.isInteger(duration) || duration < 15 || duration > 180) throw error('WEBHOOK_SCHEMA_INVALID', 'Duração da consulta externa inválida.', 422);
  const structure = appointmentStructure(store, TENANT_ID, source, existing);
  const next = { tenantId: TENANT_ID, externalId: source.externalId, patient: String(source.patient || existing?.patient || 'Paciente não identificado').slice(0, 120), doctor: structure.doctor, professionalId: structure.professionalId, unitId: structure.unitId, date: source.date, start: source.start, duration, status: payload.type === 'appointment.cancelled' ? 'CANCELLED' : normalizeExternalStatus(source.status), externalUpdatedAt: source.updatedAt || now() };
  if (!existing) {
    const appointment = { id: id('apt'), ...next, version: 1 };
    if (appointment.status !== 'CANCELLED' && overlaps(store.appointments, appointment)) throw error('APPOINTMENT_SLOT_UNAVAILABLE', 'O evento externo conflita com um horário já ocupado.', 409);
    store.appointments.push(appointment); audit(store, 'appointment.ingested', appointment.id, null, appointment, 'integration webhook'); return { appointment, created: true };
  }
  const candidate = { ...existing, ...next };
  if (candidate.status !== 'CANCELLED' && overlaps(store.appointments, candidate, existing.id)) throw error('APPOINTMENT_SLOT_UNAVAILABLE', 'A atualização externa conflita com um horário já ocupado.', 409);
  const before = { ...existing }; Object.assign(existing, next, { version: existing.version + 1 }); audit(store, 'appointment.synchronized', existing.id, before, existing, 'integration webhook'); return { appointment: existing, updated: true };
}
function classifyIntent(text) {
  const normalized = text.toLowerCase();
  if (/(emergência|dor no peito|socorro|remédio|medicamento|diagnóstico)/.test(normalized)) return 'REQUIRES_HUMAN';
  if (/(confirmo|pode confirmar|vou sim|estarei lá)/.test(normalized)) return 'CONFIRM_APPOINTMENT';
  if (/(remarcar|trocar|não consigo|outro dia)/.test(normalized)) return 'RESCHEDULE_REQUEST';
  if (/(cancelar|cancela|desmarcar)/.test(normalized)) return 'CANCEL_APPOINTMENT';
  return 'UNKNOWN';
}
function staticFile(req, res) {
  const requestPath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  const allowed = new Set(['/index.html', '/styles.css', '/fixes.css', '/app.js', '/logotipo.png']);
  if (!allowed.has(requestPath)) return false;
  const target = path.join(ROOT, requestPath);
  if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) return false;
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png' };
  res.writeHead(200, { 'content-type': types[path.extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(target).pipe(res); return true;
}

async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/webhooks/whatsapp') return receiveWhatsAppWebhook(req, res, url);
  if (!url.pathname.startsWith('/api/')) { if (!staticFile(req, res)) response(res, 404, { error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' } }); return; }
  if (!tenant(req)) return response(res, 403, error('TENANT_FORBIDDEN', 'Tenant não autorizado.', 403).body);
  try {
    const store = readStore();
    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const input = await body(req); const configuredEmail = process.env.NEVOA_OWNER_EMAIL; const configuredPassword = process.env.NEVOA_OWNER_PASSWORD;
      if (!configuredEmail || !configuredPassword) return response(res, 503, error('LOGIN_NOT_CONFIGURED', 'Defina NEVOA_OWNER_EMAIL e NEVOA_OWNER_PASSWORD no ambiente do servidor.', 503).body);
      if (!safeSecretEquals(String(input.email || '').trim().toLowerCase(), configuredEmail.trim().toLowerCase()) || !safeSecretEquals(input.password, configuredPassword)) return response(res, 401, error('INVALID_CREDENTIALS', 'E-mail ou senha inválidos.', 401).body);
      const user = store.users.find(item => item.id === 'user_owner' && item.active); const sessionId = crypto.randomUUID(); store.sessions[sessionId] = { userId: user.id, expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() }; writeStore(store);
      res.setHeader('set-cookie', sessionCookie(sessionId)); return response(res, 201, { user: { name: user.name, role: user.role, tenantId: user.tenantId } });
    }
    if (req.method === 'POST' && url.pathname === '/api/auth/dev-session') {
      if (process.env.NODE_ENV === 'production' || !isLocalRequest(req)) return response(res, 404, error('NOT_FOUND', 'Rota não encontrada.', 404).body);
      const user = store.users.find(item => item.id === 'user_owner' && item.active);
      const sessionId = crypto.randomUUID();
      store.sessions[sessionId] = { userId: user.id, expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() };
      writeStore(store);
      res.setHeader('set-cookie', sessionCookie(sessionId));
      return response(res, 201, { user: { name: user.name, role: user.role, tenantId: user.tenantId }, development: true });
    }
    if (req.method === 'GET' && url.pathname === '/api/health') return response(res, 200, { status: 'ok', storage: 'sqlite', tenant: TENANT_ID, channel: LOCAL_CHANNEL, externalConnectors: whatsappConfigured(), whatsapp: { configured: whatsappConfigured(), webhookPath: '/api/webhooks/whatsapp', publicUrl: process.env.PUBLIC_BASE_URL || null } });
    if (req.method === 'POST' && url.pathname === '/api/webhooks/sandbox') {
      const eventId = req.headers['x-nevoa-event-id']; const timestamp = req.headers['x-nevoa-timestamp']; const signature = req.headers['x-nevoa-signature'];
      if (typeof eventId !== 'string' || !/^[a-zA-Z0-9_-]{8,120}$/.test(eventId)) return response(res, 422, error('WEBHOOK_EVENT_ID_INVALID', 'Identificador de evento inválido.', 422).body);
      const raw = await rawBody(req);
      if (!webhookSignatureIsValid(raw, signature, timestamp)) return response(res, 401, error('WEBHOOK_SIGNATURE_INVALID', 'Assinatura de webhook inválida ou expirada.', 401).body);
      const duplicated = store.webhookEvents.find(item => item.eventId === eventId && item.tenantId === TENANT_ID);
      if (duplicated) return response(res, 200, { accepted: true, duplicate: true, eventId });
      let payload; try { payload = JSON.parse(raw.toString('utf8')); } catch { return response(res, 422, error('INVALID_JSON', 'JSON inválido.', 422).body); }
      const result = ingestWebhook(store, payload); store.webhookEvents.push({ id: id('webhook'), tenantId: TENANT_ID, eventId, type: payload.type, receivedAt: now(), processedAt: now() }); writeStore(store);
      return response(res, 202, { accepted: true, eventId, result });
    }
    const actor = actorFromRequest(req, store);
    if (!actor) return response(res, 401, error('AUTHENTICATION_REQUIRED', 'Faça login para continuar.', 401).body);
    if (actor.tenantId !== TENANT_ID) return response(res, 403, error('TENANT_FORBIDDEN', 'Tenant não autorizado.', 403).body);
    const requiredPermission = permissionFor(req.method, url.pathname);
    if (requiredPermission === false) return response(res, 404, error('NOT_FOUND', 'Rota não encontrada.', 404).body);
    if (requiredPermission && !isAllowed(actor, requiredPermission)) return response(res, 403, error('PERMISSION_DENIED', 'Você não tem permissão para esta ação.', 403).body);
    if (req.method === 'GET' && url.pathname === '/api/auth/me') return response(res, 200, { user: actor, permissions: ROLE_PERMISSIONS[actor.role] || [] });
    if (req.method === 'GET' && url.pathname === '/api/audit-logs') return response(res, 200, store.auditLogs.filter(item => item.tenantId === actor.tenantId).slice(-100).reverse());
    if (req.method === 'GET' && url.pathname === '/api/settings') {
      const settings = store.settings.find(item => item.tenantId === actor.tenantId);
      return settings ? response(res, 200, settings) : response(res, 404, error('SETTINGS_NOT_FOUND', 'Configurações da clínica não encontradas.', 404).body);
    }
    if (req.method === 'PATCH' && url.pathname === '/api/settings') {
      const settings = store.settings.find(item => item.tenantId === actor.tenantId);
      if (!settings) return response(res, 404, error('SETTINGS_NOT_FOUND', 'Configurações da clínica não encontradas.', 404).body);
      const input = await body(req); const issue = validateSettings(input, settings);
      if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body);
      const before = { ...settings };
      for (const key of ['clinicName', 'phone', 'timezone', 'aiName', 'greeting', 'reminderStart', 'reminderEnd']) if (input[key] !== undefined) settings[key] = typeof input[key] === 'string' ? input[key].trim() : input[key];
      const tenantRecord = store.tenants.find(item => item.id === actor.tenantId); if (tenantRecord) { tenantRecord.name = settings.clinicName; tenantRecord.timezone = settings.timezone; }
      audit(store, 'settings.update', actor.tenantId, before, settings); writeStore(store); return response(res, 200, { settings });
    }
    if (req.method === 'GET' && url.pathname === '/api/team') {
      const members = store.users.filter(item => item.tenantId === actor.tenantId).map(({ id: userId, name, email, role, active }) => ({ id: userId, name, email, role, active })).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      return response(res, 200, members);
    }
    if (req.method === 'POST' && url.pathname === '/api/team') {
      const input = await body(req); const issue = validateTeamMember(input);
      if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body);
      if (input.role === 'OWNER' && actor.role !== 'OWNER') return response(res, 403, error('OWNER_ROLE_FORBIDDEN', 'Somente um proprietário pode conceder essa função.', 403).body);
      const email = input.email.trim().toLowerCase();
      if (store.users.some(item => item.tenantId === actor.tenantId && item.email.toLowerCase() === email)) return response(res, 409, error('TEAM_EMAIL_EXISTS', 'Já existe um usuário com este e-mail.', 409).body);
      const member = { id: id('user'), tenantId: actor.tenantId, name: input.name.trim(), email, role: input.role, active: input.active ?? true };
      store.users.push(member); audit(store, 'team.create', member.id, null, member); writeStore(store); return response(res, 201, { user: member });
    }
    const teamMatch = url.pathname.match(/^\/api\/team\/([^/]+)$/);
    if (teamMatch && req.method === 'PATCH') {
      const member = store.users.find(item => item.id === teamMatch[1] && item.tenantId === actor.tenantId);
      if (!member) return response(res, 404, error('TEAM_MEMBER_NOT_FOUND', 'Usuário não encontrado.', 404).body);
      const input = await body(req); const issue = validateTeamMember(input, true);
      if (issue || !Object.keys(input).some(key => ['name', 'email', 'role', 'active'].includes(key))) return response(res, 422, error('VALIDATION_ERROR', issue || 'Informe ao menos uma alteração válida.', 422).body);
      const nextRole = input.role ?? member.role; const nextActive = input.active ?? member.active;
      if ((member.role === 'OWNER' || nextRole === 'OWNER') && actor.role !== 'OWNER') return response(res, 403, error('OWNER_ROLE_FORBIDDEN', 'Somente um proprietário pode alterar essa função.', 403).body);
      if (member.role === 'OWNER' && member.active && (nextRole !== 'OWNER' || !nextActive) && !store.users.some(item => item.tenantId === actor.tenantId && item.id !== member.id && item.role === 'OWNER' && item.active)) return response(res, 409, error('LAST_OWNER_REQUIRED', 'A clínica precisa manter ao menos um proprietário ativo.', 409).body);
      const nextEmail = input.email === undefined ? member.email : input.email.trim().toLowerCase();
      if (store.users.some(item => item.tenantId === actor.tenantId && item.id !== member.id && item.email.toLowerCase() === nextEmail)) return response(res, 409, error('TEAM_EMAIL_EXISTS', 'Já existe um usuário com este e-mail.', 409).body);
      const before = { ...member };
      if (input.name !== undefined) member.name = input.name.trim(); if (input.email !== undefined) member.email = nextEmail; if (input.role !== undefined) member.role = input.role; if (input.active !== undefined) member.active = input.active;
      if (!member.active) for (const [sessionId, session] of Object.entries(store.sessions)) if (session.userId === member.id) delete store.sessions[sessionId];
      audit(store, 'team.update', member.id, before, member); writeStore(store); return response(res, 200, { user: member });
    }
    if (req.method === 'GET' && url.pathname === '/api/professionals') {
      const pagination = paginationFor(url); const active = url.searchParams.get('active') || 'true'; const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase('pt-BR');
      if (!pagination || !['true', 'false', 'all'].includes(active)) return response(res, 400, error('INVALID_QUERY', 'Paginação ou filtro de profissionais inválido.').body);
      const items = store.professionals.filter(item => item.tenantId === actor.tenantId && (active === 'all' || item.active === (active === 'true')) && (!query || [item.name, item.role, item.education, item.specialty, item.registration, item.phone, item.email].some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(query)))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      return response(res, 200, paginated(items, pagination.page, pagination.pageSize));
    }
    if (req.method === 'POST' && url.pathname === '/api/professionals') {
      const input = await body(req); const issue = validateProfessional(input); if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body);
      const name = input.name.trim(); const registration = input.registration?.trim() || null; const email = input.email?.trim().toLowerCase() || null;
      if (store.professionals.some(item => item.tenantId === actor.tenantId && item.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) return response(res, 409, error('PROFESSIONAL_ALREADY_EXISTS', 'Já existe um profissional com este nome.', 409).body);
      if (registration && store.professionals.some(item => item.tenantId === actor.tenantId && String(item.registration || '').toLocaleLowerCase('pt-BR') === registration.toLocaleLowerCase('pt-BR'))) return response(res, 409, error('PROFESSIONAL_REGISTRATION_EXISTS', 'Já existe um profissional com este registro.', 409).body);
      const professional = { id: id('professional'), tenantId: actor.tenantId, name, role: input.role?.trim() || null, education: input.education?.trim() || null, specialty: input.specialty?.trim() || null, registration, phone: String(input.phone || '').replace(/\s|\(|\)|-/g, '') || null, email, active: input.active ?? true, createdAt: now(), updatedAt: now() };
      store.professionals.push(professional); audit(store, 'professional.create', professional.id, null, professional); writeStore(store); return response(res, 201, { professional });
    }
    const professionalMatch = url.pathname.match(/^\/api\/professionals\/([^/]+)(?:\/(archive))?$/);
    if (professionalMatch && req.method === 'GET' && !professionalMatch[2]) {
      const professional = store.professionals.find(item => item.id === professionalMatch[1] && item.tenantId === actor.tenantId); return professional ? response(res, 200, professional) : response(res, 404, error('PROFESSIONAL_NOT_FOUND', 'Profissional não encontrado.', 404).body);
    }
    if (professionalMatch && req.method === 'PATCH' && !professionalMatch[2]) {
      const professional = store.professionals.find(item => item.id === professionalMatch[1] && item.tenantId === actor.tenantId); if (!professional) return response(res, 404, error('PROFESSIONAL_NOT_FOUND', 'Profissional não encontrado.', 404).body);
      const input = await body(req); const issue = validateProfessional(input, true); const allowed = ['name', 'role', 'education', 'specialty', 'registration', 'phone', 'email', 'active'];
      if (issue || !Object.keys(input).some(key => allowed.includes(key))) return response(res, 422, error('VALIDATION_ERROR', issue || 'Informe ao menos uma alteração válida.', 422).body);
      if (input.active === false) return response(res, 422, error('USE_ARCHIVE_ACTION', 'Use a ação de arquivamento para desativar um profissional.', 422).body);
      const nextName = input.name === undefined ? professional.name : input.name.trim(); const nextRegistration = input.registration === undefined ? professional.registration : input.registration?.trim() || null;
      if (store.professionals.some(item => item.id !== professional.id && item.tenantId === actor.tenantId && item.name.toLocaleLowerCase('pt-BR') === nextName.toLocaleLowerCase('pt-BR'))) return response(res, 409, error('PROFESSIONAL_ALREADY_EXISTS', 'Já existe um profissional com este nome.', 409).body);
      if (nextRegistration && store.professionals.some(item => item.id !== professional.id && item.tenantId === actor.tenantId && String(item.registration || '').toLocaleLowerCase('pt-BR') === nextRegistration.toLocaleLowerCase('pt-BR'))) return response(res, 409, error('PROFESSIONAL_REGISTRATION_EXISTS', 'Já existe um profissional com este registro.', 409).body);
      const before = { ...professional };
      if (input.name !== undefined) professional.name = nextName; if (input.role !== undefined) professional.role = input.role?.trim() || null; if (input.education !== undefined) professional.education = input.education?.trim() || null; if (input.specialty !== undefined) professional.specialty = input.specialty?.trim() || null; if (input.registration !== undefined) professional.registration = nextRegistration; if (input.phone !== undefined) professional.phone = String(input.phone || '').replace(/\s|\(|\)|-/g, '') || null; if (input.email !== undefined) professional.email = input.email?.trim().toLowerCase() || null; if (input.active !== undefined) professional.active = input.active; professional.updatedAt = now();
      if (professional.name !== before.name) store.appointments.filter(item => item.tenantId === actor.tenantId && item.professionalId === professional.id).forEach(item => { item.doctor = professional.name; });
      audit(store, 'professional.update', professional.id, before, professional); writeStore(store); return response(res, 200, { professional });
    }
    if (professionalMatch && professionalMatch[2] === 'archive' && req.method === 'POST') {
      const professional = store.professionals.find(item => item.id === professionalMatch[1] && item.tenantId === actor.tenantId); if (!professional) return response(res, 404, error('PROFESSIONAL_NOT_FOUND', 'Profissional não encontrado.', 404).body); if (!professional.active) return response(res, 200, { professional });
      const future = store.appointments.filter(item => item.tenantId === actor.tenantId && item.date >= dateKey() && !['CANCELLED', 'COMPLETED'].includes(item.status));
      if (future.some(item => item.professionalId === professional.id || (!item.professionalId && item.doctor.toLocaleLowerCase('pt-BR') === professional.name.toLocaleLowerCase('pt-BR')))) return response(res, 409, error('PROFESSIONAL_HAS_FUTURE_APPOINTMENTS', 'O profissional possui consultas futuras e não pode ser arquivado.', 409).body);
      if (store.professionals.filter(item => item.tenantId === actor.tenantId && item.active).length === 1 && future.length) return response(res, 409, error('LAST_ACTIVE_PROFESSIONAL_REQUIRED', 'A clínica precisa manter um profissional ativo enquanto houver consultas futuras.', 409).body);
      const before = { ...professional }; professional.active = false; professional.updatedAt = now(); audit(store, 'professional.archive', professional.id, before, professional); writeStore(store); return response(res, 200, { professional });
    }
    if (req.method === 'GET' && url.pathname === '/api/units') {
      const pagination = paginationFor(url); const active = url.searchParams.get('active') || 'true'; const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase('pt-BR');
      if (!pagination || !['true', 'false', 'all'].includes(active)) return response(res, 400, error('INVALID_QUERY', 'Paginação ou filtro de unidades inválido.').body);
      const items = store.units.filter(item => item.tenantId === actor.tenantId && (active === 'all' || item.active === (active === 'true')) && (!query || [item.name, item.address, item.phone].some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(query)))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      return response(res, 200, paginated(items, pagination.page, pagination.pageSize));
    }
    if (req.method === 'POST' && url.pathname === '/api/units') {
      const input = await body(req); const issue = validateUnit(input); if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body); const name = input.name.trim();
      if (store.units.some(item => item.tenantId === actor.tenantId && item.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) return response(res, 409, error('UNIT_ALREADY_EXISTS', 'Já existe uma unidade com este nome.', 409).body);
      const unit = { id: id('unit'), tenantId: actor.tenantId, name, address: input.address?.trim() || null, phone: String(input.phone || '').replace(/\s|\(|\)|-/g, '') || null, active: input.active ?? true, createdAt: now(), updatedAt: now() };
      store.units.push(unit); audit(store, 'unit.create', unit.id, null, unit); writeStore(store); return response(res, 201, { unit });
    }
    const unitMatch = url.pathname.match(/^\/api\/units\/([^/]+)(?:\/(archive))?$/);
    if (unitMatch && req.method === 'GET' && !unitMatch[2]) {
      const unit = store.units.find(item => item.id === unitMatch[1] && item.tenantId === actor.tenantId); return unit ? response(res, 200, unit) : response(res, 404, error('UNIT_NOT_FOUND', 'Unidade não encontrada.', 404).body);
    }
    if (unitMatch && req.method === 'PATCH' && !unitMatch[2]) {
      const unit = store.units.find(item => item.id === unitMatch[1] && item.tenantId === actor.tenantId); if (!unit) return response(res, 404, error('UNIT_NOT_FOUND', 'Unidade não encontrada.', 404).body);
      const input = await body(req); const issue = validateUnit(input, true); const allowed = ['name', 'address', 'phone', 'active'];
      if (issue || !Object.keys(input).some(key => allowed.includes(key))) return response(res, 422, error('VALIDATION_ERROR', issue || 'Informe ao menos uma alteração válida.', 422).body);
      if (input.active === false) return response(res, 422, error('USE_ARCHIVE_ACTION', 'Use a ação de arquivamento para desativar uma unidade.', 422).body);
      const nextName = input.name === undefined ? unit.name : input.name.trim(); if (store.units.some(item => item.id !== unit.id && item.tenantId === actor.tenantId && item.name.toLocaleLowerCase('pt-BR') === nextName.toLocaleLowerCase('pt-BR'))) return response(res, 409, error('UNIT_ALREADY_EXISTS', 'Já existe uma unidade com este nome.', 409).body);
      const before = { ...unit }; if (input.name !== undefined) unit.name = nextName; if (input.address !== undefined) unit.address = input.address?.trim() || null; if (input.phone !== undefined) unit.phone = String(input.phone || '').replace(/\s|\(|\)|-/g, '') || null; if (input.active !== undefined) unit.active = input.active; unit.updatedAt = now();
      audit(store, 'unit.update', unit.id, before, unit); writeStore(store); return response(res, 200, { unit });
    }
    if (unitMatch && unitMatch[2] === 'archive' && req.method === 'POST') {
      const unit = store.units.find(item => item.id === unitMatch[1] && item.tenantId === actor.tenantId); if (!unit) return response(res, 404, error('UNIT_NOT_FOUND', 'Unidade não encontrada.', 404).body); if (!unit.active) return response(res, 200, { unit });
      const future = store.appointments.filter(item => item.tenantId === actor.tenantId && item.date >= dateKey() && !['CANCELLED', 'COMPLETED'].includes(item.status));
      if (future.some(item => item.unitId === unit.id)) return response(res, 409, error('UNIT_HAS_FUTURE_APPOINTMENTS', 'A unidade possui consultas futuras e não pode ser arquivada.', 409).body);
      if (store.units.filter(item => item.tenantId === actor.tenantId && item.active).length === 1 && future.length) return response(res, 409, error('LAST_ACTIVE_UNIT_REQUIRED', 'A clínica precisa manter uma unidade ativa enquanto houver consultas futuras.', 409).body);
      const before = { ...unit }; unit.active = false; unit.updatedAt = now(); audit(store, 'unit.archive', unit.id, before, unit); writeStore(store); return response(res, 200, { unit });
    }
    if (req.method === 'GET' && url.pathname === '/api/dashboard') {
      const today = dateKey(); const appointments = store.appointments.filter(item => item.tenantId === actor.tenantId && item.date === today);
      const confirmed = appointments.filter(item => item.status === 'CONFIRMED').length;
      const waiting = appointments.filter(item => item.status === 'AWAITING_PATIENT_RESPONSE').length;
      const tenantConversations = store.conversations.filter(item => item.tenantId === actor.tenantId); const resolved = tenantConversations.filter(item => item.status === 'RESOLVED'); const aiResolved = resolved.filter(item => !item.humanTakeover).length;
      const attention = [
        ...store.appointments.filter(item => item.tenantId === actor.tenantId && ['AWAITING_PATIENT_RESPONSE', 'RESCHEDULE_REQUESTED', 'CANCELLATION_REQUESTED', 'REQUIRES_HUMAN'].includes(item.status)).map(item => ({ type: 'APPOINTMENT', id: item.id, title: `${item.patient}: ${statusLabelForApi(item.status)}`, detail: `${item.doctor} · ${item.date} ${item.start}` })),
        ...tenantConversations.filter(item => item.status === 'OPEN' && item.humanTakeover).map(item => ({ type: 'CONVERSATION', id: item.id, title: `${item.patient}: atendimento humano`, detail: `Conversa ${LOCAL_CHANNEL.toLowerCase()}`, channel: LOCAL_CHANNEL })),
        ...store.integrations.filter(item => item.tenantId === actor.tenantId && !['CONNECTED', 'SANDBOX'].includes(item.status)).map(item => ({ type: 'INTEGRATION', id: item.id, title: `${item.provider}: ${item.status}`, detail: 'Integração requer atenção' }))
      ].slice(0, 6);
      const activities = store.auditLogs.filter(item => item.tenantId === actor.tenantId).slice(-6).reverse().map(item => ({ action: item.action, subjectId: item.subjectId, reason: item.reason, at: item.at }));
      const confirmationSeries = Array.from({ length: 7 }, (_, offset) => { const day = new Date(); day.setUTCDate(day.getUTCDate() - (6 - offset)); const key = dateKey(day); const dayAppointments = store.appointments.filter(item => item.tenantId === actor.tenantId && item.date === key); return { date: key, total: dayAppointments.length, confirmed: dayAppointments.filter(item => item.status === 'CONFIRMED').length }; });
      return response(res, 200, { date: today, appointmentsToday: appointments.length, confirmed, waiting, cancelled: appointments.filter(item => item.status === 'CANCELLED').length, rescheduled: appointments.filter(item => item.status === 'RESCHEDULED').length, openConversations: tenantConversations.filter(item => item.status === 'OPEN').length, humanConversations: tenantConversations.filter(item => item.status === 'OPEN' && item.humanTakeover).length, aiResolved, aiResolutionRate: resolved.length ? Math.round(aiResolved / resolved.length * 100) : null, attention, activities, confirmationSeries });
    }
    if (req.method === 'GET' && url.pathname === '/api/appointments') {
      const date = url.searchParams.get('date'); const doctor = url.searchParams.get('doctor'); const professionalId = url.searchParams.get('professionalId'); const unitId = url.searchParams.get('unitId'); const status = url.searchParams.get('status'); const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase('pt-BR');
      if ((date && !validDate(date)) || (status && !APPOINTMENT_STATUSES.has(status))) return response(res, 400, error('INVALID_QUERY', 'Data ou estado da consulta inválido.').body);
      const appointments = store.appointments.map(item => appointmentView(store, item)).filter(item => item.tenantId === actor.tenantId && (!date || item.date === date) && (!professionalId || item.professionalId === professionalId) && (!unitId || item.unitId === unitId) && (!doctor || item.doctor.toLocaleLowerCase('pt-BR') === doctor.toLocaleLowerCase('pt-BR')) && (!status || item.status === status) && (!query || [item.patient, item.doctor, item.professional?.specialty, item.unit?.name].some(value => String(value || '').toLocaleLowerCase('pt-BR').includes(query)))).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
      return response(res, 200, appointments);
    }
    if (req.method === 'GET' && url.pathname === '/api/patients') {
      const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase('pt-BR'); const page = Math.max(1, Number(url.searchParams.get('page') || 1)); const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || 10))); const includeArchived = url.searchParams.get('archived') === 'true';
      const filtered = store.patients.filter(item => item.tenantId === actor.tenantId && (includeArchived || !item.archived) && (!query || item.name.toLocaleLowerCase('pt-BR').includes(query) || String(item.phone || '').includes(query) || String(item.email || '').toLocaleLowerCase('pt-BR').includes(query))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      const items = filtered.slice((page - 1) * pageSize, page * pageSize).map(patient => ({ ...patient, appointments: store.appointments.filter(item => item.tenantId === actor.tenantId && item.patientId === patient.id).length, lastAppointment: store.appointments.filter(item => item.tenantId === actor.tenantId && item.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date))[0]?.date || null }));
      return response(res, 200, { items, pagination: { page, pageSize, total: filtered.length, pages: Math.max(1, Math.ceil(filtered.length / pageSize)) } });
    }
    const patientMatch = url.pathname.match(/^\/api\/patients\/([^/]+)(?:\/(archive))?$/);
    if (patientMatch && req.method === 'GET' && !patientMatch[2]) { const patient = store.patients.find(item => item.id === patientMatch[1] && item.tenantId === actor.tenantId); return patient ? response(res, 200, patient) : response(res, 404, error('PATIENT_NOT_FOUND', 'Paciente não encontrado.', 404).body); }
    if (req.method === 'POST' && url.pathname === '/api/patients') {
      const input = await body(req); const issue = validatePatient(input); if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body);
      if (store.patients.some(item => item.tenantId === actor.tenantId && item.name.toLocaleLowerCase('pt-BR') === input.name.trim().toLocaleLowerCase('pt-BR') && !item.archived)) return response(res, 409, error('PATIENT_ALREADY_EXISTS', 'Já existe um paciente ativo com este nome.', 409).body);
      const patient = { id: id('patient'), tenantId: actor.tenantId, name: input.name.trim(), phone: String(input.phone || '').replace(/\s|\(|\)|-/g, '') || null, email: input.email?.trim().toLowerCase() || null, archived: false, createdAt: now(), updatedAt: now() };
      store.patients.push(patient); audit(store, 'patient.create', patient.id, null, patient); writeStore(store); return response(res, 201, { patient });
    }
    if (patientMatch && req.method === 'PATCH' && !patientMatch[2]) {
      const patient = store.patients.find(item => item.id === patientMatch[1] && item.tenantId === actor.tenantId); if (!patient) return response(res, 404, error('PATIENT_NOT_FOUND', 'Paciente não encontrado.', 404).body);
      const input = await body(req); const issue = validatePatient(input, true); if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body); const before = { ...patient };
      if (input.name !== undefined) patient.name = input.name.trim(); if (input.phone !== undefined) patient.phone = String(input.phone).replace(/\s|\(|\)|-/g, '') || null; if (input.email !== undefined) patient.email = input.email.trim().toLowerCase() || null; patient.updatedAt = now();
      store.appointments.filter(item => item.patientId === patient.id).forEach(item => { item.patient = patient.name; }); store.conversations.filter(item => item.patientId === patient.id).forEach(item => { item.patient = patient.name; }); audit(store, 'patient.update', patient.id, before, patient); writeStore(store); return response(res, 200, { patient });
    }
    if (patientMatch && patientMatch[2] === 'archive' && req.method === 'POST') {
      const patient = store.patients.find(item => item.id === patientMatch[1] && item.tenantId === actor.tenantId); if (!patient) return response(res, 404, error('PATIENT_NOT_FOUND', 'Paciente não encontrado.', 404).body); const before = { ...patient }; patient.archived = true; patient.updatedAt = now(); audit(store, 'patient.archive', patient.id, before, patient); writeStore(store); return response(res, 200, { patient });
    }
    if (req.method === 'GET' && url.pathname === '/api/pending') {
      const appointments = store.appointments.filter(item => item.tenantId === TENANT_ID && ['AWAITING_PATIENT_RESPONSE', 'RESCHEDULE_REQUESTED', 'CANCELLATION_REQUESTED', 'REQUIRES_HUMAN'].includes(item.status));
      const conversations = store.conversations.filter(item => item.tenantId === TENANT_ID && item.humanTakeover && item.status === 'OPEN');
      return response(res, 200, { appointments, conversations });
    }
    if (req.method === 'GET' && url.pathname === '/api/reports') {
      const dateFrom = url.searchParams.get('dateFrom'); const dateTo = url.searchParams.get('dateTo');
      if ((dateFrom && !validDate(dateFrom)) || (dateTo && !validDate(dateTo)) || (dateFrom && dateTo && dateFrom > dateTo)) return response(res, 400, error('INVALID_REPORT_PERIOD', 'Período do relatório inválido.').body);
      const inPeriod = date => (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
      const appointments = store.appointments.filter(item => item.tenantId === actor.tenantId && inPeriod(item.date));
      const tenantConversations = store.conversations.filter(item => item.tenantId === actor.tenantId && inPeriod(String(item.updatedAt || '').slice(0, 10)));
      const resolved = tenantConversations.filter(item => item.status === 'RESOLVED'); const aiResolved = resolved.filter(item => !item.humanTakeover).length;
      const byStatus = Object.fromEntries([...APPOINTMENT_STATUSES].map(status => [status, appointments.filter(item => item.status === status).length]));
      return response(res, 200, { period: { dateFrom: dateFrom || null, dateTo: dateTo || null }, total: appointments.length, confirmed: byStatus.CONFIRMED, cancelled: byStatus.CANCELLED, rescheduled: byStatus.RESCHEDULED, waiting: byStatus.AWAITING_PATIENT_RESPONSE, byStatus, conversations: tenantConversations.length, resolvedConversations: resolved.length, aiResolved, aiResolutionRate: resolved.length ? Math.round(aiResolved / resolved.length * 100) : null });
    }
    if (req.method === 'GET' && url.pathname === '/api/automation-rules') return response(res, 200, store.automationRules.filter(item => item.tenantId === actor.tenantId));
    if (req.method === 'GET' && url.pathname === '/api/automation-runs') {
      const runs = store.auditLogs.filter(item => item.tenantId === actor.tenantId && item.action === 'automation.run').slice(-100).reverse().map(item => ({ id: item.id, ruleId: item.subjectId, result: item.after, at: item.at, correlationId: item.correlationId }));
      return response(res, 200, runs);
    }
    if (req.method === 'POST' && url.pathname === '/api/automation-rules') {
      const input = await body(req); const issue = validateAutomationRule(input);
      if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body);
      const rule = { id: id('rule'), tenantId: actor.tenantId, name: input.name.trim(), active: input.active ?? false, executionsToday: 0, triggerHours: input.triggerHours, conditionStatus: input.conditionStatus, actionType: input.actionType };
      store.automationRules.push(rule); audit(store, 'automation.create', rule.id, null, rule); writeStore(store); return response(res, 201, { rule });
    }
    const automationRunMatch = url.pathname.match(/^\/api\/automation-rules\/([^/]+)\/run$/);
    if (automationRunMatch && req.method === 'POST') {
      const rule = store.automationRules.find(item => item.id === automationRunMatch[1] && item.tenantId === actor.tenantId);
      if (!rule) return response(res, 404, error('RULE_NOT_FOUND', 'Automação não encontrada.', 404).body);
      if (!rule.active) return response(res, 409, error('RULE_INACTIVE', 'Ative a automação antes de executá-la.', 409).body);
      const startedAt = Date.now(); const cutoff = startedAt + rule.triggerHours * 60 * 60 * 1000;
      const eligible = store.appointments.filter(item => { const scheduledAt = Date.parse(`${item.date}T${item.start}:00-03:00`); return item.tenantId === actor.tenantId && item.status === rule.conditionStatus && Number.isFinite(scheduledAt) && scheduledAt >= startedAt && scheduledAt <= cutoff; });
      const messageIds = []; const conversationsCreated = [];
      for (const appointment of eligible) {
        let conversation = store.conversations.find(item => item.tenantId === actor.tenantId && item.appointmentId === appointment.id);
        if (!conversation) { conversation = { id: id('conv'), tenantId: actor.tenantId, patientId: appointment.patientId || null, patient: appointment.patient, appointmentId: appointment.id, channel: LOCAL_CHANNEL, status: 'OPEN', humanTakeover: false, updatedAt: now(), messages: [] }; store.conversations.push(conversation); }
        const requestsConfirmation = ['SEND_CONFIRMATION_REQUEST', 'REQUEST_CONFIRMATION'].includes(rule.actionType);
        const content = rule.actionType === 'FLAG_HUMAN' ? `A automação sinalizou a consulta de ${appointment.date} às ${appointment.start} para revisão da equipe.` : requestsConfirmation ? `Olá, ${appointment.patient}! Pode confirmar sua consulta de ${appointment.date} às ${appointment.start}?` : `Lembrete: sua consulta está marcada para ${appointment.date} às ${appointment.start}.`;
        const message = { id: id('msg'), direction: rule.actionType === 'FLAG_HUMAN' ? 'INTERNAL' : 'OUTBOUND', sender: rule.actionType === 'FLAG_HUMAN' ? 'SYSTEM' : 'AI', content, createdAt: now(), internal: rule.actionType === 'FLAG_HUMAN' }; conversation.messages.push(message); conversation.updatedAt = message.createdAt;
        if (rule.actionType === 'FLAG_HUMAN') { conversation.humanTakeover = true; appointment.status = 'REQUIRES_HUMAN'; appointment.version += 1; }
        messageIds.push(message.id); conversationsCreated.push({ conversationId: conversation.id, patient: appointment.patient, appointmentId: appointment.id, messageId: message.id, action: rule.actionType });
      }
      const before = { executionsToday: rule.executionsToday }; rule.executionsToday += messageIds.length;
      const result = { channel: LOCAL_CHANNEL, externalDelivery: false, eligible: eligible.length, messagesCreated: messageIds.length, messageIds, conversations: conversationsCreated };
      audit(store, 'automation.run', rule.id, before, result, 'manual sandbox run'); writeStore(store); return response(res, 200, { rule, matched: eligible.length, executed: messageIds.length, ...result, run: result });
    }
    const automationMatch = url.pathname.match(/^\/api\/automation-rules\/([^/]+)$/);
    if (automationMatch && req.method === 'GET') { const rule = store.automationRules.find(item => item.id === automationMatch[1] && item.tenantId === actor.tenantId); return rule ? response(res, 200, rule) : response(res, 404, error('RULE_NOT_FOUND', 'Automação não encontrada.', 404).body); }
    if (automationMatch && req.method === 'PATCH') {
      const rule = store.automationRules.find(item => item.id === automationMatch[1] && item.tenantId === actor.tenantId); if (!rule) return response(res, 404, error('RULE_NOT_FOUND', 'Automação não encontrada.', 404).body);
      const input = await body(req); const issue = validateAutomationRule(input, true); if (issue || !Object.keys(input).some(key => ['name', 'active', 'triggerHours', 'conditionStatus', 'actionType'].includes(key))) return response(res, 422, error('VALIDATION_ERROR', issue || 'Informe ao menos uma alteração válida.', 422).body);
      const before = { ...rule }; if (input.name !== undefined) rule.name = input.name.trim(); for (const key of ['active', 'triggerHours', 'conditionStatus', 'actionType']) if (input[key] !== undefined) rule[key] = input[key];
      audit(store, 'automation.update', rule.id, before, rule); writeStore(store); return response(res, 200, { rule });
    }
    if (automationMatch && req.method === 'DELETE') {
      const index = store.automationRules.findIndex(item => item.id === automationMatch[1] && item.tenantId === actor.tenantId); if (index < 0) return response(res, 404, error('RULE_NOT_FOUND', 'Automação não encontrada.', 404).body);
      const [rule] = store.automationRules.splice(index, 1); audit(store, 'automation.delete', rule.id, rule, null); writeStore(store); return response(res, 200, { deleted: true, id: rule.id });
    }
    if (req.method === 'GET' && url.pathname === '/api/integrations') return response(res, 200, store.integrations.filter(item => item.tenantId === actor.tenantId).map(item => ({ ...item, channel: LOCAL_CHANNEL, external: false })));
    if (req.method === 'POST' && url.pathname === '/api/integrations') {
      const input = await body(req); const issue = validateIntegration(input); if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body);
      const integration = { id: id('integration'), tenantId: actor.tenantId, provider: 'GENERIC_WEBHOOK', environment: 'SANDBOX', status: input.status || 'SANDBOX', lastSyncAt: null, config: { name: input.config?.name?.trim() || 'Webhook sandbox', endpoint: input.config?.endpoint || '' } };
      store.integrations.push(integration); audit(store, 'integration.create', integration.id, null, integration); writeStore(store); return response(res, 201, { integration: { ...integration, channel: LOCAL_CHANNEL, external: false } });
    }
    const integrationActionMatch = url.pathname.match(/^\/api\/integrations\/([^/]+)\/(test|sync)$/);
    if (integrationActionMatch && req.method === 'POST') {
      const integration = store.integrations.find(item => item.id === integrationActionMatch[1] && item.tenantId === actor.tenantId); if (!integration) return response(res, 404, error('INTEGRATION_NOT_FOUND', 'Integração não encontrada.', 404).body);
      const action = integrationActionMatch[2]; const before = { ...integration, config: { ...(integration.config || {}) } }; const at = now(); integration.status = 'SANDBOX'; if (action === 'sync') integration.lastSyncAt = at;
      const result = action === 'test' ? { ok: true, provider: integration.provider, environment: 'SANDBOX', external: false, message: 'Configuração local validada; nenhuma chamada externa foi feita.' } : { ok: true, synced: 0, at, external: false, message: 'Sincronização sandbox concluída sem conector externo.' };
      audit(store, `integration.${action}`, integration.id, before, { integration, result }, 'sandbox action'); writeStore(store); return response(res, 200, { integration: { ...integration, channel: LOCAL_CHANNEL, external: false }, result });
    }
    const integrationMatch = url.pathname.match(/^\/api\/integrations\/([^/]+)$/);
    if (integrationMatch && req.method === 'PATCH') {
      const integration = store.integrations.find(item => item.id === integrationMatch[1] && item.tenantId === actor.tenantId); if (!integration) return response(res, 404, error('INTEGRATION_NOT_FOUND', 'Integração não encontrada.', 404).body);
      const input = await body(req); const issue = validateIntegration(input, true); if (issue || !Object.keys(input).some(key => ['provider', 'environment', 'status', 'config'].includes(key))) return response(res, 422, error('VALIDATION_ERROR', issue || 'Informe ao menos uma alteração válida.', 422).body);
      const before = { ...integration, config: { ...(integration.config || {}) } }; if (input.status !== undefined) integration.status = input.status; if (input.config !== undefined) integration.config = { ...(integration.config || {}), ...input.config, ...(input.config.name !== undefined ? { name: input.config.name.trim() } : {}) };
      audit(store, 'integration.update', integration.id, before, integration); writeStore(store); return response(res, 200, { integration: { ...integration, channel: LOCAL_CHANNEL, external: false } });
    }
    if (req.method === 'GET' && url.pathname === '/api/slots') {
      const professionalId = url.searchParams.get('professionalId'); const doctor = url.searchParams.get('doctor'); const date = url.searchParams.get('date'); const duration = Number(url.searchParams.get('duration') || 45);
      const professional = professionalByReference(store, actor.tenantId, professionalId, doctor);
      if (!professional || !validDate(date) || !Number.isInteger(duration) || duration < 15 || duration > 180) return response(res, 400, error('INVALID_QUERY', 'Profissional, data e duração válidos são obrigatórios.').body);
      return response(res, 200, { professionalId: professional.id, doctor: professional.name, date, duration, slots: availableSlots(store, professional.id, date, duration, actor.tenantId) });
    }
    if (req.method === 'POST' && url.pathname === '/api/appointments') {
      const input = await body(req); const structure = appointmentStructure(store, actor.tenantId, input); const candidate = { ...input, doctor: structure.doctor, professionalId: structure.professionalId, unitId: structure.unitId }; const issue = validateAppointment(candidate); if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body);
      const key = req.headers['idempotency-key']; if (key && store.idempotency[key]) return response(res, 200, store.idempotency[key]);
      const appointment = { id: id('apt'), tenantId: actor.tenantId, patient: input.patient.trim(), doctor: structure.doctor, professionalId: structure.professionalId, unitId: structure.unitId, date: input.date, start: input.start, duration: input.duration, status: 'SCHEDULED', version: 1 };
      let patient = store.patients.find(item => item.tenantId === actor.tenantId && item.name.toLocaleLowerCase('pt-BR') === appointment.patient.toLocaleLowerCase('pt-BR') && !item.archived);
      if (!patient) { patient = { id: id('patient'), tenantId: actor.tenantId, name: appointment.patient, phone: null, email: null, archived: false, createdAt: now(), updatedAt: now() }; store.patients.push(patient); audit(store, 'patient.create_from_appointment', patient.id, null, patient); }
      appointment.patientId = patient.id;
      if (overlaps(store.appointments, appointment)) return response(res, 409, error('APPOINTMENT_SLOT_UNAVAILABLE', 'O horário escolhido não está mais disponível.', 409).body);
      store.appointments.push(appointment); audit(store, 'appointment.create', appointment.id, null, appointment); const payload = { appointment: appointmentView(store, appointment) }; if (key) store.idempotency[key] = payload; writeStore(store); return response(res, 201, payload);
    }
    const appointmentMatch = url.pathname.match(/^\/api\/appointments\/([^/]+)(?:\/(confirm|reschedule|cancel))?$/);
    if (appointmentMatch && req.method === 'GET' && !appointmentMatch[2]) { const appointment = store.appointments.find(item => item.id === appointmentMatch[1] && item.tenantId === actor.tenantId); return appointment ? response(res, 200, appointmentView(store, appointment)) : response(res, 404, error('APPOINTMENT_NOT_FOUND', 'Consulta não encontrada.', 404).body); }
    if (appointmentMatch && req.method === 'PATCH' && !appointmentMatch[2]) {
      const appointment = store.appointments.find(item => item.id === appointmentMatch[1] && item.tenantId === actor.tenantId); if (!appointment) return response(res, 404, error('APPOINTMENT_NOT_FOUND', 'Consulta não encontrada.', 404).body);
      const input = await body(req); if (input.version !== appointment.version) return response(res, 409, error('APPOINTMENT_VERSION_CONFLICT', 'A consulta mudou. Atualize antes de salvar.', 409).body);
      const structure = appointmentStructure(store, actor.tenantId, input, appointment); const candidate = { ...appointment, doctor: structure.doctor, professionalId: structure.professionalId, unitId: structure.unitId, date: input.date ?? appointment.date, start: input.start ?? appointment.start, duration: input.duration ?? appointment.duration, patient: appointment.patient };
      const issue = validateAppointment(candidate); if (issue) return response(res, 422, error('VALIDATION_ERROR', issue, 422).body); if (overlaps(store.appointments, candidate, appointment.id)) return response(res, 409, error('APPOINTMENT_SLOT_UNAVAILABLE', 'O horário escolhido não está disponível.', 409).body);
      const before = { ...appointment }; Object.assign(appointment, { doctor: candidate.doctor, professionalId: candidate.professionalId, unitId: candidate.unitId, date: candidate.date, start: candidate.start, duration: candidate.duration, patient: candidate.patient, version: appointment.version + 1 }); audit(store, 'appointment.update', appointment.id, before, appointment); writeStore(store); return response(res, 200, { appointment: appointmentView(store, appointment) });
    }
    if (appointmentMatch && req.method === 'POST') {
      const appointment = store.appointments.find(item => item.id === appointmentMatch[1] && item.tenantId === TENANT_ID); if (!appointment) return response(res, 404, error('APPOINTMENT_NOT_FOUND', 'Consulta não encontrada.', 404).body);
      const operation = appointmentMatch[2]; const input = await body(req); const key = req.headers['idempotency-key']; if (key && store.idempotency[key]) return response(res, 200, store.idempotency[key]);
      if (Number.isInteger(input.version) && input.version !== appointment.version) return response(res, 409, error('APPOINTMENT_VERSION_CONFLICT', 'A consulta mudou. Atualize antes de tentar novamente.', 409).body);
      const before = { ...appointment };
      if (operation === 'confirm') { if (['CANCELLED', 'COMPLETED'].includes(appointment.status)) return response(res, 409, error('APPOINTMENT_NOT_ACTIVE', 'Esta consulta não pode ser confirmada.', 409).body); appointment.status = 'CONFIRMED'; }
      else if (operation === 'cancel') { if (['CANCELLED', 'COMPLETED'].includes(appointment.status)) return response(res, 409, error('APPOINTMENT_NOT_ACTIVE', 'Esta consulta não pode ser cancelada.', 409).body); appointment.status = 'CANCELLED'; }
      else if (operation === 'reschedule') {
        if (!validDate(input.date) || !validTime(input.start)) return response(res, 422, error('VALIDATION_ERROR', 'Nova data ou horário inválido.', 422).body);
        const candidate = { ...appointment, date: input.date, start: input.start }; if (overlaps(store.appointments, candidate, appointment.id)) return response(res, 409, error('APPOINTMENT_SLOT_UNAVAILABLE', 'Este horário acabou de ser ocupado.', 409).body);
        appointment.date = input.date; appointment.start = input.start; appointment.status = 'RESCHEDULED';
      } else return response(res, 404, error('NOT_FOUND', 'Ação não encontrada.', 404).body);
      appointment.version += 1; audit(store, `appointment.${operation}`, appointment.id, before, appointment); const payload = { appointment: appointmentView(store, appointment) }; if (key) store.idempotency[key] = payload; writeStore(store); return response(res, 200, payload);
    }
    if (req.method === 'GET' && url.pathname === '/api/conversations') {
      const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase('pt-BR'); const status = (url.searchParams.get('status') || '').trim().toUpperCase(); const ownership = (url.searchParams.get('ownership') || 'all').trim().toLowerCase();
      if (status && !['OPEN', 'RESOLVED'].includes(status)) return response(res, 400, error('INVALID_QUERY', 'Estado de conversa inválido.').body);
      if (!['all', 'human', 'mine', 'ai'].includes(ownership)) return response(res, 400, error('INVALID_QUERY', 'Filtro de responsabilidade inválido.').body);
      const conversations = store.conversations.filter(item => item.tenantId === actor.tenantId && (!status || item.status === status) && (ownership === 'all' || (['human', 'mine'].includes(ownership) ? item.humanTakeover : !item.humanTakeover)) && (!query || item.patient.toLocaleLowerCase('pt-BR').includes(query) || item.messages.some(message => message.content.toLocaleLowerCase('pt-BR').includes(query)))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return response(res, 200, conversations.map(item => localConversationView(item)));
    }
    if (req.method === 'POST' && url.pathname === '/api/conversations') {
      const input = await body(req); let appointment = null;
      if (input.channel !== undefined && ![LOCAL_CHANNEL, WHATSAPP_CHANNEL].includes(input.channel)) return response(res, 422, error('VALIDATION_ERROR', 'Canal de conversa inválido.', 422).body);
      const channel = input.channel || LOCAL_CHANNEL;
      if (channel === WHATSAPP_CHANNEL && !whatsappConfigured()) return response(res, 503, error('WHATSAPP_NOT_CONFIGURED', 'Configure as credenciais do WhatsApp Cloud API no Railway antes de iniciar esse canal.', 503).body);
      if (input.appointmentId !== undefined) { if (typeof input.appointmentId !== 'string') return response(res, 422, error('VALIDATION_ERROR', 'Consulta vinculada inválida.', 422).body); appointment = store.appointments.find(item => item.id === input.appointmentId && item.tenantId === actor.tenantId); if (!appointment) return response(res, 404, error('APPOINTMENT_NOT_FOUND', 'Consulta não encontrada.', 404).body); }
      const patientName = String(input.patient || appointment?.patient || '').trim(); if (patientName.length < 2 || patientName.length > 120) return response(res, 422, error('VALIDATION_ERROR', 'Informe o paciente da conversa.', 422).body);
      let patient = store.patients.find(item => item.tenantId === actor.tenantId && !item.archived && item.name.toLocaleLowerCase('pt-BR') === patientName.toLocaleLowerCase('pt-BR'));
      if (!patient) { patient = { id: id('patient'), tenantId: actor.tenantId, name: patientName, phone: null, email: null, archived: false, createdAt: now(), updatedAt: now() }; store.patients.push(patient); audit(store, 'patient.create_from_conversation', patient.id, null, patient); }
      if (channel === WHATSAPP_CHANNEL && !/^\+?[1-9]\d{7,14}$/.test(String(patient.phone || '').replace(/\s|\(|\)|-/g, ''))) return response(res, 422, error('WHATSAPP_RECIPIENT_INVALID', 'Cadastre o paciente com telefone internacional antes de abrir uma conversa no WhatsApp.', 422).body);
      const conversation = { id: id('conv'), tenantId: actor.tenantId, patientId: patient.id, patient: patient.name, appointmentId: appointment?.id || null, channel, status: 'OPEN', humanTakeover: true, updatedAt: now(), messages: [] };
      store.conversations.push(conversation); audit(store, 'conversation.create', conversation.id, null, { ...conversation, messages: [] }); writeStore(store); return response(res, 201, { conversation: localConversationView(conversation, true) });
    }
    const conversationMatch = url.pathname.match(/^\/api\/conversations\/([^/]+)(?:\/(messages|incoming|takeover|release|resolve|reopen|notes))?$/);
    if (conversationMatch) {
      const conversation = store.conversations.find(item => item.id === conversationMatch[1] && item.tenantId === actor.tenantId); if (!conversation) return response(res, 404, error('CONVERSATION_NOT_FOUND', 'Conversa não encontrada.', 404).body);
      const action = conversationMatch[2];
      if (req.method === 'GET' && !action) return response(res, 200, localConversationView(conversation, true));
      if (req.method === 'POST' && ['takeover', 'release'].includes(action)) { const before = { humanTakeover: conversation.humanTakeover }; conversation.humanTakeover = action === 'takeover'; conversation.updatedAt = now(); audit(store, `conversation.${action}`, conversation.id, before, { humanTakeover: conversation.humanTakeover }); writeStore(store); return response(res, 200, { conversation: localConversationView(conversation, true) }); }
      if (req.method === 'POST' && ['resolve', 'reopen'].includes(action)) { const before = { status: conversation.status }; conversation.status = action === 'resolve' ? 'RESOLVED' : 'OPEN'; conversation.updatedAt = now(); audit(store, `conversation.${action}`, conversation.id, before, { status: conversation.status }); writeStore(store); return response(res, 200, { conversation: localConversationView(conversation, true) }); }
      if (req.method === 'POST' && action === 'notes') {
        const input = await body(req); if (typeof input.content !== 'string' || !input.content.trim() || input.content.length > 3000) return response(res, 422, error('VALIDATION_ERROR', 'Nota interna inválida.', 422).body);
        const note = { id: id('msg'), direction: 'INTERNAL', sender: 'HUMAN', content: input.content.trim(), createdAt: now(), internal: true }; conversation.messages.push(note); conversation.updatedAt = note.createdAt; audit(store, 'conversation.note', conversation.id, null, { messageId: note.id }); writeStore(store); return response(res, 201, { note, conversation: localConversationView(conversation, true) });
      }
      if (req.method === 'POST' && ['messages', 'incoming'].includes(action)) {
        const input = await body(req); if (typeof input.content !== 'string' || !input.content.trim() || input.content.length > 3000) return response(res, 422, error('VALIDATION_ERROR', 'Mensagem inválida.', 422).body);
        if (conversation.status === 'RESOLVED') return response(res, 409, error('CONVERSATION_RESOLVED', 'Reabra a conversa antes de enviar uma mensagem.', 409).body);
        const inbound = action === 'incoming';
        let delivery = { channel: LOCAL_CHANNEL, status: 'STORED_LOCALLY', external: false };
        if (!inbound && conversation.channel === WHATSAPP_CHANNEL) {
          const patient = store.patients.find(item => item.id === conversation.patientId && item.tenantId === actor.tenantId);
          delivery = { ...(await sendWhatsAppText(patient?.phone, input.content.trim())), status: 'SENT' };
        }
        const message = { id: id('msg'), direction: inbound ? 'INBOUND' : 'OUTBOUND', sender: inbound ? 'PATIENT' : (conversation.humanTakeover ? 'HUMAN' : 'AI'), content: input.content.trim(), createdAt: now(), internal: false }; conversation.messages.push(message); conversation.updatedAt = message.createdAt;
        audit(store, inbound ? 'conversation.message_received' : 'conversation.message_sent', conversation.id, null, { messageId: message.id, channel: LOCAL_CHANNEL, externalDelivery: false });
        let intent = null; let automatedResponse = null; const appointment = store.appointments.find(item => item.id === conversation.appointmentId && item.tenantId === actor.tenantId);
        if (inbound && !conversation.humanTakeover && appointment) {
          intent = classifyIntent(message.content);
          if (intent === 'CONFIRM_APPOINTMENT') { const before = { ...appointment }; appointment.status = 'CONFIRMED'; appointment.version += 1; automatedResponse = 'Perfeito! Sua consulta está confirmada.'; audit(store, 'appointment.confirm_by_conversation', appointment.id, before, appointment, 'sandbox intent'); }
          if (intent === 'RESCHEDULE_REQUEST') { const availability = nextAvailability(store, appointment); automatedResponse = availability ? `Posso oferecer estes horários em ${availability.date}: ${availability.slots.slice(0, 3).join(', ')}.` : 'Vou pedir ajuda à equipe para encontrar um horário.'; }
          if (intent === 'CANCEL_APPOINTMENT') { const before = { ...appointment }; appointment.status = 'CANCELLATION_REQUESTED'; appointment.version += 1; automatedResponse = 'Entendi. Um atendente confirmará o cancelamento com você.'; audit(store, 'appointment.cancellation_requested', appointment.id, before, appointment, 'sandbox intent'); }
          if (intent === 'REQUIRES_HUMAN') { conversation.humanTakeover = true; automatedResponse = 'Vou encaminhar sua mensagem imediatamente para a equipe da clínica.'; }
          if (automatedResponse) conversation.messages.push({ id: id('msg'), direction: 'OUTBOUND', sender: 'AI', content: automatedResponse, createdAt: now(), internal: false });
          audit(store, 'ai.intent_classified', conversation.id, null, { intent, appointmentId: appointment.id });
        }
        if (!inbound && delivery.external) audit(store, 'whatsapp.message_sent', conversation.id, null, { messageId: message.id, externalMessageId: delivery.messageId }, 'Meta Cloud API'); writeStore(store); return response(res, 201, { message, intent, automatedResponse, delivery, conversation: localConversationView(conversation, true) });
      }
    }
    return response(res, 404, error('NOT_FOUND', 'Rota não encontrada.', 404).body);
  } catch (caught) {
    if (caught && caught.status) return response(res, caught.status, caught.body);
    console.error(caught); return response(res, 500, error('INTERNAL_ERROR', 'Erro interno. Tente novamente.', 500).body);
  }
}
function createServer() {
  ensureStore();
  const server = http.createServer(handler);
  server.on('close', () => { if (databaseStore) { databaseStore.close(); databaseStore = null; } });
  return server;
}
if (require.main === module) { const port = Number(process.env.PORT || 3000); createServer().listen(port, () => console.log(`Névoa Saúde disponível em http://localhost:${port}`)); }
module.exports = { createServer, initialStore, availableSlots, overlaps };
