// JS (CodePen)
const LS_KEY = "wincontrol_visits_v2";
const CONTACTS_KEY = "wincontrol_contacts_v1";

/**
 * Reglas clave (lo que quieres enseñar):
 * - Estados editables: REALIZADA, CANCELADA, NO_SE_PRESENTA, MODIFICADA (y mantenemos PENDIENTE/EN_OFERTA/BLOQUEADA como estados del flujo).
 * - Si estado EN_OFERTA o REALIZADA o BLOQUEADA => bloquea el slot del calendario.
 * - Si MODIFICADA => se puede cambiar fecha/hora y se valida conflicto.
 * - Flujo Idealista con links reales: http://localhost:3000/public/schedule/123 etc.
 */

const STATUS = {
  PENDIENTE: "PENDIENTE",
  MODIFICADA: "MODIFICADA",
  EN_OFERTA: "EN_OFERTA",
  REALIZADA: "REALIZADA",
  BLOQUEADA: "BLOQUEADA",
  CANCELADA: "CANCELADA",
  NO_SE_PRESENTA: "NO_SE_PRESENTA",
};

const EDITABLE_STATES = [
  STATUS.REALIZADA,
  STATUS.CANCELADA,
  STATUS.NO_SE_PRESENTA,
  STATUS.MODIFICADA,
];

const BLOCKING_STATES = new Set([STATUS.EN_OFERTA, STATUS.REALIZADA, STATUS.BLOQUEADA]);

const demoContacts = [
  { id:"c1", nombre:"Laura Méndez", telefono:"+34 600 111 222", email:"laura@demo.com", fuente:"Idealista", score:"Alta" },
  { id:"c2", nombre:"Carlos Herrera", telefono:"+34 600 333 444", email:"carlos@demo.com", fuente:"Fotocasa", score:"Media" },
  { id:"c3", nombre:"Ana Beltrán", telefono:"+34 600 555 666", email:"ana@demo.com", fuente:"Idealista", score:"Alta" },
  { id:"c4", nombre:"Javier Soto", telefono:"+34 600 777 888", email:"javier@demo.com", fuente:"Referido", score:"Media" },
  { id:"c5", nombre:"Marta Vidal", telefono:"+34 600 999 000", email:"marta@demo.com", fuente:"Idealista", score:"Alta" },
  { id:"c6", nombre:"Roberto Campos", telefono:"+34 601 010 101", email:"roberto@demo.com", fuente:"Fotocasa", score:"Baja" },
];

const demoVisits = [
  { id:"1", ref:"WC-7842", inmueble:"Piso 3 hab - Gràcia", clienteId:"c1", comercial:"Toni Ruiz", fecha:"2025-02-21", hora:"10:30", estado:STATUS.PENDIENTE },
  { id:"2", ref:"WC-7841", inmueble:"Ático 2 hab - Eixample", clienteId:"c2", comercial:"Sara López", fecha:"2025-02-21", hora:"12:00", estado:STATUS.MODIFICADA },
  { id:"3", ref:"WC-7840", inmueble:"Casa con piscina - Sant Cugat", clienteId:"c3", comercial:"Marc Puig", fecha:"2025-02-20", hora:"16:45", estado:STATUS.BLOQUEADA },
  { id:"4", ref:"WC-7839", inmueble:"Estudio - Poblenou", clienteId:"c4", comercial:"Toni Ruiz", fecha:"2025-02-20", hora:"09:15", estado:STATUS.CANCELADA },
  { id:"5", ref:"WC-7838", inmueble:"Piso 4 hab - Les Corts", clienteId:"c5", comercial:"Sara López", fecha:"2025-02-19", hora:"11:00", estado:STATUS.REALIZADA },
  { id:"6", ref:"WC-7837", inmueble:"Dúplex - Sarrià", clienteId:"c6", comercial:"Marc Puig", fecha:"2025-02-21", hora:"15:30", estado:STATUS.EN_OFERTA },
];

let state = {
  visits: [],
  contacts: [],
  search: "",
  status: "all",
  sort: { key: "datetime", dir: "asc" },
  selectedId: null,
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];

const tbody = $("#tbody");
const searchInput = $("#searchInput");
const clearSearch = $("#clearSearch");
const countLabel = $("#countLabel");
const nowLabel = $("#nowLabel");

const statToday = $("#statToday");
const statPending = $("#statPending");
const statOffers = $("#statOffers");
const statConv = $("#statConv");

const toast = $("#toast");

// Modal (create/edit)
const modal = $("#modal");
const newVisitBtn = $("#newVisitBtn");
const closeModal = $("#closeModal");
const modalBackdrop = $("#modalBackdrop");
const newVisitForm = $("#newVisitForm");
const seedBtn = $("#seedBtn");
const calendarHint = $("#calendarHint");
const clienteSelect = $("#clienteSelect");

// Drawer
const drawer = $("#drawer");
const closeDrawer = $("#closeDrawer");
const drawerBackdrop = $("#drawerBackdrop");
const drawerBody = $("#drawerBody");
const drawerTitle = $("#drawerTitle");
const drawerSub = $("#drawerSub");
const deleteBtn = $("#deleteBtn");
const saveBtn = $("#saveBtn");
const copyPublicLinksBtn = $("#copyPublicLinksBtn");

// Flow
const flowBtn = $("#flowBtn");
const flowModal = $("#flowModal");
const closeFlow = $("#closeFlow");
const flowBackdrop = $("#flowBackdrop");
const copyAllLinks = $("#copyAllLinks");
const createIdealistaLead = $("#createIdealistaLead");
const applyOfferBtn = $("#applyOfferBtn");

const exportBtn = $("#exportBtn");

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  toast.setAttribute("aria-hidden", "false");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.remove("show");
    toast.setAttribute("aria-hidden", "true");
  }, 1900);
}

function saveLS(key, val){
  localStorage.setItem(key, JSON.stringify(val));
}
function loadLS(key){
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function pad2(n){ return String(n).padStart(2,"0"); }
function formatESDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  const months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${pad2(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function formatNow() {
  const d = new Date();
  const date = new Intl.DateTimeFormat("es-ES", { day:"2-digit", month:"long", year:"numeric" }).format(d);
  const time = new Intl.DateTimeFormat("es-ES", { hour:"2-digit", minute:"2-digit" }).format(d);
  return `${date} • ${time}`;
}

function visitDateTime(v) {
  return new Date(`${v.fecha}T${v.hora}:00`).getTime();
}

function getContact(id){ return state.contacts.find(c => c.id === id); }

function computeStats(visits) {
  const todayIso = new Date().toISOString().slice(0, 10);

  const todayCount = visits.filter(v => v.fecha === todayIso).length;
  const pendingCount = visits.filter(v => [STATUS.PENDIENTE, STATUS.MODIFICADA].includes(v.estado)).length;
  const offersCount = visits.filter(v => v.estado === STATUS.EN_OFERTA).length;

  const conv = visits.length
    ? Math.round((visits.filter(v => v.estado === STATUS.REALIZADA).length / visits.length) * 100)
    : 0;

  statToday.textContent = String(todayCount);
  statPending.textContent = String(pendingCount);
  statOffers.textContent = String(offersCount);
  statConv.textContent = visits.length ? `${conv}%` : "—";
}

/** Slot key y bloqueo */
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
  switch (estado) {
    case STATUS.REALIZADA: return `<span class="badge b-emerald">REALIZADA</span>`;
    case STATUS.PENDIENTE: return `<span class="badge b-blue">PENDIENTE</span>`;
    case STATUS.BLOQUEADA: return `<span class="badge b-amber">BLOQUEADA</span>`;
    case STATUS.MODIFICADA: return `<span class="badge b-violet">MODIFICADA</span>`;
    case STATUS.EN_OFERTA: return `<span class="badge b-orange">EN_OFERTA</span>`;
    case STATUS.CANCELADA: return `<span class="badge b-red">CANCELADA</span>`;
    case STATUS.NO_SE_PRESENTA: return `<span class="badge b-red">NO_SE_PRESENTA</span>`;
    default: return `<span class="badge">${estado}</span>`;
  }
}

function escapeHTML(s="") {
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function applyFilters() {
  const s = state.search.trim().toLowerCase();
  const st = state.status;

  return state.visits.filter(v => {
    if (st !== "all" && v.estado !== st) return false;
    if (!s) return true;

    const c = getContact(v.clienteId);
    const cliente = c?.nombre ?? "";
    return (
      cliente.toLowerCase().includes(s) ||
      String(v.inmueble||"").toLowerCase().includes(s) ||
      String(v.ref||"").toLowerCase().includes(s)
    );
  });
}

function applySort(list) {
  const { key, dir } = state.sort;
  const mult = dir === "asc" ? 1 : -1;

  return [...list].sort((a,b) => {
    const get = (v) => {
      if (key === "datetime") return visitDateTime(v);
      if (key === "ref") return v.ref.toLowerCase();
      if (key === "inmueble") return v.inmueble.toLowerCase();
      if (key === "comercial") return v.comercial.toLowerCase();
      return "";
    };
    const x = get(a), y = get(b);
    if (x < y) return -1 * mult;
    if (x > y) return 1 * mult;
    return 0;
  });
}

/** Estado editable en tabla (select) */
function stateSelectHTML(v){
  const current = v.estado;
  // mostramos todos, pero "editable" = los 4 + mantenemos PENDIENTE/EN_OFERTA/BLOQUEADA para que se vea el flujo
  const options = [
    STATUS.PENDIENTE,
    STATUS.MODIFICADA,
    STATUS.EN_OFERTA,
    STATUS.REALIZADA,
    STATUS.BLOQUEADA,
    STATUS.CANCELADA,
    STATUS.NO_SE_PRESENTA,
  ];

  return `
    <select class="stateSelect" data-action="setState" data-id="${v.id}">
      ${options.map(s => `<option value="${s}" ${s===current?"selected":""}>${s}</option>`).join("")}
    </select>
  `;
}

function render() {
  const filtered = applyFilters();
  const sorted = applySort(filtered);
  computeStats(state.visits);

  countLabel.textContent = `${sorted.length} visitas • filtro: ${state.status === "all" ? "todas" : state.status}`;

  if (!sorted.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading">No se encontraron visitas</td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map(v => {
    const c = getContact(v.clienteId);
    const cliente = c?.nombre ?? "—";
    const date = formatESDate(v.fecha);

    return `
      <tr data-id="${v.id}">
        <td class="mono">${escapeHTML(v.ref)}</td>
        <td><strong style="color:#fff">${escapeHTML(v.inmueble)}</strong></td>

        <td class="clientCell">
          <button class="clientBtn" data-action="toggleClient" data-id="${v.id}">
            ${escapeHTML(cliente)} <span class="chev">▾</span>
          </button>
          <div class="popover" id="pop_${v.id}">
            <div class="popRow"><div class="popK">Teléfono</div><div class="popV">${escapeHTML(c?.telefono || "—")}</div></div>
            <div class="popRow"><div class="popK">Email</div><div class="popV">${escapeHTML(c?.email || "—")}</div></div>
            <div class="popRow"><div class="popK">Fuente</div><div class="popV">${escapeHTML(c?.fuente || "—")}</div></div>
            <div class="popRow"><div class="popK">Score</div><div class="popV">${escapeHTML(c?.score || "—")}</div></div>
          </div>
        </td>

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

/** Popovers cliente: cerrar otros */
function closeAllPopovers(){
  $$(".popover.show").forEach(p => p.classList.remove("show"));
}

/** Drawer */
function publicLinksForVisit(v){
  // id “estable” para demo
  const pubId = encodeURIComponent(v.publicId || v.ref || v.id);
  return {
    schedule: `http://localhost:3000/public/schedule/${pubId}`,
    questionnaire: `http://localhost:3000/public/questionnaire/${pubId}`,
    offer: `http://localhost:3000/public/offer/${pubId}`,
  };
}

function openDrawer(id) {
  const v = state.visits.find(x => x.id === id);
  if (!v) return;

  state.selectedId = id;

  drawer.setAttribute("aria-hidden", "false");

  const c = getContact(v.clienteId);
  const date = formatESDate(v.fecha);

  drawerTitle.textContent = `Ficha completa • ${v.ref}`;
  drawerSub.textContent = `${date} • ${v.hora} • ${v.estado}`;

  const links = publicLinksForVisit(v);

  drawerBody.innerHTML = `
    <div class="kv"><div class="k">Inmueble</div><div class="v">${escapeHTML(v.inmueble)}</div></div>

    <div class="kv"><div class="k">Cliente</div><div class="v">
      ${escapeHTML(c?.nombre || "—")}
      <div style="margin-top:8px;color:#64748b;font-size:12px;">
        ${escapeHTML(c?.telefono || "—")} • ${escapeHTML(c?.email || "—")} • ${escapeHTML(c?.fuente || "—")}
      </div>
    </div></div>

    <div class="grid2">
      <div class="kv">
        <div class="k">Estado (editable)</div>
        <div class="v">
          <select id="editEstado">
            ${[
              STATUS.PENDIENTE,
              STATUS.MODIFICADA,
              STATUS.EN_OFERTA,
              STATUS.REALIZADA,
              STATUS.BLOQUEADA,
              STATUS.CANCELADA,
              STATUS.NO_SE_PRESENTA
            ].map(s => `<option value="${s}" ${s===v.estado?"selected":""}>${s}</option>`).join("")}
          </select>
          <div style="margin-top:8px;color:#64748b;font-size:12px;">
            Estados clave para demo: editable “normal” = ${EDITABLE_STATES.join(", ")}.
          </div>
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
        <a class="pill" href="${links.schedule}" target="_blank">${links.schedule}</a>
        <a class="pill" href="${links.questionnaire}" target="_blank">${links.questionnaire}</a>
        <a class="pill" href="${links.offer}" target="_blank">${links.offer}</a>
      </div>
    </div>

    <div class="kv">
      <div class="k">Acción “Bloqueado → En oferta → Realizada”</div>
      <div class="v" style="display:flex;gap:10px;flex-wrap:wrap;">
        <button type="button" class="btn ghost" id="toBlocked">BLOQUEADA</button>
        <button type="button" class="btn ghost" id="toOffer">EN_OFERTA</button>
        <button type="button" class="btn primary" id="toDone">REALIZADA</button>
      </div>
      <div style="margin-top:10px;color:#64748b;font-size:12px;">
        EN_OFERTA / REALIZADA bloquean el calendario para ese slot.
      </div>
    </div>
  `;

  $("#toBlocked").onclick = () => { v.estado = STATUS.BLOQUEADA; persist(); render(); openDrawer(v.id); showToast("Estado → BLOQUEADA"); };
  $("#toOffer").onclick = () => { v.estado = STATUS.EN_OFERTA; persist(); render(); openDrawer(v.id); showToast("Estado → EN_OFERTA (slot bloqueado)"); };
  $("#toDone").onclick = () => { v.estado = STATUS.REALIZADA; persist(); render(); openDrawer(v.id); showToast("Estado → REALIZADA (slot bloqueado)"); };
}

function closeDrawerUI() {
  drawer.setAttribute("aria-hidden", "true");
  state.selectedId = null;
}

/** Modal create */
function openModal() {
  modal.setAttribute("aria-hidden", "false");
  updateCalendarHint();
}
function closeModalUI() { modal.setAttribute("aria-hidden", "true"); }

/** Persist */
function persist(){
  saveLS(LS_KEY, state.visits);
  saveLS(CONTACTS_KEY, state.contacts);
}

/** Validación calendario (impactante para demo) */
function updateCalendarHint(){
  const fecha = newVisitForm.fecha.value;
  const hora = newVisitForm.hora.value;
  const estado = newVisitForm.estado.value;
  if (!fecha || !hora){
    calendarHint.textContent = "Selecciona fecha/hora para validar disponibilidad.";
    return;
  }
  const blocked = slotIsBlocked(fecha, hora, null);
  if (blocked) {
    calendarHint.textContent = `⛔ Slot ${fecha} ${hora} está BLOQUEADO (hay visita EN_OFERTA/REALIZADA/BLOQUEADA).`;
  } else if (BLOCKING_STATES.has(estado)) {
    calendarHint.textContent = `✅ Slot disponible. Ojo: si guardas como ${estado}, el slot quedará bloqueado.`;
  } else {
    calendarHint.textContent = `✅ Slot disponible. Puedes guardar como ${estado}.`;
  }
}

/** Render select de clientes */
function renderClienteOptions(){
  clienteSelect.innerHTML = state.contacts.map(c => `<option value="${c.id}">${c.nombre} • ${c.fuente}</option>`).join("");
}

/** Sorting */
function setSort(key) {
  const ths = $$("thead th.sortable");
  const current = state.sort;

  if (current.key === key) state.sort.dir = current.dir === "asc" ? "desc" : "asc";
  else { state.sort.key = key; state.sort.dir = "asc"; }

  ths.forEach(th => {
    th.removeAttribute("data-dir");
    if (th.dataset.sort === state.sort.key) th.setAttribute("data-dir", state.sort.dir);
  });

  render();
}

/** CSV */
function exportCSV(visits) {
  const header = ["id","ref","inmueble","clienteId","comercial","fecha","hora","estado","publicId"];
  const rows = visits.map(v => header.map(k => `"${String(v[k] ?? "").replaceAll('"','""')}"`).join(","));
  const csv = [header.join(","), ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wincontrol_visits.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Interacciones tabla */
tbody.addEventListener("click", (e) => {
  const actionBtn = e.target.closest("[data-action]");
  const tr = e.target.closest("tr[data-id]");
  if (!tr) return;
  const id = tr.dataset.id;

  // Evitar abrir drawer si interactúas con select o cliente
  const inSelect = e.target.closest("select");
  if (inSelect) return;

  if (actionBtn?.dataset.action === "open") {
    openDrawer(id);
    return;
  }

  if (actionBtn?.dataset.action === "toggleClient") {
    const pop = $(`#pop_${id}`);
    const isOpen = pop.classList.contains("show");
    closeAllPopovers();
    if (!isOpen) pop.classList.add("show");
    return;
  }

  // click en fila -> ficha completa
  openDrawer(id);
});

document.addEventListener("click", (e) => {
  // cerrar popovers si click fuera
  if (!e.target.closest(".clientCell")) closeAllPopovers();
});

/** Cambio de estado desde tabla */
tbody.addEventListener("change", (e) => {
  const sel = e.target.closest("select[data-action='setState']");
  if (!sel) return;
  const id = sel.dataset.id;
  const v = state.visits.find(x => x.id === id);
  if (!v) return;

  const next = sel.value;

  // Regla “impactante”:
  // - Si pasa a MODIFICADA => abrimos modal para re-agendar (y validar conflictos)
  // - Si pasa a EN_OFERTA/REALIZADA/BLOQUEADA => bloquea el slot (no hace nada extra, la validación será en nuevas agendas)
  v.estado = next;
  persist();
  render();

  if (next === STATUS.MODIFICADA) {
    showToast("Estado → MODIFICADA. Re-agenda fecha/hora en la ficha o con ‘Nueva visita’.");
    openDrawer(v.id); // para que se vea editFecha/editHora
  } else if (BLOCKING_STATES.has(next)) {
    showToast(`${next} → slot bloqueado`);
  } else {
    showToast(`Estado → ${next}`);
  }
});

/** Filtros y search */
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

/** Drawer buttons */
closeDrawer.onclick = closeDrawerUI;
drawerBackdrop.onclick = closeDrawerUI;

deleteBtn.onclick = () => {
  if (!state.selectedId) return;
  const id = state.selectedId;
  state.visits = state.visits.filter(v => v.id !== id);
  persist();
  closeDrawerUI();
  render();
  showToast("Visita eliminada");
};

saveBtn.onclick = () => {
  if (!state.selectedId) return;
  const v = state.visits.find(x => x.id === state.selectedId);
  if (!v) return;

  const est = $("#editEstado")?.value;
  const fecha = $("#editFecha")?.value;
  const hora = $("#editHora")?.value;

  // Si el estado queda MODIFICADA, aplicamos cambio de fecha/hora con validación:
  const wantsReschedule = (est === STATUS.MODIFICADA);

  if (wantsReschedule) {
    if (!fecha || !hora) {
      showToast("Falta fecha/hora para MODIFICADA");
      return;
    }
    if (slotIsBlocked(fecha, hora, v.id)) {
      showToast("⛔ No puedes mover: slot bloqueado por EN_OFERTA/REALIZADA/BLOQUEADA");
      return;
    }
    v.fecha = fecha;
    v.hora = hora;
  }

  v.estado = est || v.estado;

  persist();
  render();
  openDrawer(v.id);
  showToast("Guardado");
};

copyPublicLinksBtn.onclick = async () => {
  if (!state.selectedId) return;
  const v = state.visits.find(x => x.id === state.selectedId);
  if (!v) return;
  const links = publicLinksForVisit(v);
  const text = `${links.schedule}\n${links.questionnaire}\n${links.offer}`;
  try { await navigator.clipboard.writeText(text); showToast("Links copiados"); }
  catch { showToast(text); }
};

/** Modal create */
newVisitBtn.onclick = openModal;
closeModal.onclick = closeModalUI;
modalBackdrop.onclick = closeModalUI;

seedBtn.onclick = () => {
  const form = newVisitForm;
  const rnd = Math.floor(7800 + Math.random() * 80);
  const iso = new Date().toISOString().slice(0,10);
  form.ref.value = `WC-${rnd}`;
  form.fecha.value = iso;
  form.hora.value = "17:15";
  form.estado.value = STATUS.PENDIENTE;
  form.inmueble.value = "Piso 2 hab - Sants";
  form.comercial.value = "Sara López";
  // cliente random
  const c = state.contacts[Math.floor(Math.random() * state.contacts.length)];
  form.clienteId.value = c.id;
  updateCalendarHint();
  showToast("Demo cargada");
};

["fecha","hora","estado"].forEach(name => {
  newVisitForm[name].addEventListener("input", updateCalendarHint);
  newVisitForm[name].addEventListener("change", updateCalendarHint);
});

newVisitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(newVisitForm);

  const ref = String(fd.get("ref")).trim();
  const clienteId = String(fd.get("clienteId"));
  const fecha = String(fd.get("fecha"));
  const hora = String(fd.get("hora"));
  const estado = String(fd.get("estado"));
  const comercial = String(fd.get("comercial")).trim();
  const inmueble = String(fd.get("inmueble")).trim();

  if (slotIsBlocked(fecha, hora, null)) {
    showToast("⛔ No se puede crear: slot bloqueado");
    return;
  }

  const v = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    ref, clienteId, fecha, hora, estado, comercial, inmueble,
    publicId: "123" // para la demo del flujo (links)
  };

  state.visits = [v, ...state.visits];
  persist();
  render();
  closeModalUI();
  newVisitForm.reset();
  showToast("Visita creada");
});

/** Flow Modal */
function openFlow(){ flowModal.setAttribute("aria-hidden","false"); }
function closeFlowUI(){ flowModal.setAttribute("aria-hidden","true"); }
flowBtn.onclick = openFlow;
closeFlow.onclick = closeFlowUI;
flowBackdrop.onclick = closeFlowUI;

flowModal.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-copy]");
  if (!btn) return;
  const sel = btn.dataset.copy;
  const a = $(sel);
  const url = a?.href;
  if (!url) return;
  try { await navigator.clipboard.writeText(url); showToast("Copiado"); }
  catch { showToast(url); }
});

copyAllLinks.onclick = async () => {
  const urls = [
    $("#linkSchedule").href,
    $("#linkQuestionnaire").href,
    $("#linkOffer").href
  ].join("\n");
  try { await navigator.clipboard.writeText(urls); showToast("Todos los links copiados"); }
  catch { showToast(urls); }
};

createIdealistaLead.onclick = () => {
  // crea una visita tipo “lead idealista” con publicId 123
  const iso = new Date().toISOString().slice(0,10);
  const v = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    ref: `WC-${Math.floor(7900 + Math.random() * 80)}`,
    clienteId: "c1",
    fecha: iso,
    hora: "18:00",
    estado: STATUS.PENDIENTE,
    comercial: "Sara López",
    inmueble: "Piso 2 hab - Eixample",
    publicId: "123"
  };

  if (slotIsBlocked(v.fecha, v.hora, null)) {
    showToast("⛔ Slot ya bloqueado, cambia hora y reintenta");
    return;
  }

  state.visits = [v, ...state.visits];
  persist();
  render();
  showToast("Lead Idealista creado (PENDIENTE)");
};

applyOfferBtn.onclick = () => {
  // aplica EN_OFERTA a la primera visita PENDIENTE, para demo de “bloqueo”
  const v = state.visits.find(x => x.estado === STATUS.PENDIENTE);
  if (!v) { showToast("No hay PENDIENTE para pasar a EN_OFERTA"); return; }
  v.estado = STATUS.EN_OFERTA;
  v.publicId = v.publicId || "123";
  persist();
  render();
  showToast(`EN_OFERTA aplicado a ${v.ref} (slot bloqueado)`);
};

/** Export */
exportBtn.onclick = () => exportCSV(state.visits);

/** Init */
(function init(){
  nowLabel.textContent = formatNow();
  setInterval(() => { nowLabel.textContent = formatNow(); }, 30_000);

  // contacts
  state.contacts = loadLS(CONTACTS_KEY) || demoContacts;
  renderClienteOptions();

  // visits
  state.visits = loadLS(LS_KEY) || demoVisits;
  // marca sort header initial
  const th = document.querySelector(`thead th.sortable[data-sort="${state.sort.key}"]`);
  if (th) th.setAttribute("data-dir", state.sort.dir);

  persist();
  render();
})();