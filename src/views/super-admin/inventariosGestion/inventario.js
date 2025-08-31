import { esResponsive } from "../../../helpers/renderFilas";
import { get } from "../../../utils/api";

import crear from './crud/crear';
import detalles from './crud/detalles';
import editar from './crud/editar';

export default { crear, detalles, editar };

export const formatearInventario = (inventario) => {    
    if (esResponsive()) {
        return [
            {name: 'id-fila', value: inventario.id},
            {name: 'ID', value: inventario.id},
            {name: 'Nombre', value: inventario.nombre},
            {name: 'Fecha de Creación', value: inventario.fecha_creacion},
            {name: 'Última Actualización', value: inventario.ultima_actualizacion},
            {name: 'Cantidad de Elementos', value: inventario.cantidad_elementos},
            {name: 'Gestor', value: inventario.gestor},
        ]
    }
    else{
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
}

export const inventarioClick = async (id) => {
    location.hash = '#/super-admin/inventarios/detalles/id='+id;
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