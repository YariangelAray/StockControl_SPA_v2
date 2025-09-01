import obtenerHashBase from "../helpers/obtenerHashBase";
import { cargarModal, cerrarModal, mostrarModal } from "./modalsController";

/**
 * Administrador principal de modales del sistema
 * Maneja la apertura, cierre y reutilización de modales de forma inteligente
 * 
 * @param {Object} modal - Objeto con configuración del modal
 * @param {string} modal.nombre - Nombre del archivo del modal
 * @param {Function} modal.controlador - Función controladora del modal
 * @param {*} modal.parametros - Parámetros a pasar al controlador
 * @param {boolean} modal.mismoModal - Indica si es el mismo modal que está abierto
 */
export default async (modal) => {
  // Busca si ya hay un modal abierto en el DOM
  let modalAbierto = document.getElementById('app-modal');

  // Si ya hay modal abierto y es el mismo → solo refrescar con el nuevo controlador
  if (modalAbierto && modal.mismoModal) {
    // Ejecuta el controlador con los nuevos parámetros sin cerrar/abrir
    modal.controlador(modalAbierto, modal.parametros);
    return;
  }

  // Si hay modal distinto, lo cerramos antes de abrir el nuevo
  if (modalAbierto && !modal.mismoModal) {
    // Espera a que termine la animación de cierre
    await cerrarModal(modalAbierto);
    // Limpia la referencia
    modalAbierto = null;
  }

  // Cargar modal si no está presente
  if (!modalAbierto) {
    // Carga el modal desde archivo HTML
    const modalCargado = await cargarModal(modal.nombre);

    // Primero ejecuta el controlador para configurar el modal
    await modal.controlador(modalCargado, modal.parametros);

    // Luego muestra el modal con animaciones
    mostrarModal(modalCargado);

    // Configura eventos de cierre del modal
    modalCargado.addEventListener('click', e => {
      // Detecta clics en botones de cancelar o aceptar
      if (e.target.matches('.cancelar, .aceptar')) {
        
        // Solo cierra si no está en modo editar
        if (modalCargado.dataset.modo !== 'editar') {
          // Cierra el modal con animación
          cerrarModal(modalCargado);
          // Navega de vuelta al hash base después del cierre
          requestAnimationFrame(() => location.hash = obtenerHashBase());
        }
      }
    });
  }
};