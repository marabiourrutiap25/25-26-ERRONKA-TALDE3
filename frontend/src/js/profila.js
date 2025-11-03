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


    fetch("http://localhost:80/profila",{

    });


});