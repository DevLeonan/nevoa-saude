const icons = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
  message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.5-.7L4 20l1.5-4A7.1 7.1 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.3 3.3 2.7 17a2 2 0 0 0 1.75 3h15.1a2 2 0 0 0 1.75-3L13.7 3.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m13 2-9 12h7l-1 8 10-13h-7V2Z"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"/><path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18"/><path d="m7 16 4-5 3 3 5-7"/></svg>',
  team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6M21 21v-2a6 6 0 0 0-3-5.2"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.06.06-2.1 2.1-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65v.1h-3v-.1a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-2 .36l-.06.06-2.1-2.1.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.1h-.1v-3h.1A1.8 1.8 0 0 0 6.7 9a1.8 1.8 0 0 0-.36-2l-.06-.06 2.1-2.1.06.06a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.1-1.65v-.1h3v.1A1.8 1.8 0 0 0 15.6 5.3a1.8 1.8 0 0 0 2-.36l.06-.06 2.1 2.1-.06-.06a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.65 1.1h.1v3h-.1A1.8 1.8 0 0 0 19.4 15Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="m22 2-11 11"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  audit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12h6M9 16h6M9 8h6"/><path d="M5 3h14a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-4-2V5a2 2 0 0 1 2-2Z"/></svg>'
};

const state = {
  user: null,
  settings: null,
  agendaDate: localDate(),
  agendaDoctor: '',
  agendaStatus: '',
  agendaQuery: '',
  patientPage: 1,
  patientQuery: '',
  selectedConversationId: null,
  selectedConversation: null,
  conversationStatus: 'OPEN',
  conversationQuery: '',
  auditLogs: [],
  reports: null,
  team: [],
  automations: [],
  integrations: []
};

const toast = document.querySelector('.toast');
let toastTimer;
let searchTimer;

function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icons[element.dataset.icon] || ''; });
}

function localDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return `${parts.find(item => item.type === 'year').value}-${parts.find(item => item.type === 'month').value}-${parts.find(item => item.type === 'day').value}`;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);
}

function escapeAttr(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function initials(value = '') {
  return String(value).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '—';
}

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

async function api(endpoint, options = {}) {
  const { headers = {}, ...rest } = options;
  const requestHeaders = { accept: 'application/json', ...headers };
  if (rest.body !== undefined) requestHeaders['content-type'] = 'application/json';
  if (rest.method && rest.method !== 'GET' && !requestHeaders['idempotency-key']) requestHeaders['idempotency-key'] = crypto.randomUUID();
  const response = await fetch(`/api${endpoint}`, { credentials: 'same-origin', ...rest, headers: requestHeaders });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw new Error(data?.error?.message || `A operação falhou (${response.status}).`);
  return data;
}

async function bootstrapSession() {
  const existing = await fetch('/api/auth/me', { credentials: 'same-origin' });
  if (existing.ok) return existing.json();
  const local = await fetch('/api/auth/dev-session', { method: 'POST', credentials: 'same-origin' });
  if (local.ok) return local.json();
  return new Promise((resolve, reject) => {
    const dialog = document.querySelector('#loginDialog'); const form = document.querySelector('#loginForm'); const feedback = document.querySelector('#loginFeedback');
    dialog.showModal(); form.onsubmit = async event => { event.preventDefault(); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true, 'Entrando…'); feedback.textContent = '';
      try { const values = Object.fromEntries(new FormData(form)); const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) }); const data = await response.json(); if (!response.ok) throw new Error(data?.error?.message || 'Não foi possível entrar.'); dialog.close(); resolve(data); }
      catch (error) { feedback.textContent = error.message; } finally { setBusy(submit, false); }
    };
  });
}

function statusLabel(status) {
  return ({ SCHEDULED: 'Agendada', CONFIRMED: 'Confirmada', AWAITING_PATIENT_RESPONSE: 'Aguardando resposta', RESCHEDULE_REQUESTED: 'Remarcação solicitada', RESCHEDULED: 'Remarcada', CANCELLATION_REQUESTED: 'Cancelamento solicitado', CANCELLED: 'Cancelada', COMPLETED: 'Concluída', REQUIRES_HUMAN: 'Requer atendimento humano', OPEN: 'Aberta', RESOLVED: 'Resolvida' })[status] || status || 'Sem status';
}

function statusClass(status) {
  return ({ CONFIRMED: 'green', AWAITING_PATIENT_RESPONSE: 'yellow', RESCHEDULE_REQUESTED: 'lilac', RESCHEDULED: 'blue', CANCELLATION_REQUESTED: 'coral', CANCELLED: 'muted', COMPLETED: 'green' })[status] || 'blue';
}

function timeAgo(value) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return 'data desconhecida';
  const seconds = Math.max(0, Math.floor((Date.now() - parsed) / 1000));
  if (seconds < 60) return 'agora';
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)} h`;
  return new Intl.DateTimeFormat('pt-BR').format(new Date(parsed));
}

function formatDate(value, options = { dateStyle: 'short' }) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: value.length === 10 ? 'UTC' : undefined }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
}

function emptyState(message, detail = '') {
  return `<div class="empty-state"><strong>${escapeHtml(message)}</strong>${detail ? `<p>${escapeHtml(detail)}</p>` : ''}</div>`;
}

function setBusy(button, busy, busyText = 'Salvando…') {
  if (!button) return;
  if (busy) { button.dataset.originalText = button.textContent; button.textContent = busyText; }
  else if (button.dataset.originalText) button.textContent = button.dataset.originalText;
  button.disabled = busy;
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(filename, headers, rows) {
  const csv = `\uFEFF${[headers, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

const loaders = {
  dashboard: loadDashboard,
  agenda: loadAgenda,
  conversas: loadConversations,
  pacientes: loadPatients,
  pendencias: loadPending,
  automacoes: loadAutomations,
  integracoes: loadIntegrations,
  relatorios: loadReports,
  equipe: loadTeam,
  auditoria: loadAuditLogs,
  configuracoes: loadSettings
};

async function go(route, updateHistory = true) {
  if (!document.getElementById(route)) route = 'dashboard';
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('active-page', page.id === route));
  document.querySelectorAll('[data-route]').forEach(link => link.classList.toggle('active', link.dataset.route === route));
  if (updateHistory && location.hash !== `#${route}`) history.pushState({ route }, '', `#${route}`);
  document.querySelector('.sidebar').classList.remove('open');
  window.scrollTo(0, 0);
  try { await loaders[route]?.(); } catch (error) { showToast(error.message, 'error'); }
}

function updateShell() {
  const name = state.user?.name || 'Usuário';
  const settings = state.settings || {};
  document.querySelector('#activeClinicName').textContent = settings.clinicName || 'Clínica local';
  document.querySelector('#dashboardContext').textContent = `OPERAÇÃO · ${String(settings.clinicName || 'CLÍNICA LOCAL').toUpperCase()}`;
  document.querySelector('#dashboardGreeting').textContent = `${new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, ${name}.`;
  document.querySelector('#profileInitials').textContent = initials(name);
  document.querySelector('#currentDate').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

async function loadHealth() {
  try {
    const health = await api('/health');
    document.querySelector('#systemStatus').innerHTML = '<span class="pulse"></span> Núcleo local operacional';
    document.querySelector('#healthTitle').textContent = 'Núcleo local operacional';
    document.querySelector('#healthList').innerHTML = `<span><i class="healthy"></i>Base de dados: ${escapeHtml(health.storage)}</span><span><i class="neutral-health"></i>Canal externo: requer credenciais</span>`;
  } catch (error) {
    document.querySelector('#systemStatus').innerHTML = '<span class="pulse offline"></span> Serviço indisponível';
    document.querySelector('#healthTitle').textContent = 'Serviço indisponível';
    document.querySelector('#healthList').innerHTML = `<span><i class="unhealthy"></i>${escapeHtml(error.message)}</span>`;
  }
}

async function loadDashboard() {
  const attention = document.querySelector('#dashboardAttention');
  const activity = document.querySelector('#dashboardActivity');
  attention.innerHTML = '<p class="live-empty">Carregando pendências…</p>';
  activity.innerHTML = '<p class="live-empty">Carregando atividade…</p>';
  try {
    const [data, appointments] = await Promise.all([api('/dashboard'), api('/appointments')]);
    state.agendaDate = data.date || state.agendaDate;
    document.querySelector('#appointmentsToday').textContent = data.appointmentsToday;
    document.querySelector('#confirmedToday').textContent = data.confirmed;
    document.querySelector('#waitingToday').textContent = data.waiting;
    document.querySelector('#aiRate').textContent = data.aiResolutionRate == null ? '—' : `${data.aiResolutionRate}%`;
    const rate = data.appointmentsToday ? Math.round(data.confirmed / data.appointmentsToday * 100) : 0;
    document.querySelector('#confirmedProgress').style.width = `${rate}%`;
    document.querySelector('#confirmedRate').textContent = `${rate}% da agenda de hoje`;
    document.querySelector('#appointmentsTrend').textContent = `${data.cancelled} cancelada(s) · ${data.rescheduled} remarcada(s)`;
    document.querySelector('#attentionCount').textContent = `${data.attention.length} item(ns) requerem atenção`;
    document.querySelector('#aiResolvedCount').textContent = data.aiResolutionRate == null ? 'Nenhuma conversa resolvida ainda' : `${data.aiResolved} resolvida(s) sem intervenção`;
    document.querySelector('#aiCardTitle').textContent = data.humanConversations ? `${data.humanConversations} conversa(s) precisam de você` : 'Nenhuma conversa aguardando humano';
    document.querySelector('#aiCardText').textContent = `${data.openConversations} conversa(s) aberta(s) · ${data.aiResolved} resolvida(s) pela automação local.`;
    document.querySelector('#agendaBadge').textContent = data.appointmentsToday;
    document.querySelector('#conversationsBadge').textContent = data.openConversations;
    document.querySelector('#notificationButton b').hidden = !data.attention.length;
    attention.innerHTML = data.attention.map(item => `<div class="attention-row"><span class="status-dot ${item.type === 'INTEGRATION' ? 'red-dot' : 'orange-dot'}"></span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></div><button class="row-action" type="button" data-dashboard-target="${item.type === 'CONVERSATION' ? 'conversas' : item.type === 'INTEGRATION' ? 'integracoes' : 'agenda'}">Abrir</button></div>`).join('') || emptyState('Nenhuma pendência', 'A operação não possui itens aguardando ação.');
    attention.querySelectorAll('[data-dashboard-target]').forEach(button => button.addEventListener('click', () => go(button.dataset.dashboardTarget)));
    activity.innerHTML = data.activities.map(item => `<div class="activity"><span class="activity-icon ${item.action.includes('appointment') ? 'green' : item.action.includes('ai') ? 'violet' : 'blue'}">${item.action.includes('appointment') ? '✓' : '•'}</span><p><strong>${escapeHtml(item.action.replaceAll('.', ' · '))}</strong><br><span>${escapeHtml(item.reason)} · ${escapeHtml(timeAgo(item.at))}</span></p></div>`).join('') || emptyState('Nenhuma atividade registrada');
    const max = Math.max(1, ...data.confirmationSeries.map(item => item.total));
    document.querySelectorAll('.chart-bars span').forEach((bar, index) => { const item = data.confirmationSeries[index]; bar.style.height = `${item ? Math.max(5, Math.round(item.confirmed / max * 100)) : 5}%`; bar.title = item ? `${item.confirmed} confirmada(s) de ${item.total}` : 'Sem dados'; });
    document.querySelectorAll('.chart-days span').forEach((label, index) => { const item = data.confirmationSeries[index]; label.textContent = item ? new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${item.date}T12:00:00Z`)).replace('.', '') : '—'; });
    document.querySelector('.rate strong').textContent = `${rate}%`;
    document.querySelector('.rate .trend').textContent = `${data.confirmed}/${data.appointmentsToday}`;
    document.querySelector('.rate small').textContent = 'confirmações de hoje';
    renderDashboardSchedule(appointments, data.date);
  } catch (error) {
    document.querySelectorAll('#appointmentsToday,#confirmedToday,#waitingToday,#aiRate').forEach(item => { item.textContent = '—'; });
    attention.innerHTML = emptyState('Indicadores indisponíveis', error.message);
    activity.innerHTML = emptyState('Atividade indisponível');
    showToast('Não foi possível atualizar o painel.', 'error');
  }
}

function renderDashboardSchedule(appointments, today) {
  const card = document.querySelector('.schedule-card');
  card.querySelectorAll('.time-block,.live-empty,.empty-state').forEach(row => row.remove());
  const current = appointments.filter(item => item.status !== 'CANCELLED' && item.date >= today).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).slice(0, 5);
  if (!current.length) { card.insertAdjacentHTML('beforeend', emptyState('Nenhuma consulta futura cadastrada')); return; }
  current.forEach((appointment, index) => {
    const row = document.createElement('button');
    row.type = 'button'; row.className = `time-block dashboard-appointment ${index === current.length - 1 ? 'last' : ''}`; row.dataset.appointmentId = appointment.id;
    row.innerHTML = `<time>${appointment.start}</time><span class="appointment appointment-${statusClass(appointment.status)}"><span class="avatar">${initials(appointment.patient)}</span><span><strong>${escapeHtml(appointment.patient)}</strong><span>${escapeHtml(appointment.doctor)} · ${formatDate(appointment.date)}</span></span><b>${escapeHtml(statusLabel(appointment.status))}</b></span>`;
    row.addEventListener('click', () => openAppointmentAction(appointment.id));
    card.append(row);
  });
}

function changeAgendaDate(days) {
  const date = new Date(`${state.agendaDate}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); state.agendaDate = date.toISOString().slice(0, 10); loadAgenda();
}

async function loadAgenda() {
  const columns = [...document.querySelectorAll('.doctor-column')];
  columns.forEach(column => column.querySelectorAll('.cal-event,.agenda-empty').forEach(event => event.remove()));
  (columns[0] || document.body).insertAdjacentHTML('beforeend', '<p class="agenda-empty">Carregando agenda…</p>');
  const query = new URLSearchParams({ date: state.agendaDate });
  if (state.agendaDoctor) query.set('doctor', state.agendaDoctor);
  if (state.agendaStatus) query.set('status', state.agendaStatus);
  if (state.agendaQuery) query.set('q', state.agendaQuery);
  try {
    const appointments = await api(`/appointments?${query}`);
    document.querySelector('.agenda-date strong').textContent = formatDate(state.agendaDate, { dateStyle: 'long' });
    document.querySelector('#agendaDoctorFilter').value = state.agendaDoctor;
    columns.forEach(column => {
      column.querySelectorAll('.cal-event,.agenda-empty').forEach(event => event.remove());
      const matches = !state.agendaDoctor || column.querySelector('.doctor-header strong')?.textContent === state.agendaDoctor;
      column.hidden = !matches; column.classList.toggle('mobile-selected', matches && Boolean(state.agendaDoctor));
    });
    document.querySelector('.calendar-grid').classList.toggle('single-doctor', Boolean(state.agendaDoctor));
    appointments.forEach(appointment => {
      const column = columns.find(item => item.querySelector('.doctor-header strong')?.textContent === appointment.doctor); if (!column) return;
      const [hour, minute] = appointment.start.split(':').map(Number); const top = 58 + (hour - 8) * 60 + Math.round(minute / 60 * 60);
      const item = document.createElement('button'); item.type = 'button'; item.dataset.appointmentId = appointment.id; item.className = `cal-event ${statusClass(appointment.status)}`; item.style.top = `${top}px`; item.style.height = `${Math.max(38, Math.round(appointment.duration / 60 * 60))}px`; item.innerHTML = `${escapeHtml(appointment.start)} · ${escapeHtml(appointment.patient)}<small>${escapeHtml(statusLabel(appointment.status))}</small>`; column.append(item);
    });
    if (!appointments.length) (columns.find(column => !column.hidden) || columns[0]).insertAdjacentHTML('beforeend', '<p class="agenda-empty">Nenhuma consulta para os filtros atuais.</p>');
  } catch (error) {
    columns.forEach(column => column.querySelectorAll('.cal-event,.agenda-empty').forEach(event => event.remove()));
    columns[0].insertAdjacentHTML('beforeend', `<p class="agenda-empty error-text">${escapeHtml(error.message)}</p>`);
  }
}

async function loadPatientSuggestions() {
  try {
    const data = await api('/patients?page=1&pageSize=50');
    document.querySelector('#patientSuggestions').innerHTML = data.items.map(patient => `<option value="${escapeAttr(patient.name)}"></option>`).join('');
  } catch { document.querySelector('#patientSuggestions').replaceChildren(); }
}

async function openAppointmentDialog(date = state.agendaDate) {
  const form = document.querySelector('#appointmentForm'); form.reset(); form.elements.date.value = date || localDate();
  document.querySelector('#appointmentDialog').showModal();
  await Promise.all([refreshAvailableSlots(), loadPatientSuggestions()]);
}

async function refreshAvailableSlots() {
  const form = document.querySelector('#appointmentForm'); const select = form.elements.start; const hint = document.querySelector('#slotHint'); const submit = form.querySelector('[type="submit"]'); const doctor = form.elements.doctor.value; const date = form.elements.date.value;
  if (!date) { hint.textContent = 'Informe uma data.'; return; }
  select.disabled = true; submit.disabled = true; hint.classList.remove('error'); hint.textContent = 'Consultando horários disponíveis…';
  try {
    const data = await api(`/slots?doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}&duration=45`);
    select.replaceChildren();
    if (!data.slots.length) { select.add(new Option('Nenhum horário disponível', '')); hint.textContent = 'Não há horários disponíveis para essa combinação.'; hint.classList.add('error'); return; }
    data.slots.forEach(slot => select.add(new Option(slot, slot))); select.disabled = false; submit.disabled = false; hint.textContent = `${data.slots.length} horário(s). A disponibilidade será revalidada ao confirmar.`;
  } catch (error) { select.replaceChildren(new Option('Consulta indisponível', '')); hint.textContent = error.message; hint.classList.add('error'); }
}

async function openAppointmentAction(appointmentId) {
  try {
    const appointment = await api(`/appointments/${appointmentId}`); const form = document.querySelector('#appointmentActionForm');
    for (const field of ['id', 'version', 'patient', 'doctor', 'date', 'start', 'duration']) form.elements[field].value = appointment[field];
    document.querySelector('#appointmentActionTitle').textContent = appointment.patient; document.querySelector('#appointmentActionStatus').textContent = statusLabel(appointment.status);
    const inactive = ['CANCELLED', 'COMPLETED'].includes(appointment.status); form.querySelector('[data-confirm-appointment]').disabled = inactive || appointment.status === 'CONFIRMED'; form.querySelector('[data-reschedule-appointment]').disabled = inactive; form.querySelector('[data-cancel-appointment]').disabled = inactive;
    document.querySelector('#appointmentActionDialog').showModal();
  } catch (error) { showToast(error.message, 'error'); }
}

async function refreshAppointmentViews(message) {
  document.querySelector('#appointmentActionDialog').close(); showToast(message, 'success');
  await Promise.all([loadDashboard(), loadAgenda()]);
  if (document.querySelector('#pendencias').classList.contains('active-page')) await loadPending();
}

async function loadPatients() {
  const page = document.querySelector('#pacientes'); page.innerHTML = '<p class="audit-loading">Carregando pacientes…</p>';
  try {
    const data = await api(`/patients?q=${encodeURIComponent(state.patientQuery)}&page=${state.patientPage}&pageSize=8`);
    const rows = data.items.map(item => `<div class="data-row" data-patient-id="${escapeAttr(item.id)}"><span class="avatar">${initials(item.name)}</span><div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.phone || item.email || 'Sem contato')} · ${item.appointments} consulta(s)</small></div><time>${item.lastAppointment ? `Última: ${formatDate(item.lastAppointment)}` : 'Sem consulta'}</time><button class="row-action" type="button" data-view-patient>Ver</button><button class="row-action" type="button" data-edit-patient>Editar</button><button class="row-action danger" type="button" data-archive-patient>Arquivar</button></div>`).join('');
    page.innerHTML = `<div class="page-heading compact"><div><p class="eyebrow">CADASTRO</p><h1>Pacientes</h1><p class="subtitle">Cadastro persistido, busca e histórico de consultas.</p></div><button class="primary-button" type="button" data-new-patient><i data-icon="plus"></i>Novo paciente</button></div><div class="patient-toolbar"><div class="search-box"><i data-icon="search"></i><input value="${escapeAttr(state.patientQuery)}" placeholder="Buscar por nome, telefone ou e-mail" aria-label="Buscar pacientes"></div><span>${data.pagination.total} paciente(s)</span></div><article class="panel data-panel">${rows || emptyState('Nenhum paciente encontrado')}</article><div class="pagination"><button class="outline-button" type="button" data-patient-prev ${data.pagination.page <= 1 ? 'disabled' : ''}>← Anterior</button><span>Página ${data.pagination.page} de ${data.pagination.pages}</span><button class="outline-button" type="button" data-patient-next ${data.pagination.page >= data.pagination.pages ? 'disabled' : ''}>Próxima →</button></div>`;
    renderIcons(page);
    page.querySelector('[data-new-patient]').addEventListener('click', () => openPatientDialog());
    page.querySelector('.search-box input').addEventListener('input', event => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.patientQuery = event.target.value.trim(); state.patientPage = 1; loadPatients(); }, 300); });
    page.querySelector('[data-patient-prev]').addEventListener('click', () => { state.patientPage -= 1; loadPatients(); }); page.querySelector('[data-patient-next]').addEventListener('click', () => { state.patientPage += 1; loadPatients(); });
    page.querySelectorAll('[data-view-patient]').forEach(button => button.addEventListener('click', event => openPatientProfile(event.target.closest('[data-patient-id]').dataset.patientId)));
    page.querySelectorAll('[data-edit-patient]').forEach(button => button.addEventListener('click', async event => { try { openPatientDialog(await api(`/patients/${event.target.closest('[data-patient-id]').dataset.patientId}`)); } catch (error) { showToast(error.message, 'error'); } }));
    page.querySelectorAll('[data-archive-patient]').forEach(button => button.addEventListener('click', async event => { if (!confirm('Arquivar este paciente? O histórico será preservado.')) return; try { await api(`/patients/${event.target.closest('[data-patient-id]').dataset.patientId}/archive`, { method: 'POST', body: '{}' }); showToast('Paciente arquivado.', 'success'); await loadPatients(); } catch (error) { showToast(error.message, 'error'); } }));
  } catch (error) { page.innerHTML = emptyState('Não foi possível carregar pacientes', error.message); }
}

function openPatientDialog(patient = null) {
  const form = document.querySelector('#patientForm'); form.reset(); form.elements.id.value = patient?.id || ''; form.elements.name.value = patient?.name || ''; form.elements.phone.value = patient?.phone || ''; form.elements.email.value = patient?.email || ''; document.querySelector('#patientDialogTitle').textContent = patient ? 'Editar paciente' : 'Novo paciente'; document.querySelector('#patientDialog').showModal();
}

async function openPatientProfile(patientId) {
  const dialog = document.querySelector('#patientProfileDialog'); const content = document.querySelector('#patientProfileContent'); content.innerHTML = '<p class="live-empty">Carregando histórico…</p>'; dialog.showModal();
  try {
    const patient = await api(`/patients/${patientId}`); const appointments = (await api(`/appointments?q=${encodeURIComponent(patient.name)}`)).filter(item => item.patientId === patient.id);
    document.querySelector('#patientProfileTitle').textContent = patient.name;
    content.innerHTML = `<div class="profile-summary"><span><small>Telefone</small><strong>${escapeHtml(patient.phone || 'Não informado')}</strong></span><span><small>E-mail</small><strong>${escapeHtml(patient.email || 'Não informado')}</strong></span><span><small>Cadastro</small><strong>${formatDate(patient.createdAt)}</strong></span></div><h3>Histórico de consultas</h3><div class="profile-history">${appointments.map(item => `<button type="button" data-profile-appointment="${escapeAttr(item.id)}"><span><strong>${formatDate(item.date)} · ${escapeHtml(item.start)}</strong><small>${escapeHtml(item.doctor)}</small></span><em>${escapeHtml(statusLabel(item.status))}</em></button>`).join('') || emptyState('Nenhuma consulta vinculada')}</div><div class="dialog-actions"><button class="outline-button" type="button" data-profile-edit>Editar cadastro</button></div>`;
    content.querySelectorAll('[data-profile-appointment]').forEach(button => button.addEventListener('click', () => { dialog.close(); openAppointmentAction(button.dataset.profileAppointment); })); content.querySelector('[data-profile-edit]').addEventListener('click', () => { dialog.close(); openPatientDialog(patient); });
  } catch (error) { content.innerHTML = emptyState('Perfil indisponível', error.message); }
}

async function loadPending() {
  const page = document.querySelector('#pendencias'); page.innerHTML = '<p class="audit-loading">Carregando pendências…</p>';
  try {
    const data = await api('/pending');
    const appointments = data.appointments.map(item => `<div class="data-row"><span class="status-dot orange-dot"></span><div><strong>${escapeHtml(item.patient)}</strong><small>${escapeHtml(statusLabel(item.status))} · ${escapeHtml(item.doctor)}</small></div><time>${formatDate(item.date)} ${escapeHtml(item.start)}</time><button class="row-action" type="button" data-open-appointment="${escapeAttr(item.id)}">Tratar</button></div>`);
    const conversations = data.conversations.map(item => `<div class="data-row"><span class="status-dot red-dot"></span><div><strong>${escapeHtml(item.patient)}</strong><small>Atendimento humano solicitado</small></div><time>Conversa aberta</time><button class="row-action" type="button" data-open-conversation="${escapeAttr(item.id)}">Abrir</button></div>`);
    page.innerHTML = `<div class="page-heading compact"><div><p class="eyebrow">FILA HUMANA</p><h1>Pendências</h1><p class="subtitle">Itens reais que dependem de uma decisão da equipe.</p></div></div><article class="panel data-panel">${[...appointments, ...conversations].join('') || emptyState('Nenhuma pendência', 'A fila humana está vazia.')}</article>`;
    page.querySelectorAll('[data-open-appointment]').forEach(button => button.addEventListener('click', () => openAppointmentAction(button.dataset.openAppointment)));
    page.querySelectorAll('[data-open-conversation]').forEach(button => button.addEventListener('click', async () => { state.selectedConversationId = button.dataset.openConversation; await go('conversas'); }));
  } catch (error) { page.innerHTML = emptyState('Não foi possível carregar pendências', error.message); }
}

function conversationQueryString() {
  const query = new URLSearchParams(); if (state.conversationQuery) query.set('q', state.conversationQuery); if (state.conversationStatus === 'MINE') query.set('ownership', 'mine'); else if (state.conversationStatus) query.set('status', state.conversationStatus); return query.toString();
}

async function loadConversations() {
  const container = document.querySelector('#conversationItems'); container.innerHTML = '<p class="live-empty">Carregando conversas…</p>';
  try {
    const conversations = await api(`/conversations?${conversationQueryString()}`);
    const openCount = state.conversationStatus === 'OPEN' && !state.conversationQuery ? conversations.length : (await api('/conversations?status=OPEN')).length;
    document.querySelector('#conversationTabs [data-status="OPEN"] b').textContent = openCount;
    container.innerHTML = conversations.map(conversation => `<button class="conversation ${conversation.id === state.selectedConversationId ? 'selected' : ''}" type="button" data-conversation-id="${escapeAttr(conversation.id)}"><span class="avatar">${initials(conversation.patient)}</span><span><strong>${escapeHtml(conversation.patient)}</strong><small>${escapeHtml(conversation.lastMessage || 'Sem mensagens')}</small></span><em>${escapeHtml(timeAgo(conversation.updatedAt))}</em></button>`).join('') || emptyState('Nenhuma conversa encontrada');
    if (!conversations.some(item => item.id === state.selectedConversationId)) state.selectedConversationId = conversations[0]?.id || null;
    if (state.selectedConversationId) await loadConversation(state.selectedConversationId); else resetConversationView();
  } catch (error) { container.innerHTML = emptyState('Conversas indisponíveis', error.message); resetConversationView(); }
}

function resetConversationView() {
  state.selectedConversation = null; document.querySelector('.message-area').innerHTML = emptyState('Selecione uma conversa'); document.querySelector('.chat-header strong').textContent = 'Nenhuma conversa selecionada'; document.querySelector('.composer input').disabled = true; document.querySelector('.send-button').disabled = true; document.querySelector('.takeover').disabled = true; document.querySelector('#conversationResolve').disabled = true;
}

function renderMessage(message) {
  const element = document.createElement('div'); const internal = Boolean(message.internal); element.className = internal ? 'internal-note' : `bubble ${message.direction === 'INBOUND' ? 'incoming' : 'outgoing'}`;
  const createdAt = formatDate(message.createdAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  element.innerHTML = internal ? `<strong>Nota interna · ${escapeHtml(message.sender || 'EQUIPE')}</strong><p>${escapeHtml(message.content).replaceAll('\n', '<br>')}</p><time>${escapeHtml(createdAt)}</time>` : `${escapeHtml(message.content).replaceAll('\n', '<br>')}<time>${escapeHtml(message.sender || '')} · ${escapeHtml(createdAt)} · salvo localmente</time>`;
  return element;
}

async function loadConversation(conversationId) {
  const conversation = await api(`/conversations/${conversationId}`); state.selectedConversationId = conversationId; state.selectedConversation = conversation;
  const area = document.querySelector('.message-area'); area.replaceChildren();
  if (!conversation.messages.length) area.innerHTML = emptyState('Ainda não há mensagens', 'Escreva a primeira mensagem ou registre uma nota interna.'); else conversation.messages.forEach(message => area.append(renderMessage(message)));
  area.scrollTop = area.scrollHeight;
  const channel = conversation.channel === 'WHATSAPP' ? 'Histórico WhatsApp não verificado' : conversation.channel === 'LOCAL_SANDBOX' ? 'Sandbox local' : conversation.channel;
  document.querySelector('.chat-header .avatar').textContent = initials(conversation.patient); document.querySelector('.chat-header strong').textContent = conversation.patient; document.querySelector('.chat-header small').textContent = `${channel} · ${statusLabel(conversation.status)} · ${conversation.humanTakeover ? 'equipe' : 'automação local'}`;
  document.querySelectorAll('.conversation').forEach(item => item.classList.toggle('selected', item.dataset.conversationId === conversationId));
  const composerDisabled = conversation.status === 'RESOLVED'; document.querySelector('.composer input').disabled = composerDisabled; document.querySelector('.send-button').disabled = composerDisabled;
  const takeover = document.querySelector('.takeover'); takeover.disabled = false; takeover.textContent = conversation.humanTakeover ? 'Devolver para a automação' : 'Assumir conversa';
  const resolve = document.querySelector('#conversationResolve'); resolve.disabled = false; resolve.dataset.operation = conversation.status === 'RESOLVED' ? 'reopen' : 'resolve'; resolve.title = conversation.status === 'RESOLVED' ? 'Reabrir conversa' : 'Resolver conversa'; resolve.setAttribute('aria-label', resolve.title);
  const patientCard = document.querySelector('.patient-card'); patientCard.querySelector('.avatar').textContent = initials(conversation.patient); patientCard.querySelector('strong').textContent = conversation.patient; patientCard.querySelector('p').textContent = conversation.patientId ? 'Cadastro vinculado' : 'Sem cadastro vinculado'; const profile = document.querySelector('#conversationPatientProfile'); profile.disabled = !conversation.patientId; profile.dataset.patientId = conversation.patientId || '';
  document.querySelector('#conversationContext').textContent = conversation.humanTakeover ? 'A equipe assumiu este atendimento. As respostas automáticas estão pausadas.' : conversation.status === 'RESOLVED' ? 'Atendimento encerrado e preservado no histórico.' : 'Automação local ativa. Não há confirmação de entrega em canal externo.';
  const linked = document.querySelector('#linkedAppointment');
  if (!conversation.appointmentId) linked.innerHTML = '<p>Sem consulta vinculada.</p>'; else {
    try { const appointment = await api(`/appointments/${conversation.appointmentId}`); linked.innerHTML = `<p><strong>${escapeHtml(appointment.doctor)}</strong><br><span>${formatDate(appointment.date)} · ${escapeHtml(appointment.start)}</span><br><em>${escapeHtml(statusLabel(appointment.status))}</em></p><button class="row-action" type="button">Abrir consulta</button>`; linked.querySelector('button').addEventListener('click', () => openAppointmentAction(appointment.id)); }
    catch { linked.innerHTML = '<p>Consulta vinculada não está mais disponível.</p>'; }
  }
}

async function openConversationDialog() {
  const form = document.querySelector('#conversationForm'); form.reset(); const select = form.elements.appointmentId; select.innerHTML = '<option value="">Sem consulta vinculada</option>';
  try { const appointments = await api('/appointments'); appointments.filter(item => !['CANCELLED', 'COMPLETED'].includes(item.status)).forEach(item => select.add(new Option(`${item.patient} · ${formatDate(item.date)} ${item.start}`, item.id))); } catch { /* vínculo opcional */ }
  await loadPatientSuggestions(); document.querySelector('#conversationDialog').showModal();
}

async function loadAutomations() {
  const container = document.querySelector('#automationRules'); container.innerHTML = '<p class="live-empty">Carregando regras…</p>';
  try {
    const [rules, runs] = await Promise.all([api('/automation-rules'), api('/automation-runs')]); state.automations = rules;
    document.querySelector('#activeAutomations').textContent = rules.filter(rule => rule.active).length; document.querySelector('#automationExecutions').textContent = runs.length; document.querySelector('#lastAutomationRun').textContent = runs[0]?.at ? timeAgo(runs[0].at) : 'Nenhuma';
    container.innerHTML = rules.map(rule => `<div class="rule" data-rule-id="${escapeAttr(rule.id)}"><span class="rule-icon">${rule.actionType === 'FLAG_HUMAN' ? '!' : rule.actionType === 'REQUEST_CONFIRMATION' ? '?' : '⏱'}</span><div><strong>${escapeHtml(rule.name)}</strong><p>${escapeHtml(ruleDescription(rule))}</p><span class="rule-meta">${rule.active ? 'Ativa' : 'Pausada'} · ${rule.triggerHours}h · ${escapeHtml(statusLabel(rule.conditionStatus))}</span></div><label class="switch" title="Ativar ou pausar"><input type="checkbox" ${rule.active ? 'checked' : ''}><span></span></label><div class="row-actions"><button class="row-action" type="button" data-run-rule>Executar</button><button class="row-action" type="button" data-edit-rule>Editar</button><button class="row-action danger" type="button" data-delete-rule>Excluir</button></div></div>`).join('') || emptyState('Nenhuma automação cadastrada', 'Crie uma regra para executar no sandbox local.');
    document.querySelector('#automationHistory').innerHTML = runs.map(run => { const rule = rules.find(item => item.id === run.ruleId); const executed = run.result?.messagesCreated ?? run.result?.executed ?? 0; return `<div class="history-row"><span class="activity-icon violet">✓</span><div><strong>${escapeHtml(rule?.name || 'Regra removida')}</strong><small>${executed} ação(ões) local(is) · sem entrega externa</small></div><time>${formatDate(run.at, { dateStyle: 'short', timeStyle: 'short' })}</time></div>`; }).join('') || emptyState('Nenhuma execução registrada', 'Use “Executar” em uma regra ativa para testar o motor local.');
    bindAutomationRows(container);
  } catch (error) { container.innerHTML = emptyState('Automações indisponíveis', error.message); document.querySelector('#automationHistory').innerHTML = emptyState('Histórico indisponível', error.message); document.querySelector('#activeAutomations').textContent = '—'; document.querySelector('#automationExecutions').textContent = '—'; }
}

function ruleDescription(rule) {
  return ({ SEND_REMINDER: 'Cria um lembrete persistido na conversa vinculada.', SEND_CONFIRMATION_REQUEST: 'Cria uma solicitação local de confirmação.' })[rule.actionType] || 'Ação local configurada.';
}

function bindAutomationRows(container) {
  container.querySelectorAll('.rule').forEach(row => {
    const id = row.dataset.ruleId; const rule = state.automations.find(item => item.id === id);
    row.querySelector('.switch input').addEventListener('change', async event => { event.target.disabled = true; try { await api(`/automation-rules/${id}`, { method: 'PATCH', body: JSON.stringify({ active: event.target.checked }) }); showToast(event.target.checked ? 'Automação ativada.' : 'Automação pausada.', 'success'); await loadAutomations(); } catch (error) { event.target.checked = !event.target.checked; showToast(error.message, 'error'); } finally { event.target.disabled = false; } });
    row.querySelector('[data-edit-rule]').addEventListener('click', () => openAutomationDialog(rule));
    row.querySelector('[data-run-rule]').addEventListener('click', async event => { setBusy(event.target, true, 'Executando…'); try { const result = await api(`/automation-rules/${id}/run`, { method: 'POST', body: '{}' }); showToast(`Execução concluída: ${result.executed ?? result.matched ?? 0} ação(ões).`, 'success'); await Promise.all([loadAutomations(), loadDashboard()]); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(event.target, false); } });
    row.querySelector('[data-delete-rule]').addEventListener('click', async () => { if (!confirm(`Excluir a automação “${rule.name}”?`)) return; try { await api(`/automation-rules/${id}`, { method: 'DELETE' }); showToast('Automação excluída.', 'success'); await loadAutomations(); } catch (error) { showToast(error.message, 'error'); } });
  });
}

function openAutomationDialog(rule = null) {
  const form = document.querySelector('#automationForm'); form.reset(); form.elements.id.value = rule?.id || ''; form.elements.name.value = rule?.name || ''; form.elements.triggerHours.value = rule?.triggerHours ?? 24; form.elements.conditionStatus.value = rule?.conditionStatus || 'SCHEDULED'; form.elements.actionType.value = rule?.actionType || 'SEND_REMINDER'; form.elements.active.checked = rule?.active ?? true; document.querySelector('#automationDialogTitle').textContent = rule ? 'Editar automação' : 'Nova automação'; document.querySelector('#automationDialog').showModal();
}

async function loadIntegrations() {
  const grid = document.querySelector('#integrationGrid'); grid.innerHTML = '<p class="live-empty">Carregando integrações…</p>';
  try {
    state.integrations = await api('/integrations');
    grid.innerHTML = state.integrations.map(item => `<article class="integration-card panel" data-integration-id="${escapeAttr(item.id)}"><div class="integration-top"><span class="integration-logo">↔</span><span class="connection-status status-${escapeAttr(String(item.status).toLowerCase())}"><i></i>${escapeHtml(item.status === 'SANDBOX' ? 'Sandbox local' : item.status)}</span></div><h3>${escapeHtml(item.config?.name || item.provider)}</h3><p>${escapeHtml(item.environment)} · ${item.status === 'DISCONNECTED' ? 'desativada' : 'sem canal externo validado'}</p><hr><div class="integration-stats"><span>Última sincronização<strong>${item.lastSyncAt ? formatDate(item.lastSyncAt, { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'}</strong></span><span>Endpoint<strong>${escapeHtml(item.config?.endpoint || 'Não informado')}</strong></span></div><div class="integration-actions"><button class="outline-button" type="button" data-test-integration ${item.status === 'DISCONNECTED' ? 'disabled' : ''}>Testar</button><button class="outline-button" type="button" data-sync-integration ${item.status === 'DISCONNECTED' ? 'disabled' : ''}>Sincronizar</button><button class="outline-button" type="button" data-toggle-integration>${item.status === 'DISCONNECTED' ? 'Reativar' : 'Desativar'}</button></div></article>`).join('') + `<article class="integration-card panel external-blocked"><span class="integration-logo whatsapp">◔</span><h3>WhatsApp Business</h3><p>Não conectado. É necessário um número na Cloud API, aplicativo Meta e credenciais válidas.</p><hr><button class="outline-button" type="button" data-whatsapp-requirements>Ver requisitos</button></article>`;
    grid.querySelectorAll('[data-test-integration]').forEach(button => button.addEventListener('click', () => operateIntegration(button, 'test'))); grid.querySelectorAll('[data-sync-integration]').forEach(button => button.addEventListener('click', () => operateIntegration(button, 'sync'))); grid.querySelectorAll('[data-toggle-integration]').forEach(button => button.addEventListener('click', () => toggleIntegration(button)));
    grid.querySelector('[data-whatsapp-requirements]').addEventListener('click', () => showToast('WhatsApp não foi conectado: informe Phone Number ID, token e webhook oficiais no ambiente do servidor.', 'info'));
    await loadHealth();
  } catch (error) { grid.innerHTML = emptyState('Integrações indisponíveis', error.message); await loadHealth(); }
}

async function operateIntegration(button, operation) {
  const id = button.closest('[data-integration-id]').dataset.integrationId; setBusy(button, true, operation === 'test' ? 'Testando…' : 'Sincronizando…');
  try { const result = await api(`/integrations/${id}/${operation}`, { method: 'POST', body: '{}' }); showToast(result.result?.message || (operation === 'test' ? 'Teste concluído.' : 'Sincronização concluída.'), 'success'); await loadIntegrations(); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(button, false); }
}

async function toggleIntegration(button) {
  const card = button.closest('[data-integration-id]'); const integration = state.integrations.find(item => item.id === card.dataset.integrationId); const status = integration.status === 'DISCONNECTED' ? 'SANDBOX' : 'DISCONNECTED'; setBusy(button, true, 'Salvando…');
  try { await api(`/integrations/${integration.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); showToast(status === 'SANDBOX' ? 'Sandbox reativado.' : 'Sandbox desativado.', 'success'); await loadIntegrations(); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(button, false); }
}

async function loadReports() {
  const page = document.querySelector('#relatorios'); const today = localDate(); const first = `${today.slice(0, 8)}01`; const from = page.dataset.from || first; const to = page.dataset.to || today; page.innerHTML = '<p class="audit-loading">Calculando indicadores…</p>';
  try {
    const data = await api(`/reports?dateFrom=${encodeURIComponent(from)}&dateTo=${encodeURIComponent(to)}`); state.reports = data;
    const metrics = [['Consultas', data.total], ['Confirmadas', data.confirmed], ['Remarcadas', data.rescheduled], ['Canceladas', data.cancelled], ['Aguardando', data.waiting], ['Conversas', data.conversations], ['Resolução automática', data.aiResolutionRate == null ? '—' : `${data.aiResolutionRate}%`]];
    page.innerHTML = `<div class="page-heading compact"><div><p class="eyebrow">INDICADORES CALCULADOS</p><h1>Relatórios</h1><p class="subtitle">Período aplicado diretamente aos dados persistidos.</p></div><button class="outline-button" type="button" data-export-report>Exportar CSV</button></div><form class="report-filters"><label class="inline-field">De<input type="date" name="from" value="${escapeAttr(from)}"></label><label class="inline-field">Até<input type="date" name="to" value="${escapeAttr(to)}"></label><button class="primary-button" type="submit">Aplicar período</button></form><article class="panel data-panel"><div class="report-grid">${metrics.map(([label, value]) => `<div class="report-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div></article>`;
    page.querySelector('.report-filters').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.currentTarget); page.dataset.from = form.get('from'); page.dataset.to = form.get('to'); loadReports(); });
    page.querySelector('[data-export-report]').addEventListener('click', () => downloadCsv(`relatorio-nevoa-${from}-${to}.csv`, ['Indicador', 'Valor'], metrics));
  } catch (error) { page.innerHTML = emptyState('Não foi possível calcular os relatórios', error.message); }
}

async function loadTeam() {
  const page = document.querySelector('#equipe'); page.innerHTML = '<p class="audit-loading">Carregando equipe…</p>';
  try {
    state.team = await api('/team');
    const rows = state.team.map(user => `<div class="data-row" data-user-id="${escapeAttr(user.id)}"><span class="avatar">${initials(user.name)}</span><div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)} · ${escapeHtml(user.role)}</small></div><span class="status-pill ${user.active ? 'active' : 'inactive'}">${user.active ? 'Ativo' : 'Inativo'}</span><button class="row-action" type="button" data-edit-user>Editar</button></div>`).join('');
    page.innerHTML = `<div class="page-heading compact"><div><p class="eyebrow">ACESSOS E PAPÉIS</p><h1>Equipe</h1><p class="subtitle">Membros, funções e estado de acesso persistidos.</p></div><button class="primary-button" type="button" data-new-user><i data-icon="plus"></i>Adicionar membro</button></div><article class="panel data-panel">${rows || emptyState('Nenhum membro cadastrado')}</article>`; renderIcons(page);
    page.querySelector('[data-new-user]').addEventListener('click', () => openTeamDialog()); page.querySelectorAll('[data-edit-user]').forEach(button => button.addEventListener('click', () => openTeamDialog(state.team.find(user => user.id === button.closest('[data-user-id]').dataset.userId))));
  } catch (error) { page.innerHTML = emptyState('Não foi possível carregar a equipe', error.message); }
}

function openTeamDialog(user = null) {
  const form = document.querySelector('#teamForm'); form.reset(); form.elements.id.value = user?.id || ''; form.elements.name.value = user?.name || ''; form.elements.email.value = user?.email || ''; form.elements.role.value = user?.role || 'SECRETARY'; form.elements.active.checked = user?.active ?? true; document.querySelector('#teamDialogTitle').textContent = user ? 'Editar membro' : 'Adicionar membro'; document.querySelector('#teamDialog').showModal();
}

async function loadSettings() {
  const page = document.querySelector('#configuracoes'); page.innerHTML = '<p class="audit-loading">Carregando configurações…</p>';
  try {
    const result = await api('/settings'); const settings = result.settings || result; state.settings = settings;
    page.innerHTML = `<div class="page-heading compact"><div><p class="eyebrow">PREFERÊNCIAS PERSISTIDAS</p><h1>Configurações</h1><p class="subtitle">Dados da clínica e limites da operação local.</p></div></div><form class="panel settings-form" id="settingsForm"><section><h2>Clínica</h2><div class="form-grid"><label>Nome da clínica<input name="clinicName" minlength="2" maxlength="120" value="${escapeAttr(settings.clinicName || '')}" required></label><label>Telefone<input name="phone" value="${escapeAttr(settings.phone || '')}" placeholder="+5511999999999"></label><label>Fuso horário<select name="timezone"><option value="America/Sao_Paulo" ${settings.timezone === 'America/Sao_Paulo' ? 'selected' : ''}>America/Sao_Paulo</option></select></label></div></section><section><h2>Assistente local</h2><div class="form-grid"><label>Nome da assistente<input name="aiName" maxlength="60" value="${escapeAttr(settings.aiName || '')}" required></label><label class="wide-field">Saudação<textarea name="greeting" rows="3" maxlength="500" required>${escapeHtml(settings.greeting || '')}</textarea></label><label>Início dos lembretes<input name="reminderStart" type="time" value="${escapeAttr(settings.reminderStart || '08:00')}" required></label><label>Fim dos lembretes<input name="reminderEnd" type="time" value="${escapeAttr(settings.reminderEnd || '20:00')}" required></label></div></section><div class="settings-warning"><strong>Canal externo</strong><p>As mensagens permanecem locais enquanto o WhatsApp Business não tiver credenciais oficiais verificadas.</p></div><button class="primary-button" type="submit">Salvar configurações</button></form>`;
    page.querySelector('#settingsForm').addEventListener('submit', saveSettings);
  } catch (error) { page.innerHTML = emptyState('Não foi possível carregar as configurações', error.message); }
}

async function saveSettings(event) {
  event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true);
  try { const result = await api('/settings', { method: 'PATCH', body: JSON.stringify(data) }); state.settings = result.settings || result; updateShell(); showToast('Configurações salvas.', 'success'); }
  catch (error) { showToast(error.message, 'error'); } finally { setBusy(submit, false); }
}

function renderAuditRows() {
  const query = document.querySelector('#auditSearch').value.trim().toLocaleLowerCase('pt-BR'); const logs = state.auditLogs.filter(log => !query || `${log.action} ${log.reason} ${log.correlationId}`.toLocaleLowerCase('pt-BR').includes(query)); const container = document.querySelector('#auditRows');
  container.innerHTML = logs.map(log => `<div class="audit-row"><span><b>${escapeHtml(log.action.replaceAll('.', ' · '))}</b><small>Rastreio ${escapeHtml(log.correlationId)}</small></span><span>${escapeHtml(log.reason)}</span><time>${formatDate(log.at, { dateStyle: 'short', timeStyle: 'short' })}</time></div>`).join('') || '<p class="audit-loading">Nenhum evento encontrado.</p>';
}

async function loadAuditLogs() {
  document.querySelector('#auditRows').innerHTML = '<p class="audit-loading">Carregando registros…</p>';
  try { state.auditLogs = await api('/audit-logs'); renderAuditRows(); }
  catch (error) { document.querySelector('#auditRows').innerHTML = `<p class="audit-loading error-text">${escapeHtml(error.message)}</p>`; }
}

function bindStaticEvents() {
  renderIcons();
  document.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); go(link.dataset.route); }));
  document.querySelector('[data-go-conversations]').addEventListener('click', () => go('conversas')); document.querySelector('[data-go-pending]').addEventListener('click', () => go('pendencias'));
  document.querySelector('.menu-button').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
  document.querySelector('#globalSearch').addEventListener('click', async () => { state.patientQuery = ''; await go('pacientes'); document.querySelector('#pacientes .search-box input')?.focus(); }); document.querySelector('#notificationButton').addEventListener('click', () => go('pendencias')); document.querySelector('#profileButton').addEventListener('click', () => go('configuracoes'));
  document.querySelectorAll('dialog .dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close())); document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));
  document.querySelector('#newAppointment').addEventListener('click', () => openAppointmentDialog(localDate())); document.querySelector('#agendaNewAppointment').addEventListener('click', () => openAppointmentDialog(state.agendaDate)); document.querySelector('#appointmentForm').elements.doctor.addEventListener('change', refreshAvailableSlots); document.querySelector('#appointmentForm').elements.date.addEventListener('change', refreshAvailableSlots); document.querySelector('#appointmentForm').addEventListener('submit', createAppointment);
  const dateButtons = document.querySelectorAll('.agenda-date button'); dateButtons[0].addEventListener('click', () => changeAgendaDate(-1)); dateButtons[1].addEventListener('click', () => changeAgendaDate(1)); document.querySelector('#agendaDoctorFilter').addEventListener('change', event => { state.agendaDoctor = event.target.value; loadAgenda(); }); document.querySelector('#agendaStatus').addEventListener('change', event => { state.agendaStatus = event.target.value; loadAgenda(); }); document.querySelector('#agendaSearch').addEventListener('input', event => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.agendaQuery = event.target.value.trim(); loadAgenda(); }, 300); }); document.querySelector('.calendar-grid').addEventListener('click', event => { const item = event.target.closest('[data-appointment-id]'); if (item) openAppointmentAction(item.dataset.appointmentId); });
  bindPatientForm(); bindAppointmentActionForm(); bindConversationEvents(); bindAutomationForm(); bindIntegrationForm(); bindTeamForm();
  document.querySelector('#auditSearch').addEventListener('input', renderAuditRows); document.querySelector('#exportAudit').addEventListener('click', () => downloadCsv(`auditoria-nevoa-${localDate()}.csv`, ['Evento', 'Motivo', 'Rastreio', 'Data'], state.auditLogs.map(log => [log.action, log.reason, log.correlationId, log.at])));
  window.addEventListener('popstate', () => go(location.hash.replace('#', '') || 'dashboard', false));
}

async function createAppointment(event) {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true, 'Criando…');
  try { const result = await api('/appointments', { method: 'POST', body: JSON.stringify({ patient: data.get('patient'), doctor: data.get('doctor'), date: data.get('date'), start: data.get('start'), duration: 45 }) }); form.reset(); document.querySelector('#appointmentDialog').close(); state.agendaDate = result.appointment.date; showToast(`Consulta de ${result.appointment.patient} criada.`, 'success'); await Promise.all([loadDashboard(), loadAgenda()]); }
  catch (error) { showToast(error.message, 'error'); if (error.message.toLowerCase().includes('horário')) await refreshAvailableSlots(); } finally { setBusy(submit, false); }
}

function bindPatientForm() {
  const dialog = document.querySelector('#patientDialog'); dialog.querySelector('[data-close-patient]').addEventListener('click', () => dialog.close()); document.querySelector('#patientForm').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const id = data.get('id'); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true); try { await api(id ? `/patients/${id}` : '/patients', { method: id ? 'PATCH' : 'POST', body: JSON.stringify({ name: data.get('name'), phone: data.get('phone'), email: data.get('email') }) }); dialog.close(); showToast(id ? 'Paciente atualizado.' : 'Paciente cadastrado.', 'success'); await Promise.all([loadPatients(), loadPatientSuggestions()]); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(submit, false); } });
}

function bindAppointmentActionForm() {
  const dialog = document.querySelector('#appointmentActionDialog'); const form = document.querySelector('#appointmentActionForm');
  form.addEventListener('submit', async event => { event.preventDefault(); const data = new FormData(form); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true); try { await api(`/appointments/${data.get('id')}`, { method: 'PATCH', body: JSON.stringify({ version: Number(data.get('version')), doctor: data.get('doctor'), date: data.get('date'), start: data.get('start'), duration: Number(data.get('duration')) }) }); await refreshAppointmentViews('Consulta atualizada.'); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(submit, false); } });
  form.querySelector('[data-confirm-appointment]').addEventListener('click', event => appointmentOperation(event.target, 'confirm', 'Consulta confirmada.'));
  form.querySelector('[data-reschedule-appointment]').addEventListener('click', event => appointmentOperation(event.target, 'reschedule', 'Consulta remarcada.'));
  form.querySelector('[data-cancel-appointment]').addEventListener('click', event => { if (confirm('Cancelar esta consulta? A ação ficará registrada na auditoria.')) appointmentOperation(event.target, 'cancel', 'Consulta cancelada.'); });
  dialog.addEventListener('close', () => form.reset());
}

async function appointmentOperation(button, operation, success) {
  const form = document.querySelector('#appointmentActionForm'); const data = new FormData(form); setBusy(button, true, 'Processando…');
  try { const payload = { version: Number(data.get('version')) }; if (operation === 'reschedule') { payload.date = data.get('date'); payload.start = data.get('start'); } await api(`/appointments/${data.get('id')}/${operation}`, { method: 'POST', body: JSON.stringify(payload) }); await refreshAppointmentViews(success); }
  catch (error) { showToast(error.message, 'error'); } finally { setBusy(button, false); }
}

function bindConversationEvents() {
  document.querySelector('#newConversation').addEventListener('click', openConversationDialog); document.querySelector('#conversationItems').addEventListener('click', event => { const item = event.target.closest('[data-conversation-id]'); if (!item) return; document.querySelector('.conversations-layout').classList.add('chat-open'); loadConversation(item.dataset.conversationId).catch(error => showToast(error.message, 'error')); });
  document.querySelector('#conversationTabs').addEventListener('click', event => { const button = event.target.closest('[data-status]'); if (!button) return; state.conversationStatus = button.dataset.status; document.querySelectorAll('#conversationTabs button').forEach(item => item.classList.toggle('selected', item === button)); loadConversations(); }); document.querySelector('#conversationSearch').addEventListener('input', event => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.conversationQuery = event.target.value.trim(); loadConversations(); }, 300); });
  document.querySelector('.mobile-chat-back').addEventListener('click', () => document.querySelector('.conversations-layout').classList.remove('chat-open'));
  document.querySelector('.send-button').addEventListener('click', sendConversationMessage); document.querySelector('.composer input').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); sendConversationMessage(); } });
  document.querySelector('.takeover').addEventListener('click', async event => { if (!state.selectedConversation) return; const operation = state.selectedConversation.humanTakeover ? 'release' : 'takeover'; setBusy(event.target, true, 'Processando…'); try { await api(`/conversations/${state.selectedConversationId}/${operation}`, { method: 'POST', body: '{}' }); showToast(operation === 'takeover' ? 'Conversa assumida pela equipe.' : 'Conversa devolvida à automação local.', 'success'); await Promise.all([loadConversation(state.selectedConversationId), loadConversations()]); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(event.target, false); } });
  document.querySelector('#conversationResolve').addEventListener('click', async event => { if (!state.selectedConversation) return; const operation = event.currentTarget.dataset.operation; try { await api(`/conversations/${state.selectedConversationId}/${operation}`, { method: 'POST', body: '{}' }); showToast(operation === 'resolve' ? 'Conversa resolvida.' : 'Conversa reaberta.', 'success'); await loadConversations(); } catch (error) { showToast(error.message, 'error'); } });
  document.querySelector('#internalNoteButton').addEventListener('click', () => { if (!state.selectedConversationId) return; document.querySelector('#noteForm').reset(); document.querySelector('#noteDialog').showModal(); }); document.querySelector('#noteForm').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const content = new FormData(form).get('content'); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true); try { await api(`/conversations/${state.selectedConversationId}/notes`, { method: 'POST', body: JSON.stringify({ content }) }); document.querySelector('#noteDialog').close(); showToast('Nota interna salva.', 'success'); await loadConversation(state.selectedConversationId); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(submit, false); } });
  document.querySelector('#conversationPatientProfile').addEventListener('click', async () => { if (!state.selectedConversation?.patient) return; state.patientQuery = state.selectedConversation.patient; state.patientPage = 1; await go('pacientes'); });
  document.querySelector('#conversationForm').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true, 'Criando…'); const payload = { patient: data.get('patient'), channel: data.get('channel') }; if (data.get('appointmentId')) payload.appointmentId = data.get('appointmentId'); try { const result = await api('/conversations', { method: 'POST', body: JSON.stringify(payload) }); state.selectedConversationId = result.conversation.id; state.conversationStatus = 'OPEN'; document.querySelector('#conversationDialog').close(); showToast(payload.channel === 'WHATSAPP_CLOUD_API' ? 'Conversa WhatsApp criada.' : 'Conversa local criada.', 'success'); await loadConversations(); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(submit, false); } });
}

async function sendConversationMessage() {
  if (!state.selectedConversationId) return; const input = document.querySelector('.composer input'); const content = input.value.trim(); if (!content) return; const button = document.querySelector('.send-button'); button.disabled = true;
  try { const result = await api(`/conversations/${state.selectedConversationId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }); input.value = ''; showToast(result.delivery?.external ? 'Mensagem enviada ao WhatsApp.' : 'Mensagem salva no ambiente local.', 'success'); await Promise.all([loadConversation(state.selectedConversationId), loadConversations()]); }
  catch (error) { showToast(error.message, 'error'); } finally { button.disabled = false; }
}

function bindAutomationForm() {
  document.querySelector('#newAutomation').addEventListener('click', () => openAutomationDialog()); document.querySelector('#automationForm').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const id = data.get('id'); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true); const payload = { name: data.get('name'), triggerHours: Number(data.get('triggerHours')), conditionStatus: data.get('conditionStatus'), actionType: data.get('actionType'), active: data.get('active') === 'on' }; try { await api(id ? `/automation-rules/${id}` : '/automation-rules', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); document.querySelector('#automationDialog').close(); showToast(id ? 'Automação atualizada.' : 'Automação criada.', 'success'); await loadAutomations(); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(submit, false); } });
}

function bindIntegrationForm() {
  document.querySelector('#newIntegration').addEventListener('click', () => { document.querySelector('#integrationForm').reset(); document.querySelector('#integrationDialog').showModal(); }); document.querySelector('#integrationForm').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const submit = form.querySelector('[type="submit"]'); const payload = { provider: data.get('provider'), environment: data.get('environment'), config: { name: data.get('name'), endpoint: data.get('endpoint') } }; setBusy(submit, true, 'Conectando…'); try { await api('/integrations', { method: 'POST', body: JSON.stringify(payload) }); document.querySelector('#integrationDialog').close(); showToast('Sandbox criado.', 'success'); await loadIntegrations(); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(submit, false); } });
}

function bindTeamForm() {
  document.querySelector('#teamForm').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const id = data.get('id'); const submit = form.querySelector('[type="submit"]'); setBusy(submit, true); const payload = { name: data.get('name'), email: data.get('email'), role: data.get('role'), active: data.get('active') === 'on' }; try { await api(id ? `/team/${id}` : '/team', { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); document.querySelector('#teamDialog').close(); showToast(id ? 'Membro atualizado.' : 'Membro adicionado.', 'success'); await loadTeam(); } catch (error) { showToast(error.message, 'error'); } finally { setBusy(submit, false); } });
}

async function boot() {
  bindStaticEvents();
  try {
    await bootstrapSession();
    const [me, settings] = await Promise.all([api('/auth/me'), api('/settings')]); state.user = me.user; state.settings = settings.settings || settings; updateShell(); await loadHealth(); const route = location.hash.replace('#', '') || 'dashboard'; history.replaceState({ route }, '', `#${route}`); await go(route, false); if (route !== 'dashboard') loadDashboard();
  } catch (error) {
    document.querySelector('#systemStatus').innerHTML = '<span class="pulse offline"></span> Inicialização falhou'; showToast(error.message, 'error'); document.querySelector('#dashboardAttention').innerHTML = emptyState('Não foi possível iniciar o sistema', error.message);
  }
}

boot();
