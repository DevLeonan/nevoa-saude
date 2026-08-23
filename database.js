const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const migrations = [
  {
    version: 1,
    sql: `
      CREATE TABLE tenants (id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL, timezone TEXT NOT NULL);
      CREATE TABLE users (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, active INTEGER NOT NULL, FOREIGN KEY (tenant_id) REFERENCES tenants(id));
      CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id));
      CREATE TABLE patients (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL, phone TEXT, email TEXT, archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY (tenant_id) REFERENCES tenants(id));
      CREATE TABLE appointments (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, patient_id TEXT, patient_name TEXT NOT NULL, doctor TEXT NOT NULL, date TEXT NOT NULL, start TEXT NOT NULL, duration INTEGER NOT NULL, status TEXT NOT NULL, version INTEGER NOT NULL, external_id TEXT, external_updated_at TEXT, FOREIGN KEY (tenant_id) REFERENCES tenants(id));
      CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, date, start);
      CREATE INDEX idx_appointments_patient ON appointments(tenant_id, patient_id);
      CREATE UNIQUE INDEX idx_appointments_external ON appointments(tenant_id, external_id) WHERE external_id IS NOT NULL;
      CREATE TABLE conversations (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, patient_id TEXT, patient_name TEXT NOT NULL, appointment_id TEXT, channel TEXT NOT NULL, status TEXT NOT NULL, human_takeover INTEGER NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY (tenant_id) REFERENCES tenants(id));
      CREATE TABLE messages (id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, direction TEXT NOT NULL, sender TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, internal INTEGER NOT NULL DEFAULT 0, FOREIGN KEY (conversation_id) REFERENCES conversations(id));
      CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
      CREATE TABLE automation_rules (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, name TEXT NOT NULL, active INTEGER NOT NULL, executions_today INTEGER NOT NULL DEFAULT 0, trigger_hours INTEGER NOT NULL DEFAULT 24, condition_status TEXT NOT NULL DEFAULT 'SCHEDULED', action_type TEXT NOT NULL DEFAULT 'SEND_REMINDER', FOREIGN KEY (tenant_id) REFERENCES tenants(id));
      CREATE TABLE integrations (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, provider TEXT NOT NULL, environment TEXT NOT NULL, status TEXT NOT NULL, last_sync_at TEXT, config_json TEXT NOT NULL DEFAULT '{}', FOREIGN KEY (tenant_id) REFERENCES tenants(id));
      CREATE TABLE clinic_settings (tenant_id TEXT PRIMARY KEY, clinic_name TEXT NOT NULL, phone TEXT, timezone TEXT NOT NULL, ai_name TEXT NOT NULL, greeting TEXT NOT NULL, reminder_start TEXT NOT NULL, reminder_end TEXT NOT NULL, FOREIGN KEY (tenant_id) REFERENCES tenants(id));
      CREATE TABLE audit_logs (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, action TEXT NOT NULL, subject_id TEXT, before_json TEXT, after_json TEXT, reason TEXT NOT NULL, correlation_id TEXT NOT NULL, at TEXT NOT NULL, FOREIGN KEY (tenant_id) REFERENCES tenants(id));
      CREATE INDEX idx_audit_tenant_at ON audit_logs(tenant_id, at DESC);
      CREATE TABLE webhook_events (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, event_id TEXT NOT NULL, type TEXT NOT NULL, received_at TEXT NOT NULL, processed_at TEXT NOT NULL, UNIQUE(tenant_id, event_id));
      CREATE TABLE idempotency (key TEXT PRIMARY KEY, response_json TEXT NOT NULL);
    `
  },
  {
    version: 2,
    sql: `
      CREATE TABLE units (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      );
      CREATE INDEX idx_units_tenant_active ON units(tenant_id, active, name);
      CREATE TABLE professionals (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        specialty TEXT,
        registration TEXT,
        phone TEXT,
        email TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      );
      CREATE INDEX idx_professionals_tenant_active ON professionals(tenant_id, active, name);
      ALTER TABLE appointments ADD COLUMN professional_id TEXT REFERENCES professionals(id);
      ALTER TABLE appointments ADD COLUMN unit_id TEXT REFERENCES units(id);
      CREATE INDEX idx_appointments_professional_date ON appointments(tenant_id, professional_id, date, start);
      CREATE INDEX idx_appointments_unit_date ON appointments(tenant_id, unit_id, date, start);

      INSERT OR IGNORE INTO units(id, tenant_id, name, address, phone, active, created_at, updated_at)
        SELECT 'unit_principal_' || id, id, 'Principal', NULL, NULL, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now') FROM tenants;
      INSERT OR IGNORE INTO professionals(id, tenant_id, name, specialty, registration, phone, email, active, created_at, updated_at)
        SELECT 'professional_camila_' || id, id, 'Dra. Camila Mendes', 'Clínica geral', NULL, NULL, NULL, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now') FROM tenants;
      INSERT OR IGNORE INTO professionals(id, tenant_id, name, specialty, registration, phone, email, active, created_at, updated_at)
        SELECT 'professional_rafael_' || id, id, 'Dr. Rafael Costa', 'Clínica geral', NULL, NULL, NULL, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now') FROM tenants;
      UPDATE appointments SET unit_id = 'unit_principal_' || tenant_id WHERE unit_id IS NULL;
      UPDATE appointments SET professional_id = 'professional_camila_' || tenant_id WHERE professional_id IS NULL AND doctor = 'Dra. Camila Mendes';
      UPDATE appointments SET professional_id = 'professional_rafael_' || tenant_id WHERE professional_id IS NULL AND doctor = 'Dr. Rafael Costa';

      UPDATE automation_rules SET executions_today = 0, trigger_hours = 24, condition_status = 'SCHEDULED', action_type = 'SEND_CONFIRMATION_REQUEST' WHERE id = 'rule_confirmation';
      UPDATE automation_rules SET name = 'Encaminhar pedidos de remarcação', executions_today = 0, trigger_hours = 24, condition_status = 'RESCHEDULE_REQUESTED', action_type = 'FLAG_HUMAN' WHERE id = 'rule_reschedule';
      UPDATE automation_rules SET executions_today = 0, trigger_hours = 3, condition_status = 'SCHEDULED', action_type = 'SEND_REMINDER' WHERE id = 'rule_final_reminder';
    `
  },
  {
    version: 3,
    sql: `
      ALTER TABLE professionals ADD COLUMN role TEXT;
      ALTER TABLE professionals ADD COLUMN education TEXT;
    `
  }
];

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function patientIdFor(tenantId, name) { return `patient_${Buffer.from(`${tenantId}:${name.toLocaleLowerCase('pt-BR')}`).toString('base64url').slice(0, 24)}`; }

function createDatabaseStore(databasePath, seed) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);');
  const applied = new Set(db.prepare('SELECT version FROM schema_migrations').all().map(row => row.version));
  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;
    db.exec('BEGIN IMMEDIATE');
    try { db.exec(migration.sql); db.prepare('INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)').run(migration.version, new Date().toISOString()); db.exec('COMMIT'); }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  }

  const write = store => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const tables = ['messages', 'conversations', 'appointments', 'professionals', 'units', 'patients', 'sessions', 'users', 'clinic_settings', 'automation_rules', 'integrations', 'audit_logs', 'webhook_events', 'idempotency', 'tenants'];
      for (const table of tables) db.exec(`DELETE FROM ${table}`);
      const tenantStmt = db.prepare('INSERT INTO tenants VALUES (?, ?, ?, ?)');
      for (const item of store.tenants || []) tenantStmt.run(item.id, item.name, item.status, item.timezone);
      const userStmt = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)');
      for (const item of store.users || []) userStmt.run(item.id, item.tenantId, item.name, item.email, item.role, item.active ? 1 : 0);
      const sessionStmt = db.prepare('INSERT INTO sessions VALUES (?, ?, ?)');
      for (const [sessionId, item] of Object.entries(store.sessions || {})) sessionStmt.run(sessionId, item.userId, item.expiresAt);
      const knownPatients = new Map((store.patients || []).map(item => [`${item.tenantId}:${item.name.toLocaleLowerCase('pt-BR')}`, item]));
      for (const appointment of store.appointments || []) {
        const key = `${appointment.tenantId}:${appointment.patient.toLocaleLowerCase('pt-BR')}`;
        if (!knownPatients.has(key)) knownPatients.set(key, { id: appointment.patientId || patientIdFor(appointment.tenantId, appointment.patient), tenantId: appointment.tenantId, name: appointment.patient, phone: null, email: null, archived: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      const patientStmt = db.prepare('INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const item of knownPatients.values()) patientStmt.run(item.id, item.tenantId, item.name, item.phone || null, item.email || null, item.archived ? 1 : 0, item.createdAt, item.updatedAt);
      const patientByName = new Map([...knownPatients.values()].map(item => [`${item.tenantId}:${item.name.toLocaleLowerCase('pt-BR')}`, item.id]));
      const unitStmt = db.prepare('INSERT INTO units(id, tenant_id, name, address, phone, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const item of store.units || []) unitStmt.run(item.id, item.tenantId, item.name, item.address || null, item.phone || null, item.active ? 1 : 0, item.createdAt, item.updatedAt);
      const professionalStmt = db.prepare('INSERT INTO professionals(id, tenant_id, name, specialty, registration, phone, email, active, created_at, updated_at, role, education) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const item of store.professionals || []) professionalStmt.run(item.id, item.tenantId, item.name, item.specialty || null, item.registration || null, item.phone || null, item.email || null, item.active ? 1 : 0, item.createdAt, item.updatedAt, item.role || null, item.education || null);
      const appointmentStmt = db.prepare('INSERT INTO appointments(id, tenant_id, patient_id, patient_name, doctor, date, start, duration, status, version, external_id, external_updated_at, professional_id, unit_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const item of store.appointments || []) appointmentStmt.run(item.id, item.tenantId, item.patientId || patientByName.get(`${item.tenantId}:${item.patient.toLocaleLowerCase('pt-BR')}`) || null, item.patient, item.doctor, item.date, item.start, item.duration, item.status, item.version, item.externalId || null, item.externalUpdatedAt || null, item.professionalId || null, item.unitId || null);
      const conversationStmt = db.prepare('INSERT INTO conversations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const messageStmt = db.prepare('INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, ?)');
      for (const item of store.conversations || []) {
        const patientId = item.patientId || patientByName.get(`${item.tenantId}:${item.patient.toLocaleLowerCase('pt-BR')}`) || null;
        conversationStmt.run(item.id, item.tenantId, patientId, item.patient, item.appointmentId || null, item.channel, item.status, item.humanTakeover ? 1 : 0, item.updatedAt);
        for (const message of item.messages || []) messageStmt.run(message.id, item.id, message.direction, message.sender, message.content, message.createdAt, message.internal ? 1 : 0);
      }
      const ruleStmt = db.prepare('INSERT INTO automation_rules VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const item of store.automationRules || []) ruleStmt.run(item.id, item.tenantId, item.name, item.active ? 1 : 0, item.executionsToday || 0, item.triggerHours ?? 24, item.conditionStatus || 'SCHEDULED', item.actionType || 'SEND_REMINDER');
      const integrationStmt = db.prepare('INSERT INTO integrations VALUES (?, ?, ?, ?, ?, ?, ?)');
      for (const item of store.integrations || []) integrationStmt.run(item.id, item.tenantId, item.provider, item.environment, item.status, item.lastSyncAt || null, JSON.stringify(item.config || {}));
      const settingStmt = db.prepare('INSERT INTO clinic_settings VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      for (const item of store.settings || []) settingStmt.run(item.tenantId, item.clinicName, item.phone || null, item.timezone, item.aiName, item.greeting, item.reminderStart, item.reminderEnd);
      const auditStmt = db.prepare('INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const item of store.auditLogs || []) auditStmt.run(item.id, item.tenantId, item.action, item.subjectId || null, item.before == null ? null : JSON.stringify(item.before), item.after == null ? null : JSON.stringify(item.after), item.reason, item.correlationId, item.at);
      const webhookStmt = db.prepare('INSERT INTO webhook_events VALUES (?, ?, ?, ?, ?, ?)');
      for (const item of store.webhookEvents || []) webhookStmt.run(item.id, item.tenantId, item.eventId, item.type, item.receivedAt, item.processedAt);
      const idempotencyStmt = db.prepare('INSERT INTO idempotency VALUES (?, ?)');
      for (const [key, value] of Object.entries(store.idempotency || {})) idempotencyStmt.run(key, JSON.stringify(value));
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
  };

  const read = () => {
    const patients = db.prepare('SELECT id, tenant_id, name, phone, email, archived, created_at, updated_at FROM patients').all().map(row => ({ id: row.id, tenantId: row.tenant_id, name: row.name, phone: row.phone, email: row.email, archived: Boolean(row.archived), createdAt: row.created_at, updatedAt: row.updated_at }));
    const conversations = db.prepare('SELECT * FROM conversations').all().map(row => ({ id: row.id, tenantId: row.tenant_id, patientId: row.patient_id, patient: row.patient_name, appointmentId: row.appointment_id, channel: row.channel, status: row.status, humanTakeover: Boolean(row.human_takeover), updatedAt: row.updated_at, messages: db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at').all(row.id).map(message => ({ id: message.id, direction: message.direction, sender: message.sender, content: message.content, createdAt: message.created_at, internal: Boolean(message.internal) })) }));
    return {
      tenants: db.prepare('SELECT * FROM tenants').all().map(row => ({ id: row.id, name: row.name, status: row.status, timezone: row.timezone })),
      users: db.prepare('SELECT * FROM users').all().map(row => ({ id: row.id, tenantId: row.tenant_id, name: row.name, email: row.email, role: row.role, active: Boolean(row.active) })),
      sessions: Object.fromEntries(db.prepare('SELECT * FROM sessions').all().map(row => [row.id, { userId: row.user_id, expiresAt: row.expires_at }])),
      patients,
      units: db.prepare('SELECT * FROM units').all().map(row => ({ id: row.id, tenantId: row.tenant_id, name: row.name, address: row.address, phone: row.phone, active: Boolean(row.active), createdAt: row.created_at, updatedAt: row.updated_at })),
      professionals: db.prepare('SELECT * FROM professionals').all().map(row => ({ id: row.id, tenantId: row.tenant_id, name: row.name, specialty: row.specialty, registration: row.registration, phone: row.phone, email: row.email, role: row.role, education: row.education, active: Boolean(row.active), createdAt: row.created_at, updatedAt: row.updated_at })),
      appointments: db.prepare('SELECT * FROM appointments').all().map(row => ({ id: row.id, tenantId: row.tenant_id, patientId: row.patient_id, patient: row.patient_name, doctor: row.doctor, date: row.date, start: row.start, duration: row.duration, status: row.status, version: row.version, externalId: row.external_id, externalUpdatedAt: row.external_updated_at, professionalId: row.professional_id, unitId: row.unit_id })),
      conversations,
      automationRules: db.prepare('SELECT * FROM automation_rules').all().map(row => ({ id: row.id, tenantId: row.tenant_id, name: row.name, active: Boolean(row.active), executionsToday: row.executions_today, triggerHours: row.trigger_hours, conditionStatus: row.condition_status, actionType: row.action_type })),
      integrations: db.prepare('SELECT * FROM integrations').all().map(row => ({ id: row.id, tenantId: row.tenant_id, provider: row.provider, environment: row.environment, status: row.status, lastSyncAt: row.last_sync_at, config: JSON.parse(row.config_json || '{}') })),
      settings: db.prepare('SELECT * FROM clinic_settings').all().map(row => ({ tenantId: row.tenant_id, clinicName: row.clinic_name, phone: row.phone, timezone: row.timezone, aiName: row.ai_name, greeting: row.greeting, reminderStart: row.reminder_start, reminderEnd: row.reminder_end })),
      auditLogs: db.prepare('SELECT * FROM audit_logs ORDER BY at').all().map(row => ({ id: row.id, tenantId: row.tenant_id, action: row.action, subjectId: row.subject_id, before: row.before_json ? JSON.parse(row.before_json) : null, after: row.after_json ? JSON.parse(row.after_json) : null, reason: row.reason, correlationId: row.correlation_id, at: row.at })),
      webhookEvents: db.prepare('SELECT * FROM webhook_events').all().map(row => ({ id: row.id, tenantId: row.tenant_id, eventId: row.event_id, type: row.type, receivedAt: row.received_at, processedAt: row.processed_at })),
      idempotency: Object.fromEntries(db.prepare('SELECT * FROM idempotency').all().map(row => [row.key, JSON.parse(row.response_json)]))
    };
  };

  if (db.prepare('SELECT COUNT(*) AS count FROM tenants').get().count === 0) write(clone(seed));
  return { read, write, close: () => db.close(), path: databasePath };
}

module.exports = { createDatabaseStore, migrations };
