import * as validaciones from "../../../helpers/Validaciones";

export default async () => {
    const formulario = document.querySelector(".form--signup");

    const campos = [...formulario].filter((elemento) => elemento.hasAttribute("required") && (elemento.tagName == "INPUT" || elemento.tagName == "SELECT"));

    campos.forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);

        if (campo.name == "documento" || campo.name == "telefono") {            
            campo.addEventListener("keydown", validaciones.validarNumero);            
            campo.addEventListener("input", validaciones.validarCampo);            
            const limite = campo.name == "documento" ? 11 : 15;
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, limite));
        } else {

            if (campo.name == "nombres" || campo.name == "apellidos") {
                campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));
                campo.addEventListener("input", validaciones.validarTexto);
            }

            if (campo.name == "contrasena") {
                campo.addEventListener("keydown", event => validaciones.validarLimite(event, 30));
                campo.addEventListener("input", () => validaciones.validarContrasena(campo));
            }

            if (campo.name == "correo") {
                campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));
                campo.addEventListener("input", () => validaciones.validarCorreo(campo));
            }
        }
    });

    formulario.addEventListener("submit", async event => {
        event.preventDefault();

        if (!validaciones.validarFormulario(event)) return;

        validaciones.datos.tipo_documento_id = parseInt(validaciones.datos.tipo_documento_id);
        validaciones.datos.genero_id = parseInt(validaciones.datos.genero_id);
        validaciones.datos.ficha_id = parseInt(validaciones.datos.ficha_id);
        // validaciones.datos.rol_id = 2;
        delete validaciones.datos.programa;

        console.log(validaciones.datos);
        formulario.reset()


        // try {

        //     // const respuesta = await api.post('usuarios', validaciones.datos);

        //     if (respuesta.ok) {
        //         alert("Usuario registrado exitosamente.");
        //         window.location.href = "./index.html";
        //     } else {
        //         const resultado = await respuesta.json();
        //         manejarErrores(resultado);
        //     }

        // } catch (error) {
        //     console.error("Error inesperado:", error);
        //     alert("❌ Error al conectar con el servidor.");
        // }
    });
}