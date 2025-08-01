import { initComponentes } from "../../../helpers/initComponentes";
import { renderFilas } from "../../../helpers/renderFilas";
import { configurarModalInventario, initModalInventario } from "../../../modals/modalInventario";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import { actualizarStorageInventarios, inventarioClick, cargarInventarios } from "./inventario";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    initComponentes(usuario);

    let inventarios = JSON.parse(localStorage.getItem('inventarios') || '{}').inventarios || [];


    if (!inventarios || inventarios.length === 0) {
        const inventariosFormateados = await cargarInventarios();
        localStorage.setItem('inventarios', JSON.stringify({ inventarios: inventariosFormateados }));
        inventarios = inventariosFormateados;
    }

    renderFilas(inventarios, inventarioClick);

    limpiarModales();
    await initModales(['modalInventario']);
    const { modalInventario } = modales;
    await initModalInventario(modalInventario)



    // Actualización en segundo plano
    await actualizarStorageInventarios();
    document.getElementById('dashboard-inventarios').addEventListener('click', async (e) => {
        // Botón Agregar → AGREGAR
        if (e.target.closest('#crearInventario')) {
            await configurarModalInventario('crear', modalInventario);
            abrirModal(modalInventario);
        }
    });
    const search = document.querySelector('[type="search"]');
    search.addEventListener('input', (e) => {
        let inventarios = JSON.parse(localStorage.getItem('inventarios') || '{}').inventarios || [];
        const valor = e.target.value.toLowerCase();
        const inventariosFiltrados = inventarios.filter(inventario => {
            for (const key in inventario) {
                if (inventario[key] && inventario[key].toString().toLowerCase().includes(valor)) return true;
            }
            return false;
        });
        renderFilas(inventariosFiltrados, inventarioClick);
    });
}