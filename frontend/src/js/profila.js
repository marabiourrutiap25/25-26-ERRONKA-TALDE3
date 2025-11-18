// Lógica de perfil: lectura de datos personales y actualización
import ENV from '../../config.js';
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return "";
}


window.onload=function(){


    const checkbox = document.getElementById('checkPasahitza');
    const passwordInput = document.getElementById('pasahitza');

    const api_key=getCookie("api_key_session");

    // Escuchar cambios en el checkbox
    checkbox.addEventListener('change', function() {
        passwordInput.disabled = !this.checked;
        if (!this.checked) {
            passwordInput.value = ''; // Limpiar el campo si se desactiva
        }
    });
    console.log(api_key);

    fetch(`${ENV.API_BASE_URL}src/controller/ErabiltzaileaController.php?action=getByApi`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + api_key
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        const izena = document.getElementById("izena");
        const erabilztailea= document.getElementById("erabiltzailea");
        const abizena =document.getElementById("abizena");

        erabilztailea.setAttribute("datanan", data.user.nan);

        izena.value=data.user.izena;
        erabilztailea.value=data.user.erabiltzailea;
        abizena.value=data.user.abizena;


    });
}


document.addEventListener("submit", function (event) {
    event.preventDefault();

    const checkbox = document.getElementById('checkPasahitza');
    const api_key=getCookie("api_key_session");

    // Obtener los datos del formulario
    const form = event.target;
    const izena = form.izena.value;
    const abizena = form.abizena.value;
    const nan = form.erabiltzailea.getAttribute("datanan");
    const erabiltzailea = form.erabiltzailea.value;
    const pasahitza = form.pasahitza.value;

    // Crear objeto con los datos
    const datos = {
        nan: nan,
        izena: izena,
        abizena: abizena,
        erabiltzailea: erabiltzailea,
    };

    if(checkbox.checked){
        datos.pasahitza=pasahitza
    }

    fetch(`${ENV.API_BASE_URL}src/controller/ErabiltzaileaController.php?action=update`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + api_key,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(data => console.log(data));
});