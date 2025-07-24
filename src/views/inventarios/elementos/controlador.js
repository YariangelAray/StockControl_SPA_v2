import { generarSidebar } from "../../../helpers/generarSidebar";
import { configurarModalElemento, initModalElemento } from "../../../modals/modalElemento";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";

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
    document.querySelector('.dashboard').id = "dashboard-elementos";


    limpiarModales();
    await initModales(['modalElemento']);

    const { modalElemento } = modales;
    await initModalElemento(modalElemento);

    document.getElementById('dashboard-elementos').addEventListener('click', (e) => {
        if (e.target.closest('#crearElemento')) {
            configurarModalElemento('crear', modalElemento);
            abrirModal(modalElemento);
        }

        // Selección de fila → EDITAR
        if (e.target.closest('.table__row')) {
            e.stopPropagation();
            configurarModalElemento('editar', modalElemento);
            abrirModal(modalElemento);
        }
    })
}