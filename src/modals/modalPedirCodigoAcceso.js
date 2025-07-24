import { cerrarModal } from "./modalsController";

export const initModalPedirCodigo = (modal) => {

    const form = modal.querySelector('form');

    // Evita el submit (recarga)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });
    form.reset();


    modal.addEventListener('click', (e) => {
        if (e.target.closest('.confirmar')) {
            cerrarModal();

        }
        if (e.target.closest('.cancelar')) {
            cerrarModal();
        }
    });
};
