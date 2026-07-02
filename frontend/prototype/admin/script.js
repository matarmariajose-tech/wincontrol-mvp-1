const LS_KEY = "wincontrol_admin_dashboard_v1";

const STATUS = {
  LEAD_NUEVO: "LEAD_NUEVO",
  VISITA_AGENDADA: "VISITA_AGENDADA",
  VISITA_CANCELADA: "VISITA_CANCELADA",
  VISITA_MODIFICADA: "VISITA_MODIFICADA",
  PENDIENTE: "PENDIENTE",
  SEGUIMIENTO: "SEGUIMIENTO",
  INTENCION_OFERTA: "INTENCION_OFERTA",
  OFERTA_REALIZADA: "OFERTA_REALIZADA",
  VENDIDO: "VENDIDO",
};

const BLOCKING_STATES = new Set([
  STATUS.VISITA_AGENDADA,
  STATUS.OFERTA_REALIZADA,
  STATUS.VENDIDO,
]);

const API_URL = `${CONFIG.API_URL}/api/leads`;
const VISITS_API = `${CONFIG.API_URL}/api/visits`;
const VISITS_ADMIN_API = `${CONFIG.API_URL}/api/visits/admin/all`;
const COMERCIALES_API = `${CONFIG.API_URL}/api/comerciales`;

window.adminComerciales = [];

function authHeaders() {
  const token = localStorage.getItem('wc_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function fetchLeads() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  return await res.json();
}

async function updateLead(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error updating lead");
  return res.json();
}

async function deleteLeadApi(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  if (!res.ok) throw new Error("Error deleting lead");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

let state = {
  rows: [],
  search: "",
  status: "all",
  sort: { key: "createdAt", dir: "desc" },
  selectedId: null
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];

const nowLabel = $("#nowLabel");
const tbody = $("#tbody");
const countLabel = $("#countLabel");
const toast = $("#toast");

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function formatNow() {
  const d = new Date();
  const date = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", year: "numeric" }).format(d);
  const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${date} • ${time} • Vista administrador`;
}

function pad2(n) { return String(n).padStart(2, "0"); }

function hoursSince(dateIso) {
  return (Date.now() - new Date(dateIso).getTime()) / 36e5;
}

function escapeHTML(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSlaLevel(row) {
  if ([STATUS.OFERTA_REALIZADA, STATUS.VENDIDO, STATUS.VISITA_CANCELADA].includes(row.status)) return "ok";
  const h = hoursSince(row.createdAt);
  if (h > 48) return "red";
  if (h > 24) return "orange";
  return "ok";
}

function slaBadge(row) {
  const level = getSlaLevel(row);
  if (level === "red") return `<span class="badge b-red">+48h sin cierre</span>`;
  if (level === "orange") return `<span class="badge b-amber">+24h pendiente</span>`;
  return `<span class="badge b-emerald">Dentro SLA</span>`;
}

function statusBadge(status) {
  const map = {
    LEAD_NUEVO: "b-slate",
    VISITA_AGENDADA: "b-blue",
    VISITA_CANCELADA: "b-red",
    VISITA_MODIFICADA: "b-violet",
    PENDIENTE: "b-amber",
    SEGUIMIENTO: "b-violet",
    INTENCION_OFERTA: "b-orange",
    OFERTA_REALIZADA: "b-emerald",
    VENDIDO: "b-emerald",
  };
  const cls = map[status] || "b-slate";
  return `<span class="badge ${cls}">${escapeHTML(status)}</span>`;
}

function computeStats() {
  const rows = state.rows;

  const getEstado = r => r.estado || r.status || '';

  const leads = rows.filter(r => getEstado(r) === 'LEAD_NUEVO').length;
  const agendadas = rows.filter(r => getEstado(r) === 'VISITA_AGENDADA').length;
  const pendientes = rows.filter(r => getEstado(r) === 'PENDIENTE' || getEstado(r) === 'SEGUIMIENTO').length;
  const ofertas = rows.filter(r => getEstado(r) === 'INTENCION_OFERTA' || getEstado(r) === 'OFERTA_REALIZADA').length;
  const vendidos = rows.filter(r => getEstado(r) === 'VENDIDO').length;
  const canceladas = rows.filter(r => getEstado(r) === 'VISITA_CANCELADA').length;
  const total = rows.length;
  const conv = total ? Math.round((vendidos / total) * 100) : 0;

  $("#statLeads").textContent = total;
  $("#statLeadsSub").textContent = `${leads} nuevos · ${agendadas} agendadas`;
  $("#statVisitsToday").textContent = agendadas;
  $("#statVisitsTodaySub").textContent = `${rows.filter(r => getEstado(r) === 'VISITA_MODIFICADA').length} modificadas`;
  $("#statOffers").textContent = ofertas;
  $("#statOffersSub").textContent = `${rows.filter(r => getEstado(r) === 'OFERTA_REALIZADA').length} ofertas registradas`;
  $("#statSla").textContent = pendientes;
  $("#statSlaSub").textContent = `${canceladas} canceladas`;
  $("#statConversion").textContent = `${conv}%`;
  $("#statConversionSub").textContent = `${vendidos} vendidos`;
  $("#statBlocked").textContent = agendadas + ofertas;
  $("#statBlockedSub").textContent = `${agendadas} agendadas`;
}

function renderFunnel() {
  const total = Math.max(state.rows.length, 1);
  const getE = r => r.estado || r.status || '';
  const stateColors = {
    'Lead nuevo': '#334155',
    'Visita agendada': '#2563eb',
    'Pendiente': '#8b5cf6',
    'Seguimiento': '#6366f1',
    'Intención oferta': '#f59e0b',
    'Oferta realizada': '#f97316',
    'Vendido': '#10b981',
  };
  const steps = [
    { label: "Lead nuevo", count: state.rows.filter(r => getE(r) === 'LEAD_NUEVO').length, color: stateColors['Lead nuevo'] },
    { label: "Visita agendada", count: state.rows.filter(r => getE(r) === 'VISITA_AGENDADA' || getE(r) === 'VISITA_MODIFICADA').length, color: stateColors['Visita agendada'] },
    { label: "Pendiente", count: state.rows.filter(r => getE(r) === 'PENDIENTE').length, color: stateColors['Pendiente'] },
    { label: "Seguimiento", count: state.rows.filter(r => getE(r) === 'SEGUIMIENTO').length, color: stateColors['Seguimiento'] },
    { label: "Intención oferta", count: state.rows.filter(r => getE(r) === 'INTENCION_OFERTA').length, color: stateColors['Intención oferta'] },
    { label: "Oferta realizada", count: state.rows.filter(r => getE(r) === 'OFERTA_REALIZADA').length, color: stateColors['Oferta realizada'] },
    { label: "Vendido", count: state.rows.filter(r => getE(r) === 'VENDIDO').length, color: stateColors['Vendido'] },
  ];

  $("#funnel").innerHTML = steps.map(step => {
    const pct = Math.max(4, Math.round((step.count / total) * 100));
    return `
      <div class="funnelStep">
        <div class="funnelTop">
          <div class="funnelTitle">${step.label}</div>
          <div style="font-size:18px;font-weight:700;color:#fff;">${step.count}</div>
        </div>
        <div class="funnelSub">${Math.round((step.count / total) * 100)}% del total</div>
        <div class="barTrack"><div class="barFill" style="width:${pct}%;background:${step.color};"></div></div>
      </div>
    `;
  }).join("");
}

function renderSources() {
  const total = Math.max(state.rows.length, 1);
  const map = {};
  state.rows.forEach(r => map[r.source] = (map[r.source] || 0) + 1);
  const items = Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
    const pct = Math.round((count / total) * 100);
    return `
      <div class="sourceItem">
        <div class="sourceRow">
          <div><div class="sourceName">${escapeHTML(name)}</div><div class="sourceMeta">${count} leads</div></div>
          <div class="badge b-blue">${pct}%</div>
        </div>
        <div class="sourceBar"><span style="width:${Math.max(pct, 6)}%"></span></div>
      </div>
    `;
  });
  $("#sourceList").innerHTML = items.join("");
}

function renderAgents() {
  const comerciales = window.adminComerciales;
  if (!comerciales || !comerciales.length) {
    $("#agentTbody").innerHTML = `<tr><td colspan="7" class="loading">No hay comerciales registrados</td></tr>`;
    return;
  }
  const today = todayISO();
  $("#agentTbody").innerHTML = comerciales.map(c => {
    const rows = state.rows.filter(r => r.agent === c.nombre || r.agent === c.id);
    const todayCount = rows.filter(r => r.status === STATUS.VISITA_AGENDADA).length;
    const pending = rows.filter(r => r.status === STATUS.PENDIENTE).length;
    const offers = rows.filter(r => r.status === STATUS.INTENCION_OFERTA).length;
    const done = rows.filter(r => r.status === STATUS.OFERTA_REALIZADA || r.status === STATUS.VENDIDO).length;
    const load = Math.min(100, pending * 18 + offers * 24 + todayCount * 14);
    return `
      <tr>
        <td><strong>${escapeHTML(c.nombre)}</strong></td>
        <td><span class="badge b-emerald">ONLINE</span></td>
        <td>${todayCount}</td>
        <td>${pending}</td>
        <td>${offers}</td>
        <td>${done}</td>
        <td class="right">${load}%</td>
      </tr>
    `;
  }).join("");
}

function buildAlerts() {
  const alerts = [];
  const lateRows = state.rows.filter(r => getSlaLevel(r) === "red");
  if (lateRows.length) alerts.push({ title: `${lateRows.length} leads fuera de SLA`, meta: "Más de 48h sin cambio de estado", badge: `<span class="badge b-red">Crítico</span>` });
  const offerRows = state.rows.filter(r => r.status === STATUS.INTENCION_OFERTA);
  if (offerRows.length) alerts.push({ title: `${offerRows.length} intenciones de oferta`, meta: "Revisar seguimiento comercial", badge: `<span class="badge b-orange">Seguimiento</span>` });
  if (!alerts.length) alerts.push({ title: "Sin alertas críticas", meta: "La operación está dentro de los umbrales definidos", badge: `<span class="badge b-emerald">OK</span>` });
  $("#alertList").innerHTML = alerts.map(a => `
    <div class="alertItem">
      <div class="alertRow">
        <div><div class="alertTitle">${a.title}</div><div class="alertMeta">${a.meta}</div></div>
        <div>${a.badge}</div>
      </div>
    </div>
  `).join("");
}

function applyFilters() {
  const s = state.search.trim().toLowerCase();
  const st = state.status;
  return state.rows.filter(r => {
    if (st !== "all" && r.status !== st) return false;
    if (!s) return true;
    return [r.client, r.source, r.agent, r.email].some(v => String(v || "").toLowerCase().includes(s));
  });
}

function applySort(list) {
  const { key, dir } = state.sort;
  const mult = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const x = a[key] || "";
    const y = b[key] || "";
    if (x < y) return -1 * mult;
    if (x > y) return 1 * mult;
    return 0;
  });
}

function stateSelectHTML(row) {
  return `
    <select class="stateSelect" data-action="setState" data-id="${row.id}">
      ${Object.values(STATUS).map(s => `<option value="${s}" ${s === row.status ? "selected" : ""}>${s}</option>`).join("")}
    </select>
  `;
}

function renderTable() {
  const filtered = applyFilters();
  const sorted = applySort(filtered);
  countLabel.textContent = `${sorted.length} registros • filtro: ${state.status === "all" ? "todos" : state.status}`;
  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="loading">No hay datos con ese filtro</td></tr>`;
    return;
  }
  tbody.innerHTML = sorted.map(row => `
    <tr data-id="${row.id}">
      <td class="mono">${escapeHTML(row.id.slice(0, 8))}...</td>
      <td>
        <strong style="color:#fff">${escapeHTML(row.client)}</strong>
        <div class="muted">${escapeHTML(row.email)}</div>
      </td>
      <td>${escapeHTML(row.source)}</td>
      <td>${escapeHTML(row.property)}</td>
      <td>${escapeHTML(row.agent)}</td>
      <td>${new Date(row.createdAt).toLocaleDateString("es-ES")}</td>
      <td>${slaBadge(row)}</td>
      <td>
        ${stateSelectHTML(row)}
        <div style="margin-top:6px">${statusBadge(row.status)}</div>
      </td>
      <td class="right">
        <button class="actionBtn" data-action="open" data-id="${row.id}">Ver detalle</button>
      </td>
    </tr>
  `).join("");
}

function render() {
  computeStats();
  renderFunnel();
  renderSources();
  renderAgents();
  buildAlerts();
  renderTable();
}

async function loadComerciales(selectId) {
  try {
    const res = await fetch(COMERCIALES_API, { headers: authHeaders() });
    const data = await res.json();
    window.adminComerciales = data;
    if (selectId) {
      const select = document.getElementById(selectId);
      if (select) select.innerHTML = data.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    }
    return data;
  } catch (e) {
    showToast('⚠️ No se pudieron cargar los comerciales');
  }
}

async function openDrawer(id) {
  const row = state.rows.find(r => r.id === id);
  if (!row) return;
  state.selectedId = id;
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawerTitle").textContent = `Lead ${row.id.slice(0, 8)}`;
  $("#drawerBody").innerHTML = `
    <div class="kv">
      <div class="k">Cliente</div>
      <div class="v"><input id="editClient" type="text" value="${escapeHTML(row.client)}" /></div>
      <div style="margin-top:8px" class="grid2">
        <input id="editPhone" type="text" placeholder="Teléfono" value="${escapeHTML(row.phone)}" />
        <input id="editEmail" type="text" placeholder="Email" value="${escapeHTML(row.email)}" />
      </div>
    </div>
    <div class="grid2">
      <div class="kv">
        <div class="k">Fuente</div>
        <div class="v"><input id="editSource" type="text" value="${escapeHTML(row.source)}" /></div>
      </div>
      <div class="kv">
        <div class="k">Estado</div>
        <div class="v">
          <select id="editStatus">
            ${Object.values(STATUS).map(s => `<option value="${s}" ${s === row.status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
      </div>
    </div>
    <div class="kv">
      <div class="k">Comercial</div>
      <div class="v" style="display:flex; gap:8px; align-items:center;">
        <select id="editAgent" style="flex:1"></select>
      </div>
    </div>
    <div class="kv">
      <div class="k">URL de origen</div>
      <div class="v">
        ${row.sourceUrl
          ? `<a class="pill" target="_blank" href="${escapeHTML(row.sourceUrl)}">${escapeHTML(row.sourceUrl)}</a>`
          : `<span class="muted" style="font-size:11px">Sin URL registrada</span>`
        }
      </div>
    </div>
  `;
  await loadComerciales('editAgent');
  document.getElementById('editAgent').value = row.agent;
}

function closeDrawer() {
  $("#drawer").setAttribute("aria-hidden", "true");
  state.selectedId = null;
}

function exportCSV(rows) {
  const headers = ["ID", "Cliente", "Email", "Teléfono", "Inmueble", "Comercial", "Estado", "Fuente", "Fecha creación"];
  const data = rows.map(r => [
    r.id || '',
    r.client || '',
    r.email || '',
    r.phone || '',
    r.property || '',
    r.agent || '',
    r.estado || r.status || '',
    r.source || '',
    r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-ES') : '',
  ]);

  const csv = [headers, ...data].map(row =>
    row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')
  ).join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `winallcontrol_leads_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

$("#searchInput").addEventListener("input", (e) => {
  state.search = e.target.value;
  renderTable();
});
$("#clearSearch").onclick = () => {
  state.search = "";
  $("#searchInput").value = "";
  renderTable();
};

$("#statusFilter").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg");
  if (!btn) return;
  state.status = btn.dataset.status;
  $$("#statusFilter .seg").forEach(b => b.classList.toggle("active", b.dataset.status === state.status));
  renderTable();
});

tbody.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-action='open']");
  const tr = e.target.closest("tr[data-id]");
  if (!tr) return;
  if (e.target.closest("select")) return;
  if (openBtn) { openDrawer(openBtn.dataset.id); return; }
  openDrawer(tr.dataset.id);
});

tbody.addEventListener("change", async (e) => {
  const select = e.target.closest("select[data-action='setState']");
  if (!select) return;
  const row = state.rows.find(r => r.id === select.dataset.id);
  if (!row) return;
  const newStatus = select.value;
  try {
    await fetch(`${API_URL}/${row.id}/state`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ state: newStatus })
    });
    await loadRowsFromAPI();
    showToast(`Estado actualizado a ${newStatus}`);
  } catch (err) {
    showToast("Error al guardar estado");
  }
});

$("#closeDrawer").onclick = closeDrawer;
$("#drawerBackdrop").onclick = closeDrawer;

$("#saveBtn").onclick = async () => {
  if (!state.selectedId) return;
  const updated = {
    nombre: $("#editClient").value,
    phone: $("#editPhone").value,
    email: $("#editEmail").value,
    source: $("#editSource").value,
    comercialId: $("#editAgent").value,
    estado: $("#editStatus").value,
  };
  try {
    await updateLead(state.selectedId, updated);
    await loadRowsFromAPI();
    showToast("Lead actualizado");
    closeDrawer();
  } catch (err) {
    showToast("Error al guardar");
  }
};

$("#deleteBtn").onclick = async () => {
  if (!state.selectedId) return;
  try {
    await deleteLeadApi(state.selectedId);
    await loadRowsFromAPI();
    closeDrawer();
    showToast("Lead eliminado");
  } catch (err) {
    showToast("Error al eliminar");
  }
};

$("#exportBtn").onclick = () => exportCSV(state.rows);

async function loadRowsFromAPI() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  const data = await res.json();
  const propRes = await fetch(`${CONFIG.API_URL}/api/properties`, { headers: authHeaders() });
  const props = await propRes.json();
  const propMap = {};
  props.forEach(p => propMap[p.id] = p);

  state.rows = data.map(v => ({
    id: v.id,
    client: v.nombre || v.cliente || "—",
    property: v.propertyId && propMap[v.propertyId] ? propMap[v.propertyId].title : (v.inmueble || "—"),
    propertyUrl: v.propertyId && propMap[v.propertyId] ? propMap[v.propertyId].sourceUrl : null,
    agent: v.comercialId || v.comercial || "—",
    status: v.estado || STATUS.LEAD_NUEVO,
    estado: v.estado || STATUS.LEAD_NUEVO,
    source: v.source || "—",
    phone: v.phone || "",
    email: v.email || "",
    sourceUrl: v.sourceUrl || "",
    createdAt: v.createdAt,
    propertyId: v.propertyId,
    adminId: v.adminId,
  }));
  render();
}

// Modal crear lead
function openCreateLeadModal() {
  const modal = document.getElementById('createLeadModal');
  modal.style.display = 'flex';
  document.getElementById('lead-nombre').value = '';
  document.getElementById('lead-phone').value = '';
  document.getElementById('lead-email').value = '';
  document.getElementById('lead-url').value = '';
  document.getElementById('lead-property-id').value = '';
  document.getElementById('lead-property-search').value = '';
  document.getElementById('lead-property-selected').textContent = '';
  document.getElementById('lead-property-dropdown').style.display = 'none';
  loadLeadComerciales();
  document.getElementById('lead-nombre').focus();
}

function closeCreateLeadModal() {
  document.getElementById('createLeadModal').style.display = 'none';
}

async function loadLeadComerciales() {
  try {
    const res = await fetch(COMERCIALES_API, { headers: authHeaders() });
    const data = await res.json();
    const sel = document.getElementById('lead-comercial');
    sel.innerHTML = '<option value="">Sin asignar</option>' + data.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
  } catch {}
}

let allPropertiesCache = [];
async function searchProperties(query) {
  const dropdown = document.getElementById('lead-property-dropdown');
  if (!query || query.length < 2) { dropdown.style.display = 'none'; return; }

  if (!allPropertiesCache.length) {
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/properties`, { headers: authHeaders() });
      allPropertiesCache = await res.json();
    } catch { return; }
  }

  const q = query.toLowerCase();
  const matches = allPropertiesCache.filter(p =>
    p.title?.toLowerCase().includes(q) ||
    String(p.id).includes(q) ||
    p.sourceUrl?.includes(q)
  ).slice(0, 6);

  if (!matches.length) { dropdown.style.display = 'none'; return; }

  dropdown.style.display = 'block';
  dropdown.innerHTML = matches.map(p => `
    <div onclick="selectProperty(${p.id}, '${p.title?.replace(/'/g, "\'")}' )" style="padding:8px 12px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.05);font-size:12px;" onmouseover="this.style.background='rgba(255,255,255,.05)'" onmouseout="this.style.background='transparent'">
      <div style="color:#7aa2ff;font-weight:600;">#${p.id}</div>
      <div style="color:#94a3b8;">${p.title}</div>
    </div>
  `).join('');
}

function selectProperty(id, title) {
  document.getElementById('lead-property-id').value = id;
  document.getElementById('lead-property-search').value = title;
  document.getElementById('lead-property-selected').textContent = '✓ Inmueble seleccionado';
  document.getElementById('lead-property-dropdown').style.display = 'none';
}

async function createLeadFromForm() {
  const nombre = document.getElementById('lead-nombre').value.trim();
  if (!nombre) { showToast('El nombre es obligatorio'); return; }

  const btn = document.getElementById('createLeadConfirm');
  btn.disabled = true; btn.textContent = 'Creando...';

  const propertyId = document.getElementById('lead-property-id').value;
  const payload = {
    nombre,
    phone: document.getElementById('lead-phone').value.trim(),
    email: document.getElementById('lead-email').value.trim(),
    comercialId: document.getElementById('lead-comercial').value || null,
    source: document.getElementById('lead-source').value,
    sourceUrl: document.getElementById('lead-url').value.trim(),
    propertyId: propertyId ? parseInt(propertyId) : null,
  };

  try {
    const res = await fetch(API_URL, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Error en el servidor');
    await loadRowsFromAPI();
    closeCreateLeadModal();
    showToast('Lead creado');
  } catch (e) {
    showToast(e.message || 'Error de red');
  } finally {
    btn.disabled = false; btn.textContent = 'Crear lead';
  }
}

window.addEventListener('click', (e) => {
  const modal = document.getElementById('createLeadModal');
  if (e.target === modal) closeCreateLeadModal();
});

function parseLink(url) {
  let source = 'Web';
  if (url.toLowerCase().includes('idealista')) source = 'Idealista';
  if (url.toLowerCase().includes('habitaclia')) source = 'Habitaclia';
  return { source };
}

async function createLeadFromLink() {
  const url = document.getElementById('lead-url').value.trim();
  if (!url) { showToast('Pegá un link para continuar'); return; }
  const { source } = parseLink(url);
  const newLead = { nombre: "Nuevo Lead", source, sourceUrl: url, phone: "", email: "" };
  try {
    const res = await fetch(API_URL, { method: 'POST', headers: authHeaders(), body: JSON.stringify(newLead) });
    if (!res.ok) throw new Error('Error en el servidor');
    showToast(`Lead de ${source} creado con éxito`);
    closeCreateLeadModal();
    await loadRowsFromAPI();
  } catch (err) {
    showToast('No se pudo guardar el lead');
  }
}

async function loadVisitsAdmin() {
  try {
    await loadComerciales();
    const [visitsRes, leadsRes, propsRes] = await Promise.all([
      fetch(VISITS_ADMIN_API, { headers: authHeaders() }),
      fetch(API_URL, { headers: authHeaders() }),
      fetch(`${CONFIG.API_URL}/api/properties`, { headers: authHeaders() }),
    ]);
    const visits = await visitsRes.json();
    const leads = await leadsRes.json();
    const props = await propsRes.json();

    const leadMap = {};
    leads.forEach(l => leadMap[l.id] = l);
    const propMap = {};
    props.forEach(p => propMap[p.id] = p);

    const enriched = visits.map(v => ({
      ...v,
      clienteNombre: leadMap[v.leadId]?.nombre || '—',
      inmuebleTitulo: propMap[v.propertyId]?.title || (leadMap[v.leadId]?.propertyId && propMap[leadMap[v.leadId].propertyId]?.title) || '—',
    }));

    renderVisitsAdmin(enriched);
  } catch (err) {
    document.getElementById('visitsAdminTbody').innerHTML = `<tr><td colspan="6" class="loading">Error cargando visitas</td></tr>`;
  }
}

function renderVisitsAdmin(visits) {
  const tbody = document.getElementById('visitsAdminTbody');
  if (!visits || !visits.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading">No hay visitas</td></tr>`;
    return;
  }
  tbody.innerHTML = visits.map(v => `
    <tr>
      <td class="mono">${v.id ? v.id.slice(0, 8) : '-'}</td>
      <td><strong style="color:#fff">${v.clienteNombre}</strong><div class="muted" style="font-size:11px">${v.inmuebleTitulo}</div></td>
      <td>${v.fecha || '-'} • ${(v.hora || '').slice(0,5)}</td>
      <td>
        <select class="stateSelect adminVisitCommercial" data-id="${v.id}">
          ${(window.adminComerciales || []).map(c => `<option value="${c.nombre}" ${c.nombre === v.comercialId ? 'selected' : ''}>${c.nombre}</option>`).join('')}
        </select>
      </td>
      <td>
        <select class="stateSelect adminVisitStatus" data-id="${v.id}">
          <option value="PENDIENTE" ${v.estado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
          <option value="CONFIRMADA" ${v.estado === 'CONFIRMADA' ? 'selected' : ''}>CONFIRMADA</option>
          <option value="REALIZADA" ${v.estado === 'REALIZADA' ? 'selected' : ''}>REALIZADA</option>
          <option value="CANCELADA" ${v.estado === 'CANCELADA' ? 'selected' : ''}>CANCELADA</option>
          <option value="NO_SE_PRESENTA" ${v.estado === 'NO_SE_PRESENTA' ? 'selected' : ''}>NO_SE_PRESENTA</option>
        </select>
      </td>
    </tr>
  `).join('');
}

document.addEventListener('change', async (e) => {
  if (e.target.classList.contains('adminVisitStatus')) {
    const id = e.target.dataset.id;
    const estado = e.target.value;
    try {
      await fetch(`${VISITS_API}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ estado }) });
      showToast('Estado actualizado');
    } catch (err) {
      showToast('⚠️ Error actualizando estado');
    }
  }
  if (e.target.classList.contains('adminVisitCommercial')) {
    const id = e.target.dataset.id;
    const comercialId = e.target.value;
    try {
      await fetch(`${VISITS_API}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ comercialId }) });
      showToast('Comercial actualizado');
    } catch (err) {
      showToast('⚠️ Error actualizando comercial');
    }
  }
});

(async function init() {
  nowLabel.textContent = formatNow();
  setInterval(() => nowLabel.textContent = formatNow(), 30000);
  await loadComerciales();
  await loadRowsFromAPI();
  await loadVisitsAdmin();
})();