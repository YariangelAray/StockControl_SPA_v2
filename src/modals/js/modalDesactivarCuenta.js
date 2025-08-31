// import { error, success } from "../../utils/alertas";
import { errorToast, successAlert } from "../../utils/alertas";
import * as api from "../../utils/api";
import * as validaciones from "../../utils/Validaciones";
import { cargarModal, cerrarModal, mostrarModal } from "../modalsController";

export const abrirModalDesactivar = async () => {

    const modal = await cargarModal('modalDesactivarCuenta');
    mostrarModal(modal)

    const campo = modal.querySelector('input');
    campo.addEventListener('blur', validaciones.validarCampo);
    campo.addEventListener('keydown', validaciones.validarCampo);

    const form = modal.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validaciones.validarFormulario(e) || campo.value.trim() == "") return;

        try {
            const respuesta = await api.put(`usuarios/me/desactivar`, { contrasena_actual: campo.value });

            if (respuesta.success) {
                cerrarModal(modal);
                setTimeout( async() => {
                    await successAlert("Cuenta desactivada exitosamente");
                    location.hash = '#/inicio';
                }, 500);

            } else {
                cerrarModal(modal);
                errorToast(respuesta);
            }

        } catch (e) {
            console.error("Error inesperado:", e);            
        }        
    })

    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            cerrarModal(modal);
        }
    })
}