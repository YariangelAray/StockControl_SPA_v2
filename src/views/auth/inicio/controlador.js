import * as validaciones from "../../../utils/Validaciones";
import { error, success } from "../../../utils/alertas";
import * as api from "../../../utils/api";

export default async () => {

    localStorage.clear();
    const formulario = document.querySelector(".form--signin");

    const campos = [...formulario].filter((elemento) => elemento.hasAttribute("required"));

    campos.forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);
        if (campo.name == "documento") {
            campo.addEventListener("keydown", validaciones.validarNumero);
            campo.addEventListener("input", validaciones.validarCampo);
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 11));
        }
    })

    formulario.addEventListener("submit", async event => {
        event.preventDefault();

        
        if (!validaciones.validarFormulario(event)) return;
        console.log(validaciones.datos)

        try {
            const respuesta = await api.post('usuarios/login', validaciones.datos);

            if (respuesta.success) {
                await success("Inicio de sesión éxitoso");
                localStorage.setItem('usuario', JSON.stringify({id:respuesta.data.id, nombres:respuesta.data.nombres, apellidos:respuesta.data.apellidos, rol_id: respuesta.data.rol_id}));
                setTimeout(() => {                    
                    location.hash = respuesta.data.rol_id == 1 ? '#/super-admin' : '#/inventarios';
                },500);
            } else {
                error(respuesta);
            }

        } catch (e) {
            console.error("Error inesperado:", e);
            error({});
        }
    })
}