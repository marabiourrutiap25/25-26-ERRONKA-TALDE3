// Web osagaia: hizkuntza eta saioa kudeatzen dituen berrerabilgarria den goiburuaren marrazketa
class CustomHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header id="main-header">
        <img src="../assets/img/logo_horizontal_principal.png" alt="Logo Izq" class="logo">

        <nav>
          <a href="ekipamendua.html" data-page="ekipamendua" data-i18n="equipment-header">EKIPAMENDUA</a>
          <a href="inbentarioa.html" data-page="inbentarioa" data-i18n="inventory-header">INBENTARIOA</a>
          <a href="kudeaketa.html" data-page="kudeaketa" data-i18n="management-header">KUDEAKETA</a>
          <a href="erabiltzaileak.html" data-page="erabiltzaileak" data-i18n="users-header">ERABILTZAILEAK</a>
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
              <a href="profila.html" data-i18n="profile-header">Profila</a>
              <a href="../../index.html" data-i18n="logout-header" id="logout">Saioa itxi</a>
            </div>
          </div>
        </div>
      </header>
    `;
    this.attachStyles();
    this.initUserMenu();
    this.initLangButtons();
    this.highlightCurrentPage();
    this.logout();
    
  }

  logout() {
    const logout=document.getElementById("logout");
    logout.addEventListener("click", function(){

      localStorage.clear();
      sessionStorage.clear();

      document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      });

    });
  }
  attachStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* ========================= TIPOGRAFIA ========================= */
      header, nav a {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
      }

      /* ========================= GOIBURUA ========================= */
      #main-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #009888;
        padding: 10px 20px;
        box-sizing: border-box;
        flex-wrap: wrap;           /* lerro-itzelketa onartzen du */
        overflow-x: hidden;        /* horizontal scroll-a saihesten du */
        white-space: normal;       /* testua egokitu */
        gap: 15px;
      }

      /* ========================= LOGOA ========================= */
      #main-header .logo {
        height: 50px;
        width: auto;
        flex-shrink: 0;
      }

      /* ========================= NABIGAZIOA ========================= */
      #main-header nav {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 50px;
        flex: 1 1 auto;
        flex-shrink: 1;
        min-width: 0; /* nabigazioa txikitu ahal izateko garrantzitsua */
      }

      #main-header nav a {
        color: #17355F;
        text-decoration: none;
        transition: all 0.2s ease;
        padding-bottom: 2px;
        white-space: nowrap; /* esteka bakoitza lerro bakarrean mantendu */
      }

      nav a:hover {
        text-decoration: underline;
      }

      #main-header nav a.active {
        text-decoration: underline 2px solid #17355F;
        text-underline-offset: 4px;
      }

      /* ========================= ESKUIN BLOKEA ========================= */
      #main-header .right-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;         /* bloke-a eskuinera bultzatzen du */
        flex-shrink: 0;
      }

      /* ========================= HIZKUNTZA HAUTAGAILUA ========================= */
      #main-header .lang-switcher {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #main-header .lang-btn {
        font-weight: 600;
        border-color: #17355F !important;
        color: #17355F !important;
        transition: all 0.2s ease;
        padding: 4px 8px;
      }

      #main-header .lang-btn:hover,
      #main-header .lang-btn.active {
        background-color: #17355F !important;
        color: #fff !important;
      }

      /* ========================= ERABILTZAILEA ========================= */
      #main-header .user-container {
        position: relative;
      }

      #main-header .user-btn {
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

      #main-header .user-btn:hover {
        background: rgba(23, 53, 95, 0.13);
      }

      #main-header .user-icon {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }

      /* ========================= ERABILTZAILE MENUA ========================= */
      #main-header .user-menu {
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

      #main-header .user-menu a {
        padding: 10px 15px;
        text-decoration: none;
        color: #17355F;
        display: block;
        transition: background 0.2s;
        font-weight: 600;
      }

      #main-header .user-menu a:hover {
        background: #e6f3f1;
      }

      #main-header .user-menu.show {
        display: flex;
      }

      /* ========================= TAULAK (badauden kasuan) ========================= */
      #main-header table {
        width: 100%;
        table-layout: auto;
        border-collapse: collapse;
      }

      #main-header td, th {
        word-wrap: break-word;
        white-space: normal;
      }

      /* ========================= RESPONSIVE ========================= */
      #main-header @media (max-width: 768px) {
        header {
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        #main-header nav {
          gap: 18px;
          justify-content: center;
        }

        #main-header .right-section {
          margin-left: 0;
          width: 100%;
          justify-content: center;
        }

        #main-header .lang-switcher {
          margin-top: 8px;
          justify-content: center;
        }
      }
    `;
    this.prepend(style);
  }

  // --- Erabiltzaile menua ---
  initUserMenu() {
    const userBtn = this.querySelector('#userBtn');
    const userMenu = this.querySelector('#userMenu');
    if (!userBtn || !userMenu) return;

    userBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // botoiaren barruan klik egiterakoan ez ixteko
      userMenu.classList.toggle('show');
    });

    // Kanpoan klik egiten denean itxi
    document.addEventListener('click', (e) => {
      // klik-a osagaiaren barruan ez badago, itxi
      if (!this.contains(e.target)) {
        userMenu.classList.remove('show');
      }
    });

    // Escape-rekin itxi
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') userMenu.classList.remove('show');
    });
  }

  // --- Hizkuntza botoiak ---
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
          // isilean huts egiten du storage erabilgarri ez badago
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

  // --- Orri aktiboa azpimarratu ---
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
