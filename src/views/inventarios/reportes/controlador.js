import { generarSidebar } from "../../../helpers/generarSidebar";
import { initModalReporte } from "../../../modals/modalReporte";
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
    document.querySelector('.dashboard').id = "dashboard-reportes";

    limpiarModales();
    await initModales(['modalReporte']);
    const {modalReporte} = modales;

    await initModalReporte(modalReporte)
    
    document.getElementById('dashboard-reportes').addEventListener('click', (e) => {

        if (e.target.closest('.table__row')) {
            e.stopPropagation();
            abrirModal(modalReporte);
        }
    })
}