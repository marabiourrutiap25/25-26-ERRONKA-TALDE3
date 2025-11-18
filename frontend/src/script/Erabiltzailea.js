// Script de administración de usuarios y sincronización con la API
// =======================
// CONFIGURACIÓN DE API
// =======================
const apiUrl = `${window.location.origin}/25-26-ERRONKA-TALDE3/backend/src/controller/ErabiltzaileaController.php`;

// =======================
// ELEMENTOS DEL DOM
// =======================
const tbody = document.querySelector('#erabiltzaileaTable tbody');
const modal = new bootstrap.Modal(document.getElementById('erabiltzaileaModal'));
const form = document.getElementById('erabiltzaileaForm');
const searchInput = document.getElementById('searchInput');

// Campos del formulario
const nanField = document.getElementById('nan');
const nanOldField = document.getElementById('nanOld');
const izenaField = document.getElementById('izena');
const abizenaField = document.getElementById('abizena');
const erabiltzaileaField = document.getElementById('erabiltzailea');
const pasahitzaField = document.getElementById('pasahitza');
const rolaField = document.getElementById('rola');
const apiKeyField = document.getElementById('api_key');

// =======================
// HELPER FUNCTIONS
// =======================
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

function getApiKey() {
  return getCookie('api_key_session') || localStorage.getItem('api_key');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// =======================
// TOAST
// =======================
let toast = null;
const toastElement = document.getElementById('notificationToast');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');

try {
  if (toastElement && window.bootstrap?.Toast) {
    toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  }
} catch (e) {
  console.warn('Toast init failed:', e);
  toast = null;
}

function showToast(message, type = 'success') {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const titles = { success: 'Arrakasta', error: 'Errorea', warning: 'Kontuz', info: 'Informazioa' };

  if (toast && toastElement && toastTitle && toastMessage && toastIcon) {
    try {
      toastIcon.textContent = icons[type] || '';
      toastTitle.textContent = titles[type] || '';
      toastMessage.textContent = message || '';
      toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'text-white');

      switch (type) {
        case 'error': toastElement.classList.add('bg-danger', 'text-white'); break;
        case 'success': toastElement.classList.add('bg-success', 'text-white'); break;
        case 'warning': toastElement.classList.add('bg-warning'); break;
        default: toastElement.classList.add('bg-info', 'text-white');
      }

      toast.show();
      return;
    } catch (e) {
      console.warn('Showing toast failed, falling back to alert:', e);
    }
  }

  console.log(`${type.toUpperCase()}: ${message}`);
  try { window.alert(message); } catch (e) { }
}

// =======================
// FETCH USUARIOS
// =======================
async function fetchErabiltzaileak() {
  tbody.innerHTML = '<tr><td colspan="8">Kargatzen...</td></tr>';
  const api_key = getApiKey();
  if (!api_key) {
    tbody.innerHTML = '<tr><td colspan="8">❌ Saioa ez da aktibo. Hasi saioa berriro.</td></tr>';
    return;
  }

  try {
    const res = await fetch(`${apiUrl}?action=getAll`, { headers: { 'Authorization': 'Bearer ' + api_key } });
    const data = await res.json();

    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="8">${data.message}</td></tr>`;
      return;
    }

    const items = data.users || [];
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">Ez dago daturik.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(u => `<tr>
      <td>${escapeHtml(u.nan)}</td>
      <td>${escapeHtml(u.izena)}</td>
      <td>${escapeHtml(u.abizena)}</td>
      <td>${escapeHtml(u.erabiltzailea)}</td>
      <td>••••••••</td>
      <td>${escapeHtml(u.rola)}</td>
      <td>••••••••</td>
      <td>
        <button class="btn-action editBtn" data-nan="${u.nan}">✏️</button>
        <button class="btn-action deleteBtn" data-nan="${u.nan}">🗑️</button>
      </td>
    </tr>`).join('');

    document.querySelectorAll('.editBtn').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.nan)));
    document.querySelectorAll('.deleteBtn').forEach(btn => btn.addEventListener('click', () => deleteErabiltzailea(btn.dataset.nan)));

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8">${escapeHtml(err.message)}</td></tr>`;
  }
}

// =======================
// OPEN MODAL
// =======================
async function openModal(nan = null) {
  const api_key = getApiKey();

  if (nan) {
    const res = await fetch(`${apiUrl}?action=getById&nan=${encodeURIComponent(nan)}`, {
      headers: { 'Authorization': 'Bearer ' + api_key }
    });
    const data = await res.json();
    if (!data.success) { showToast(data.message, 'error'); return; }

    const user = data.user;
    nanField.value = user.nan;
    nanOldField.value = user.nan;
    izenaField.value = user.izena;
    abizenaField.value = user.abizena;
    erabiltzaileaField.value = user.erabiltzailea;
    pasahitzaField.value = ''; // siempre vacío al editar
    apiKeyField.value = '••••••••';

    // Seleccionar automáticamente el rol del usuario
    const rolaField = document.getElementById('rola');
    rolaField.querySelectorAll('option').forEach(opt => {
      opt.selected = (opt.value === user.rola);
    });

    nanField.setAttribute('readonly', true);
    document.getElementById('erabiltzaileaModalLabel').textContent = 'Editatu';
  } else {
    form.reset();
    nanOldField.value = '';
    document.getElementById('erabiltzaileaModalLabel').textContent = 'Sortu';
    nanField.removeAttribute('readonly');
  }

  modal.show();
}

// =======================
// FORM SUBMIT
// =======================
form.addEventListener('submit', async e => {
  e.preventDefault();
  const api_key = getApiKey();

  const payload = {
    nan: nanField.value,
    izena: izenaField.value,
    abizena: abizenaField.value,
    erabiltzailea: erabiltzaileaField.value,
    pasahitza: pasahitzaField.value,
    rola: rolaField.value // Aquí ya será 'A' o 'E'
  };

  let url;
  if (nanOldField.value) {
    url = `${apiUrl}?action=update&nan=${encodeURIComponent(nanOldField.value)}`;
  } else {
    url = `${apiUrl}?action=create`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!data.success) { showToast(data.message, 'error'); return; }

  showToast('Erabiltzailea gorde da', 'success');
  modal.hide();
  fetchErabiltzaileak();
});

// =======================
// DELETE USUARIO
// =======================
async function deleteErabiltzailea(nan, silent = false) {
  if (!silent && !confirm('Erabiltzailea ezabatuko duzu.')) return;

  const api_key = getApiKey();
  const res = await fetch(`${apiUrl}?action=delete&nan=${encodeURIComponent(nan)}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + api_key }
  });

  const data = await res.json();
  if (!data.success) { if (!silent) showToast(data.message, 'error'); return; }

  if (!silent) showToast('Erabiltzailea ezabatu da', 'success');
  fetchErabiltzaileak();
}

// =======================
// EVENT LISTENERS
// =======================
document.getElementById('addBtn').addEventListener('click', () => openModal());
window.addEventListener('DOMContentLoaded', fetchErabiltzaileak);

searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll('#erabiltzaileaTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
});
