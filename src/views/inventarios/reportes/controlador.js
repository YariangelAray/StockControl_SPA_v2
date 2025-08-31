import { renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import { actualizarStorageReportes, cargarReportes, reporteClick } from "./reporte";

export default async () => {

    setVistaActual("reportes");    
    const reportes = await cargarReportes();
    localStorage.setItem('reportes', JSON.stringify({ reportes: reportes }));    

    const tbody = document.querySelector('#dashboard-reportes .table__body');
    const acordeon = document.querySelector('#dashboard-reportes .acordeon');

    renderFilas(reportes, reporteClick, acordeon, tbody);

    const search = document.querySelector('[type="search"]');
    search.addEventListener('input', (e) => {
        let reportes = JSON.parse(localStorage.getItem('reportes') || '{}').reportes || [];
        const valor = e.target.value.toLowerCase();
        const reportesFiltrados = reportes.filter(reporte => {
            reporte = reporte.map(r => typeof r == 'object' ? r.value : r);
            for (const dato of reporte) {
                if (dato && dato.toString().toLowerCase().includes(valor)) return true;
            }
            return false;
        });
        renderFilas(reportesFiltrados, reporteClick, acordeon, tbody);
    });

    onResponsiveChange("reportes", async () => {
        console.log("Resize detectado SOLO en reportes");
        await actualizarStorageReportes();
        const reportes = JSON.parse(localStorage.getItem('reportes') || '{}').reportes || [];
        renderFilas(reportes, reporteClick, acordeon, tbody);
    });
}

