
(function() {
  const apiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/KategoriaController.php';
  const tbody = document.querySelector('#kategoriaTable tbody');
  const form = document.getElementById('kategoriaForm');
  const searchInput = document.getElementById('searchKategoriaInput');
  const addBtn = document.getElementById('addKategoriaBtn');
  const modalElement = document.getElementById('kategoriaModal');
  let modal = null;

  console.log('[Kategoria] Script initialising');

  if (!tbody || !form || !searchInput || !addBtn) {
    console.warn('[Kategoria] Required DOM elements not found. Aborting script.');
    return;
  }

  if (modalElement && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
    try {
      modal = new bootstrap.Modal(modalElement);
    } catch (err) {
      console.warn('[Kategoria] Bootstrap modal initialisation failed:', err);
      modal = null;
    }
  } else {
    console.warn('[Kategoria] Bootstrap modal not available. Modal actions disabled.');
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

async function fetchKategoriak() {
  tbody.innerHTML = '<tr><td colspan="3">Kargatzen...</td></tr>';
  const api_key = getApiKey();
  if (!api_key) {
    tbody.innerHTML = '<tr><td colspan="3">\u274c Saioa ez da aktibo. Hasi saioa berriro.</td></tr>';
    return;
  }
  try {
    const res = await fetch(`${apiUrl}?action=getAll`, {
      headers: { 'Authorization': 'Bearer ' + api_key }
    });
    const data = await res.json();
    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="3">${data.message}</td></tr>`;
      return;
    }
    const items = data.kategoriak || [];
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">Ez dago daturik.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(item => {
      return `<tr>
        <td>${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.izena)}</td>
        <td>
          <button class="btn-action editBtn-kategoria" data-id="${item.id}">✏️</button>
          <button class="btn-action deleteBtn-kategoria" data-id="${item.id}">🗑️</button>
        </td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.editBtn-kategoria').forEach(btn => {
      btn.addEventListener('click', () => {
        console.log('[Kategoria] Edit button clicked', btn.dataset.id);
        openModal(btn.dataset.id);
      });
    });
    tbody.querySelectorAll('.deleteBtn-kategoria').forEach(btn => {
      btn.addEventListener('click', () => {
        console.log('[Kategoria] Delete button clicked', btn.dataset.id);
        deleteKategoria(btn.dataset.id);
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3">${escapeHtml(err.message)}</td></tr>`;
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
    document.getElementById('kategoriaId').value = data.kategoria.id;
    document.getElementById('kategoriaIzena').value = data.kategoria.izena;
    document.getElementById('kategoriaModalLabel').textContent = 'Editatu';
  } else {
    form.reset();
    document.getElementById('kategoriaId').value = '';
    document.getElementById('kategoriaModalLabel').textContent = 'Sortu';
  }
  if (modal) {
    modal.hide();
    modal.show();
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const api_key = getApiKey();
  const id = document.getElementById('kategoriaId').value;
  const izena = document.getElementById('kategoriaIzena').value;
  const payload = { izena };
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
  showToast('Kategoria gorde da', 'success');
  modal.hide();
  fetchKategoriak();
});

async function deleteKategoria(id) {
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
  showToast('Kategoria ezabatu da', 'success');
  fetchKategoriak();
}

addBtn.addEventListener('click', () => {
  console.log('[Kategoria] Add button clicked');
  openModal();
});
window.addEventListener('DOMContentLoaded', fetchKategoriak);
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll('#kategoriaTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
});
})();
