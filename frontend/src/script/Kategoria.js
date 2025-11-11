
(function() {
  const apiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/KategoriaController.php';
  const tbody = document.querySelector('#kategoriaTable tbody');
  const modal = new bootstrap.Modal(document.getElementById('kategoriaModal'));
  const form = document.getElementById('kategoriaForm');
  const searchInput = document.getElementById('searchKategoriaInput');

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
          <button class="btn-action editBtn" data-id="${item.id}">✏️</button>
          <button class="btn-action deleteBtn" data-id="${item.id}">🗑️</button>
        </td>
      </tr>`;
    }).join('');
    document.querySelectorAll('.editBtn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.id));
    });
    document.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.addEventListener('click', () => deleteKategoria(btn.dataset.id));
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
  modal.hide();
  modal.show();
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
  showToast('Kategoria ezabatu da', 'success');
  fetchKategoriak();
}

document.getElementById('addKategoriaBtn').addEventListener('click', () => openModal());
window.addEventListener('DOMContentLoaded', fetchKategoriak);
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll('#kategoriaTable tbody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
});
})();
