import { cerrarModal } from "./modalsController";

export const initModalEliminar = (modal) => {
    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            cerrarModal();
        }
        
        if (e.target.closest('.desactivar')) {
            alert("Cuenta desactivada con éxito.");
            cerrarModal();
        }
    })
}