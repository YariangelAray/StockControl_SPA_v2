import { abrirModal, modales } from "../../../../modals/modalsController"
import { configurarModalTipo } from "../../../../modals/modalTipoElemento"
import { get } from "../../../../utils/api"
import { llenarCamposFormulario } from "../../../../utils/llenarCamposFormulario"

export const formatearTipo = (tipo) => {
    return[
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