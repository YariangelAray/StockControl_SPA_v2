
import { initComponentes } from "../../../helpers/initComponentes";
import { agregarFila, renderFilas } from "../../../helpers/renderFilas";
import { configurarModalReporte, initModalReporte } from "../../../modals/modalReporte";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import * as api from '../../../utils/api';
import { actualizarStorageReportes, cargarReportes, formatearReporte, reporteClick } from "./reporte";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const inventario = JSON.parse(localStorage.getItem('inventario'));
    initComponentes(usuario);
    
    let reportes = JSON.parse(localStorage.getItem('reportes') || '{}').reportes;

    
    if (!reportes) {
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
}