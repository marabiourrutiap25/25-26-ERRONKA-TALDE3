
(function() {
  const apiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/GelaController.php';
  const tbody = document.querySelector('#gelaTable tbody');
  const form = document.getElementById('gelaForm');
  const searchInput = document.getElementById('searchGelaInput');
  const modalElement = document.getElementById('gelaModal');
  const addBtn = document.getElementById('addGelaBtn');
  let modal = null;

  console.log('[Gela] Script initialising');

  if (!tbody || !form || !searchInput || !modalElement || !addBtn) {
    console.warn('[Gela] Required DOM elements not found. Aborting script.');
    return;
  }

  if (modalElement && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
    try {
      modal = new bootstrap.Modal(modalElement);
    } catch (err) {
      console.warn('[Gela] Bootstrap modal initialisation failed:', err);
      modal = null;
    }
  } else {
    console.warn('[Gela] Bootstrap modal not available. Modal actions disabled.');
  }

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

async function fetchGelak() {
  tbody.innerHTML = '<tr><td colspan="4">Kargatzen...</td></tr>';
  const api_key = getApiKey();
  if (!api_key) {
    tbody.innerHTML = '<tr><td colspan="4">\u274c Saioa ez da aktibo. Hasi saioa berriro.</td></tr>';
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
    const items = data.gelak || [];
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Ez dago daturik.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(item => {
      return `<tr>
        <td>${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.izena)}</td>
        <td>${escapeHtml(item.taldea || '')}</td>
        <td>
          <button class="btn-action editBtn-gela" data-id="${item.id}">✏️</button>
          <button class="btn-action deleteBtn-gela" data-id="${item.id}">🗑️</button>
        </td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.editBtn-gela').forEach(btn => {
      btn.addEventListener('click', () => {
        console.log('[Gela] Edit button clicked', btn.dataset.id);
        openModal(btn.dataset.id);
      });
    });
    tbody.querySelectorAll('.deleteBtn-gela').forEach(btn => {
      btn.addEventListener('click', () => {
        console.log('[Gela] Delete button clicked', btn.dataset.id);
        deleteGela(btn.dataset.id);
      });
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

async function openModal(id = null) {
  const api_key = getApiKey();
  if (id) {
    const res = await fetch(`${apiUrl}?action=getById&id=${encodeURIComponent(id)}`, { headers: { 'Authorization': 'Bearer ' + api_key } });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message, 'error');
      return;
    }
    document.getElementById('gelaId').value = data.gela.id;
    document.getElementById('gelaIzena').value = data.gela.izena;
    document.getElementById('gelaTaldea').value = data.gela.taldea || '';
    document.getElementById('gelaModalLabel').textContent = 'Editatu';
  } else {
    form.reset();
    document.getElementById('gelaId').value = '';
    document.getElementById('gelaModalLabel').textContent = 'Sortu';
  }
  if (modal) {
    modal.hide();
    modal.show();
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const api_key = getApiKey();
  const id = document.getElementById('gelaId').value;
  const izena = document.getElementById('gelaIzena').value;
  const taldea = document.getElementById('gelaTaldea').value;
  const payload = { izena, taldea };
  let action, url;
  if (id) {
    action = 'update&id=' + encodeURIComponent(id);
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
  showToast('Gela gorde da', 'success');
  modal.hide();
  fetchGelak();
});

async function deleteGela(id) {
  if (!confirm('Ziur al zaude ezabatu nahi duzula?')) return;
  const api_key = getApiKey();
  const res = await fetch(`${apiUrl}?action=delete&id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + api_key }
  });
  const data = await res.json();
  if (!data.success) {
    showToast(data.message, 'error');
    return;
  }
  showToast('Gela ezabatu da', 'success');
  fetchGelak();
}

addBtn.addEventListener('click', () => {
  console.log('[Gela] Add button clicked');
  openModal();
});
window.addEventListener('DOMContentLoaded', fetchGelak);
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll('#gelaTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
});
})();
