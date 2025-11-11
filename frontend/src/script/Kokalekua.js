
(function() {
  const apiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/KokalekuaController.php';
  const gelaApiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/GelaController.php';
  const tbody = document.querySelector('#kokalekuaTable tbody');
  const modal = new bootstrap.Modal(document.getElementById('kokalekuaModal'));
  const form = document.getElementById('kokalekuaForm');
  const searchInput = document.getElementById('searchKokalekuaInput');
  const gelaSelect = document.getElementById('idGela');

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
  return "";
}

function getApiKey() {
  return getCookie('api_key_session') || localStorage.getItem('api_key');
}

// Toast initialization (igual que Inbentarioa.js)
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

async function fetchKokalekuak() {
  tbody.innerHTML = '<tr><td colspan="5">Kargatzen...</td></tr>';
  const api_key = getApiKey();
  if (!api_key) {
    tbody.innerHTML = '<tr><td colspan="5">\u274c Saioa ez da aktibo. Hasi saioa berriro.</td></tr>';
    return;
  }
  try {
    const res = await fetch(`${apiUrl}?action=getAll`, {
      headers: { 'Authorization': 'Bearer ' + api_key }
    });
    const data = await res.json();
    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="5">${data.message}</td></tr>`;
      return;
    }
    const items = data.kokalekuak || [];
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Ez dago daturik.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(obj => {
      const item = obj.kokalekua;
      const gela_izena = obj.gela_izena || '';
      return `<tr>
        <td>${escapeHtml(item.etiketa)}</td>
        <td>${escapeHtml(gela_izena)}</td>
        <td>${escapeHtml(item.hasieraData)}</td>
        <td>${escapeHtml(item.amaieraData || '')}</td>
        <td>
          <button class="btn-action editBtn" data-etiketa="${item.etiketa}" data-hasieraData="${item.hasieraData}">✏️</button>
          <button class="btn-action deleteBtn" data-etiketa="${item.etiketa}" data-hasieraData="${item.hasieraData}">🗑️</button>
        </td>
      </tr>`;
    }).join('');
    document.querySelectorAll('.editBtn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.etiketa, btn.dataset.hasieraData));
    });
    document.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.addEventListener('click', () => deleteKokalekua(btn.dataset.etiketa, btn.dataset.hasieraData));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message)}</td></tr>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function loadGelak() {
  const api_key = getApiKey();
  try {
    const res = await fetch(`${gelaApiUrl}?action=getAll`, {
      headers: { 'Authorization': 'Bearer ' + api_key }
    });
    const data = await res.json();
    if (!data.success) {
      console.error('Error loading gelak:', data.message);
      return;
    }
    gelaSelect.innerHTML = '<option value="">Aukeratu gela</option>';
    (data.gelak || []).forEach(gela => {
      const option = document.createElement('option');
      option.value = gela.id;
      option.textContent = gela.izena;
      gelaSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading gelak:', err);
  }
}

async function openModal(etiketa = null, hasieraData = null) {
  const api_key = getApiKey();
  await loadGelak();
  if (etiketa && hasieraData) {
    const res = await fetch(`${apiUrl}?action=getByEtiketa&etiketa=${encodeURIComponent(etiketa)}`, { headers: { 'Authorization': 'Bearer ' + api_key } });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message, 'error');
      return;
    }
    document.getElementById('kokalekuaEtiketa').value = data.kokalekua.etiketa;
    document.getElementById('kokalekuaEtiketaOld').value = data.kokalekua.etiketa;
    document.getElementById('idGela').value = data.kokalekua.idGela;
    document.getElementById('hasieraData').value = data.kokalekua.hasieraData;
    document.getElementById('hasieraDataOld').value = data.kokalekua.hasieraData;
    document.getElementById('amaieraData').value = data.kokalekua.amaieraData || '';
    document.getElementById('kokalekuaModalLabel').textContent = 'Editatu';
  } else {
    form.reset();
    document.getElementById('kokalekuaEtiketaOld').value = '';
    document.getElementById('hasieraDataOld').value = '';
    document.getElementById('kokalekuaModalLabel').textContent = 'Sortu';
  }
  modal.hide();
  modal.show();
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const api_key = getApiKey();
  const etiketa = document.getElementById('kokalekuaEtiketa').value;
  const etiketaOld = document.getElementById('kokalekuaEtiketaOld').value;
  const hasieraData = document.getElementById('hasieraData').value;
  const hasieraDataOld = document.getElementById('hasieraDataOld').value;
  const payload = {
    etiketa: etiketa,
    idGela: document.getElementById('idGela').value,
    hasieraData: hasieraData,
    amaieraData: document.getElementById('amaieraData').value
  };
  let action, url;
  if (etiketaOld && hasieraDataOld) {
    action = `update&etiketa=${encodeURIComponent(etiketaOld)}&hasieraData=${encodeURIComponent(hasieraDataOld)}`;
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
  showToast('Kokalekua gorde da', 'success');
  modal.hide();
  fetchKokalekuak();
});

async function deleteKokalekua(etiketa, hasieraData) {
  if (!confirm('Ziur al zaude ezabatu nahi duzula?')) return;
  const api_key = getApiKey();
  const res = await fetch(`${apiUrl}?action=delete&etiketa=${encodeURIComponent(etiketa)}&hasieraData=${encodeURIComponent(hasieraData)}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + api_key }
  });
  const data = await res.json();
  if (!data.success) {
    showToast(data.message, 'error');
    return;
  }
  showToast('Kokalekua ezabatu da', 'success');
  fetchKokalekuak();
}

document.getElementById('addKokalekuaBtn').addEventListener('click', () => openModal());
window.addEventListener('DOMContentLoaded', fetchKokalekuak);
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll('#kokalekuaTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
});
})();
