import { initComponentes } from "../../../helpers/initComponentes";
import { renderFilas } from "../../../helpers/renderFilas";
import { configurarModalAmbiente, initModalAmbiente } from "../../../modals/js/modalAmbiente";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import { actualizarStorageAmbientes, ambienteClick, cargarAmbientes } from "./ambiente";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    initComponentes(usuario);

    let ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes  || [];


    if (!ambientes || ambientes.length === 0) {
        const ambientesFormateados = await cargarAmbientes();
        localStorage.setItem('ambientes', JSON.stringify({ ambientes: ambientesFormateados }));
        ambientes = ambientesFormateados;
    }

    renderFilas(ambientes, ambienteClick);

    limpiarModales();
    await initModales(['modalAmbiente']);
    const { modalAmbiente } = modales;
    await initModalAmbiente(modalAmbiente)



    // Actualización en segundo plano
    await actualizarStorageAmbientes();
    document.getElementById('dashboard-ambientes').addEventListener('click', (e) => {
        // Botón Agregar → AGREGAR
        if (e.target.closest('#crearAmbiente')) {
            configurarModalAmbiente('crear', modalAmbiente);
            abrirModal(modalAmbiente);
        }
    });
    const search = document.querySelector('[type="search"]');
    search.addEventListener('input', (e) => {
        let ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];
        const valor = e.target.value.toLowerCase();
        const ambientesFiltrados = ambientes.filter(ambiente => {
            for (const dato of ambiente) {
                if (dato && dato.toString().toLowerCase().includes(valor)) return true;
            }
            return false;
        });
        renderFilas(ambientesFiltrados, ambienteClick);
    });
}