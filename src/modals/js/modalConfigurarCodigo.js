import { post } from "../../utils/api";
import * as validaciones from "../../utils/Validaciones";
import { abrirModal, cerrarModal, cerrarTodo, initModales, modales, ocultarModalTemporal } from "../modalsController";
import { error } from '../../utils/alertas';
import { initTemporizadorAcceso } from "../../views/inventarios/detalles/initTemporizadorAcceso";

export const initModalConfigurar = async (modal) => {

    await initModales(['modalCodigoAcceso']);
    const { modalCodigoAcceso } = modales;

    const form = modal.querySelector('form');
    form.reset();

    const inputHoras = modal.querySelector('input[name="horas"]');
    const inputMinutos = modal.querySelector('input[name="minutos"]');
    configurarInputsTiempo(inputHoras, inputMinutos);

    form.addEventListener('submit', async (e) => {        
        e.preventDefault();

        const horas = parseInt(inputHoras.value) || 0;
        const minutos = parseInt(inputMinutos.value) || 0;

        // Validar que no estén ambos vacíos o en cero
        if ((horas === 0 && minutos === 0) || horas > 6 || minutos > 59) {
            validaciones.agregarError(inputHoras.parentElement, "Tiempo inválido");
            validaciones.agregarError(inputMinutos.parentElement, "Tiempo inválido");
            return;
        }

        validaciones.quitarError(inputHoras.parentElement);
        validaciones.quitarError(inputMinutos.parentElement);        

        const inventario = JSON.parse(localStorage.getItem('inventario'));

        // Hacemos la petición al backend
        const respuesta = await post('codigos-acceso/generar/' + inventario.id, { horas, minutos });

        if (!respuesta.success) {
            cerrarModal();
            setTimeout(() => {
                error(respuesta);
            }, 100);
            return;
        }

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
            document.querySelector('.dashboard .access-info + .dashboard__row').classList.add('hidden');
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
            document.querySelector('.dashboard .access-info').classList.remove('hidden');
            document.querySelector('.dashboard .access-info  + .dashboard__row').classList.remove('hidden');
        }
    });
};

function configurarInputsTiempo(inputHoras, inputMinutos, maxHoras = 6, maxMinutos = 59) {
    const validarHoras = () => {
        let horas = parseInt(inputHoras.value) || 0;

        if (horas >= maxHoras) {
            horas = maxHoras;
            inputMinutos.value = 0;
        } else if (horas < 0) {
            horas = 0;
        }

        inputHoras.value = horas;
    };

    const validarMinutos = () => {
        let horas = parseInt(inputHoras.value) || 0;
        let minutos = parseInt(inputMinutos.value) || 0;

        if (horas >= maxHoras) {
            inputMinutos.value = 0;
            return;
        }

        if (minutos > maxMinutos) {
            minutos = 0;
            horas++;
        } else if (minutos < 0) {
            minutos = maxMinutos;
            horas--;
        }

        if (horas >= maxHoras) {
            horas = maxHoras;
            minutos = 0;
        } else if (horas < 0) {
            horas = 0;
            minutos = 0;
        }

        inputHoras.value = horas;
        inputMinutos.value = minutos;
    };

    // Eventos
    inputHoras.addEventListener('input', validarHoras);
    inputHoras.addEventListener('change', validarHoras);
    inputMinutos.addEventListener('input', validarMinutos);
    inputMinutos.addEventListener('change', validarMinutos);

    // Valores por defecto
    inputHoras.value = 0;
    inputMinutos.value = 0;
}
