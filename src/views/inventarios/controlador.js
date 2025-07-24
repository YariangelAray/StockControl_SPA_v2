import { generarSidebar } from "../../helpers/generarSidebar.js";
import { marcarItem } from "../../helpers/marcarItem.js";
import { initModalPedirCodigo } from "../../modals/modalPedirCodigoAcceso.js";
import { abrirModal, cerrarModal, initModales, limpiarModales, modales } from "../../modals/modalsController.js";

export default async () => {
    
    localStorage.removeItem('inventario');
    
    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');
    // Limpia menú anterior si existe
    sidebarList.querySelector('.menu__items')?.remove();
    
    if (sidebarInfo.classList.contains('hidden')) sidebarInfo.classList.remove('hidden');
    
    marcarItem();
    
    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').removeAttribute('id'); 
    document.querySelector('.dashboard').id = "dashboard-inventarios";
    
    limpiarModales();
    await initModales(['modalPedirCodigoAcceso']);
    
    const {modalPedirCodigoAcceso} = modales;    
    document.getElementById('dashboard-inventarios').addEventListener('click', (e) => {
        if (e.target.closest('.agregar-inventario')) {
            initModalPedirCodigo(modalPedirCodigoAcceso);
            abrirModal(modalPedirCodigoAcceso);
        }

        if (e.target.closest('.ver-inventario')) {
            const inventarioID = 'inventario1'; // Simulado, luego será dinámico
            const rolUsuario = 'admin'; // Simulado, luego será dinámico

            localStorage.setItem('inventario', inventarioID);
            localStorage.setItem('rolUsuario', rolUsuario);

            generarSidebar(rolUsuario);            
            window.location.hash = '#/inventarios/ambientes';
        }
    });
};
