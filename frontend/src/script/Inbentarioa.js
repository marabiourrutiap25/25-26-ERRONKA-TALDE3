// Inbentarioaren ikuspegia: unitateak erakusten eta APIari CRUD deiak egiten
// =======================
// API KONFIGURAZIOA
// =======================
const apiUrl = `${window.location.origin}/25-26-ERRONKA-TALDE3/backend/src/controller/InbentarioaController.php`;
const ekipApiUrl = `${window.location.origin}/25-26-ERRONKA-TALDE3/backend/src/controller/EkipamenduaController.php`;

// =======================
// DOM ELEMENTUAK
// =======================
const tbody = document.querySelector('#inbentarioaTable tbody');
const modal = new bootstrap.Modal(document.getElementById('inbentarioaModal'));
const form = document.getElementById('inbentarioaForm');
const searchInput = document.getElementById('searchInput');
const ekipamenduSelect = document.getElementById('idEkipamendu');

// =======================
// LAGUNTZAILE FUNKTZIOAK
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
// INBENTARIOA: ZERRENDA
// =======================
async function fetchInbentarioak() {
  tbody.innerHTML = '<tr><td colspan="4">Kargatzen...</td></tr>';
  const api_key = getApiKey();
  if (!api_key) {
    tbody.innerHTML = '<tr><td colspan="4">❌ Saioa ez da aktibo. Hasi saioa berriro.</td></tr>';
    return;
  }

  try {
    const res = await fetch(`${apiUrl}?action=getAll`, { headers: { 'Authorization': 'Bearer ' + api_key } });
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

// =======================
// EKIPAMENDUAK KARGATU
// =======================
async function loadEkipamenduak() {
  const api_key = getApiKey();
  try {
    const res = await fetch(`${ekipApiUrl}?action=getAll`, { headers: { 'Authorization': 'Bearer ' + api_key } });
    const data = await res.json();
    if (!data.success) return console.error('Error loading ekipamenduak:', data.message);

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

// =======================
// MODAL IREKI
// =======================
async function openModal(etiketa = null) {
  const api_key = getApiKey();
  await loadEkipamenduak();

  const etiketaField = document.getElementById('etiketa');
  const etiketaOldField = document.getElementById('etiketaOld');
  const idEkipamenduField = document.getElementById('idEkipamendu');
  const erosketaDataField = document.getElementById('erosketaData');

  if (etiketa) {
    const res = await fetch(`${apiUrl}?action=getByEtiketa&etiketa=${encodeURIComponent(etiketa)}`, { headers: { 'Authorization': 'Bearer ' + api_key } });
    const data = await res.json();
    if (!data.success) { showToast(data.message, 'error'); return; }

    const inv = data.inbentarioa;
    etiketaField.value = inv.etiketa;
    etiketaOldField.value = inv.etiketa;
    idEkipamenduField.value = inv.idEkipamendu;
    erosketaDataField.value = inv.erosketaData;

    // Eskaera aldaketa: etiketa ez da editagarria
    etiketaField.setAttribute('readonly', true);

    [idEkipamenduField, erosketaDataField].forEach(f => { f.removeAttribute('disabled'); f.style.pointerEvents = ''; });
    document.getElementById('inbentarioaModalLabel').textContent = 'Editatu';
  } else {
    form.reset();
    etiketaOldField.value = '';
    document.getElementById('inbentarioaModalLabel').textContent = 'Sortu';
    ['etiketa', 'idEkipamendu', 'erosketaData'].forEach(id => {
      const el = document.getElementById(id);
      el.removeAttribute('disabled'); el.removeAttribute('readonly'); el.style.pointerEvents = '';
    });
  }

  modal.show();
}

// =======================
// FORMULARIOAREN BIDALKETA
// =======================
form.addEventListener('submit', async e => {
  e.preventDefault();
  const api_key = getApiKey();

  const etiketa = document.getElementById('etiketa').value;
  const etiketaOld = document.getElementById('etiketaOld').value;

  const payload = {
    etiketa,
    idEkipamendu: document.getElementById('idEkipamendu').value,
    erosketaData: document.getElementById('erosketaData').value
  };

  let url;
  if (etiketaOld && etiketaOld === etiketa) {
    url = `${apiUrl}?action=update&etiketa=${encodeURIComponent(etiketa)}`;
  } else if (etiketaOld && etiketaOld !== etiketa) {
    await deleteInbentarioa(etiketaOld, true);
    url = `${apiUrl}?action=create`;
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

  showToast('Inbentarioa gorde da', 'success');
  modal.hide();
  fetchInbentarioak();
});

// =======================
// INBENTARIOA EZABATU
// =======================
async function deleteInbentarioa(etiketa, silent = false) {

  const api_key = getApiKey();
  const res = await fetch(`${apiUrl}?action=delete&etiketa=${encodeURIComponent(etiketa)}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + api_key }
  });

  const data = await res.json();
  if (!data.success) { if (!silent) showToast(data.message, 'error'); return; }

  if (!silent) showToast('Inbentarioa ezabatu da', 'success');
  fetchInbentarioak();
}

// =======================
// GERTAERA ENTZUNLEAK
// =======================
document.getElementById('addBtn').addEventListener('click', () => openModal());
window.addEventListener('DOMContentLoaded', fetchInbentarioak);

searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll('#inbentarioaTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
});
