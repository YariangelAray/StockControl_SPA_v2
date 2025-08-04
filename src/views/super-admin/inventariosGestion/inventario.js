import { configurarModalInventario } from "../../../modals/js/modalInventario";
import { abrirModal, modales } from "../../../modals/modalsController";
import { get } from "../../../utils/api";
import { llenarCamposFormulario } from "../../../helpers/llenarCamposFormulario";

export const formatearInventario = async (inventario) => {
    const usuario = await get('usuarios/' + inventario.usuario_admin_id);

    return [
        inventario.id,
        inventario.id,
        inventario.nombre,
        inventario.fecha_creacion,
        inventario.ultima_actualizacion,
        inventario.cantidad_elementos,
        usuario.data.nombres.split(" ")[0] + " " + usuario.data.apellidos.split(" ")[0]
    ];
}

export const inventarioClick = async (id) => {
    const { data } = await get('inventarios/' + id)
    localStorage.setItem('inventario_temp', JSON.stringify(data));

    const form = modales.modalInventario.querySelector('form');

    llenarCamposFormulario(data, form);
    modales.modalInventario.dataset.id = data.id;
    configurarModalInventario('editar', modales.modalInventario);        
    abrirModal(modales.modalInventario);
}

export const cargarInventarios = async () => {
    const respuesta = await get('inventarios')
    const inventarios = [];

    if (respuesta.success) {
        for (const inventario of respuesta.data) {
            inventarios.push(await formatearInventario(inventario))
        };
    }

    return inventarios;
}

export const actualizarStorageInventarios = async () => {
    const nuevosInventarios = await cargarInventarios();
    localStorage.setItem('inventarios', JSON.stringify({ inventarios: nuevosInventarios }));
}