import { cerrarModal } from "./modalsController";
import * as validaciones from "../helpers/Validaciones";

export const initModalPedirCodigo = (modal) => {

    const form = modal.querySelector('form');

    // Evita el submit (recarga)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validaciones.validarFormulario(e)) return;
        form.reset();
        form.querySelectorAll('.form__control').forEach(input => {
            input.classList.remove('error'); 
        });
        cerrarModal();

    });


    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            form.reset();
            form.querySelectorAll('.form__control').forEach(input => {
                input.classList.remove('error'); 
            });
            cerrarModal();
        }
    });
};
