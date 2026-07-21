const params = new URLSearchParams(window.location.search);
const leadId = params.get('leadId');
const comercialId = params.get('comercialId');

let selectedDate = null;
let selectedSlot = null;
let leadData = null;
let comercialData = null;

const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const workDays = [1, 2, 3, 4, 5];

async function init() {
  if (!leadId || !comercialId) {
    document.getElementById('leadName').textContent = 'Link inválido';
    return;
  }

  try {
    const leadRes = await fetch(`${CONFIG.API_URL}/api/leads/${leadId}`);
    leadData = await leadRes.json();

    const comercialesRes = await fetch(`${CONFIG.API_URL}/api/comerciales`);
    const comerciales = await comercialesRes.json();
    comercialData = comerciales.find(c => c.id === comercialId || c.nombre === comercialId);

    document.getElementById('leadName').textContent = `Hola ${leadData.nombre}, elige tu horario`;

    if (leadData.propertyId) {
      const propRes = await fetch(`${CONFIG.API_URL}/api/properties/${leadData.propertyId}`);
      const prop = await propRes.json();
      document.getElementById('propertyTitle').textContent = prop.title;
      document.getElementById('propertySection').style.display = 'block';
    }

    if (comercialData) {
      const iniciales = comercialData.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      document.getElementById('comercialAvatar').textContent = iniciales;
      document.getElementById('comercialName').textContent = comercialData.nombre;
      document.getElementById('comercialPhone').textContent = comercialData.telefono || 'Sin teléfono';
      document.getElementById('comercialInfo').style.display = 'flex';
    }

    renderDates();
  } catch (err) {
    document.getElementById('leadName').textContent = 'Error cargando información';
  }
}

function renderDates() {
  const grid = document.getElementById('dateGrid');
  grid.innerHTML = '';
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay();
    if (!workDays.includes(dayOfWeek)) continue;

    const btn = document.createElement('button');
    btn.className = 'date-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `<div class="date-day">${days[dayOfWeek]}</div><div class="date-num">${d.getDate()}</div>`;
    btn.onclick = () => selectDate(d, btn);
    grid.appendChild(btn);
  }
}

async function selectDate(date, btn) {
  document.querySelectorAll('.date-btn').forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('selected');
  btn.setAttribute('aria-pressed', 'true');
  selectedDate = date.toISOString().slice(0, 10);
  selectedSlot = null;
  document.getElementById('confirmBtn').disabled = true;

  const container = document.getElementById('slotsContainer');
  container.innerHTML = '<div class="loading"><span class="spinner"></span>Cargando horarios...</div>';

  try {
    const res = await fetch(`${CONFIG.API_URL}/api/calendar/slots/${comercialData?.id || comercialId}/${selectedDate}`);
    const data = await res.json();
    renderSlots(data.slots || []);
  } catch {
    container.innerHTML = '<div class="no-slots">No se pudieron cargar los horarios</div>';
  }
}

function renderSlots(slots) {
  const container = document.getElementById('slotsContainer');
  if (!slots.length) {
    container.innerHTML = '<div class="no-slots">No hay horarios disponibles para este día</div>';
    return;
  }

  container.innerHTML = '<div class="slots-grid">' +
    slots.map(slot => `<button class="slot-btn" aria-pressed="false" onclick="selectSlot('${slot}', this)">${slot}</button>`).join('') +
    '</div>';
}

function selectSlot(slot, btn) {
  document.querySelectorAll('.slot-btn').forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('selected');
  btn.setAttribute('aria-pressed', 'true');
  selectedSlot = slot;
  document.getElementById('confirmBtn').disabled = false;
}

async function confirmBooking() {
  if (!selectedDate || !selectedSlot) return;

  const btn = document.getElementById('confirmBtn');
  btn.innerHTML = '<span class="spinner"></span>Confirmando...';
  btn.disabled = true;

  try {
    await fetch(`${CONFIG.API_URL}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadId,
        comercialId: comercialData?.nombre || comercialId,
        propertyId: leadData?.propertyId || null,
        fecha: selectedDate,
        hora: selectedSlot,
        adminId: leadData?.adminId,
      }),
    });

    document.querySelector('.card-header').style.display = 'none';
    document.getElementById('propertySection').style.display = 'none';
    document.querySelector('.section').style.display = 'none';
    document.getElementById('comercialInfo').style.display = 'none';
    document.querySelector('.confirm-section').style.display = 'none';

    const success = document.getElementById('successScreen');
    success.style.display = 'flex';
    document.getElementById('successSub').textContent =
      `Tu visita para el ${selectedDate} a las ${selectedSlot} ha sido registrada. Recibirás un email de confirmación.`;

  } catch (err) {
    btn.innerHTML = 'Confirmar visita';
    btn.disabled = false;
    alert('Error al confirmar. Inténtalo de nuevo.');
  }
}

(function () {
  const THEME_KEY = 'wc-theme';
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    document.body.classList.toggle('light', theme === 'light');
    themeToggle.setAttribute('aria-checked', theme === 'light');
  }

  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

  themeToggle.addEventListener('click', () => {
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
})();

init();