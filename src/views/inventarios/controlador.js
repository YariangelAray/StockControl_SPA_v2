import { initComponentes } from "../../helpers/initComponentes.js";
import { initModalPedirCodigo } from "../../modals/modalPedirCodigoAcceso.js";
import { abrirModal, initModales, limpiarModales, modales } from "../../modals/modalsController.js";

export default async () => {
    
    const rolUsuario = {rol: 'admin'}; // Simulado, luego será dinámico
    localStorage.setItem('rolUsuario', JSON.stringify(rolUsuario));
    
    localStorage.removeItem('inventario');
    // localStorage.removeItem('rolUsuario');
    
    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');
    // Limpia menú anterior si existe
    sidebarList.querySelector('.menu__items')?.remove();
    
    if (sidebarInfo.classList.contains('hidden')) sidebarInfo.classList.remove('hidden');
    
    initComponentes();
    
    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').removeAttribute('id'); 
    document.querySelector('.dashboard').id = "dashboard-inventarios";
    
    limpiarModales();
    await initModales(['modalPedirCodigoAcceso']);
    const {modalPedirCodigoAcceso} = modales;    
    initModalPedirCodigo(modalPedirCodigoAcceso);
    
    document.getElementById('dashboard-inventarios').addEventListener('click', (e) => {
        if (e.target.closest('.agregar-inventario')) {
            abrirModal(modalPedirCodigoAcceso);
        }

        if (e.target.closest('.ver-inventario')) {
            const inventario = {nombre: "Desarrollo de Software"}; // Simulado, luego será dinámico
            localStorage.setItem('inventario', JSON.stringify(inventario));
            
            window.location.hash = '#/inventarios/ambientes';
        }
    });
};
