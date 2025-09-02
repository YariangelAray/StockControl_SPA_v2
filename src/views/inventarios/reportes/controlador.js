import { renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import { actualizarStorageReportes, cargarReportes, reporteClick } from "./reporte";

export default async () => {

    // Establece la vista actual como 'reportes'
    setVistaActual("reportes");

    // Carga los reportes desde el backend
    const reportes = await cargarReportes();

    // Guarda los reportes en localStorage
    localStorage.setItem('reportes', JSON.stringify({ reportes: reportes }));

    // Obtiene el tbody de la tabla de reportes
    const tbody = document.querySelector('#dashboard-reportes .table__body');

    // Obtiene el contenedor del acordeón de reportes
    const acordeon = document.querySelector('#dashboard-reportes .acordeon');

    // Renderiza las filas con los reportes cargados
    renderFilas(reportes, reporteClick, acordeon, tbody);

    // Obtiene el input de búsqueda
    const search = document.querySelector('[type="search"]');

    // Escucha el evento input en el campo de búsqueda
    search.addEventListener('input', (e) => {

        // Obtiene los reportes desde localStorage
        let reportes = JSON.parse(localStorage.getItem('reportes') || '{}').reportes || [];

        // Obtiene el valor del input en minúsculas
        const valor = e.target.value.toLowerCase();

        // Filtra los reportes que coincidan con el texto
        const reportesFiltrados = reportes.filter(reporte => {

            // Convierte objetos a valores simples
            reporte = reporte.map(r => typeof r == 'object' ? r.value : r);

            // Verifica si algún dato contiene el texto buscado
            for (const dato of reporte) {
                if (dato && dato.toString().toLowerCase().includes(valor)) return true;
            }

            // Si no hay coincidencias, excluye el reporte
            return false;
        });

        // Renderiza las filas filtradas
        renderFilas(reportesFiltrados, reporteClick, acordeon, tbody);
    });

    // Escucha cambios de tamaño de pantalla
    onResponsiveChange("reportes", async () => {                

        // Actualiza los reportes en segundo plano
        await actualizarStorageReportes();

        // Obtiene los reportes desde localStorage
        const reportes = JSON.parse(localStorage.getItem('reportes') || '{}').reportes || [];

        // Renderiza las filas actualizadas
        renderFilas(reportes, reporteClick, acordeon, tbody);
    });
}

