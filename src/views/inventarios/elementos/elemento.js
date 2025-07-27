import { configurarModalElemento } from "../../../modals/modalElemento";
import { abrirModal, modales } from "../../../modals/modalsController";
import { get } from "../../../utils/api";
import { llenarCamposFormulario } from "../../../utils/llenarCamposFormulario";

export const formatearElemento = async (elemento) => {
  const tipo = await get('tipos-elementos/' + elemento.tipo_elemento_id);
  const ambiente = await get('ambientes/' + elemento.ambiente_id);
  const estado = await get('estados/' + elemento.estado_id);

  return [
    elemento.id,
    elemento.placa,
    elemento.serial,
    tipo.data.nombre,
    tipo.data.modelo,
    elemento.fecha_adquisicion,
    ambiente.data.nombre,
    estado.data.nombre,
    elemento.estado_activo
  ];
};

export const elementoClick = async (id) => {
  const { data } = await get('elementos/' + id)

  localStorage.setItem('elemento_temp', JSON.stringify(data));
  const form = modales.modalElemento.querySelector('form');

  llenarCamposFormulario(data, form);
  modales.modalElemento.dataset.id = data.id;
  configurarModalElemento('editar', modales.modalElemento);
  abrirModal(modales.modalElemento);
}