class CustomHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <img src="../assets/img/logo_horizontal_principal.png" alt="Logo Izq" class="logo">

        <nav>
          <a href="ekipamendua.html" data-page="ekipamendua">EKIPAMENDUA</a>
          <a href="inbentarioa.html" data-page="inbentarioa">INBENTARIOA</a>
          <a href="kudeaketa.html" data-page="kudeaketa">KUDEAKETA</a>
          <a href="erabiltzaileak.html" data-page="erabiltzaileak">ERABILTZAILEAK</a>
        </nav>

        <div class="right-section">
          <div class="lang-switcher d-flex gap-2">
            <button type="button" class="lang-btn btn btn-outline-primary btn-sm" data-lang="eus">EUS</button>
            <button type="button" class="lang-btn btn btn-outline-primary btn-sm" data-lang="esp">ESP</button>
            <button type="button" class="lang-btn btn btn-outline-primary btn-sm" data-lang="eng">ENG</button>
          </div>

          <div class="user-container">
            <div class="user-btn" id="userBtn" title="Erabiltzailea">
              <img src="../assets/icons/usuario.png" alt="Erabiltzailea" class="user-icon">
            </div>

            <div class="user-menu" id="userMenu">
              <a href="profile.html">Profila</a>
              <a href="logout.html">Saioa itxi</a>
            </div>
          </div>
        </div>
      </header>
    `;
    this.attachStyles();
    this.initUserMenu();
    this.initLangButtons();
    this.highlightCurrentPage();
  }

  attachStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* ========================= TIPOGRAFÍA ========================= */
      header, nav a {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
      }

      /* ========================= HEADER ========================= */
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #009888;
        padding: 10px 20px;
        box-sizing: border-box;
        flex-wrap: wrap;           /* permite salto de línea si no cabe */
        overflow-x: hidden;        /* evita scroll horizontal */
        white-space: normal;       /* texto ajustable */
        gap: 15px;
      }

      /* ========================= LOGO ========================= */
      .logo {
        height: 50px;
        width: auto;
        flex-shrink: 0;
      }

      /* ========================= NAVEGACIÓN ========================= */
      nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 50px;
        flex: 1 1 auto;
        flex-shrink: 1;
        min-width: 0; /* importante para permitir que nav se reduzca */
      }

      nav a {
        color: #17355F;
        text-decoration: none;
        transition: all 0.2s ease;
        padding-bottom: 2px;
        white-space: nowrap; /* mantener cada enlace en una sola línea */
      }

      nav a:hover {
        text-decoration: underline;
      }

      nav a.active {
        text-decoration: underline 2px solid #17355F;
        text-underline-offset: 4px;
      }

      /* ========================= BLOQUE DERECHO ========================= */
      .right-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;         /* empuja el bloque hacia la derecha */
        flex-shrink: 0;
      }

      /* ========================= SELECTOR DE IDIOMA ========================= */
      .lang-switcher {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .lang-btn {
        font-weight: 600;
        border-color: #17355F !important;
        color: #17355F !important;
        transition: all 0.2s ease;
        padding: 4px 8px;
      }

      .lang-btn:hover,
      .lang-btn.active {
        background-color: #17355F !important;
        color: #fff !important;
      }

      /* ========================= USUARIO ========================= */
      .user-container {
        position: relative;
      }

      .user-btn {
        width: 40px;
        height: 40px;
        background: #FFFFFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        cursor: pointer;
        transition: background 0.2s;
      }

      .user-btn:hover {
        background: rgba(23, 53, 95, 0.13);
      }

      .user-icon {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }

      /* ========================= MENÚ USUARIO ========================= */
      .user-menu {
        position: fixed;
        right: 20px;
        top: 70px;
        background: white;
        border-radius: 8px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        min-width: 150px;
        padding: 8px 0;
        z-index: 1000;
      }

      .user-menu a {
        padding: 10px 15px;
        text-decoration: none;
        color: #17355F;
        display: block;
        transition: background 0.2s;
        font-weight: 600;
      }

      .user-menu a:hover {
        background: #e6f3f1;
      }

      .user-menu.show {
        display: flex;
      }

      /* ========================= TABLAS (si las hay) ========================= */
      table {
        width: 100%;
        table-layout: auto;
        border-collapse: collapse;
      }

      td, th {
        word-wrap: break-word;
        white-space: normal;
      }

      /* ========================= RESPONSIVE ========================= */
      @media (max-width: 768px) {
        header {
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        nav {
          gap: 18px;
          justify-content: center;
        }

        .right-section {
          margin-left: 0;
          width: 100%;
          justify-content: center;
        }

        .lang-switcher {
          margin-top: 8px;
          justify-content: center;
        }
      }
    `;
    this.prepend(style);
  }

  // --- Menú usuario ---
  initUserMenu() {
    const userBtn = this.querySelector('#userBtn');
    const userMenu = this.querySelector('#userMenu');
    if (!userBtn || !userMenu) return;

    userBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // que no cierre al hacer clic en el propio botón
      userMenu.classList.toggle('show');
    });

    // Cerrar si se hace click fuera
    document.addEventListener('click', (e) => {
      // si el click no está dentro del componente, cerramos
      if (!this.contains(e.target)) {
        userMenu.classList.remove('show');
      }
    });

    // cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') userMenu.classList.remove('show');
    });
  }

  // --- Botones de idioma ---
  initLangButtons() {
    const langButtons = this.querySelectorAll('.lang-btn');
    if (!langButtons.length) return;

    langButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        langButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        try {
          localStorage.setItem('selectedLang', btn.dataset.lang);
        } catch (err) {
          // silent fail si storage no está disponible
        }
      });
    });

    const savedLang = (() => {
      try {
        return localStorage.getItem('selectedLang');
      } catch (err) {
        return null;
      }
    })();

    if (savedLang) {
      const activeBtn = this.querySelector(`[data-lang="${savedLang}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
  }

  // --- Subrayar página activa ---
  highlightCurrentPage() {
    const currentFile = window.location.pathname.split('/').pop();
    const links = this.querySelectorAll('nav a');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentFile) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

customElements.define('custom-header', CustomHeader);
