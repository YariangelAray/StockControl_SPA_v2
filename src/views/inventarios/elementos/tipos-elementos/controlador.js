import { initComponentes } from "../../../../helpers/initComponentes";
import { abrirModal, initModales, limpiarModales, modales } from "../../../../modals/modalsController";
import { configurarModalTipo, initModalTipo } from "../../../../modals/modalTipoElemento";

export default async () => {
    if (!initComponentes()) return; 

    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').classList.add('dashboard--table-section');
    document.querySelector('.dashboard').removeAttribute('id'); 
    document.querySelector('.dashboard').id = "dashboard-tipos-elementos";    

    limpiarModales();
    await initModales(['modalTipoElemento']);
    const { modalTipoElemento } = modales;
    
    initModalTipo(modalTipoElemento);

    
    document.getElementById('dashboard-tipos-elementos').addEventListener('click', (e) => {
        // Botón Agregar → AGREGAR
        if (e.target.closest('#crearTipo')) {
            configurarModalTipo('crear', modalTipoElemento);
            abrirModal(modalTipoElemento);
        }

        // Selección de fila → EDITAR
        if (e.target.closest('.table__row')) {
            e.stopPropagation();
            configurarModalTipo('editar', modalTipoElemento);
            abrirModal(modalTipoElemento);
        }

    });
}