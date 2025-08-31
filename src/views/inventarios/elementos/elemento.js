
import { esResponsive } from "../../../helpers/renderFilas";
import { get } from "../../../utils/api";


import crear from './crud/crear';
import detalles from './crud/detalles';
import editar from './crud/editar';
import reportar from './crud/reportar';

export default { crear, detalles, editar, reportar };

export const formatearElemento = (elemento) => {
  if (esResponsive()) {
    return [
      {name: 'id-fila', value: elemento.id},
      {name: 'Placa', value: elemento.placa},
      {name: 'Tipo', value: elemento.tipo_elemento},
      {name: 'Serial', value: elemento.serial},
      {name: 'Modelo', value: elemento.tipo_modelo},
      {name: 'Fecha de adquisición', value: elemento.fecha_adquisicion},
      {name: 'Ambiente', value: elemento.ambiente ? elemento.ambiente : 'No asignado'},
      {name: 'Estado', value: elemento.estado},
      {name: 'Activo', value: elemento.activo}
    ]
  }
  else {
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
  }
};

export const elementoClick = async (id) => {
  location.hash = "#/inventarios/elementos/detalles/id=" + id;
}

export const cargarElementos = async () => {
  const inventario = JSON.parse(localStorage.getItem('inventario'));
  const respuesta = await get('elementos/me/inventario/' + inventario.id);
  const elementos = [];  
  if (respuesta.success) {

    for (const elemento of respuesta.data) {
      elementos.push(formatearElemento(elemento));
    }
  }

  return elementos;
}

export const actualizarStorageElementos = async () => {
  const nuevosElementos = await cargarElementos();
  localStorage.setItem('elementos', JSON.stringify({ elementos: nuevosElementos }));
}
