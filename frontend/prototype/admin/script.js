const LS_KEY = "wincontrol_admin_dashboard_v1";

const STATUS = {
  LEAD: "LEAD",
  PENDIENTE: "PENDIENTE",
  MODIFICADA: "MODIFICADA",
  REALIZADA: "REALIZADA",
  CONCERTADA: "CONCERTADA",
  CUESTIONARIO: "CUESTIONARIO",
  EN_OFERTA: "EN_OFERTA",
  BLOQUEADA: "BLOQUEADA",
  CANCELADA: "CANCELADA",
  NO_SE_PRESENTA: "NO_SE_PRESENTA"
};

const BLOCKING_STATES = new Set([
  STATUS.EN_OFERTA,
  STATUS.REALIZADA,
  STATUS.BLOQUEADA,
  STATUS.CONCERTADA
]);

const AGENTS = [
  { name: "Sara López", online: true },
  { name: "Toni Ruiz", online: true },
  { name: "Marc Puig", online: false },
  { name: "Lucía Navarro", online: true }
];

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

async function createLead(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
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

function todayISO(){
  return new Date().toISOString().slice(0,10);
}
function plusDays(days){
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

const demoRows = [
  {
    id:"1",
    ref:"WC-9101",
    client:"Laura Méndez",
    phone:"+34 600 111 222",
    email:"laura@demo.com",
    source:"Idealista",
    property:"Piso 3 hab · Gràcia",
    agent:"Sara López",
    fecha:todayISO(),
    hora:"10:30",
    status:STATUS.PENDIENTE,
    createdAt:new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    questionnaire:false,
    offer:false,
    publicId:"9101"
  },
  {
    id:"2",
    ref:"WC-9102",
    client:"Carlos Herrera",
    phone:"+34 600 333 444",
    email:"carlos@demo.com",
    source:"Habitaclia",
    property:"Ático 2 hab · Eixample",
    agent:"Toni Ruiz",
    fecha:todayISO(),
    hora:"12:00",
    status:STATUS.MODIFICADA,
    createdAt:new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    questionnaire:false,
    offer:false,
    publicId:"9102"
  },
  {
    id:"3",
    ref:"WC-9103",
    client:"Ana Beltrán",
    phone:"+34 600 555 666",
    email:"ana@demo.com",
    source:"Idealista",
    property:"Casa con piscina · Sant Cugat",
    agent:"Marc Puig",
    fecha:plusDays(-1),
    hora:"16:45",
    status:STATUS.REALIZADA,
    createdAt:new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    questionnaire:true,
    offer:false,
    publicId:"9103"
  },
  {
    id:"4",
    ref:"WC-9104",
    client:"Javier Soto",
    phone:"+34 600 777 888",
    email:"javier@demo.com",
    source:"Web",
    property:"Estudio · Poblenou",
    agent:"Lucía Navarro",
    fecha:plusDays(-2),
    hora:"09:15",
    status:STATUS.CANCELADA,
    createdAt:new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    questionnaire:false,
    offer:false,
    publicId:"9104"
  },
  {
    id:"5",
    ref:"WC-9105",
    client:"Marta Vidal",
    phone:"+34 600 999 000",
    email:"marta@demo.com",
    source:"Idealista",
    property:"Piso 4 hab · Les Corts",
    agent:"Sara López",
    fecha:plusDays(-1),
    hora:"11:00",
    status:STATUS.EN_OFERTA,
    createdAt:new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    questionnaire:true,
    offer:true,
    publicId:"9105"
  },
  {
    id:"6",
    ref:"WC-9106",
    client:"Roberto Campos",
    phone:"+34 601 010 101",
    email:"roberto@demo.com",
    source:"Referido",
    property:"Dúplex · Sarrià",
    agent:"Toni Ruiz",
    fecha:todayISO(),
    hora:"15:30",
    status:STATUS.BLOQUEADA,
    createdAt:new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    questionnaire:false,
    offer:false,
    publicId:"9106"
  },
  {
    id:"7",
    ref:"WC-9107",
    client:"Nora Salas",
    phone:"+34 611 000 123",
    email:"nora@demo.com",
    source:"Idealista",
    property:"Piso 2 hab · Sants",
    agent:"Lucía Navarro",
    fecha:plusDays(1),
    hora:"17:00",
    status:STATUS.LEAD,
    createdAt:new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    questionnaire:false,
    offer:false,
    publicId:"9107"
  },
  {
    id:"8",
    ref:"WC-9108",
    client:"Pablo Gil",
    phone:"+34 622 111 444",
    email:"pablo@demo.com",
    source:"Habitaclia",
    property:"Casa adosada · Badalona",
    agent:"Sara López",
    fecha:plusDays(1),
    hora:"18:15",
    status:STATUS.CUESTIONARIO,
    createdAt:new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    questionnaire:true,
    offer:false,
    publicId:"9108"
  },
  {
    id:"9",
    ref:"WC-9109",
    client:"Elena Costa",
    phone:"+34 633 777 321",
    email:"elena@demo.com",
    source:"Web",
    property:"Planta baja · Sant Antoni",
    agent:"Marc Puig",
    fecha:todayISO(),
    hora:"19:00",
    status:STATUS.NO_SE_PRESENTA,
    createdAt:new Date(Date.now() - 55 * 60 * 60 * 1000).toISOString(),
    questionnaire:false,
    offer:false,
    publicId:"9109"
  }
];

let state = {
  rows: [],
  search: "",
  status: "all",
  sort: { key: "datetime", dir: "asc" },
  selectedId: null
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];

const nowLabel = $("#nowLabel");
const tbody = $("#tbody");
const countLabel = $("#countLabel");
const toast = $("#toast");

function saveLS(){
  localStorage.setItem(LS_KEY, JSON.stringify(state.rows));
}
function loadLS(){
  try {
    return JSON.parse(localStorage.getItem(LS_KEY));
  } catch {
    return null;
  }
}

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function formatNow() {
  const d = new Date();
  const date = new Intl.DateTimeFormat("es-ES", { day:"2-digit", month:"long", year:"numeric" }).format(d);
  const time = new Intl.DateTimeFormat("es-ES", { hour:"2-digit", minute:"2-digit" }).format(d);
  return `${date} • ${time} • Vista administrador`;
}

function pad2(n){ return String(n).padStart(2,"0"); }
function formatESDate(isoDate){
  const d = new Date(isoDate + "T00:00:00");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${pad2(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function rowDateTime(r){
  return new Date(`${r.fecha}T${r.hora}:00`).getTime();
}
function hoursSince(dateIso){
  return (Date.now() - new Date(dateIso).getTime()) / 36e5;
}
function escapeHTML(s=""){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function getSlaLevel(row){
  if ([STATUS.REALIZADA, STATUS.CANCELADA, STATUS.NO_SE_PRESENTA, STATUS.EN_OFERTA, STATUS.CUESTIONARIO, STATUS.CONCERTADA].includes(row.status)) {
    return "ok";
  }

  const h = hoursSince(row.createdAt);
  if (h > 48) return "red";
  if (h > 24) return "orange";
  return "ok";
}

function slaBadge(row){
  const level = getSlaLevel(row);
  if (level === "red") return `<span class="badge b-red">+48h sin cierre</span>`;
  if (level === "orange") return `<span class="badge b-amber">+24h pendiente</span>`;
  return `<span class="badge b-emerald">Dentro SLA</span>`;
}

function statusBadge(status){
  switch(status){
    case STATUS.LEAD: return `<span class="badge b-slate">LEAD</span>`;
    case STATUS.PENDIENTE: return `<span class="badge b-blue">PENDIENTE</span>`;
    case STATUS.MODIFICADA: return `<span class="badge b-violet">MODIFICADA</span>`;
    case STATUS.REALIZADA: return `<span class="badge b-emerald">REALIZADA</span>`;
    case STATUS.CONCERTADA: return `<span class="badge b-emerald">CONCERTADA</span>`;
    case STATUS.CUESTIONARIO: return `<span class="badge b-violet">CUESTIONARIO</span>`;
    case STATUS.EN_OFERTA: return `<span class="badge b-orange">EN_OFERTA</span>`;
    case STATUS.BLOQUEADA: return `<span class="badge b-amber">BLOQUEADA</span>`;
    case STATUS.CANCELADA: return `<span class="badge b-red">CANCELADA</span>`;
    case STATUS.NO_SE_PRESENTA: return `<span class="badge b-red">NO_SE_PRESENTA</span>`;
    default: return `<span class="badge b-slate">${escapeHTML(status)}</span>`;
  }
}

function publicLinks(row){
  const id = encodeURIComponent(row.publicId || row.ref || row.id);
  return {
    schedule:`http://localhost:3000/public/schedule/${id}`,
    questionnaire:`http://localhost:3000/public/questionnaire/${id}`,
    offer:`http://localhost:3000/public/offer/${id}`
  };
}

function computeStats(){
  const rows = state.rows;
  const today = todayISO();

  const leads = rows.filter(r => [STATUS.LEAD, STATUS.PENDIENTE, STATUS.MODIFICADA].includes(r.status)).length;
  const visitsToday = rows.filter(r => r.fecha === today && r.status !== STATUS.LEAD).length;
  const offers = rows.filter(r => r.status === STATUS.EN_OFERTA).length;
  const sla = rows.filter(r => ["orange","red"].includes(getSlaLevel(r))).length;
  const blocked = rows.filter(r => BLOCKING_STATES.has(r.status)).length;

  const scheduled = rows.filter(r => r.status !== STATUS.LEAD).length;
  const offerConv = scheduled ? Math.round((offers / scheduled) * 100) : 0;

  $("#statLeads").textContent = leads;
  $("#statLeadsSub").textContent = `${rows.filter(r => r.source === "Idealista").length} desde Idealista`;

  $("#statVisitsToday").textContent = visitsToday;
  $("#statVisitsTodaySub").textContent = `${rows.filter(r => r.status === STATUS.MODIFICADA).length} modificadas`;

  $("#statOffers").textContent = offers;
  $("#statOffersSub").textContent = `${rows.filter(r => r.offer).length} ofertas registradas`;

  $("#statSla").textContent = sla;
  $("#statSlaSub").textContent = `${rows.filter(r => getSlaLevel(r) === "red").length} críticas`;

  $("#statConversion").textContent = `${offerConv}%`;
  $("#statConversionSub").textContent = `${rows.filter(r => r.status === STATUS.REALIZADA).length} visitas realizadas`;

  $("#statBlocked").textContent = blocked;
  $("#statBlockedSub").textContent = `${rows.filter(r => r.status === STATUS.BLOQUEADA).length} bloqueos manuales`;
}

function renderFunnel(){
  const total = Math.max(state.rows.length, 1);
  const steps = [
    { label:"Leads", count: state.rows.filter(r => r.status === STATUS.LEAD).length },
    { label:"Visitas", count: state.rows.filter(r => [STATUS.PENDIENTE, STATUS.MODIFICADA, STATUS.BLOQUEADA, STATUS.REALIZADA, STATUS.CANCELADA, STATUS.NO_SE_PRESENTA, STATUS.CUESTIONARIO, STATUS.EN_OFERTA, STATUS.CONCERTADA].includes(r.status)).length },
    { label:"Finalizadas", count: state.rows.filter(r => [STATUS.REALIZADA, STATUS.CANCELADA, STATUS.NO_SE_PRESENTA].includes(r.status)).length },
    { label:"Cuestionario", count: state.rows.filter(r => r.questionnaire || r.status === STATUS.CUESTIONARIO || r.status === STATUS.EN_OFERTA).length },
    { label:"Oferta", count: state.rows.filter(r => r.offer || r.status === STATUS.EN_OFERTA).length }
  ];

  $("#funnel").innerHTML = steps.map(step => {
    const pct = Math.max(8, Math.round((step.count / total) * 100));
    return `
      <div class="funnelStep">
        <div class="funnelTop">
          <div class="funnelTitle">${step.label}</div>
          <div>${step.count}</div>
        </div>
        <div class="funnelValue">${step.count}</div>
        <div class="funnelSub">${Math.round((step.count / total) * 100)}% del total</div>
        <div class="barTrack"><div class="barFill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join("");
}

function renderSources(){
  const total = Math.max(state.rows.length, 1);
  const map = {};
  state.rows.forEach(r => map[r.source] = (map[r.source] || 0) + 1);

  const items = Object.entries(map)
    .sort((a,b) => b[1] - a[1])
    .map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      return `
        <div class="sourceItem">
          <div class="sourceRow">
            <div>
              <div class="sourceName">${escapeHTML(name)}</div>
              <div class="sourceMeta">${count} leads / visitas asociadas</div>
            </div>
            <div class="badge b-blue">${pct}%</div>
          </div>
          <div class="sourceBar"><span style="width:${Math.max(pct, 6)}%"></span></div>
        </div>
      `;
    });

  $("#sourceList").innerHTML = items.join("");
}

function renderAgents(){
  const today = todayISO();

  $("#agentTbody").innerHTML = AGENTS.map(agent => {
    const rows = state.rows.filter(r => r.agent === agent.name);
    const todayCount = rows.filter(r => r.fecha === today && r.status !== STATUS.LEAD).length;
    const pending = rows.filter(r => [STATUS.PENDIENTE, STATUS.MODIFICADA].includes(r.status)).length;
    const offers = rows.filter(r => r.status === STATUS.EN_OFERTA).length;
    const done = rows.filter(r => r.status === STATUS.REALIZADA).length;
    const load = Math.min(100, pending * 18 + offers * 24 + todayCount * 14);

    return `
      <tr>
        <td><strong>${escapeHTML(agent.name)}</strong></td>
        <td>${agent.online ? `<span class="badge b-emerald">ONLINE</span>` : `<span class="badge b-slate">OFFLINE</span>`}</td>
        <td>${todayCount}</td>
        <td>${pending}</td>
        <td>${offers}</td>
        <td>${done}</td>
        <td class="right">${load}%</td>
      </tr>
    `;
  }).join("");
}

function buildAlerts(){
  const alerts = [];

  const lateRows = state.rows.filter(r => getSlaLevel(r) === "red");
  if (lateRows.length){
    alerts.push({
      title:`${lateRows.length} visitas fuera de SLA`,
      meta:`Más de 48h sin cierre definitivo`,
      badge:`<span class="badge b-red">Crítico</span>`
    });
  }

  const offerRows = state.rows.filter(r => r.status === STATUS.EN_OFERTA);
  if (offerRows.length){
    alerts.push({
      title:`${offerRows.length} operaciones en oferta`,
      meta:`Revisar documentación, reserva y seguimiento comercial`,
      badge:`<span class="badge b-orange">Seguimiento</span>`
    });
  }

  const blockedRows = state.rows.filter(r => r.status === STATUS.BLOQUEADA);
  if (blockedRows.length){
    alerts.push({
      title:`${blockedRows.length} slots bloqueados manualmente`,
      meta:`Impactan en disponibilidad rotativa del equipo`,
      badge:`<span class="badge b-amber">Operación</span>`
    });
  }

  const noShow = state.rows.filter(r => r.status === STATUS.NO_SE_PRESENTA).length;
  if (noShow){
    alerts.push({
      title:`${noShow} no show detectados`,
      meta:`Conviene revisar llamada / mensaje de seguimiento`,
      badge:`<span class="badge b-red">Atención</span>`
    });
  }

  if (!alerts.length){
    alerts.push({
      title:"Sin alertas críticas",
      meta:"La operación está dentro de los umbrales definidos",
      badge:`<span class="badge b-emerald">OK</span>`
    });
  }

  $("#alertList").innerHTML = alerts.map(a => `
    <div class="alertItem">
      <div class="alertRow">
        <div>
          <div class="alertTitle">${a.title}</div>
          <div class="alertMeta">${a.meta}</div>
        </div>
        <div>${a.badge}</div>
      </div>
    </div>
  `).join("");
}

function applyFilters(){
  const s = state.search.trim().toLowerCase();
  const st = state.status;

  return state.rows.filter(r => {
    if (st !== "all" && r.status !== st) return false;
    if (!s) return true;

    return [
      r.ref, r.client, r.property, r.agent, r.source
    ].some(v => String(v || "").toLowerCase().includes(s));
  });
}

function applySort(list){
  const { key, dir } = state.sort;
  const mult = dir === "asc" ? 1 : -1;

  return [...list].sort((a,b) => {
    let x, y;

    if (key === "datetime") {
      x = rowDateTime(a);
      y = rowDateTime(b);
    } else if (key === "ref") {
      x = a.ref.toLowerCase();
      y = b.ref.toLowerCase();
    } else if (key === "source") {
      x = a.source.toLowerCase();
      y = b.source.toLowerCase();
    } else if (key === "property") {
      x = a.property.toLowerCase();
      y = b.property.toLowerCase();
    } else if (key === "agent") {
      x = a.agent.toLowerCase();
      y = b.agent.toLowerCase();
    }

    if (x < y) return -1 * mult;
    if (x > y) return 1 * mult;
    return 0;
  });
}

function stateSelectHTML(row){
  const options = Object.values(STATUS);
  return `
    <select class="stateSelect" data-action="setState" data-id="${row.id}">
      ${options.map(s => `<option value="${s}" ${s === row.status ? "selected" : ""}>${s}</option>`).join("")}
    </select>
  `;
}

function renderTable(){
  const filtered = applyFilters();
  const sorted = applySort(filtered);

  countLabel.textContent = `${sorted.length} registros • filtro: ${state.status === "all" ? "todos" : state.status}`;

  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="loading">No hay datos con ese filtro</td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map(row => {
    const slotConflict = state.rows.some(other =>
      other.id !== row.id &&
      other.fecha === row.fecha &&
      other.hora === row.hora &&
      BLOCKING_STATES.has(other.status)
    );

    return `
      <tr data-id="${row.id}">
        <td class="mono">${escapeHTML(row.ref)}</td>
        <td>
          <strong style="color:#fff">${escapeHTML(row.client)}</strong>
          <div class="muted">${escapeHTML(row.email)}</div>
        </td>
        <td>${escapeHTML(row.source)}</td>
        <td>${escapeHTML(row.property)}</td>
        <td>${escapeHTML(row.agent)}</td>
        <td>
          ${formatESDate(row.fecha)} • ${escapeHTML(row.hora)}
          ${slotConflict ? `<div style="margin-top:6px"><span class="badge b-red">Conflicto slot</span></div>` : ""}
        </td>
        <td>${slaBadge(row)}</td>
        <td>
          ${stateSelectHTML(row)}
          <div style="margin-top:6px">${statusBadge(row.status)}</div>
        </td>
        <td class="right">
          <button class="actionBtn" data-action="open" data-id="${row.id}">Ver detalle</button>
        </td>
      </tr>
    `;
  }).join("");
}

function render(){
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
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = data.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    return data;
  } catch (e) {
    showToast('⚠️ No se pudieron cargar los comerciales');
  }
}

async function openDrawer(id){
  const row = state.rows.find(r => r.id === id);
  if (!row) return;

  state.selectedId = id;
  $("#drawer").setAttribute("aria-hidden","false");
  $("#drawerTitle").textContent = `Editar Operación ${row.ref}`;
  
  const links = publicLinks(row);

  $("#drawerBody").innerHTML = `
    <div class="grid2">
      <div class="kv">
        <div class="k">Referencia Interna</div>
        <div class="v"><input id="editRef" type="text" value="${escapeHTML(row.ref)}" /></div>
      </div>
      <div class="kv">
        <div class="k">Public ID / ID Externo</div>
        <div class="v"><input id="editPublicId" type="text" value="${escapeHTML(row.publicId)}" /></div>
      </div>
    </div>

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
        <div class="k">Inmueble</div>
        <div class="v"><input id="editProperty" type="text" value="${escapeHTML(row.property)}" /></div>
      </div>
      <div class="kv">
        <div class="k">Fuente</div>
        <div class="v"><input id="editSource" type="text" value="${escapeHTML(row.source)}" /></div>
      </div>
    </div>

    <div class="grid2">
      <div class="kv">
        <div class="k">Comercial</div>
        <div class="v" style="display:flex; gap:8px; align-items:center;">
          <select id="editAgent" style="flex:1"></select>
          <button type="button" id="addComercialBtnDrawer" class="btn ghost" style="white-space:nowrap">+ Nuevo</button>
        </div>
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

    <div class="grid2">
      <div class="kv">
        <div class="k">Fecha</div>
        <div class="v"><input id="editFecha" type="date" value="${row.fecha}" /></div>
      </div>
      <div class="kv">
        <div class="k">Hora</div>
        <div class="v"><input id="editHora" type="time" value="${row.hora}" /></div>
      </div>
    </div>

    <div class="kv">
      <div class="k">URL de origen del inmueble</div>
      <div class="v">
        ${row.sourceUrl
          ? `<a class="pill" target="_blank" href="${escapeHTML(row.sourceUrl)}">${escapeHTML(row.sourceUrl)}</a>`
          : `<span class="muted" style="font-size:11px">Sin URL de origen registrada</span>`
        }
      </div>
    </div>

    <div class="kv">
      <div class="k">Fase 1 · Links públicos</div>
      <div class="v" style="display:flex;flex-direction:column;gap:8px">
        <a class="pill" target="_blank" href="${links.schedule}">${links.schedule}</a>
        <a class="pill" target="_blank" href="${links.questionnaire}">${links.questionnaire}</a>
        <a class="pill" target="_blank" href="${links.offer}">${links.offer}</a>
      </div>
    </div>

    <div class="kv">
      <div class="k">Link de oferta comercial</div>
      <div class="v" style="display:flex;flex-direction:column;gap:8px">
        ${row.offer
          ? `<a class="pill" target="_blank" href="${escapeHTML(row.offer)}" style="background:var(--blue);color:white;font-weight:bold;">${escapeHTML(row.offer)}</a>`
          : `<span class="muted" style="font-size:11px">⚠️ Link de oferta no registrado</span>`
        }
        <input
          id="editOffer"
          type="text"
          placeholder="Pegá el link de oferta aquí..."
          value="${escapeHTML(row.offer || '')}"
        />
      </div>
    </div>

    <div class="kv">
      <div class="k">Estado Cuestionario</div>
      <div class="v">
        <select id="editQuestionnaire">
          <option value="false" ${!row.questionnaire ? "selected" : ""}>No enviado</option>
          <option value="true" ${row.questionnaire ? "selected" : ""}>Enviado / Respondido</option>
        </select>
      </div>
    </div>
  `;

  await loadComerciales('editAgent');
  document.getElementById('editAgent').value = row.agent;

  document.getElementById('addComercialBtnDrawer').addEventListener('click', async () => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,.6);
      display:flex; align-items:center; justify-content:center; z-index:200;
    `;
    overlay.innerHTML = `
      <div style="
        background:rgba(11,18,32,.98); border:1px solid rgba(255,255,255,.10);
        border-radius:18px; padding:24px; width:360px; display:flex; flex-direction:column; gap:14px;
      ">
        <div style="font-size:16px; font-weight:900; color:#fff">Nuevo comercial</div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">NOMBRE</label>
          <input id="newComercialNombre" type="text" placeholder="Nombre completo" style="
            width:100%; padding:11px 12px; border-radius:14px;
            border:1px solid rgba(255,255,255,.08); background:rgba(2,6,23,.45);
            color:#e5e7eb; font-size:14px; outline:none; box-sizing:border-box;
          " />
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">EMAIL</label>
          <input id="newComercialEmail" type="email" placeholder="comercial@email.com" style="
            width:100%; padding:11px 12px; border-radius:14px;
            border:1px solid rgba(255,255,255,.08); background:rgba(2,6,23,.45);
            color:#e5e7eb; font-size:14px; outline:none; box-sizing:border-box;
          " />
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">TELÉFONO</label>
          <input id="newComercialTelefono" type="tel" placeholder="+34 600 000 000" style="
            width:100%; padding:11px 12px; border-radius:14px;
            border:1px solid rgba(255,255,255,.08); background:rgba(2,6,23,.45);
            color:#e5e7eb; font-size:14px; outline:none; box-sizing:border-box;
          " />
        </div>
        <div style="display:flex; gap:10px; justify-content:flex-end;">
          <button id="cancelComercial" class="btn ghost">Cancelar</button>
          <button id="confirmComercial" class="btn primary">Crear</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('newComercialNombre').focus();

    document.getElementById('cancelComercial').onclick = () => overlay.remove();

    document.getElementById('confirmComercial').onclick = async () => {
      const nombre = document.getElementById('newComercialNombre').value.trim();
      const email  = document.getElementById('newComercialEmail').value.trim();
      const telefono = document.getElementById('newComercialTelefono').value.trim();

      if (!nombre) { showToast('⚠️ El nombre es obligatorio'); return; }

      try {
        const res = await fetch(COMERCIALES_API, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ nombre, email, telefono })
        });
        if (!res.ok) throw new Error();
        showToast(`✅ ${nombre} agregado`);
        overlay.remove();
        await loadComerciales('editAgent');
        document.getElementById('editAgent').value = nombre;
      } catch (e) {
        showToast('⚠️ Error al crear comercial');
      }
    };
  });
}

function closeDrawer(){
  $("#drawer").setAttribute("aria-hidden","true");
  state.selectedId = null;
}

function setSort(key){
  const current = state.sort;
  if (current.key === key) {
    state.sort.dir = current.dir === "asc" ? "desc" : "asc";
  } else {
    state.sort.key = key;
    state.sort.dir = "asc";
  }

  $$("thead th.sortable").forEach(th => {
    th.removeAttribute("data-dir");
    if (th.dataset.sort === state.sort.key) th.setAttribute("data-dir", state.sort.dir);
  });

  renderTable();
}

function exportCSV(rows){
  const header = ["id","ref","client","phone","email","source","property","agent","fecha","hora","status","questionnaire","offer","publicId"];
  const csv = [
    header.join(","),
    ...rows.map(r => header.map(k => `"${String(r[k] ?? "").replaceAll('"','""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wincontrol_admin_dashboard.csv";
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

$$("thead th.sortable").forEach(th => {
  th.addEventListener("click", () => setSort(th.dataset.sort));
});

tbody.addEventListener("click", (e) => {
  const openBtn = e.target.closest("[data-action='open']");
  const tr = e.target.closest("tr[data-id]");
  if (!tr) return;

  if (e.target.closest("select")) return;

  if (openBtn) {
    openDrawer(openBtn.dataset.id);
    return;
  }

  openDrawer(tr.dataset.id);
});

tbody.addEventListener("change", async (e) => {
  const select = e.target.closest("select[data-action='setState']");
  if (!select) return;

  const row = state.rows.find(r => r.id === select.dataset.id);
  if (!row) return;

  const newStatus = select.value;

  try {
    await updateLead(row.id, {
      estado: newStatus,
      questionnaire: newStatus === STATUS.CUESTIONARIO || newStatus === STATUS.EN_OFERTA,
      offer: newStatus === STATUS.EN_OFERTA ? true : row.offer
    });

    await loadRowsFromAPI();

    showToast(`Estado actualizado a ${newStatus}`);
  } catch (err) {
    console.error(err);
    showToast("Error al guardar estado");
  }
});

$("#closeDrawer").onclick = closeDrawer;
$("#drawerBackdrop").onclick = closeDrawer;

$("#saveBtn").onclick = async () => {
  if (!state.selectedId) return;

  const row = state.rows.find(r => r.id === state.selectedId);
  if (!row) return;

  // Recolectamos la información de todos los campos editables
  const updated = {
    ref: $("#editRef").value,
    publicId: $("#editPublicId").value,
    cliente: $("#editClient").value,
    phone: $("#editPhone").value,
    email: $("#editEmail").value,
    inmueble: $("#editProperty").value,
    source: $("#editSource").value,
    comercial: $("#editAgent").value,
    estado: $("#editStatus").value,
    fecha: $("#editFecha").value,
    hora: $("#editHora").value,
    questionnaire: $("#editQuestionnaire").value === "true",
    offer: (document.getElementById("editOffer")?.value ?? "").trim() || row.offer
  };

  try {
    // Llamada a tu función async que hace el PUT a http://localhost:3000/api/leads
    await updateLead(row.id, updated);
    
    // Recargamos los datos del servidor para que la tabla se actualice
    await loadRowsFromAPI(); 

    showToast("Operación actualizada con éxito");
  } catch (err) {
    console.error("Error al guardar:", err);
    showToast("Error al conectar con el servidor");
  }
};

$("#deleteBtn").onclick = async () => {
  if (!state.selectedId) return;

  try {
    console.log("Deleting ID:", state.selectedId);
    await deleteLeadApi(state.selectedId);

    await loadRowsFromAPI();

    closeDrawer();
    showToast("Registro eliminado");
  } catch (err) {
    console.error(err);
    showToast("Error al eliminar");
  }
};

$("#copyLinksBtn").onclick = async () => {
  if (!state.selectedId) return;
  const row = state.rows.find(r => r.id === state.selectedId);
  if (!row) return;

  const links = publicLinks(row);
  const text = `${links.schedule}\n${links.questionnaire}\n${links.offer}`;

  try {
    await navigator.clipboard.writeText(text);
    showToast("Links copiados");
  } catch {
    showToast("No se pudo copiar");
  }
};

$("#exportBtn").onclick = () => exportCSV(state.rows);

// $("#seedBtn").onclick = () => {
//   state.rows = JSON.parse(JSON.stringify(demoRows));
//   saveLS();
//   render();
//   showToast("Demo restaurada");
// };

// $("#createLeadBtn").onclick = async () => {
//   const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)].name;
//   const sources = ["Idealista", "Habitaclia", "Web", "Referido"];
//   const source = sources[Math.floor(Math.random() * sources.length)];
//   const ref = `WC-${Math.floor(9200 + Math.random() * 100)}`;

//   const row = {
//     id: String(Date.now()),
//     ref,
//     client: "Lead demo",
//     phone: "+34 600 000 000",
//     email: "lead@demo.com",
//     source,
//     property: "Piso 2 hab · Demo",
//     agent,
//     fecha: plusDays(1),
//     hora: "18:30",
//     status: STATUS.LEAD,
//     createdAt: new Date().toISOString(),
//     questionnaire: false,
//     offer: false,
//     publicId: ref.replace("WC-","")
//   };

//   const newVisit = await createVisit({
//     ref: row.ref,
//     cliente: row.client,
//     inmueble: row.property,
//     comercial: row.agent,
//     fecha: row.fecha,
//     hora: row.hora,
//     estado: row.status,
//     source: row.source,
//     phone: row.phone,
//     email: row.email,
//     questionnaire: row.questionnaire,
//     offer: row.offer,
//     publicId: row.publicId
//   });
//   await loadRowsFromAPI();
//   render();
//   showToast("Lead demo creado");
// };

(async function init(){
  nowLabel.textContent = formatNow();
  setInterval(() => nowLabel.textContent = formatNow(), 30000);

  try {
    const data = await fetchLeads();
    state.rows = data.map(v => ({
      id: v.id,
      ref: v.ref,
      client: v.cliente,
      property: v.inmueble,
      agent: v.comercial,
      fecha: v.fecha,
      hora: v.hora,
      status: v.estado,
      source: v.source || "—",
      phone: v.phone || "",
      email: v.email || "",
      questionnaire: v.questionnaire || false,
      offer: v.offer && v.offer !== true ? v.offer : "",
      sourceUrl: v.sourceUrl || "",
      publicId: v.publicId || v.id,
      createdAt: v.createdAt
    }));
  } catch (err) {
    console.error("Error cargando leads:", err);
    state.rows = [];
  }

  const th = document.querySelector(`thead th.sortable[data-sort="${state.sort.key}"]`);
  if (th) th.setAttribute("data-dir", state.sort.dir);

  render();
  await loadVisitsAdmin();
})();

async function loadRowsFromAPI() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  const data = await res.json();

  state.rows = data.map(v => ({
    id: v.id,
    ref: v.ref,
    client: v.cliente,
    property: v.inmueble,
    agent: v.comercial,
    fecha: v.fecha,
    hora: v.hora,
    status: v.estado,
    source: v.source || "",
    phone: v.phone || "",
    email: v.email || "",
    questionnaire: v.questionnaire || false,
    offer: v.offer ? v.offer : "",
    sourceUrl: v.sourceUrl || "",
    publicId: v.publicId || v.id,
    createdAt: v.createdAt
  }));

  render();
};

// Lógica del Modal
function openCreateLeadModal() {
  const modal = document.getElementById('createLeadModal');
  modal.style.display = 'flex';
  document.getElementById('lead-url').value = '';
  document.getElementById('lead-url').focus();
}

function closeCreateLeadModal() {
  document.getElementById('createLeadModal').style.display = 'none';
}

// Cerrar si tocan fuera del cuadro blanco
window.addEventListener('click', (e) => {
  const modal = document.getElementById('createLeadModal');
  if (e.target === modal) closeCreateLeadModal();
});

// Procesar el link
function parseLink(url) {
  let source = 'Web';
  if (url.toLowerCase().includes('idealista')) source = 'Idealista';
  if (url.toLowerCase().includes('habitaclia')) source = 'Habitaclia';

  const match = url.match(/(\d+)/);
  const publicId = match ? match[0] : Math.floor(Math.random() * 10000).toString();

  return { source, publicId };
}

// Guardar en Base de Datos
async function createLeadFromLink() {
  const urlInput = document.getElementById('lead-url');
  const url = urlInput.value.trim();

  if (!url) {
    showToast('Pegá un link para continuar');
    return;
  }

  const { source, publicId } = parseLink(url);
  
  // Objeto formateado para tu API
  const newLead = {
    ref: `W-${publicId}`,
    cliente: "Nuevo Lead",
    inmueble: "Propiedad importada",
    comercial: "Sin asignar",
    fecha: todayISO(),
    hora: "00:00",
    estado: STATUS.LEAD,
    source: source,
    phone: "",
    email: "",
    questionnaire: false,
    sourceUrl: url,
    offer: "",
    publicId: publicId
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(newLead)
    });

    if (!res.ok) throw new Error('Error en el servidor');

    showToast(`Lead de ${source} creado con éxito`);
    closeCreateLeadModal();
    
    // Recarga la tabla automáticamente
    await loadRowsFromAPI(); 

  } catch (err) {
    console.error(err);
    showToast('No se pudo guardar el lead');
  }
}

async function loadVisitsAdmin() {
  try {

    const comercialesRes = await fetch(COMERCIALES_API, {
      headers: authHeaders()
    });

    window.adminComerciales = await comercialesRes.json();

    const res = await fetch(VISITS_ADMIN_API, {
      headers: authHeaders()
    });

    const visits = await res.json();

    renderVisitsAdmin(visits);

  } catch (err) {

    console.error(err);

    document.getElementById('visitsAdminTbody').innerHTML = `
      <tr>
        <td colspan="6" class="loading">
          Error cargando visitas
        </td>
      </tr>
    `;
  }
}

function renderVisitsAdmin(visits) {

  const tbody = document.getElementById('visitsAdminTbody');

  if (!visits.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="loading">
          No hay visitas
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = visits.map(v => `
    <tr>

      <td class="mono">
        ${v.ref || '-'}
      </td>

      <td>
        <strong style="color:#fff">
          ${v.inmueble || '-'}
        </strong>
      </td>

      <td>
        ${v.cliente || '-'}
      </td>

      <td>
        <select
          class="stateSelect adminVisitCommercial"
          data-id="${v.id}"
        >
          ${window.adminComerciales.map(c => `
            <option
              value="${c.nombre}"
              ${c.nombre === v.comercial ? 'selected' : ''}
            >
              ${c.nombre}
            </option>
          `).join('')}
        </select>
      </td>

      <td>
        ${v.fecha || '-'} • ${v.hora || '-'}
      </td>

      <td>
        <select
          class="stateSelect adminVisitStatus"
          data-id="${v.id}"
        >
          <option value="PENDIENTE" ${v.estado === 'PENDIENTE' ? 'selected' : ''}>
            PENDIENTE
          </option>

          <option value="MODIFICADA" ${v.estado === 'MODIFICADA' ? 'selected' : ''}>
            MODIFICADA
          </option>

          <option value="EN_OFERTA" ${v.estado === 'EN_OFERTA' ? 'selected' : ''}>
            EN_OFERTA
          </option>

          <option value="REALIZADA" ${v.estado === 'REALIZADA' ? 'selected' : ''}>
            REALIZADA
          </option>

          <option value="BLOQUEADA" ${v.estado === 'BLOQUEADA' ? 'selected' : ''}>
            BLOQUEADA
          </option>

          <option value="CANCELADA" ${v.estado === 'CANCELADA' ? 'selected' : ''}>
            CANCELADA
          </option>

          <option value="NO_SE_PRESENTA" ${v.estado === 'NO_SE_PRESENTA' ? 'selected' : ''}>
            NO_SE_PRESENTA
          </option>
        </select>
      </td>

    </tr>
  `).join('');
}

document.addEventListener('change', async (e) => {

  // ESTADO
  if (e.target.classList.contains('adminVisitStatus')) {

    const id = e.target.dataset.id;
    const estado = e.target.value;

    try {

      await fetch(`${VISITS_API}/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ estado })
      });

      showToast('Estado actualizado');

    } catch (err) {

      console.error(err);
      showToast('⚠️ Error actualizando estado');

    }
  }

  // COMERCIAL
  if (e.target.classList.contains('adminVisitCommercial')) {

    const id = e.target.dataset.id;
    const comercial = e.target.value;

    try {

      await fetch(`${VISITS_API}/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ comercial })
      });

      showToast('Comercial actualizado');

    } catch (err) {

      console.error(err);
      showToast('⚠️ Error actualizando comercial');

    }
  }

});