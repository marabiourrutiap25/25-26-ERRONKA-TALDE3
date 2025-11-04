document.addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener los datos del formulario
    const form = event.target;
    const nombre = form.nombre.value;
    const apellidos = form.apellidos.value;
    const contrasena = form.contrasena.value;

    // Crear objeto con los datos
    const datos = {
        nombre: nombre,
        apellidos: apellidos,
        contrasena: contrasena
    };


    fetch("http://localhost/25-26-ERRONKA-TALDE2/backend/src/controllers/profilaController.php",{
        method:"PUT",
        body: JSON.stringify(datos)
    }).then(respuesta=>console.log(respuesta.status));



    /*.then(respuesta =>{ 
        respuesta.json;
        respuesta.status;
    }).then(data=>console.log(data.message)); */

});