import { error, success } from "../utils/alertas";
import * as api from "../utils/api";
import * as validaciones from "../utils/Validaciones";
import { cerrarModal } from "./modalsController";

export const initModalEliminar = (modal, usuario) => {

    const campo = modal.querySelector('input');
    campo.addEventListener('blur', validaciones.validarCampo);
    campo.addEventListener('keydown', validaciones.validarCampo);

    const form = modal.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validaciones.validarFormulario(e) || campo.value.trim() == "") return;

        try {
            const respuesta = await api.put(`usuarios/${usuario.id}/desactivar`, { contrasena_actual: campo.value });

            if (respuesta.success) {
                cerrarModal();
                await success("Cuenta desactivada exitosamente");
                setTimeout(() => {
                    location.hash = '#/inicio';
                }, 100);

            } else {
                cerrarModal();
                error(respuesta);
            }

        } catch (e) {
            console.error("Error inesperado:", e);
            error({});
        }
        form.reset()
    })

    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            cerrarModal();
            form.querySelectorAll('.form__control').forEach(input => {
                input.classList.remove('error');
            });
        }
    })
}