import {renderFilas } from "../../../helpers/renderFilas";
import { actualizarStorageReportes, cargarReportes, reporteClick } from "./reporte";

export default async () => {            
    
    let reportes = JSON.parse(localStorage.getItem('reportes') || '{}').reportes || [];

    
    if (!reportes || reportes.length === 0) {
        const reportesFormateados = await cargarReportes();
        localStorage.setItem('reportes', JSON.stringify({reportes: reportesFormateados}));
        reportes = reportesFormateados;
    }
    
    renderFilas(reportes, reporteClick);

    // Actualización en segundo plano
    await actualizarStorageReportes();
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