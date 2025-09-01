import { errorToast, successAlert } from "../../utils/alertas";
import * as api from "../../utils/api";
import * as validaciones from "../../utils/Validaciones";
import { cargarModal, cerrarModal, mostrarModal } from "../modalsController";

/**
 * Abre el modal para desactivar la cuenta del usuario
 * Requiere confirmación con contraseña actual para proceder
 */
export const abrirModalDesactivar = async () => {
    // Carga y muestra el modal de desactivación de cuenta
    const modal = await cargarModal('modalDesactivarCuenta');
    mostrarModal(modal);

    // Obtiene el campo de contraseña y configura validaciones en tiempo real
    const campo = modal.querySelector('input');
    campo.addEventListener('blur', validaciones.validarCampo);
    campo.addEventListener('keydown', validaciones.validarCampo);

    // Configura el manejo del envío del formulario
    const form = modal.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Valida que el formulario esté completo y el campo no esté vacío
        if (!validaciones.validarFormulario(e) || campo.value.trim() == "") return;

        try {
            // Envía petición para desactivar la cuenta con la contraseña actual
            const respuesta = await api.put(`usuarios/me/desactivar`, { contrasena_actual: campo.value });

            // Maneja respuesta exitosa
            if (respuesta.success) {
                // Cierra el modal inmediatamente
                cerrarModal(modal);
                
                // Muestra alerta de éxito y redirige después de un delay
                setTimeout(async () => {
                    await successAlert("Cuenta desactivada exitosamente");
                    location.hash = '#/inicio';
                }, 500);

            } else {
                // Cierra modal y muestra error si la desactivación falla
                cerrarModal(modal);
                errorToast(respuesta);
            }

        } catch (e) {
            // Maneja errores inesperados del sistema
            console.error("Error inesperado:", e);            
        }        
    });

    // Configura evento para cancelar la operación
    modal.addEventListener('click', async (e) => {
        if (e.target.closest('.cancelar')) {
            // Cierra el modal si el usuario cancela
            await cerrarModal(modal);
        }
    });
};