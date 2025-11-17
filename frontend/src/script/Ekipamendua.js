// Lógica de interfaz para listar y CRUD de equipamiento
const apiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/EkipamenduaController.php';
const kategoriaApiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/KategoriaController.php';
const tbody = document.querySelector('#ekipTable tbody');
const modal = new bootstrap.Modal(document.getElementById('ekipModal'));
const form = document.getElementById('ekipForm');
const searchInput = document.getElementById('searchInput');
const kategoriaSelect = document.getElementById('kategoria');

// ===== COOKIE HELPER FUNCTION =====
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

// Obtener api_key desde cookie de sesión o localStorage
function getApiKey() {
  return getCookie('api_key_session') || localStorage.getItem('api_key');
}

// Toast initialization (defensive)
let toast = null;
let toastElement = document.getElementById('notificationToast');
let toastTitle = document.getElementById('toastTitle');
let toastMessage = document.getElementById('toastMessage');
let toastIcon = document.getElementById('toastIcon');
try {
  if (toastElement && window.bootstrap && typeof window.bootstrap.Toast === 'function') {
    toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  } else {
    toast = null;
  }
} catch (e) {
  console.warn('Toast init failed:', e);
  toast = null;
}

// Show toast notification
function showToast(message, type = 'success') {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  const titles = {
    success: 'Arrakasta',
    error: 'Errorea',
    warning: 'Kontuz',
    info: 'Informazioa'
  };

  if (toast && toastElement && toastTitle && toastMessage && toastIcon) {
    try {
      toastIcon.textContent = icons[type] || '';
      toastTitle.textContent = titles[type] || '';
      toastMessage.textContent = message || '';

      toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'text-white');
      if (type === 'error') {
        toastElement.classList.add('bg-danger', 'text-white');
      } else if (type === 'success') {
        toastElement.classList.add('bg-success', 'text-white');
      } else if (type === 'warning') {
        toastElement.classList.add('bg-warning');
      } else {
        toastElement.classList.add('bg-info', 'text-white');
      }

      toast.show();
      return;
    } catch (e) {
      console.warn('Errore bat gertatu da:', e);
    }
  }
  console.log(`${type.toUpperCase()}: ${message}`);
  try { window.alert(message); } catch (e) { }
}

async function fetchEkipamenduak() {
  tbody.innerHTML = '<tr><td colspan="8">Kargatzen...</td></tr>';
  const api_key = getApiKey();
  if (!api_key) {
    tbody.innerHTML = '<tr><td colspan="8">❌ Saioa ez da aktibo. Hasi saioa berriro.</td></tr>';
    return;
  }

  try {
    const res = await fetch(`${apiUrl}?action=getAll`, {
      headers: { 'Authorization': 'Bearer ' + api_key }
    });
    const data = await res.json();
    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="8">${data.message}</td></tr>`;
      return;
    }

    const items = data.ekipamenduak || [];
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">Ez dago daturik.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${escapeHtml(item.izena)}</td>
        <td>${escapeHtml(item.deskribapena)}</td>
        <td>${escapeHtml(item.marka || '')}</td>
        <td>${escapeHtml(item.modelo || '')}</td>
        <td>${escapeHtml(item.kategoria_izena || '')}</td>
        <td>${item.stock}</td>
        <td>
          <button class="btn-action editBtn" data-id="${item.id}">✏️</button>
          <button class="btn-action deleteBtn" data-id="${item.id}">🗑️</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.editBtn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });

    document.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.addEventListener('click', () => deleteEkipamendua(btn.dataset.id));
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8">${escapeHtml(err.message)}</td></tr>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function loadKategoriak() {
  const api_key = getApiKey();
  try {
    const res = await fetch(`${kategoriaApiUrl}?action=getAll`, {
      headers: { 'Authorization': 'Bearer ' + api_key }
    });
    const data = await res.json();
    if (!data.success) {
      console.error('Error loading categories:', data.message);
      return;
    }

    kategoriaSelect.innerHTML = '<option value="">Aukeratu kategoria</option>';
    data.kategoriak.forEach(kategoria => {
      const option = document.createElement('option');
      option.value = kategoria.id;
      option.textContent = kategoria.izena;
      kategoriaSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

async function openModal(id = null) {
  const api_key = getApiKey();
  await loadKategoriak();

  if (id) {
    const res = await fetch(`${apiUrl}?action=getById&id=${id}`, { headers: { 'Authorization': 'Bearer ' + api_key } });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message, 'error');
      return;
    }

    const idField = document.getElementById('ekipId');
    const izenaField = document.getElementById('izena');
    const deskrField = document.getElementById('deskribapena');
    const markaField = document.getElementById('marka');
    const modeloField = document.getElementById('modelo');
    const kategoriaField = document.getElementById('kategoria');
    const stockField = document.getElementById('stock');

    idField.value = data.ekipamendua.id;
    izenaField.value = data.ekipamendua.izena;
    deskrField.value = data.ekipamendua.deskribapena;
    markaField.value = data.ekipamendua.marka;
    modeloField.value = data.ekipamendua.modelo;
    kategoriaField.value = data.ekipamendua.idKategoria;
    stockField.value = data.ekipamendua.stock;
    document.getElementById('ekipModalLabel').textContent = 'Editatu';

    [izenaField, deskrField, markaField, modeloField, kategoriaField, stockField].forEach(f => {
      if (f) { f.removeAttribute('disabled'); f.removeAttribute('readonly'); f.style.pointerEvents = ''; }
    });
  } else {
    form.reset();
    document.getElementById('ekipId').value = '';
    document.getElementById('ekipModalLabel').textContent = 'Sortu';
    ['izena', 'deskribapena', 'marka', 'modelo', 'kategoria', 'stock'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.removeAttribute('disabled'); el.removeAttribute('readonly'); el.style.pointerEvents = ''; }
    });
  }
  modal.show();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const api_key = getApiKey();
  const id = document.getElementById('ekipId').value;
  const payload = {
    izena: document.getElementById('izena').value,
    deskribapena: document.getElementById('deskribapena').value,
    marka: document.getElementById('marka').value,
    modelo: document.getElementById('modelo').value,
    idKategoria: document.getElementById('kategoria').value,
    stock: parseInt(document.getElementById('stock').value) || 0
  };

  const action = id ? 'update&id=' + id : 'create';
  const res = await fetch(`${apiUrl}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) {
    showToast(data.message, 'error');
    return;
  }
  showToast('Ekipamendua gorde da', 'success');
  modal.hide();
  fetchEkipamenduak();
});

async function deleteEkipamendua(id) {
  const api_key = getApiKey();
  const res = await fetch(`${apiUrl}?action=delete&id=${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + api_key }
  });
  const data = await res.json();
  if (!data.success) {
    showToast(data.message, 'error');
    return;
  }
  showToast('Ekipamendua ezabatu da', 'success');
  fetchEkipamenduak();
}

document.getElementById('addBtn').addEventListener('click', () => openModal());
window.addEventListener('DOMContentLoaded', fetchEkipamenduak);

searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll('#ekipTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
});
