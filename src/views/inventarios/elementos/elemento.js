
import { get } from "../../../utils/api";


import crear from './crud/crear';
import detalles from './crud/detalles';
import editar from './crud/editar';
import reportar from './crud/reportar';

export default { crear, detalles, editar, reportar };

export const formatearElemento = (elemento) => {

  return [
    elemento.id,
    elemento.placa,
    elemento.serial,
    elemento.tipo_elemento,
    elemento.tipo_modelo,
    elemento.fecha_adquisicion,
    elemento.ambiente ? elemento.ambiente : 'No asignado',
    elemento.estado,
    elemento.activo
  ];
};

export const elementoClick = async (id) => {
  location.hash = "#/inventarios/elementos/detalles/id="+id;
  // const permisos = getCookie('permisos', []);
  // const { data } = await get('elementos/me/' + id)

  // localStorage.setItem('elemento_temp', JSON.stringify(data));
  // const form = modales.modalElemento.querySelector('form');

  // llenarCamposFormulario(data, form);
  // modales.modalElemento.dataset.id = data.id;
  // configurarModalElemento('editar', modales.modalElemento);
  // const btn = data.estado_activo ? modales.modalElemento.querySelector('.dar-baja') : modales.modalElemento.querySelector('.reactivar');
  // if (!hasPermisos('elemento.change-status-inventory-own', permisos)) btn.classList.remove('hidden');
  // abrirModal(modales.modalElemento);
}

export const cargarElementos = async () => {
  const respuesta = await get('elementos/me')
  const elementos = [];

  if (respuesta.success) {

    for (const elemento of respuesta.data) {
      elementos.push(formatearElemento(elemento));
    }
  }

  return elementos;
}

export const actualizarStorageElementos = async (inventario) => {
  const nuevosElementos = await cargarElementos();
  localStorage.setItem('elementos', JSON.stringify({ elementos: nuevosElementos }));
}
