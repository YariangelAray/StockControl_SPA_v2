
import { initComponentes } from "../../../helpers/initComponentes";
import { initModalReporte } from "../../../modals/modalReporte";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";

export default async () => {
    if (!initComponentes()) return; 
    
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