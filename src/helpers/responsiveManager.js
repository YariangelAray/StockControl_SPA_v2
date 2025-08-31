// responsiveManager.js
let vistaActual = null;
let cambioResize = false;

/**
 * Registrar la vista que está activa (ej: "elementos", "reportes")
 */
export const setVistaActual = (vista) => {
  vistaActual = vista;
};

/**
 * Obtener vista actual
 */
export const getVistaActual = () => vistaActual;

/**
 * Limpia la vista activa y callbacks (p.ej. al cerrar sesión)
 */
export const clearResponsiveManager = () => {
  vistaActual = null;
  for (const key in listeners) {
    delete listeners[key];
  }
};

/**
 * Dispatcher cuando cambia el tamaño
 */
const listeners = {};

export const onResponsiveChange = (vista, callback) => {
  listeners[vista] = callback;
};

window.addEventListener("resize", () => {
  cambioResize = true;
  const actual = getVistaActual();
  if (actual && listeners[actual]) {
    listeners[actual]();
  }
});
