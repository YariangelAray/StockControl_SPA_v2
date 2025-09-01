import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss'
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

// Configuración común para todos los toasts
const toastCommonOptions = {
  duration: 3000,
  gravity: "top",
  position: "right",
  close: true,
  stopOnFocus: true,
  style: {
    fontSize: '16px',
    fontWeight: '550',
    boxShadow: '0 2px 4px #00000047',
    borderRadius: '12px',
    maxWidth: '400px',
  }
};

// Configuración base para SweetAlert2
const configuracionBase = {
  background: '#F6F6F6',
  customClass: {
    confirmButton: 'button',
  },
  buttonsStyling: false,
};

/**
 * Muestra un toast de éxito
 * 
 * @param {string} message - Mensaje a mostrar (default: 'Operación realizada con éxito')
 */
export function successToast(message = 'Operación realizada con éxito') {
  // Crea y muestra el toast con estilo de éxito
  Toastify({
    text: message,
    backgroundColor: "#39A900",
    ...toastCommonOptions,
  }).showToast();
}

/**
 * Muestra toasts de error basados en la respuesta del backend
 * Maneja tanto errores individuales como arrays de errores
 * 
 * @param {Object} response - Respuesta del backend con errores
 */
export function errorToast(response) {
  // Array para almacenar mensajes de error
  const messages = [];
  
  // Procesa errores si vienen en formato array
  if (Array.isArray(response?.errors)) {
    // Extrae cada error del array
    response.errors.forEach(err => messages.unshift(err));
    
    // Muestra cada mensaje de error como toast separado
    messages.forEach(({ message }) => {
      Toastify({
        text: `${response.message}: ${message}`,
        backgroundColor: "hsla(0, 70%,55%, 1.00)",
        ...toastCommonOptions,
      }).showToast();
    });
  } else if (response?.message) {
    // Muestra mensaje de error simple
    Toastify({
      text: `${response.message}`,
      backgroundColor: "hsla(0, 70%,55%, 1.00)",
      ...toastCommonOptions,
    }).showToast();
  }
}

/**
 * Muestra un toast informativo
 * 
 * @param {string} message - Mensaje informativo a mostrar
 */
export const infoToast = (message) => {
  // Crea y muestra el toast con estilo informativo
  Toastify({
    text: message,
    backgroundColor: "#1e73be",
    ...toastCommonOptions,
  }).showToast();
}

/**
 * Muestra una alerta modal de éxito con auto-cierre
 * 
 * @param {string} mensaje - Mensaje de éxito (default: 'Operación realizada con éxito')
 * @returns {Promise} Promesa de SweetAlert2
 */
export const successAlert = (mensaje = 'Operación realizada con éxito') => {
  // Retorna alerta modal con configuración de éxito
  return Swal.fire({
    ...configuracionBase,
    icon: 'success',
    title: mensaje,
    confirmButtonText: 'Aceptar',
    allowOutsideClick: false,
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    allowOutsideClick: false,
    didOpen: (popup) => {
      // Muestra loading mientras se auto-cierra
      Swal.showLoading();
    }
  });
};

/**
 * Muestra una alerta modal informativa
 * 
 * @param {string} titulo - Título de la alerta
 * @param {string} mensaje - Mensaje informativo
 * @returns {Promise} Promesa de SweetAlert2
 */
export const infoAlert = (titulo, mensaje) => {
  // Retorna alerta modal con información
  return Swal.fire({
    ...configuracionBase,
    icon: 'info',
    title: titulo,
    text: mensaje,
  });
}