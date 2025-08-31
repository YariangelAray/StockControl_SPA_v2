import { get } from "../../../utils/api"
import { llenarCamposFormulario } from "../../../helpers/llenarCamposFormulario"
import getCookie from "../../../utils/getCookie"
import hasPermisos from "../../../utils/hasPermisos"

import crear from './crud/crear';
import detalles from './crud/detalles';
import editar from './crud/editar';

export default { crear, detalles, editar };

export const formatearTipo = (tipo) => {
  return [
    tipo.id,
    tipo.id,
    tipo.consecutivo,
    tipo.nombre,
    tipo.marca,
    tipo.modelo,
    tipo.atributos,
    tipo.cantidadElementos,
  ]
}

export const tipoClick = async (id) => {

  if(location.hash.startsWith('#/inventarios')) location.hash = '#/inventarios/elementos/tipos-elementos/detalles/id='+id;
  else if(location.hash.startsWith('#/super-admin')) location.hash = '#/super-admin/tipos-elementos/detalles/id='+id;
}

export const cargarTipos = async () => {
  const permisos = getCookie('permisos', []);
  const inventario = JSON.parse(localStorage.getItem('inventario'));

  const respuesta = hasPermisos('tipo-elemento.view', permisos) ? await get('tipos-elementos/') : await get('tipos-elementos/inventario/me/' + inventario.id);
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