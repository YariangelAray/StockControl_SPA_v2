import * as validaciones from "../../utils/Validaciones";
import { errorToast, successToast } from "../../utils/alertas";
import * as api from "../../utils/api";
import { cargarModal, cerrarModal, mostrarModal } from "../modalsController";

/**
 * Abre el modal para ingresar código de acceso a inventario
 * Permite al usuario acceder a un inventario mediante código temporal
 */
export const abrirModalPedirCodigo = async () => {
    // Carga y muestra el modal de código de acceso
    const modal = await cargarModal("modalPedirCodigoAcceso");
    mostrarModal(modal);

    // Obtiene referencias a elementos del formulario
    const form = modal.querySelector('form');
    const input = modal.querySelector('.input');

    // Configura el manejo del envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtiene y normaliza el código ingresado (mayúsculas, sin espacios)
        const codigo = input.value.trim().toUpperCase();
        
        // Valida que se haya ingresado un código
        if (!codigo) {
            validaciones.agregarError(input.parentElement, "Ingrese un código.");
            return;
        }
        
        // Limpia errores previos de validación
        validaciones.quitarError(input.parentElement);
        
        // Envía petición al backend para validar el código de acceso
        const respuesta = await api.post('accesos/inventarios/acceder', {codigo});

        // Maneja respuesta de error (código inválido o expirado)
        if (!respuesta.success) {
            errorToast(respuesta);
            // Limpia el formulario para permitir nuevo intento
            form.reset();
            return;
        }

        // Muestra mensaje de éxito
        successToast('Código confirmado. Accediendo al inventario...');

        // Guarda información del inventario en localStorage para sesión
        localStorage.setItem('inventario', JSON.stringify({ 
            id: respuesta.data.inventario_id, 
            nombre: respuesta.data.nombre_inventario 
        }));

        // Guarda información del código de acceso para control de tiempo
        localStorage.setItem('codigoAccesoInfo', JSON.stringify({
            codigo: respuesta.data.codigo,
            expiracion: respuesta.data.fecha_expiracion
        }));

        // Cierra el modal y redirige al área de inventarios
        await cerrarModal(modal);        
        window.location.hash = '#/inventarios/ambientes';
    });

    // Configura evento para cancelar la operación
    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            cerrarModal(modal);
        }
    });
};