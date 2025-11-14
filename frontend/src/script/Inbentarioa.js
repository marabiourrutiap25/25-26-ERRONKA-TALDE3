const apiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/InbentarioaController.php';
const ekipApiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/EkipamenduaController.php';
const tbody = document.querySelector('#inbentarioaTable tbody');
const modal = new bootstrap.Modal(document.getElementById('inbentarioaModal'));
const form = document.getElementById('inbentarioaForm');
const searchInput = document.getElementById('searchInput');
const ekipamenduSelect = document.getElementById('idEkipamendu');

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

function showToast(message, type = 'success') {
  const icons = {
    success: '\u2705',
    error: '\u274c',
    warning: '\u26a0\ufe0f',
    info: '\u2139\ufe0f'
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
      console.warn('Showing toast failed, falling back to alert:', e);
    }
  }
  console.log(`${type.toUpperCase()}: ${message}`);
  try { window.alert(message); } catch (e) { /* ignore */ }
}

async function fetchInbentarioak() {
  tbody.innerHTML = '<tr><td colspan="4">Kargatzen...</td></tr>';
  const api_key = getApiKey();
  if (!api_key) {
    tbody.innerHTML = '<tr><td colspan="4">❌ Saioa ez da aktibo. Hasi saioa berriro.</td></tr>';
    return;
  }
  try {
    const res = await fetch(`${apiUrl}?action=getAll`, {
      headers: { 'Authorization': 'Bearer ' + api_key }
    });
    const data = await res.json();
    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="4">${data.message}</td></tr>`;
      return;
    }
    const items = data.inbentarioak || [];
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Ez dago daturik.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(obj => {
      const item = obj.inbentarioa;
      const ekipamendu_izena = obj.ekipamendu_izena || '';
      return `<tr>
        <td>${escapeHtml(item.etiketa)}</td>
        <td>${escapeHtml(ekipamendu_izena)}</td>
        <td>${escapeHtml(item.erosketaData)}</td>
        <td>
          <button class="btn-action editBtn" data-etiketa="${item.etiketa}">✏️</button>
          <button class="btn-action deleteBtn" data-etiketa="${item.etiketa}">🗑️</button>
        </td>
      </tr>`;
    }).join('');
    document.querySelectorAll('.editBtn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.etiketa));
    });
    document.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.addEventListener('click', () => deleteInbentarioa(btn.dataset.etiketa));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">${escapeHtml(err.message)}</td></tr>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function loadEkipamenduak() {
  const api_key = getApiKey();
  try {
    const res = await fetch(`${ekipApiUrl}?action=getAll`, {
      headers: { 'Authorization': 'Bearer ' + api_key }
    });
    const data = await res.json();
    if (!data.success) {
      console.error('Error loading ekipamenduak:', data.message);
      return;
    }
    ekipamenduSelect.innerHTML = '<option value="">Aukeratu ekipamendua</option>';
    (data.ekipamenduak || []).forEach(ekip => {
      const option = document.createElement('option');
      option.value = ekip.id;
      option.textContent = ekip.izena;
      ekipamenduSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading ekipamenduak:', err);
  }
}

async function openModal(etiketa = null) {
  const api_key = getApiKey();
  await loadEkipamenduak();
  if (etiketa) {
    const res = await fetch(`${apiUrl}?action=getByEtiketa&etiketa=${encodeURIComponent(etiketa)}`, { headers: { 'Authorization': 'Bearer ' + api_key } });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message, 'error');
      return;
    }
    const etiketaField = document.getElementById('etiketa');
    const etiketaOldField = document.getElementById('etiketaOld');
    const idEkipamenduField = document.getElementById('idEkipamendu');
    const erosketaDataField = document.getElementById('erosketaData');
    etiketaField.value = data.inbentarioa.etiketa;
    etiketaOldField.value = data.inbentarioa.etiketa;
    idEkipamenduField.value = data.inbentarioa.idEkipamendu;
    erosketaDataField.value = data.inbentarioa.erosketaData;
    document.getElementById('inbentarioaModalLabel').textContent = 'Editatu';
    [etiketaField, idEkipamenduField, erosketaDataField].forEach(f => {
      if (f) {
        f.removeAttribute('disabled');
        f.removeAttribute('readonly');
        f.style.pointerEvents = '';
      }
    });
  } else {
    form.reset();
    document.getElementById('etiketaOld').value = '';
    document.getElementById('inbentarioaModalLabel').textContent = 'Sortu';
    ['etiketa','idEkipamendu','erosketaData'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.removeAttribute('disabled'); el.removeAttribute('readonly'); el.style.pointerEvents = ''; }
    });
  }
  modal.show();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const api_key = getApiKey();
  const etiketa = document.getElementById('etiketa').value;
  const etiketaOld = document.getElementById('etiketaOld').value;
  const payload = {
    etiketa: etiketa,
    idEkipamendu: document.getElementById('idEkipamendu').value,
    erosketaData: document.getElementById('erosketaData').value
  };
  let action, url;
  if (etiketaOld && etiketaOld === etiketa) {
    action = 'update&etiketa=' + encodeURIComponent(etiketa);
    url = `${apiUrl}?action=${action}`;
  } else if (etiketaOld && etiketaOld !== etiketa) {
    // Etiqueta cambiada: eliminar el antiguo y crear nuevo
    await deleteInbentarioa(etiketaOld, true);
    action = 'create';
    url = `${apiUrl}?action=${action}`;
  } else {
    action = 'create';
    url = `${apiUrl}?action=${action}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!data.success) {
    showToast(data.message, 'error');
    return;
  }
  showToast('Inbentarioa gorde da', 'success');
  modal.hide();
  fetchInbentarioak();
});

async function deleteInbentarioa(etiketa, silent = false) {
  if (!silent && !confirm('Inbentarioa ezabatuko duzu.')) return;
  const api_key = localStorage.getItem('api_key');
  const res = await fetch(`${apiUrl}?action=delete&etiketa=${encodeURIComponent(etiketa)}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + api_key }
  });
  const data = await res.json();
  if (!data.success) {
    if (!silent) showToast(data.message, 'error');
    return;
  }
  if (!silent) showToast('Inbentarioa ezabatu da', 'success');
  fetchInbentarioak();
}

document.getElementById('addBtn').addEventListener('click', () => openModal());
window.addEventListener('DOMContentLoaded', fetchInbentarioak);
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll('#inbentarioaTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
});
