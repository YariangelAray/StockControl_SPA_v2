// Variable global para manejo de vistas
let vistaActual = null;

/**
 * Registra la vista que está actualmente activa
 * Permite al sistema saber qué vista debe recibir notificaciones de cambio de tamaño
 * 
 * @param {string} vista - Nombre de la vista activa (ej: "elementos", "reportes")
 */
export const setVistaActual = (vista) => {
  vistaActual = vista;
};

/**
 * Obtiene el nombre de la vista actualmente registrada
 * 
 * @returns {string|null} Nombre de la vista actual o null si no hay ninguna
 */
export const getVistaActual = () => vistaActual;

/**
 * Limpia el estado del responsive manager
 * Útil al cerrar sesión
 */
export const clearResponsiveManager = () => {
  // Resetea la vista actual
  vistaActual = null;
  
  // Limpia todos los listeners registrados
  for (const key in listeners) {
    delete listeners[key];
  }
};

// Objeto para almacenar callbacks por vista
const listeners = {};

/**
 * Registra un callback para ser ejecutado cuando cambie el tamaño de ventana
 * Permite a cada vista definir su propia lógica de adaptación responsive
 * 
 * @param {string} vista - Nombre de la vista que registra el callback
 * @param {Function} callback - Función a ejecutar en cambios de tamaño
 */
export const onResponsiveChange = (vista, callback) => {
  listeners[vista] = callback;
};

// Listener global de resize que distribuye eventos a la vista activa
window.addEventListener("resize", () => {
  // Marca que hubo un cambio de tamaño
  cambioResize = true;
  
  // Obtiene la vista actualmente activa
  const actual = getVistaActual();
  
  // Ejecuta el callback de la vista actual si existe
  if (actual && listeners[actual]) {
    listeners[actual]();
  }
});