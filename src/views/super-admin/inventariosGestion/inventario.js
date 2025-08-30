import { get } from "../../../utils/api";

import crear from './crud/crear';
import detalles from './crud/detalles';
import editar from './crud/editar';

export default { crear, detalles, editar };

export const formatearInventario = (inventario) => {    
    return [
        inventario.id,
        inventario.id,
        inventario.nombre,
        inventario.fecha_creacion,
        inventario.ultima_actualizacion,
        inventario.cantidad_elementos,
        inventario.gestor
    ];
}

export const inventarioClick = async (id) => {
    location.hash = '#/super-admin/inventarios/detalles/id='+id;
    // const { data } = await get('inventarios/' + id)
    // localStorage.setItem('inventario_temp', JSON.stringify(data));

    // const form = modales.modalInventario.querySelector('form');

    // llenarCamposFormulario(data, form);
    // modales.modalInventario.dataset.id = data.id;
    // configurarModalInventario('editar', modales.modalInventario);        
    // abrirModal(modales.modalInventario);
}

export const cargarInventarios = async () => {
    const respuesta = await get('inventarios')
    const inventarios = [];

    if (respuesta.success) {
        for (const inventario of respuesta.data) {
            inventarios.push(formatearInventario(inventario))
        };
    }

    return inventarios;
}

export const actualizarStorageInventarios = async () => {
    const nuevosInventarios = await cargarInventarios();
    localStorage.setItem('inventarios', JSON.stringify({ inventarios: nuevosInventarios }));
}