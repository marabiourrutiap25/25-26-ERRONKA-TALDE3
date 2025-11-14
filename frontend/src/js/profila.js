document.addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener los datos del formulario
    const form = event.target;
    const izena = form.izena.value;
    const abizena = form.abizena.value;
    const pasahitza = form.pasahitza.value;

    // Crear objeto con los datos
    const datos = {
        izena: izena,
        abizena: abizena,
        pasahitza: pasahitza
    };


    fetch("http://localhost/25-26-ERRONKA-TALDE3/backend/src/controller/profila_controller.php",{
        method:"PUT",
        body: JSON.stringify(datos)
    }).then(respuesta=>
        console.log(respuesta.status),
        console.log(respuesta.message)
    );



    /*.then(respuesta =>{ 
        respuesta.json;
        respuesta.status;
    }).then(data=>console.log(data.message)); */

});