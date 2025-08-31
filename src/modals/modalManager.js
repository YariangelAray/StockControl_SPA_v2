import obtenerHashBase from "../utils/obtenerHashBase";
import { cargarModal, cerrarModal, mostrarModal } from "./modalsController";

export default async (modal) => {
  let modalAbierto = document.getElementById('app-modal');

  // Si ya hay modal abierto y es el mismo → solo refrescar con el nuevo controlador
  if (modalAbierto && modal.mismoModal) {
    modal.controlador(modalAbierto, modal.parametros);
    return;
  }

  // if (modalAbierto && modalAbierto.dataset.modo === 'crear') {
  //   cerrarModal(modalAbierto);
  //   modalAbierto = null;
  // }


  // Si hay modal distinto, lo cerramos antes
  if (modalAbierto && !modal.mismoModal) {
    await cerrarModal(modalAbierto);
    // modalAbierto.remove();
    modalAbierto = null;
  }

  // Cargar modal si no está
  if (!modalAbierto) {
    const modalCargado = await cargarModal(modal.nombre);

    // Primero controladores y permisos
    await modal.controlador(modalCargado, modal.parametros);

    // Luego mostrar modal con transición
    mostrarModal(modalCargado);

    // Eventos de cierre
    modalCargado.addEventListener('click', e => {
      if (e.target.matches('.cancelar, .aceptar')) {
        // cerrarModal(modalCargado);        
        // // const base = location.hash.split('/').slice(0, -1).join('/');
        // requestAnimationFrame(() => location.hash = obtenerHashBase());

        if (modalCargado.dataset.modo !== 'editar') {
          cerrarModal(modalCargado);
          requestAnimationFrame(() => location.hash = obtenerHashBase());
        }
      }
    });
  }

};
