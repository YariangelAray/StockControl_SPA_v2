import { abrirModal, modales } from "../../../../modals/modalsController"
import { configurarModalTipo } from "../../../../modals/modalTipoElemento"
import { get } from "../../../../utils/api"
import { llenarCamposFormulario } from "../../../../utils/llenarCamposFormulario"

export const formatearTipo = (tipo) => {
    return [
        tipo.id,
        tipo.id,
        tipo.nombre,
        tipo.marca,
        tipo.modelo,
        tipo.detalles,
    ]
}

export const tipoClick = async (id) => {
    const { data } = await get('tipos-elementos/' + id)
    localStorage.setItem('tipo_temp', JSON.stringify(data));
    const form = modales.modalTipoElemento.querySelector('form');

    llenarCamposFormulario(data, form);
    configurarModalTipo('editar', modales.modalTipoElemento);
    abrirModal(modales.modalTipoElemento);
}

export const cargarTipos = async () => {
    const respuesta = await get('tipos-elementos');
    const tipos = [];

    if (respuesta.success) {
        for (const tipo of respuesta.data) {
            tipos.push(formatearTipo(tipo));
        }
    }
    return tipos;
}

export const actualizarStorageTipos = async () => {
    const nuevosTipos = await cargarTipos();
    localStorage.setItem('tipos', JSON.stringify({ tipos: nuevosTipos }));
}