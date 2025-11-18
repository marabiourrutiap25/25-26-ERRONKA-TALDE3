let currentLang = "eus";
import ENV from '../../config.js';

try {
  const storedLang = localStorage.getItem("selectedLang");
  if (storedLang) currentLang = storedLang;
} catch (err) {
  // Ignorar si localStorage no está disponible
}

async function loadLang(lang) {
  console.log("Intentando cargar idioma:", lang);

  try {
    const response = await fetch(`${ENV.API_BASE_URL2}src/lang/${lang}.json`);

    console.log("Respuesta fetch:", response);

    if (!response.ok) throw new Error("No se pudo cargar el JSON");

    const data = await response.json();
    console.log("JSON cargado correctamente:", data);

    // actualizar etiquetas
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (data[key]) {
        el.textContent = data[key];
      }
    });

    // actualizar placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (data[key]) {
        el.placeholder = data[key];
      }
    });

  } catch (error) {
    console.error("Error cargando idioma:", error);
  }
}

// exponer función globalmente para que otros componentes puedan llamar
if (typeof window !== "undefined") {
  window.loadLang = loadLang;
}

// inicializar idioma por defecto
loadLang(currentLang);

// cambiar idioma con delegación de eventos (funciona aunque los botones se inserten más tarde)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".lang-btn");
  if (!btn) return;
  const lang = btn.dataset.lang;
  currentLang = lang;
  loadLang(currentLang);
  // actualizar el estado activo
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  try {
    localStorage.setItem("selectedLang", lang);
  } catch (err) {
    // Ignorar si localStorage no está disponible
  }
});

// marcar por defecto el botón activo al cargar (si ya existen)
const initialActive = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
if (initialActive) initialActive.classList.add("active");
