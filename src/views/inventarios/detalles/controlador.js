import { initModalConfigurar } from "../../../modals/modalConfigurarCodigo";
import { abrirModal, cerrarModal, cerrarTodo, initModales, limpiarModales, modales, ocultarModalTemporal } from "../../../modals/modalsController";
import { generarSidebar } from "../../../helpers/generarSidebar";

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
    document.querySelector('.dashboard').classList.add('dashboard--details-section');
    document.querySelector('.dashboard').removeAttribute('id'); 
    document.querySelector('.dashboard').id = "dashboard-detalles";

    document.querySelector('.access-info').classList.add('hidden');

    limpiarModales();
    await initModales(['modalConfigurarCodigo']);
    const {modalConfigurarCodigo} = modales;
    await initModalConfigurar(modalConfigurarCodigo);

    document.getElementById('dashboard-detalles').addEventListener('click', (e) => {
        if (e.target.closest('.generar-codigo')) {
            abrirModal(modalConfigurarCodigo);
        }
    });
}