(function () {

  /* =========================================================
   *  ELEMENTOS DEL DOM
   * ========================================================= */
  const apiUrl = window.location.origin +
    '/25-26-ERRONKA-TALDE3/backend/src/controller/KategoriaController.php';

  const tbody = document.querySelector('#kategoriaTable tbody');
  const form = document.getElementById('kategoriaForm');
  const searchInput = document.getElementById('searchKategoriaInput');
  const addBtn = document.getElementById('addKategoriaBtn');
  const modalElement = document.getElementById('kategoriaModal');

  let modal = null;

  console.log('[Kategoria] Script starting…');

  if (!tbody || !form || !searchInput || !addBtn) {
    console.warn('[Kategoria] Required DOM elements missing. Aborting script.');
    return;
  }

  /* =========================================================
   *  INIT MODAL
   * ========================================================= */
  if (modalElement && window.bootstrap?.Modal) {
    try {
      modal = new bootstrap.Modal(modalElement);
    } catch (err) {
      console.warn('[Kategoria] Bootstrap modal init failed:', err);
      modal = null;
    }
  } else {
    console.warn('[Kategoria] Bootstrap modal not available.');
  }

  /* =========================================================
   *  UTILIDADES
   * ========================================================= */

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2
      ? decodeURIComponent(parts.pop().split(';').shift())
      : "";
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

  /* =========================================================
   *  TOAST
   * ========================================================= */

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
    console.warn('[Kategoria] Toast init failed:', e);
    toast = null;
  }

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

    if (toast && toastElement) {
      try {
        toastIcon.textContent = icons[type] || '';
        toastTitle.textContent = titles[type] || '';
        toastMessage.textContent = message || '';

        toastElement.classList.remove(
          'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'text-white'
        );

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
        console.warn('[Kategoria] Toast display failed:', e);
      }
    }

    console.log(`${type.toUpperCase()}: ${message}`);
    try { alert(message); } catch (_) { }
  }

  /* =========================================================
   *  FETCH: LISTAR
   * ========================================================= */
  async function fetchKategoriak() {
    tbody.innerHTML = '<tr><td colspan="3">Kargatzen...</td></tr>';

    const api_key = getApiKey();
    if (!api_key) {
      tbody.innerHTML =
        '<tr><td colspan="3">❌ Saioa ez da aktibo. Hasi saioa berriro.</td></tr>';
      return;
    }

    try {
      const res = await fetch(`${apiUrl}?action=getAll`, {
        headers: { Authorization: 'Bearer ' + api_key }
      });

      const data = await res.json();

      if (!data.success) {
        tbody.innerHTML = `<tr><td colspan="3">${escapeHtml(data.message)}</td></tr>`;
        return;
      }

      const items = data.kategoriak || [];

      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">Ez dago daturik.</td></tr>';
        return;
      }

      tbody.innerHTML = items.map(item => `
        <tr>
          <td>${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.izena)}</td>
          <td>
            <button class="btn-action editBtn-kategoria" data-id="${item.id}">✏️</button>
            <button class="btn-action deleteBtn-kategoria" data-id="${item.id}">🗑️</button>
          </td>
        </tr>
      `).join('');

      // Añadir eventos en botones
      tbody.querySelectorAll('.editBtn-kategoria').forEach(btn =>
        btn.addEventListener('click', () => openModal(btn.dataset.id))
      );

      tbody.querySelectorAll('.deleteBtn-kategoria').forEach(btn =>
        btn.addEventListener('click', () => deleteKategoria(btn.dataset.id))
      );

    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="3">${escapeHtml(err.message)}</td></tr>`;
    }
  }

  /* =========================================================
   *  MODAL: ABRIR PARA CREAR/EDITAR
   * ========================================================= */
  async function openModal(id = null) {
    const api_key = getApiKey();

    if (id) {
      const res = await fetch(`${apiUrl}?action=getById&id=${encodeURIComponent(id)}`, {
        headers: { Authorization: 'Bearer ' + api_key }
      });

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

    modal?.show();
  }

  /* =========================================================
   *  FORM: CREAR O EDITAR
   * ========================================================= */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const api_key = getApiKey();
    const id = document.getElementById('kategoriaId').value;

    const payload = {
      izena: document.getElementById('kategoriaIzena').value
    };

    const action = id
      ? `update&id=${encodeURIComponent(id)}`
      : 'create';

    const res = await fetch(`${apiUrl}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + api_key
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.success) {
      showToast(data.message, 'error');
      return;
    }

    showToast('Kategoria gorde da', 'success');
    modal?.hide();
    fetchKategoriak();
  });

  /* =========================================================
   *  ELIMINAR
   * ========================================================= */
  async function deleteKategoria(id) {
    const api_key = getApiKey();

    const res = await fetch(
      `${apiUrl}?action=delete&id=${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + api_key }
      }
    );

    const data = await res.json();

    if (!data.success) {
      showToast(data.message, 'error');
      return;
    }

    showToast('Kategoria ezabatu da', 'success');
    fetchKategoriak();
  }

  /* =========================================================
   *  EVENTOS
   * ========================================================= */
  addBtn.addEventListener('click', () => openModal());

  searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();

    document.querySelectorAll('#kategoriaTable tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter)
        ? ''
        : 'none';
    });
  });

  window.addEventListener('DOMContentLoaded', fetchKategoriak);

})();
