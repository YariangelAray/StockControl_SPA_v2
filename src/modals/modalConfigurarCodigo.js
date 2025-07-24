import { abrirModal, cerrarModal, cerrarTodo, initModales, modales, ocultarModalTemporal } from "./modalsController";

export const initModalConfigurar = async (modal) => {

    await initModales(['modalCodigoAcceso']);
    const { modalCodigoAcceso } = modales;

    const form = modal.querySelector('form');

    // Evita el submit (recarga)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    const input = modal.querySelector('.input');
    input.value = ''; // Valor por defecto
    const teclasEspeciales = ["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
    input.addEventListener('keydown', (e) => {
        const val = e.key;
        if (!teclasEspeciales.includes(val)) {
            e.preventDefault();
            if (/[1-6]/.test(val))
                e.target.value = val;
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target.closest('.confirmar')) {
            ocultarModalTemporal(modal);
            abrirModal(modalCodigoAcceso);
        }
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
