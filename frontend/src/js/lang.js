let currentLang = "eus";

async function loadLang(lang) {
  console.log("Intentando cargar idioma:", lang);

  try {
    const response = await fetch(`../src/lang/${lang}.json`);
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

// inicializar idioma por defecto
loadLang(currentLang);

// cambiar idioma al hacer clic en botones
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    currentLang = lang;
    loadLang(currentLang);

    // actualizar el estado activo
    document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// marcar por defecto el botón activo al cargar
document.querySelector(`.lang-btn[data-lang="${currentLang}"]`).classList.add("active");
