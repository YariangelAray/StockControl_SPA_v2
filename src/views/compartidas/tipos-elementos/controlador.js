import { initComponentes } from "../../../helpers/initComponentes";
import { agregarFila, renderFilas } from "../../../helpers/renderFilas";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import { configurarModalTipo, initModalTipo } from "../../../modals/modalTipoElemento";
import { actualizarStorageTipos, cargarTipos, formatearTipo, tipoClick } from "./tipos-elementos";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));    

    const btnVolver = document.querySelector("#btn-volver");

    if(usuario.rol_id==1) btnVolver.classList.add('hidden')

    const historial = sessionStorage.getItem("rutaAnterior");
    btnVolver.setAttribute("href", historial);

    initComponentes(usuario);    

    let tipos = JSON.parse(localStorage.getItem('tipos') || '{}').tipos || [];

    if (!tipos || tipos.length === 0) {
        const tiposFormateados = await cargarTipos();
        localStorage.setItem('tipos', JSON.stringify({ tipos: tiposFormateados  }));
        tipos = tiposFormateados;
    }
    renderFilas(tipos, tipoClick);


    limpiarModales();
    await initModales(['modalTipoElemento']);
    const { modalTipoElemento } = modales;

    initModalTipo(modalTipoElemento);

    // Actualización en segundo plano
    await actualizarStorageTipos();

    document.getElementById('dashboard-tipos-elementos').addEventListener('click', (e) => {
        // Botón Agregar → AGREGAR
        if (e.target.closest('#crearTipo')) {
            configurarModalTipo('crear', modalTipoElemento);
            abrirModal(modalTipoElemento);
        }
    });
    
    const search = document.querySelector('[type="search"]');
    search.addEventListener('input', (e) => {
        let tipos = JSON.parse(localStorage.getItem('tipos') || '{}').tipos || [];
        
        const valor = e.target.value.toLowerCase();
        const tiposFiltrados = tipos.filter(tipo => {
            for (const dato of tipo) {
                if (dato && dato.toString().toLowerCase().includes(valor)) return true;
            }
            return false;
        });
        renderFilas(tiposFiltrados, tipoClick);
    });
}