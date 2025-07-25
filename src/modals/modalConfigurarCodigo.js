import * as validaciones from "../helpers/Validaciones";
import { abrirModal, cerrarModal, cerrarTodo, initModales, modales, ocultarModalTemporal } from "./modalsController";

export const initModalConfigurar = async (modal) => {

    await initModales(['modalCodigoAcceso']);
    const { modalCodigoAcceso } = modales;

    const form = modal.querySelector('form');
    form.reset();

    const input = modal.querySelector('.input');    

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const valor = input.value.trim();

        if (valor === "") {
            validaciones.agregarError(input.parentElement);
            return;
        }

        const numero = Number(valor);

        if (isNaN(numero) || numero < 1 || numero > 6) {
            validaciones.agregarError(input.parentElement, "Solo se permiten valores entre 1 y 6.");
            return;
        }

        validaciones.quitarError(input.parentElement);

        ocultarModalTemporal(modal);
        abrirModal(modalCodigoAcceso);
    });


    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            cerrarModal();
        }
    });

    modalCodigoAcceso.addEventListener('click', (e) => {
        if (e.target.closest('.aceptar')) {
            cerrarTodo();
            document.querySelector('.access-info').classList.remove('hidden');
        }
    });
};
