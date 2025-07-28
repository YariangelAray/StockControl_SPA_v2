import { post } from "../utils/api";
import * as validaciones from "../utils/Validaciones";
import { abrirModal, cerrarModal, cerrarTodo, initModales, modales, ocultarModalTemporal } from "./modalsController";
import { error } from '../utils/alertas';
import { initTemporizadorAcceso } from "../views/inventarios/detalles/initTemporizadorAcceso";

export const initModalConfigurar = async (modal) => {

    await initModales(['modalCodigoAcceso']);
    const { modalCodigoAcceso } = modales;

    const form = modal.querySelector('form');
    form.reset();

    const input = modal.querySelector('.input');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const valor = input.value.trim();

        if (valor === "") {
            validaciones.agregarError(input.parentElement);
            return;
        }

        const horas = Number(valor);

        if (isNaN(horas) || horas < 1 || horas > 6) {
            validaciones.agregarError(input.parentElement, "Solo se permiten valores entre 1 y 6.");
            return;
        }

        validaciones.quitarError(input.parentElement);

        const inventario = JSON.parse(localStorage.getItem('inventario'));

        // Hacemos la petición al backend
        const respuesta = await post('codigos-acceso/generar/' + inventario.id, { horas });

        if (!respuesta.success) {
            cerrarModal();
            setTimeout(() => {
                error(respuesta);
            }, 100);
            return;
        }
        console.log(respuesta);

        const codigoGenerado = respuesta.data.codigo;
        const fechaExpiracion = new Date(respuesta.data.fecha_expiracion);

        document.querySelectorAll('.codigo-acceso').forEach(el => {
            el.textContent = codigoGenerado;
        });


        // Guardamos la fecha de expiración en localStorage por si recarga
        localStorage.setItem('codigoAccesoInfo', JSON.stringify({
            codigo: codigoGenerado,
            expiracion: fechaExpiracion
        }));

        // Cerramos el modal actual y abrimos el de resultado
        ocultarModalTemporal(modal);
        abrirModal(modalCodigoAcceso);

        // Iniciar temporizador para mostrar el tiempo restante
        await initTemporizadorAcceso(fechaExpiracion, inventario.id, () => {
            document.querySelector('.dashboard .access-info').classList.add('hidden');        
            localStorage.removeItem('codigoAccesoInfo');
        });
    });


    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            cerrarModal();
        }
    });

    modalCodigoAcceso.addEventListener('click', (e) => {
        if (e.target.closest('.aceptar')) {
            cerrarTodo(); // Se cierra el modal
            document.querySelector('.dashboard .access-info').classList.remove('hidden'); // esta es la fila que se muestra cuando se genera el codigo de acceso
        }
    });
};
