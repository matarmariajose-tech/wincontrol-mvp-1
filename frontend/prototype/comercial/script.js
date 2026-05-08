// JS (CodePen) — conectado a API REST /api/visits
const API = `${CONFIG.API_URL}/api/visits`;

const STATUS = {
  PENDIENTE:      "PENDIENTE",
  MODIFICADA:     "MODIFICADA",
  EN_OFERTA:      "EN_OFERTA",
  CONCERTADA:     "CONCERTADA",
  REALIZADA:      "REALIZADA",
  BLOQUEADA:      "BLOQUEADA",
  CANCELADA:      "CANCELADA",
  NO_SE_PRESENTA: "NO_SE_PRESENTA",
};

const EDITABLE_STATES = [
  STATUS.REALIZADA, STATUS.CANCELADA, STATUS.NO_SE_PRESENTA, STATUS.MODIFICADA,
];
const BLOCKING_STATES = new Set([STATUS.EN_OFERTA, STATUS.REALIZADA, STATUS.BLOQUEADA, STATUS.CONCERTADA]);

let state = {
  visits: [],
  search: "",
  status: "all",
  sort: { key: "datetime", dir: "asc" },
  selectedId: null,
};

// ─── Utils DOM ────────────────────────────────────────────────────────────────
const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];

const tbody      = $("#tbody");
const searchInput = $("#searchInput");
const clearSearch = $("#clearSearch");
const countLabel  = $("#countLabel");
const nowLabel    = $("#nowLabel");

const statToday   = $("#statToday");
const statPending = $("#statPending");
const statOffers  = $("#statOffers");
const statConv    = $("#statConv");
const toast       = $("#toast");

const modal         = $("#modal");
const newVisitBtn   = $("#newVisitBtn");
const closeModal    = $("#closeModal");
const modalBackdrop = $("#modalBackdrop");
const newVisitForm  = $("#newVisitForm");
const seedBtn       = $("#seedBtn");
const calendarHint  = $("#calendarHint");

const drawer            = $("#drawer");
const closeDrawer       = $("#closeDrawer");
const drawerBackdrop    = $("#drawerBackdrop");
const drawerBody        = $("#drawerBody");
const drawerTitle       = $("#drawerTitle");
const drawerSub         = $("#drawerSub");
const deleteBtn         = $("#deleteBtn");
const saveBtn           = $("#saveBtn");
const copyPublicLinksBtn= $("#copyPublicLinksBtn");

const flowBtn           = $("#flowBtn");
const flowModal         = $("#flowModal");
const closeFlow         = $("#closeFlow");
const flowBackdrop      = $("#flowBackdrop");
const copyAllLinks      = $("#copyAllLinks");
const createIdealistaLead = $("#createIdealistaLead");
const applyOfferBtn     = $("#applyOfferBtn");
const exportBtn         = $("#exportBtn");

// ─── authHeaders ────────────────────────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem('wc_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  toast.setAttribute("aria-hidden","false");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden","true");
  }, 1900);
}

// ─── LocalStorage (solo para contactos) ──────────────────────────────────────
function saveLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function loadLS(key){
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}

// ─── API helpers ─────────────────────────────────────────────────────────────
async function apiFetch(path = "", options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: authHeaders(),
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }
  return data;
}

async function loadVisitsFromAPI() {
  try {
    state.visits = await apiFetch();
    render();
  } catch (err) {
    showToast("⚠️ No se pudo cargar desde API. Usando demo local.");
    console.error(err);
    // fallback demo
    state.visits = [
      { id:"1", ref:"W-7842", inmueble:"Piso 3 hab - Gràcia",        clienteId:"c1", comercial:"Toni Ruiz",  fecha:"2025-02-21", hora:"10:30", estado:STATUS.PENDIENTE },
      { id:"2", ref:"W-7841", inmueble:"Ático 2 hab - Eixample",      clienteId:"c2", comercial:"Sara López", fecha:"2025-02-21", hora:"12:00", estado:STATUS.MODIFICADA },
      { id:"3", ref:"W-7840", inmueble:"Casa con piscina - Sant Cugat",clienteId:"c3", comercial:"Marc Puig", fecha:"2025-02-20", hora:"16:45", estado:STATUS.BLOQUEADA },
      { id:"4", ref:"W-7839", inmueble:"Estudio - Poblenou",           clienteId:"c4", comercial:"Toni Ruiz", fecha:"2025-02-20", hora:"09:15", estado:STATUS.CANCELADA },
      { id:"5", ref:"W-7838", inmueble:"Piso 4 hab - Les Corts",       clienteId:"c5", comercial:"Sara López",fecha:"2025-02-19", hora:"11:00", estado:STATUS.REALIZADA },
      { id:"6", ref:"W-7837", inmueble:"Dúplex - Sarrià",              clienteId:"c6", comercial:"Marc Puig", fecha:"2025-02-21", hora:"15:30", estado:STATUS.EN_OFERTA },
    ];
    render();
  }
}

// ─── Formato / helpers ────────────────────────────────────────────────────────
function pad2(n){ return String(n).padStart(2,"0"); }
function formatESDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${pad2(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function formatNow() {
  const d = new Date();
  const date = new Intl.DateTimeFormat("es-ES",{ day:"2-digit", month:"long", year:"numeric" }).format(d);
  const time = new Intl.DateTimeFormat("es-ES",{ hour:"2-digit", minute:"2-digit" }).format(d);
  return `${date} • ${time}`;
}
function visitDateTime(v){ return new Date(`${v.fecha}T${v.hora}:00`).getTime(); }

function computeStats(visits) {
  const todayIso = new Date().toISOString().slice(0,10);
  statToday.textContent   = String(visits.filter(v => v.fecha === todayIso).length);
  statPending.textContent = String(visits.filter(v => [STATUS.PENDIENTE, STATUS.MODIFICADA].includes(v.estado)).length);
  statOffers.textContent  = String(visits.filter(v => v.estado === STATUS.EN_OFERTA).length);
  const conv = visits.length
    ? Math.round((visits.filter(v => v.estado === STATUS.REALIZADA).length / visits.length) * 100)
    : 0;
  statConv.textContent = visits.length ? `${conv}%` : "—";
}

function slotKey(fecha, hora){ return `${fecha}__${hora}`; }
function slotIsBlocked(fecha, hora, excludeId=null){
  const key = slotKey(fecha, hora);
  return state.visits.some(v =>
    v.id !== excludeId &&
    slotKey(v.fecha, v.hora) === key &&
    BLOCKING_STATES.has(v.estado)
  );
}

function badgeHTML(estado) {
  const map = {
    [STATUS.REALIZADA]:      "b-emerald",
    [STATUS.PENDIENTE]:      "b-blue",
    [STATUS.BLOQUEADA]:      "b-amber",
    [STATUS.MODIFICADA]:     "b-violet",
    [STATUS.EN_OFERTA]:      "b-orange",
    [STATUS.CANCELADA]:      "b-red",
    [STATUS.NO_SE_PRESENTA]: "b-red",
    [STATUS.CONCERTADA]:     "b-blue",
  };
  return `<span class="badge ${map[estado] || ''}">${estado}</span>`;
}

function escapeHTML(s=""){
  return String(s)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function applyFilters(){
  const s = state.search.trim().toLowerCase();
  const st = state.status;
  return state.visits.filter(v => {
    if (st !== "all" && v.estado !== st) return false;
    if (!s) return true;
    return (
      (v.cliente || "").toLowerCase().includes(s) ||
      String(v.inmueble||"").toLowerCase().includes(s) ||
      String(v.ref||"").toLowerCase().includes(s)
    );
  });
}

function applySort(list){
  const { key, dir } = state.sort;
  const mult = dir === "asc" ? 1 : -1;
  return [...list].sort((a,b) => {
    const get = (v) => {
      if (key === "datetime")  return visitDateTime(v);
      if (key === "ref")       return v.ref.toLowerCase();
      if (key === "inmueble")  return v.inmueble.toLowerCase();
      if (key === "comercial") return v.comercial.toLowerCase();
      return "";
    };
    const x = get(a), y = get(b);
    if (x < y) return -1 * mult;
    if (x > y) return  1 * mult;
    return 0;
  });
}

// ─── Render ───────────────────────────────────────────────────────────────────
function stateSelectHTML(v){
  const options = [
    STATUS.PENDIENTE, STATUS.MODIFICADA, STATUS.EN_OFERTA,
    STATUS.REALIZADA, STATUS.BLOQUEADA, STATUS.CANCELADA, STATUS.NO_SE_PRESENTA,
  ];
  return `
    <select class="stateSelect" data-action="setState" data-id="${v.id}">
      ${options.map(s => `<option value="${s}" ${s===v.estado?"selected":""}>${s}</option>`).join("")}
    </select>
  `;
}

function render(){
  const filtered = applyFilters();
  const sorted   = applySort(filtered);
  computeStats(state.visits);

  // Texto en español: "leads" en el contador pero "visitas" en el UI interno (ambos son la misma entidad)
  countLabel.textContent = `${sorted.length} registros • filtro: ${state.status === "all" ? "todas" : state.status}`;

  if (!sorted.length){
    tbody.innerHTML = `<tr><td colspan="7" class="loading">No se encontraron visitas</td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map(v => {
    const cliente = v.cliente ?? "—";
    const date = formatESDate(v.fecha);
    return `
      <tr data-id="${v.id}">
        <td class="mono">${escapeHTML(v.ref)}</td>
        <td><strong style="color:#fff">${escapeHTML(v.inmueble)}</strong></td>

        <td>${escapeHTML(cliente)}</td>

        <td>${escapeHTML(v.comercial)}</td>

        <td style="color:#cbd5e1">
          ${date} <span style="color:#334155">•</span> ${escapeHTML(v.hora)}
          ${slotIsBlocked(v.fecha, v.hora, v.id) ? `<span class="badge b-red" style="margin-left:8px">SLOT OCUPADO</span>` : ""}
        </td>

        <td>
          ${stateSelectHTML(v)}
          <div style="margin-top:6px">${badgeHTML(v.estado)}</div>
        </td>

        <td class="right">
          <button class="actionBtn" data-action="open" data-id="${v.id}">Ver ficha completa</button>
        </td>
      </tr>
    `;
  }).join("");
}

// ─── Popovers ─────────────────────────────────────────────────────────────────
function closeAllPopovers(){ $$(".popover.show").forEach(p => p.classList.remove("show")); }

// ─── Drawer ───────────────────────────────────────────────────────────────────
function publicLinksForVisit(v){
  const pubId = encodeURIComponent(v.publicId || v.ref || v.id);
  return {
    schedule:      `http://localhost:3000/public/schedule/${pubId}`,
    questionnaire: `http://localhost:3000/public/questionnaire/${pubId}`,
    offer:         `http://localhost:3000/public/offer/${pubId}`,
  };
}

async function openDrawer(id){
  const v = state.visits.find(x => x.id === id);
  if (!v) return;
  state.selectedId = id;
  drawer.setAttribute("aria-hidden","false");

  const date = formatESDate(v.fecha);
  drawerTitle.textContent = `Ficha completa • ${v.ref}`;
  drawerSub.textContent   = `${date} • ${v.hora} • ${v.estado}`;

  const links = publicLinksForVisit(v);

  drawerBody.innerHTML = `
    <div class="kv"><div class="k">Cliente</div><div class="v">
      <input id="editCliente" type="text" value="${escapeHTML(v.cliente||'')}" />
    </div></div>

    <div class="kv"><div class="k">Email del cliente</div><div class="v">
      <input id="editClienteEmail" type="email" value="${escapeHTML(v.clienteEmail||'')}" />
    </div></div>

    <div class="kv"><div class="k">Inmueble</div><div class="v">
      <input id="editInmueble" type="text" value="${escapeHTML(v.inmueble||'')}" />
    </div></div>

    <div class="kv"><div class="k">Comercial</div><div class="v">
      <select id="editComercial"></select>
    </div></div>

    <div class="grid2">
      <div class="kv">
        <div class="k">Estado (editable)</div>
        <div class="v">
          <select id="editEstado">
            ${[STATUS.PENDIENTE,STATUS.MODIFICADA,STATUS.EN_OFERTA,STATUS.REALIZADA,STATUS.BLOQUEADA,STATUS.CANCELADA,STATUS.NO_SE_PRESENTA]
              .map(s => `<option value="${s}" ${s===v.estado?"selected":""}>${s}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="kv">
        <div class="k">Agenda (solo si MODIFICADA)</div>
        <div class="v">
          <input id="editFecha" type="date" value="${v.fecha}" />
          <div style="height:8px"></div>
          <input id="editHora" type="time" value="${v.hora}" />
          <div style="margin-top:8px;color:#64748b;font-size:12px;">
            Valida conflicto: si un slot está EN_OFERTA/REALIZADA/BLOQUEADA, no podrás ocuparlo.
          </div>
        </div>
      </div>
    </div>

    <div class="kv">
      <div class="k">Links públicos</div>
      <div class="v" style="display:flex;flex-direction:column;gap:8px;font-weight:900">
        <a class="pill" href="${links.schedule}"      target="_blank">${links.schedule}</a>
        <a class="pill" href="${links.questionnaire}" target="_blank">${links.questionnaire}</a>
        <a class="pill" href="${links.offer}"         target="_blank">${links.offer}</a>
      </div>
    </div>

    <div class="kv">
      <div class="k">Acciones rápidas</div>
      <div class="v" style="display:flex;gap:10px;flex-wrap:wrap;">
        <button type="button" class="btn ghost"   id="toBlocked">BLOQUEADA</button>
        <button type="button" class="btn ghost"   id="toOffer">EN_OFERTA</button>
        <button type="button" class="btn primary" id="toDone">REALIZADA</button>
      </div>
    </div>
  `;

  await loadComerciales('editComercial');
  document.getElementById('editComercial').value = v.comercial;

  const quickChange = async (newStatus) => {
    try {
      const updated = await apiFetch(`/${v.id}`, {
        method: "PATCH",
        body: JSON.stringify({ estado: newStatus }),
      });
      const idx = state.visits.findIndex(x => x.id === v.id);
      if (idx !== -1) state.visits[idx] = updated;
      render();
      openDrawer(v.id);
      showToast(`Estado → ${newStatus}`);
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    }
  };

  $("#toBlocked").onclick = () => quickChange(STATUS.BLOQUEADA);
  $("#toOffer").onclick   = () => quickChange(STATUS.EN_OFERTA);
  $("#toDone").onclick    = () => quickChange(STATUS.REALIZADA);
}

function closeDrawerUI(){
  drawer.setAttribute("aria-hidden","true");
  state.selectedId = null;
}

// ─── Modal crear ──────────────────────────────────────────────────────────────
function openModal(){ modal.setAttribute("aria-hidden","false"); updateCalendarHint(); }
function closeModalUI(){ modal.setAttribute("aria-hidden","true"); }

function updateCalendarHint(){
  const fecha  = newVisitForm.fecha.value;
  const hora   = newVisitForm.hora.value;
  const estado = newVisitForm.estado.value;
  if (!fecha || !hora){ calendarHint.textContent = "Selecciona fecha/hora para validar disponibilidad."; return; }
  const blocked = slotIsBlocked(fecha, hora, null);
  if (blocked){
    calendarHint.textContent = `⛔ Slot ${fecha} ${hora} está BLOQUEADO.`;
  } else if (BLOCKING_STATES.has(estado)){
    calendarHint.textContent = `✅ Slot disponible. Si guardas como ${estado}, el slot quedará bloqueado.`;
  } else {
    calendarHint.textContent = `✅ Slot disponible. Puedes guardar como ${estado}.`;
  }
}

function setSort(key){
  const ths = $$("thead th.sortable");
  if (state.sort.key === key) state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
  else { state.sort.key = key; state.sort.dir = "asc"; }
  ths.forEach(th => {
    th.removeAttribute("data-dir");
    if (th.dataset.sort === state.sort.key) th.setAttribute("data-dir", state.sort.dir);
  });
  render();
}

function exportCSV(visits){
  const header = ["id","ref","inmueble","clienteId","comercial","fecha","hora","estado","publicId"];
  const rows   = visits.map(v => header.map(k => `"${String(v[k]??"").replaceAll('"','""')}"`).join(","));
  const csv    = [header.join(","), ...rows].join("\n");
  const blob   = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href = url; a.download = "wincontrol_visitas.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Event listeners ──────────────────────────────────────────────────────────
searchInput.addEventListener("input", (e) => { state.search = e.target.value; render(); });
clearSearch.onclick = () => { state.search=""; searchInput.value=""; render(); };

$("#statusFilter").addEventListener("click", (e) => {
  const btn = e.target.closest(".seg");
  if (!btn) return;
  state.status = btn.dataset.status;
  $$("#statusFilter .seg").forEach(b => b.classList.toggle("active", b.dataset.status === state.status));
  render();
});

$$("thead th.sortable").forEach(th => th.addEventListener("click", () => setSort(th.dataset.sort)));

closeDrawer.onclick = closeDrawerUI;
drawerBackdrop.onclick = closeDrawerUI;

// Guardar desde drawer (con PATCH a la API)
saveBtn.onclick = async () => {
  if (!state.selectedId) return;
  const v = state.visits.find(x => x.id === state.selectedId);
  if (!v) return;

  const est   = $("#editEstado")?.value;
  const fecha = $("#editFecha")?.value;
  const hora  = $("#editHora")?.value;

  if (est === STATUS.MODIFICADA && (!fecha || !hora)){
    showToast("Falta fecha/hora para MODIFICADA"); return;
  }
  if (est === STATUS.MODIFICADA && slotIsBlocked(fecha, hora, v.id)){
    showToast("⛔ Slot bloqueado"); return;
  }

  const changes = { 
    estado: est,
    cliente:   $("#editCliente")?.value.trim(),
    clienteEmail: $("#editClienteEmail")?.value.trim(),
    inmueble:  $("#editInmueble")?.value.trim(),
    comercial: $("#editComercial")?.value,
  };
  if (est === STATUS.MODIFICADA){ changes.fecha = fecha; changes.hora = hora; }

  try {
    const updated = await apiFetch(`/${v.id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
    const idx = state.visits.findIndex(x => x.id === v.id);
    if (idx !== -1) state.visits[idx] = updated;
    render();
    openDrawer(v.id);
    showToast("Guardado");
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
};

// Eliminar (DELETE a la API)
deleteBtn.onclick = async () => {
  if (!state.selectedId) return;
  const id = state.selectedId;
  try {
    await apiFetch(`/${id}`, { method: "DELETE" });
    state.visits = state.visits.filter(v => v.id !== id);
    closeDrawerUI();
    render();
    showToast("Visita eliminada");
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
};

copyPublicLinksBtn.onclick = async () => {
  if (!state.selectedId) return;
  const v = state.visits.find(x => x.id === state.selectedId);
  if (!v) return;
  const links = publicLinksForVisit(v);
  const text  = `${links.schedule}\n${links.questionnaire}\n${links.offer}`;
  try { await navigator.clipboard.writeText(text); showToast("Links copiados"); }
  catch { showToast(text); }
};

newVisitBtn.onclick = openModal;
closeModal.onclick  = closeModalUI;
modalBackdrop.onclick = closeModalUI;

seedBtn.onclick = () => {
  const rnd = Math.floor(7800 + Math.random() * 80);
  newVisitForm.ref.value      = `W-${rnd}`;
  newVisitForm.fecha.value    = new Date().toISOString().slice(0,10);
  newVisitForm.hora.value     = "17:15";
  newVisitForm.estado.value   = STATUS.PENDIENTE;
  newVisitForm.inmueble.value = "Piso 2 hab - Sants";
  newVisitForm.comercial.value= "Sara López";
  newVisitForm.cliente.value   = "Laura Méndez";
  updateCalendarHint();
  showToast("Demo cargada");
};

["fecha","hora","estado"].forEach(name => {
  newVisitForm[name].addEventListener("input",  updateCalendarHint);
  newVisitForm[name].addEventListener("change", updateCalendarHint);
});

// Crear visita (POST a la API)
newVisitForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(newVisitForm);
  const payload = {
    ref:       String(fd.get("ref")).trim(),
    cliente:   String(fd.get("cliente")).trim(),
    clienteEmail: String(fd.get("clienteEmail")).trim(),
    clientePhone: String(fd.get("clientePhone")).trim(),
    fecha:     String(fd.get("fecha")),
    hora:      String(fd.get("hora")),
    estado:    String(fd.get("estado")),
    comercial: String(fd.get("comercial")),
    inmueble:  String(fd.get("inmueble")).trim(),
    publicId:  "123",
  };

  if (slotIsBlocked(payload.fecha, payload.hora, null)){
    showToast("⛔ Slot bloqueado"); return;
  }

  try {
    const created = await apiFetch("", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    state.visits = [created, ...state.visits];
    render();
    closeModalUI();
    newVisitForm.reset();
    showToast("Visita creada");
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
});

// Cambio de estado desde tabla (PATCH)
tbody.addEventListener("change", async (e) => {
  const sel = e.target.closest("select[data-action='setState']");
  if (!sel) return;
  const id   = sel.dataset.id;
  const v    = state.visits.find(x => x.id === id);
  if (!v) return;
  const next = sel.value;

  try {
    const updated = await apiFetch(`/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado: next }),
    });
    const idx = state.visits.findIndex(x => x.id === id);
    if (idx !== -1) state.visits[idx] = updated;

    if (next === STATUS.MODIFICADA){
      showToast("Estado → MODIFICADA. Re-agenda en la ficha.");
      openDrawer(id);
    } else if (BLOCKING_STATES.has(next)){
      showToast(`${next} → slot bloqueado`);
    } else {
      showToast(`Estado → ${next}`);
    }
    render();
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
    sel.value = v.estado; // revertir select si falló
  }
});

// Interacciones tabla (click)
tbody.addEventListener("click", (e) => {
  const actionBtn = e.target.closest("[data-action]");
  const tr = e.target.closest("tr[data-id]");
  if (!tr) return;
  const id = tr.dataset.id;
  if (e.target.closest("select")) return;

  if (actionBtn?.dataset.action === "open")         { openDrawer(id); return; }
  if (actionBtn?.dataset.action === "toggleClient") {
    const pop = $(`#pop_${id}`);
    const isOpen = pop.classList.contains("show");
    closeAllPopovers();
    if (!isOpen) pop.classList.add("show");
    return;
  }
  openDrawer(id);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".clientCell")) closeAllPopovers();
});

// ─── Flow Modal ───────────────────────────────────────────────────────────────
function openFlow(){ flowModal.setAttribute("aria-hidden","false"); }
function closeFlowUI(){ flowModal.setAttribute("aria-hidden","true"); }
flowBtn.onclick       = openFlow;
closeFlow.onclick     = closeFlowUI;
flowBackdrop.onclick  = closeFlowUI;

flowModal.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-copy]");
  if (!btn) return;
  const a = $(btn.dataset.copy);
  try { await navigator.clipboard.writeText(a?.href || ""); showToast("Copiado"); }
  catch { showToast(a?.href || ""); }
});

copyAllLinks.onclick = async () => {
  const urls = [$("#linkSchedule").href, $("#linkQuestionnaire").href, $("#linkOffer").href].join("\n");
  try { await navigator.clipboard.writeText(urls); showToast("Todos los links copiados"); }
  catch { showToast(urls); }
};

// Crear lead desde Idealista (POST a la API)
createIdealistaLead.onclick = async () => {
  const iso = new Date().toISOString().slice(0,10);
  const payload = {
    ref:       `W-${Math.floor(7900 + Math.random() * 80)}`,
    cliente:   "Lead Idealista",
    fecha:     iso,
    hora:      "18:00",
    estado:    STATUS.PENDIENTE,
    comercial: "Sara López",
    inmueble:  "Piso 2 hab - Eixample",
    publicId:  "123",
  };

  if (slotIsBlocked(payload.fecha, payload.hora, null)){
    showToast("⛔ Slot ya bloqueado, cambia hora y reintenta"); return;
  }

  try {
    const created = await apiFetch("", { method: "POST", body: JSON.stringify(payload) });
    state.visits = [created, ...state.visits];
    render();
    showToast("Lead Idealista creado (PENDIENTE)");
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
};

// Aplicar EN_OFERTA (PATCH)
applyOfferBtn.onclick = async () => {
  const v = state.visits.find(x => x.estado === STATUS.PENDIENTE);
  if (!v){ showToast("No hay PENDIENTE para pasar a EN_OFERTA"); return; }
  try {
    const updated = await apiFetch(`/${v.id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado: STATUS.EN_OFERTA }),
    });
    const idx = state.visits.findIndex(x => x.id === v.id);
    if (idx !== -1) state.visits[idx] = updated;
    render();
    showToast(`EN_OFERTA aplicado a ${v.ref} (slot bloqueado)`);
  } catch (err) {
    showToast(`⚠️ ${err.message}`);
  }
};

exportBtn.onclick = () => exportCSV(state.visits);

const COMERCIALES_API = `${CONFIG.API_URL}/api/comerciales`;

async function loadComerciales(selectId = 'comercialSelect') {
  try {
    const res = await fetch(COMERCIALES_API, { headers: authHeaders() });
    const data = await res.json();
    const select = document.getElementById(selectId);
    select.innerHTML = data.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
  } catch (e) {
    showToast('⚠️ No se pudieron cargar los comerciales');
  }
}

const PROPERTIES_API = `${CONFIG.API_URL}/api/properties`;
let allProperties = [];

async function loadProperties() {
  try {
    const res = await fetch(PROPERTIES_API, { headers: authHeaders() });
    allProperties = await res.json();
  } catch (e) {
    showToast('⚠️ No se pudieron cargar las propiedades');
  }
}

function getRef(property) {
  return property.sourceUrl?.match(/inmueble\/(\d+)/)?.[1] || '';
}

document.getElementById('refInput').addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  const dropdown = document.getElementById('refDropdown');

  if (!query) { dropdown.style.display = 'none'; return; }

  const matches = allProperties.filter(p => {
    const ref = getRef(p);
    return ref.includes(query) || p.title?.toLowerCase().includes(query);
  }).slice(0, 8);

  if (!matches.length) { dropdown.style.display = 'none'; return; }

  dropdown.style.display = 'block';
  dropdown.innerHTML = matches.map(p => {
    const ref = getRef(p);
    return `
      <div class="refOption" data-ref="${ref}" data-title="${escapeHTML(p.title)}" style="
        padding:10px 14px;
        cursor:pointer;
        border-bottom:1px solid rgba(255,255,255,.06);
        font-size:13px;
      ">
        <div style="color:#7aa2ff;font-weight:900;font-family:monospace">${ref}</div>
        <div style="color:#94a3b8;margin-top:2px">${escapeHTML(p.title)}</div>
      </div>
    `;
  }).join('');

  dropdown.querySelectorAll('.refOption').forEach(opt => {
    opt.addEventListener('mouseenter', () => opt.style.background = 'rgba(148,163,184,.08)');
    opt.addEventListener('mouseleave', () => opt.style.background = 'transparent');
    opt.addEventListener('click', () => {
      document.getElementById('refInput').value = opt.dataset.ref;
      newVisitForm.inmueble.value = opt.dataset.title;
      dropdown.style.display = 'none';
    });
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#refInput') && !e.target.closest('#refDropdown')) {
    document.getElementById('refDropdown').style.display = 'none';
  }
});

// ─── Init ─────────────────────────────────────────────────────────────────────
(function init(){
  nowLabel.textContent = formatNow();
  setInterval(() => { nowLabel.textContent = formatNow(); }, 30_000);

  const th = document.querySelector(`thead th.sortable[data-sort="${state.sort.key}"]`);
  if (th) th.setAttribute("data-dir", state.sort.dir);

  // Cargar visitas desde la API
  tbody.innerHTML = `<tr><td colspan="7" class="loading">Cargando desde servidor...</td></tr>`;
  loadVisitsFromAPI();
  loadComerciales();
  loadProperties();
})();

const user = JSON.parse(localStorage.getItem('wc_user'));

if (user) {
  document.querySelector('.userName').textContent = user.name;
  document.querySelector('.userRole').textContent = user.email;

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0,2)
    .toUpperCase();

  document.querySelector('.avatar').textContent = initials;
}

const userBtn = document.getElementById('userBtn');
const dropdown = document.getElementById('userDropdown');
const logoutBtn = document.getElementById('logoutBtn');

if (userBtn && dropdown) {
  userBtn.addEventListener('click', () => {
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('wc_token');
    localStorage.removeItem('wc_user');
    localStorage.removeItem('wc_role');

    window.location.href = '../login/index.html';
  });
}