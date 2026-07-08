const LEADS_API = `${CONFIG.API_URL}/api/leads`;
const COMERCIALES_API = `${CONFIG.API_URL}/api/comerciales`;
const PROPERTIES_API = `${CONFIG.API_URL}/api/properties`;

const STATUS = {
  LEAD_NUEVO: 'LEAD_NUEVO',
  VISITA_AGENDADA: 'VISITA_AGENDADA',
  VISITA_CANCELADA: 'VISITA_CANCELADA',
  VISITA_MODIFICADA: 'VISITA_MODIFICADA',
  PENDIENTE: 'PENDIENTE',
  SEGUIMIENTO: 'SEGUIMIENTO',
  INTENCION_OFERTA: 'INTENCION_OFERTA',
  OFERTA_REALIZADA: 'OFERTA_REALIZADA',
  VENDIDO: 'VENDIDO',
  PERDIDO: 'PERDIDO',
};

let state = {
  leads: [],
  search: '',
  status: 'all',
  sort: { key: 'createdAt', dir: 'desc' },
  selectedId: null,
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];

function authHeaders() {
  const token = localStorage.getItem('wc_token');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

function showToast(msg) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1900);
}

function escapeHTML(s = '') {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

function statusBadge(status) {
  const map = {
    LEAD_NUEVO: 'b-slate',
    VISITA_AGENDADA: 'b-blue',
    VISITA_CANCELADA: 'b-red',
    VISITA_MODIFICADA: 'b-violet',
    PENDIENTE: 'b-amber',
    SEGUIMIENTO: 'b-violet',
    INTENCION_OFERTA: 'b-orange',
    OFERTA_REALIZADA: 'b-emerald',
    VENDIDO: 'b-emerald',
  };
  return `<span class="badge ${map[status] || 'b-slate'}">${escapeHTML(status)}</span>`;
}

function computeStats() {
  const leads = state.leads;
  const today = new Date().toISOString().slice(0, 10);
  $('#statToday').textContent = leads.filter(l => l.estado === STATUS.VISITA_AGENDADA).length;
  $('#statPending').textContent = leads.filter(l => l.estado === STATUS.PENDIENTE || l.estado === STATUS.LEAD_NUEVO).length;
  $('#statOffers').textContent = leads.filter(l => l.estado === STATUS.INTENCION_OFERTA || l.estado === STATUS.OFERTA_REALIZADA).length;
  const total = leads.length;
  const vendidos = leads.filter(l => l.estado === STATUS.VENDIDO).length;
  $('#statConv').textContent = total ? `${Math.round((vendidos / total) * 100)}%` : '—';
}

function applyFilters() {
  const s = state.search.trim().toLowerCase();
  const st = state.status;
  return state.leads.filter(l => {
    if (st !== 'all' && l.estado !== st) return false;
    if (!s) return true;
    return [l.nombre, l.email, l.source].some(v => String(v || '').toLowerCase().includes(s));
  });
}

function applySort(list) {
  const { key, dir } = state.sort;
  const mult = dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    const x = a[key] || '';
    const y = b[key] || '';
    if (x < y) return -1 * mult;
    if (x > y) return 1 * mult;
    return 0;
  });
}

function stateSelectHTML(lead) {
  return `
    <select class="stateSelect" data-action="setState" data-id="${lead.id}">
      ${Object.values(STATUS).map(s => `<option value="${s}" ${s === lead.estado ? 'selected' : ''}>${s}</option>`).join('')}
    </select>
  `;
}

function render() {
  const filtered = applyFilters();
  const sorted = applySort(filtered);
  computeStats();
  $('#countLabel').textContent = `${sorted.length} leads • filtro: ${state.status === 'all' ? 'todos' : state.status}`;

  const tbody = $('#tbody');
  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading">No hay leads asignados</td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map(lead => `
    <tr data-id="${lead.id}">
      <td>
        <strong style="color:#fff">${escapeHTML(lead.nombre)}</strong>
        <div class="muted">${escapeHTML(lead.email || '—')}</div>
      </td>
      <td>${lead.propertyTitle ? `<span style="font-size:12px;color:#fff;font-weight:600;">${escapeHTML(lead.propertyTitle)}</span>` : escapeHTML(lead.source || '—')}</td>
      <td>${escapeHTML(lead.phone || '—')}</td>
      <td>${new Date(lead.createdAt).toLocaleDateString('es-ES')}</td>
      <td>
        ${stateSelectHTML(lead)}
        <div style="margin-top:6px">${statusBadge(lead.estado)}</div>
      </td>
      <td class="right">
        <button class="actionBtn" data-action="open" data-id="${lead.id}">Ver ficha</button>
      </td>
    </tr>
  `).join('');
}

async function loadLeads() {
  try {
    const res = await fetch(LEADS_API, { headers: authHeaders() });
    const data = await res.json();
    const user = JSON.parse(localStorage.getItem('wc_user') || '{}');
    const filtered = data.filter(l => l.comercialId === user.name || l.comercialId === user.id);

    const propRes = await fetch(PROPERTIES_API, { headers: authHeaders() });
    const props = await propRes.json();
    const propMap = {};
    props.forEach(p => propMap[p.id] = p);

    state.leads = filtered.map(l => ({
      ...l,
      propertyTitle: l.propertyId && propMap[l.propertyId] ? propMap[l.propertyId].title : null,
      propertyUrl: l.propertyId && propMap[l.propertyId] ? propMap[l.propertyId].sourceUrl : null,
    }));
    render();
  } catch (err) {
    showToast('⚠️ Error cargando leads');
    console.error(err);
  }
}

async function openDrawer(id) {
  const lead = state.leads.find(l => l.id === id);
  if (!lead) return;
  state.selectedId = id;
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#drawerTitle').textContent = `Lead · ${lead.nombre}`;

  $('#drawerBody').innerHTML = `
    <div class="kv">
      <div class="k">Cliente</div>
      <div class="v"><strong style="color:#fff">${escapeHTML(lead.nombre)}</strong></div>
    </div>
    <div class="kv">
      <div class="k">Email</div>
      <div class="v">
        ${lead.email
          ? `<a href="mailto:${escapeHTML(lead.email)}" style="color:#7aa2ff">${escapeHTML(lead.email)}</a>`
          : '—'}
      </div>
    </div>
    <div class="kv">
      <div class="k">Teléfono</div>
      <div class="v">
        ${lead.phone
          ? `<a href="tel:${escapeHTML(lead.phone)}" style="color:#7aa2ff">${escapeHTML(lead.phone)}</a>`
          : '—'}
      </div>
    </div>
    <div class="kv">
      <div class="k">Inmueble</div>
      <div class="v">
        ${lead.propertyTitle
          ? `<span style="color:#fff;font-weight:600">${escapeHTML(lead.propertyTitle)}</span>`
          : escapeHTML(lead.source || '—')}
        ${lead.propertyUrl
          ? `<a href="${escapeHTML(lead.propertyUrl)}" target="_blank" style="display:block;color:#7aa2ff;font-size:11px;margin-top:3px;">Ver en Idealista →</a>`
          : ''}
      </div>
    </div>
    <div class="kv">
      <div class="k">Estado</div>
      <div class="v">
        <select id="drawerEstado">
          ${Object.values(STATUS).map(s => `<option value="${s}" ${s === lead.estado ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="kv">
      <div class="k">Creado</div>
      <div class="v">${new Date(lead.createdAt).toLocaleString('es-ES')}</div>
    </div>
    <div class="kv">
      <div class="k">Acciones rápidas</div>
      <div class="v" style="display:flex;gap:8px;flex-wrap:wrap;">
        ${lead.email ? `<a href="mailto:${escapeHTML(lead.email)}" class="btn ghost" style="font-size:12px;padding:6px 12px;">Enviar email</a>` : ''}
        ${lead.phone ? `<a href="https://wa.me/${lead.phone.replace(/\D/g,'')}" target="_blank" class="btn ghost" style="font-size:12px;padding:6px 12px;">WhatsApp</a>` : ''}
        <button class="btn ghost" style="font-size:12px;padding:6px 12px;" onclick="window.open('https://www.winallcontrol.com/prototype/schedule/?leadId=${lead.id}&comercialId=${escapeHTML(lead.comercialId || '')}','_blank')">Ver agenda</button>
      </div>
    </div>
  `;
}

function closeDrawerUI() {
  $('#drawer').setAttribute('aria-hidden', 'true');
  state.selectedId = null;
}

$('#closeDrawer').onclick = closeDrawerUI;
$('#drawerBackdrop').onclick = closeDrawerUI;

$('#saveBtn').onclick = async () => {
  if (!state.selectedId) return;
  const estado = $('#drawerEstado')?.value;
  if (!estado) return;
  try {
    await fetch(`${LEADS_API}/${state.selectedId}/state`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ state: estado }),
    });
    await loadLeads();
    showToast('Estado actualizado');
    closeDrawerUI();
  } catch (err) {
    showToast('⚠️ Error al guardar');
  }
};

$('#tbody').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="open"]');
  const tr = e.target.closest('tr[data-id]');
  if (!tr) return;
  if (e.target.closest('select')) return;
  openDrawer(btn ? btn.dataset.id : tr.dataset.id);
});

$('#tbody').addEventListener('change', async (e) => {
  const sel = e.target.closest('select[data-action="setState"]');
  if (!sel) return;
  try {
    await fetch(`${LEADS_API}/${sel.dataset.id}/state`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ state: sel.value }),
    });
    await loadLeads();
    showToast(`Estado → ${sel.value}`);
  } catch (err) {
    showToast('⚠️ Error al actualizar estado');
  }
});

$('#searchInput').addEventListener('input', (e) => { state.search = e.target.value; render(); });
$('#clearSearch').onclick = () => { state.search = ''; $('#searchInput').value = ''; render(); };

$('#statusFilter').addEventListener('click', (e) => {
  const btn = e.target.closest('.seg');
  if (!btn) return;
  state.status = btn.dataset.status;
  $$('#statusFilter .seg').forEach(b => b.classList.toggle('active', b.dataset.status === state.status));
  render();
});

$('#exportBtn').onclick = () => {
  const header = ['id', 'nombre', 'email', 'phone', 'source', 'estado', 'createdAt'];
  const csv = [header.join(','), ...state.leads.map(l => header.map(k => `"${String(l[k] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'mis_leads.csv'; a.click();
  URL.revokeObjectURL(url);
};

const user = JSON.parse(localStorage.getItem('wc_user') || '{}');
if (user.name) {
  const el = document.querySelector('.userName');
  const elRole = document.querySelector('.userRole');
  const avatar = document.querySelector('.avatar');
  if (el) el.textContent = user.name;
  if (elRole) elRole.textContent = user.email;
  if (avatar) avatar.textContent = user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');
if (userBtn && userDropdown) {
  userBtn.addEventListener('click', () => userDropdown.classList.toggle('show'));
  document.addEventListener('click', (e) => {
    if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) userDropdown.classList.remove('show');
  });
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('wc_token');
  localStorage.removeItem('wc_user');
  localStorage.removeItem('wc_role');
  window.location.href = '../login/index.html';
});

(function init() {
  $('#nowLabel').textContent = new Date().toLocaleString('es-ES');
  setInterval(() => $('#nowLabel').textContent = new Date().toLocaleString('es-ES'), 30000);
  $('#tbody').innerHTML = `<tr><td colspan="6" class="loading">Cargando...</td></tr>`;
  loadLeads();
})();
