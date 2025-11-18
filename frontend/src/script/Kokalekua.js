// Kokalekuak kudeatzeko portaera dinamikoa etiketen kokapenen asignaziorako
(function () {
  const apiUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/KokalekuaController.php';
  const inventoryUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/InbentarioaController.php';
  const gelaUrl = window.location.origin + '/25-26-ERRONKA-TALDE3/backend/src/controller/GelaController.php';

  const tbody = document.querySelector('#kokalekuaTable tbody');
  const form = document.getElementById('kokalekuaForm');
  const searchInput = document.getElementById('searchKokalekuaInput');
  const modalElement = document.getElementById('kokalekuaModal');
  const addBtn = document.getElementById('addKokalekuaBtn');

  const selectEtiketa = document.getElementById('kokalekuaEtiketa');
  const selectGela = document.getElementById('kokalekuaGela');
  const inputHasiera = document.getElementById('kokalekuaHasieraData');
  const inputAmaiera = document.getElementById('kokalekuaAmaieraData');

  const hiddenEtiketaOriginal = document.getElementById('kokalekuaEtiketaOriginal');
  const hiddenHasieraOriginal = document.getElementById('kokalekuaHasieraDataOriginal');

  let modal = null;
  let toast = null;

  if (!tbody || !form || !searchInput || !modalElement || !addBtn) return;

  if (window.bootstrap && typeof window.bootstrap.Modal === 'function') {
    modal = new bootstrap.Modal(modalElement);
    toast = new bootstrap.Toast(document.getElementById('notificationToast'), { delay: 3000 });
  }

  function getApiKey() {
    const cookie = document.cookie.match(/api_key_session=([^;]+)/);
    return cookie ? decodeURIComponent(cookie[1]) : localStorage.getItem('api_key');
  }

  // Erabiltzaileari notifikazio laburrak erakusten ditu (toast edo alert)
  function showToast(message, type = 'success') {
    const toastEl = document.getElementById('notificationToast');
    const iconEl = document.getElementById('toastIcon');
    const titleEl = document.getElementById('toastTitle');
    const bodyEl = document.getElementById('toastMessage');

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const titles = { success: 'Arrakasta', error: 'Errorea', warning: 'Kontuz', info: 'Informazioa' };

    if (toastEl && toast) {
      toastEl.className = 'toast';

      if (type === 'success') {
        toastEl.classList.add('bg-success', 'text-white');
      } else if (type === 'error') {
        toastEl.classList.add('bg-danger', 'text-white');
      } else if (type === 'warning') {
        toastEl.classList.add('bg-warning');
      } else {
        toastEl.classList.add('bg-info', 'text-white');
      }

      iconEl.textContent = icons[type] || '';
      titleEl.textContent = titles[type] || '';
      bodyEl.textContent = message || '';
      toast.show();
    } else {
      alert(message);
    }
  }

  // DOM-era injezioak saihesteko HTML ihes bihurtzen du
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  async function fetchKokalekuak() {
    // Kokaleku-taula kargatu eta erakusten du
    tbody.innerHTML = '<tr><td colspan="5">Kargatzen...</td></tr>';
    const api_key = getApiKey();
    if (!api_key) return;

    try {
      const res = await fetch(`${apiUrl}?action=getAll`, { headers: { 'Authorization': 'Bearer ' + api_key } });
      const data = await res.json();
      if (!res.ok || !data.success) {
        tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(data.message || 'Errorea')}</td></tr>`;
        return;
      }
      const items = data.kokalekuak || [];
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Ez dago daturik.</td></tr>';
        return;
      }

      tbody.innerHTML = items.map(item => {
        const k = item.kokalekua;
        return `<tr>
          <td>${escapeHtml(k.etiketa)}</td>
          <td>${escapeHtml(item.gela_izena)}</td>
          <td>${escapeHtml(k.hasieraData)}</td>
          <td>${escapeHtml(k.amaieraData || '')}</td>
          <td>
            <button class="btn-action" data-action="edit" data-etiketa="${k.etiketa}" data-hasiera="${k.hasieraData}">✏️</button>
            <button class="btn-action" data-action="delete" data-etiketa="${k.etiketa}" data-hasiera="${k.hasieraData}">🗑️</button>
          </td>
        </tr>`;
      }).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message)}</td></tr>`;
    }
  }

  async function loadSelectOptions() {
    // Select-ak betetzen ditu inbentario eta gelak erabilgarri daudenean
    const api_key = getApiKey();
    if (!api_key) return;

    // Inbentarioak
    try {
      const res = await fetch(`${inventoryUrl}?action=getAll`, { headers: { 'Authorization': 'Bearer ' + api_key } });
      const data = await res.json();
      selectEtiketa.innerHTML = '';
      if (data.success && data.inbentarioak) {
        data.inbentarioak.forEach(inv => {
          const opt = document.createElement('option');
          opt.value = inv.inbentarioa.etiketa;
          opt.textContent = `${inv.inbentarioa.etiketa} (${inv.ekipamendu_izena})`;
          selectEtiketa.appendChild(opt);
        });
      }
    } catch (err) { console.warn(err); }

    // Gelak
    try {
      const res = await fetch(`${gelaUrl}?action=getAll`, { headers: { 'Authorization': 'Bearer ' + api_key } });
      const data = await res.json();
      selectGela.innerHTML = '';
      if (data.success && data.gelak) {
        data.gelak.forEach(g => {
          const opt = document.createElement('option');
          opt.value = g.id;
          opt.textContent = g.izena;
          selectGela.appendChild(opt);
        });
      }
    } catch (err) { console.warn(err); }
  }

  async function openModal(etiketa = null, hasieraData = null) {
    // Modal-a prestatu eta ireki kokalekua sortu/eguneratzeko
    await loadSelectOptions();
    if (etiketa && hasieraData) {
      const api_key = getApiKey();
      const res = await fetch(`${apiUrl}?action=getByEtiketa&etiketa=${encodeURIComponent(etiketa)}`, { headers: { 'Authorization': 'Bearer ' + api_key } });
      const data = await res.json();
      if (!res.ok || !data.success || !data.kokalekuak.length) {
        showToast(data.message || 'Errorea kokalekua eskuratzean', 'error');
        return;
      }
      const k = data.kokalekuak.find(k => k.kokalekua.hasieraData === hasieraData).kokalekua;

      selectEtiketa.value = k.etiketa;
      selectGela.value = k.idGela;
      inputHasiera.value = k.hasieraData;
      inputAmaiera.value = k.amaieraData || '';

      hiddenEtiketaOriginal.value = k.etiketa;
      hiddenHasieraOriginal.value = k.hasieraData;

      document.getElementById('kokalekuaModalLabel').textContent = 'Editatu';
    } else {
      form.reset();
      hiddenEtiketaOriginal.value = '';
      hiddenHasieraOriginal.value = '';
      document.getElementById('kokalekuaModalLabel').textContent = 'Sortu';
    }
    modal.show();
  }

  form.addEventListener('submit', async e => {
    // Formularioa bidaltzen du kokalekua sortu/eguneratu ahal izateko
    e.preventDefault();
    const api_key = getApiKey();
    if (!api_key) return;

    const payload = {
      etiketa: selectEtiketa.value,
      idGela: parseInt(selectGela.value),
      hasieraData: inputHasiera.value,
      amaieraData: inputAmaiera.value || null
    };

    const originalEtiketa = hiddenEtiketaOriginal.value;
    const originalHasiera = hiddenHasieraOriginal.value;

    let actionUrl = '';
    if (originalEtiketa && originalHasiera) {
      actionUrl = `${apiUrl}?action=update&etiketa=${encodeURIComponent(originalEtiketa)}&hasieraData=${encodeURIComponent(originalHasiera)}`;
    } else {
      actionUrl = `${apiUrl}?action=create`;
    }

    try {
      const res = await fetch(actionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + api_key },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Errorea gordetzean', 'error');
        return;
      }
      showToast('Kokalekua gorde da', 'success');
      modal.hide();
      fetchKokalekuak();
    } catch (err) {
      showToast(err.message || 'Errore ezezaguna', 'error');
    }
  });

  tbody.addEventListener('click', e => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const { action, etiketa, hasiera } = btn.dataset;
    if (action === 'edit') openModal(etiketa, hasiera);
    else if (action === 'delete') deleteKokalekua(etiketa, hasiera);
  });

  async function deleteKokalekua(etiketa, hasieraData) {
    // Existitzen den kokalekua ezabatzen du
    const api_key = getApiKey();
    try {
      const res = await fetch(`${apiUrl}?action=delete&etiketa=${encodeURIComponent(etiketa)}&hasieraData=${encodeURIComponent(hasieraData)}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + api_key }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Errorea ezabatzean', 'error');
        return;
      }
      showToast('Kokalekua ezabatu da', 'success');
      fetchKokalekuak();
    } catch (err) {
      showToast(err.message || 'Errore ezezaguna', 'error');
    }
  }

  addBtn.addEventListener('click', () => openModal());
  window.addEventListener('DOMContentLoaded', fetchKokalekuak);
  searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    document.querySelectorAll('#kokalekuaTable tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
    });
  });
})();
