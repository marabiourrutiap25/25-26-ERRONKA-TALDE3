// Elementuak botoi hizkuntzak
const btnEU = document.getElementById('btn-eu');
const btnES = document.getElementById('btn-es');

// Hizkuntza bakoitzerako testua
const labels = {
    eu: ["EKIPAMENDUA", "INBENTARIOA", "KUDEAKETA", "ERABILTZAILEAK"],
    es: ["EQUIPAMIENTO", "INVENTARIO", "GESTIÓN", "USUARIOS"]
};

// Hizkuntza aldaketa funtzioa
function cambiarIdioma(lang) {
    document.getElementById('link1').textContent = labels[lang][0];
    document.getElementById('link2').textContent = labels[lang][1];
    document.getElementById('link3').textContent = labels[lang][2];
    document.getElementById('link4').textContent = labels[lang][3];

    btnEU.classList.toggle('active', lang === 'eu');
    btnES.classList.toggle('active', lang === 'es');
}

// Klik Hizkuntza eventua
btnEU.addEventListener('click', () => cambiarIdioma('eu'));
btnES.addEventListener('click', () => cambiarIdioma('es'));

// Menu usuarioa
const userBtn = document.querySelector('.user-btn');
const userMenu = document.querySelector('.user-menu');

userBtn.addEventListener('click', () => {
    userMenu.classList.toggle('show');
});

document.addEventListener('click', e => {
    if (!e.target.closest('.user-container')) {
        userMenu.classList.remove('show');
    }
});