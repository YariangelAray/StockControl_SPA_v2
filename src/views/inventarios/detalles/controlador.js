import { initModalConfigurar } from "../../../modals/modalConfigurarCodigo";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import { initComponentes } from "../../../helpers/initComponentes";

export default async () => {
    
    if (!initComponentes()) return; 

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