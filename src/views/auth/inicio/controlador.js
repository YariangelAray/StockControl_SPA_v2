import { setVistaActual } from "../../../helpers/responsiveManager";
import * as validaciones from "../../../utils/Validaciones";
import { errorToast, successAlert } from "../../../utils/alertas";
import * as api from "../../../utils/api";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";

export default async () => {  
  // Establece la vista actual como 'inicio' para el responsive manager
  setVistaActual('inicio');

  // Limpia el almacenamiento local para evitar datos residuales
  localStorage.clear();

  // Cambia la clase del contenedor principal para aplicar estilos de la home
  document.querySelector('#app-main').className = 'home';    

  // Obtiene el formulario de inicio de sesión
  const formulario = document.querySelector(".form--signin");

  // Obtiene todos los campos requeridos dentro del formulario
  const campos = [...formulario].filter((elemento) => elemento.hasAttribute("required"));  

  // Agrega validaciones a cada campo requerido
  campos.forEach((campo) => {
    // Valida el campo cuando pierde el foco
    campo.addEventListener("blur", validaciones.validarCampo);

    // Validaciones específicas para el campo 'documento'
    if (campo.name === "documento") {
      // Permite solo números en keydown
      campo.addEventListener("keydown", validaciones.validarNumero);
      // Valida el campo en cada cambio de valor
      campo.addEventListener("input", validaciones.validarCampo);
      // Limita la longitud máxima a 11 caracteres
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 11));
    }
  });

  // Maneja el envío del formulario
  formulario.addEventListener("submit", async event => {
    event.preventDefault(); // Previene el envío por defecto

    // Valida todo el formulario; si falla, no continúa
    if (!validaciones.validarFormulario(event)) return;

    try {
      // Envía los datos de login a la API
      const respuesta = await api.post('auth/login', validaciones.datos);

      if (respuesta.success) {
        // Muestra alerta de éxito
        await successAlert("Inicio de sesión éxitoso");

        // Obtiene los permisos del usuario desde cookies
        const permisos = getCookie("permisos", {});

        // Redirige según permisos usando requestAnimationFrame para mejor rendimiento
        requestAnimationFrame(() => {
          location.hash = hasPermisos('superadmin.access-home', permisos) ? "#/super-admin" : "#/inventarios";
        });

      } else {
        // Muestra error recibido de la API
        errorToast(respuesta);
      }

    } catch (e) {
      // Manejo sencillo de errores inesperados
      console.error("Error inesperado en login:", e);
      errorToast({ message: "Error inesperado, por favor intente más tarde." });
    }
  });
};
