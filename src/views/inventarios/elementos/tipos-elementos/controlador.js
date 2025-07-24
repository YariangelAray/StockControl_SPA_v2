import { generarSidebar } from "../../../../helpers/generarSidebar";
import { abrirModal, initModales, limpiarModales, modales } from "../../../../modals/modalsController";
import { configurarModalTipo, initModalTipo } from "../../../../modals/modalTipoElemento";

export default async () => {
    const inventario = localStorage.getItem('inventario');
    const usuario = localStorage.getItem('rolUsuario');
    
    if (!inventario) {
        window.location.hash = '#/inventarios';
        return;
    }
    
    if (!document.querySelector('.menu__items')) {
        generarSidebar(usuario);
    }
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