import Swal from 'sweetalert2/dist/sweetalert2.js'
import 'sweetalert2/src/sweetalert2.scss'
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

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

export function successToast(message = 'Operación realizada con éxito') {
  Toastify({
    text: message,
    backgroundColor: "#39A900",
    ...toastCommonOptions,
  }).showToast();
}

export function errorToast(response) {
  const messages = [];
  if (Array.isArray(response?.errors)) {
    response.errors.forEach(err => messages.unshift(err));
    messages.forEach(({ message }) => {
      Toastify({
        text: `${response.message}: ${message}`,
        backgroundColor: "hsla(0, 70%,55%, 1.00)",
        ...toastCommonOptions,
      }).showToast();
    });
  } else if (response?.message) {
    Toastify({
      text: `${response.message}`,
      backgroundColor: "hsla(0, 70%,55%, 1.00)",
      ...toastCommonOptions,
    }).showToast();
  }
}




// Configuración base
const configuracionBase = {
  background: '#F6F6F6',
  customClass: {
    confirmButton: 'button',
  },
  buttonsStyling: false,
};

// const activeToasts = [];

// const Toast = Swal.mixin({
//   toast: true,
//   position: 'top-end',
//   iconColor: 'white',
//   customClass: {
//     popup: 'colored-toast',
//   },
//   showConfirmButton: false,
//   timer: 3000,
//   timerProgressBar: true,
//   showClass: {
//     popup: ''
//   },
//   hideClass: {
//     popup: ''
//   },
//   didOpen: (toast) => {
//     // Calcular offset dinámico
//     const offset = activeToasts.length * 60; // 60px por toast (ajustable)
//     toast.style.top = `${offset}px`;
//     toast.style.margin = '10px 10px 0 0';
//     toast.style.position = 'absolute';
//     toast.style.right = '0';

//     // Agregar a la lista
//     activeToasts.push(toast);
//   },
//   willClose: (toast) => {
//     // Quitar de la lista
//     const index = activeToasts.indexOf(toast);
//     if (index !== -1) {
//       activeToasts.splice(index, 1);
//     }

//     // Reorganizar los toasts restantes
//     activeToasts.forEach((t, i) => {
//       const newOffset = i * 60;
//       t.style.top = `${newOffset}px`;
//     });
//   }
// });

// // Alerta de éxito
// export const success = (mensaje = 'Operación realizada con éxito') => {

//   return Toast.fire({
//     icon: 'success',
//     title: mensaje
//   });
// };

export const successAlert = (mensaje = 'Operación realizada con éxito') => {
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
      Swal.showLoading();
    }
  });
};

export const infoToast = (message) => {
  Toastify({
    text: message,
    backgroundColor: "#1e73be",
    ...toastCommonOptions,
  }).showToast();
}
export const infoAlert = (titulo, mensaje) => {
  return Swal.fire({
    ...configuracionBase,
    icon: 'info',
    title: titulo,
    text: mensaje,
  });
}

// // Alerta de error que recibe tu respuesta del backend
// // export const error = (respuesta) => {
// //   let mensaje = 'Error desconocido.';

// //   if (respuesta.hasOwnProperty('errors') && Array.isArray(respuesta.errors) && respuesta.errors.length > 0) {
// //     mensaje = respuesta.errors.map(err => `${err}`).join('<br>');
// //   } else if (respuesta.message) {
// //     mensaje = `${respuesta.message}`;
// //   }

// //   return Swal.fire({
// //     ...configuracionBase,
// //     icon: 'error',
// //     title: 'Se produjo un error',
// //     html: mensaje,
// //     confirmButtonText: 'Cerrar',
// //   });
// // };

// export const error = (respuesta) => {
//   let mensajes = ['Error desconocido.'];

//   if (respuesta?.message) {
//     mensajes = [respuesta.message];
//   }
//   if (Array.isArray(respuesta?.errors) && respuesta.errors.length > 0) {
//     mensajes = [...mensajes,...respuesta.errors];
//   }
//   mensajes.forEach(({message}) => {
//     Toast.fire({
//       icon: 'error',
//       title: message
//     });
//   });
// };
