
import { initComponentes } from "../../../helpers/initComponentes";
import { agregarFila, renderFilas } from "../../../helpers/renderFilas";
import { configurarModalReporte, initModalReporte } from "../../../modals/js/modalReporte";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import * as api from '../../../utils/api';
import { actualizarStorageReportes, cargarReportes, formatearReporte, reporteClick } from "./reporte";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const inventario = JSON.parse(localStorage.getItem('inventario'));
    initComponentes(usuario);
    
    let reportes = JSON.parse(localStorage.getItem('reportes') || '{}').reportes || [];

    
    if (!reportes || reportes.length === 0) {
        const reportesFormateados = await cargarReportes(inventario);
        localStorage.setItem('reportes', JSON.stringify({reportes: reportesFormateados}));
        reportes = reportesFormateados;
    }

    renderFilas(reportes, reporteClick);
    
    limpiarModales();
    await initModales(['modalReporte']);
    const { modalReporte } = modales;
    await initModalReporte(modalReporte)



    // Actualización en segundo plano
    await actualizarStorageReportes(inventario);
    const search = document.querySelector('[type="search"]');
    search.addEventListener('input', (e) => {
        let reportes = JSON.parse(localStorage.getItem('reportes') || '{}').reportes || [];
        const valor = e.target.value.toLowerCase();
        const reportesFiltrados = reportes.filter(reporte => {
            for (const dato of reporte) {
                if (dato && dato.toString().toLowerCase().includes(valor)) return true;
            }
            return false;
        });
        renderFilas(reportesFiltrados, reporteClick);
    });
}