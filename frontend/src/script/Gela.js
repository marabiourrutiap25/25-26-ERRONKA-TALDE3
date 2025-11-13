
(function () {
  const apiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/GelaController.php';
  const tbody = document.querySelector('#gelaTable tbody');
  const form = document.getElementById('gelaForm');
  const searchInput = document.getElementById('searchGelaInput');
  const modalElement = document.getElementById('gelaModal');
  const addBtn = document.getElementById('addGelaBtn');
  let modal = null;

  if (!tbody || !form || !searchInput || !modalElement || !addBtn) {
    console.warn('[Gela] Beharrezko elementuak falta dira. Ez da script-a exekutatuko.');
    return;
  }

  if (modalElement && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
    try {
      modal = new bootstrap.Modal(modalElement);
    } catch (err) {
      console.warn('[Gela] Ezin izan da Bootstrap modala hasieratu:', err);
      modal = null;
    }
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

  let toast = null;
  const toastElement = document.getElementById('notificationToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  try {
    if (toastElement && window.bootstrap && typeof window.bootstrap.Toast === 'function') {
      toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    }
  } catch (e) {
    console.warn('[Gela] Toast-a hasieratzeak huts egin du:', e);
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
        console.warn('[Gela] Toast-a erakustea huts egin du:', e);
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
      if (!res.ok || !data.success) {
        tbody.innerHTML = `<tr><td colspan="4">${escapeHtml(data.message || 'Errorea datuak kargatzean.')}</td></tr>`;
        return;
      }
      const items = data.gelak || [];
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Ez dago daturik.</td></tr>';
        return;
      }
      tbody.innerHTML = items.map(item => `
        <tr>
          <td>${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.izena)}</td>
          <td>${escapeHtml(item.taldea || '')}</td>
          <td>
            <button class="btn-action" data-action="edit" data-id="${item.id}">✏️</button>
            <button class="btn-action" data-action="delete" data-id="${item.id}">🗑️</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="4">${escapeHtml(err.message)}</td></tr>`;
    }
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

  async function openModal(id = null) {
    const api_key = getApiKey();
    if (!api_key) {
      showToast('Saioa ez da aktibo. Hasi saioa berriro.', 'error');
      return;
    }
    if (id) {
      try {
        const res = await fetch(`${apiUrl}?action=getById&id=${encodeURIComponent(id)}`, {
          headers: { 'Authorization': 'Bearer ' + api_key }
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          showToast(data.message || 'Errorea gela eskuratzean.', 'error');
          return;
        }
        document.getElementById('gelaId').value = data.gela.id;
        document.getElementById('gelaIzena').value = data.gela.izena;
        document.getElementById('gelaTaldea').value = data.gela.taldea || '';
        document.getElementById('gelaModalLabel').textContent = 'Editatu';
      } catch (err) {
        showToast(err.message || 'Errore ezezaguna gela eskuratzean.', 'error');
        return;
      }
    } else {
      form.reset();
      document.getElementById('gelaId').value = '';
      document.getElementById('gelaModalLabel').textContent = 'Sortu';
    }
    modal?.show();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const api_key = getApiKey();
    if (!api_key) {
      showToast('Saioa ez da aktibo. Hasi saioa berriro.', 'error');
      return;
    }
    const id = document.getElementById('gelaId').value;
    const payload = {
      izena: document.getElementById('gelaIzena').value,
      taldea: document.getElementById('gelaTaldea').value
    };
    const action = id ? `update&id=${encodeURIComponent(id)}` : 'create';
    try {
      const res = await fetch(`${apiUrl}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Errorea gela gordetzean.', 'error');
        return;
      }
      showToast('Gela gorde da', 'success');
      modal?.hide();
      fetchGelak();
    } catch (err) {
      showToast(err.message || 'Errore ezezaguna gela gordetzean.', 'error');
    }
  });

  tbody.addEventListener('click', event => {
    const actionBtn = event.target.closest('button[data-action]');
    if (!actionBtn || !tbody.contains(actionBtn)) {
      return;
    }
    const { action, id } = actionBtn.dataset;
    if (!id) {
      return;
    }
    if (action === 'edit') {
      openModal(id);
    } else if (action === 'delete') {
      deleteGela(id);
    }
  });

  async function deleteGela(id) {
    const api_key = getApiKey();
    if (!api_key) {
      showToast('Saioa ez da aktibo. Hasi saioa berriro.', 'error');
      return;
    }
    if (!confirm('Ziur al zaude gela hau ezabatu nahi duzula?')) {
      return;
    }
    try {
      const res = await fetch(`${apiUrl}?action=delete&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + api_key }
      });
      let data = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        data = null;
      }
      if (!res.ok || !data || !data.success) {
        const message = data && data.message ? data.message : 'Errorea gela ezabatzean.';
        showToast(message, 'error');
        return;
      }
      showToast('Gela ezabatu da', 'success');
      fetchGelak();
    } catch (err) {
      showToast(err.message || 'Errore ezezaguna gela ezabatzean.', 'error');
    }
  }

  addBtn.addEventListener('click', () => openModal());
  window.addEventListener('DOMContentLoaded', fetchGelak);
  searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    document.querySelectorAll('#gelaTable tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  });
})();
