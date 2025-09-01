import { setVistaActual } from "../../../helpers/responsiveManager";
import { llenarSelect } from "../../../helpers/select";
import * as validaciones from "../../../utils/Validaciones";
import { errorToast, successAlert } from "../../../utils/alertas";
import * as api from "../../../utils/api";

export default async () => {  

  // Establece la vista actual como 'registro' para el responsive manager
  setVistaActual('registro');

  // Limpia el almacenamiento local para evitar datos residuales
  localStorage.clear();

  // Cambia la clase del contenedor principal para aplicar estilos de la página de registro
  document.querySelector('#app-main').className = 'home home--signup';

  // Llena el select de tipos de documentos con datos del endpoint
  await llenarSelect({
    endpoint: 'tipos-documentos',
    selector: '#tipos-documentos',
    optionMapper: tipo => ({ id: tipo.id, text: tipo.nombre })
  });

  // Llena el select de géneros con datos del endpoint
  await llenarSelect({
    endpoint: 'generos',
    selector: '#generos',
    optionMapper: genero => ({ id: genero.id, text: genero.nombre })
  });

  // Llena el select de programas de formación con datos del endpoint
  await llenarSelect({
    endpoint: 'programas-formacion',
    selector: '#programas-formacion',
    optionMapper: programa => ({ id: programa.id, text: programa.nombre })
  });

  // Obtiene todos los programas para manejar las fichas relacionadas
  const programas = await api.get('programas-formacion');

  // Referencias a los selects de programas y fichas
  const selectProgramas = document.querySelector('#programas-formacion');
  const selectFichas = document.querySelector('#fichas');
  
  // Evento para actualizar las fichas según el programa seleccionado
  selectProgramas.addEventListener('change', (e) => {
    const id = e.target.value;

    // Elimina todas las opciones de fichas excepto la primera (placeholder)
    while (selectFichas.options.length > 1) selectFichas.remove(1);

    // Si no se seleccionó un programa, deshabilita el select de fichas
    if (e.target.selectedIndex === 0) {
      selectFichas.setAttribute('disabled', 'disabled');
    } else {
      // Habilita el select de fichas y agrega las opciones correspondientes
      selectFichas.removeAttribute('disabled');
      const programa = programas.data.find(p => p.id == id);

      // Agrega cada ficha como opción al select
      programa.fichas.forEach((ficha) => {
        const option = document.createElement('option');
        option.value = ficha.id;
        option.textContent = ficha.ficha;
        selectFichas.appendChild(option);
      });
    }
  });

  // Obtiene el formulario de registro
  const formulario = document.querySelector(".form--signup");

  // Obtiene todos los campos requeridos dentro del formulario
  const campos = [...formulario].filter((elemento) => elemento.hasAttribute("required"));

  // Agrega validaciones a cada campo requerido
  campos.forEach((campo) => {
    // Valida el campo cuando pierde el foco
    campo.addEventListener("blur", validaciones.validarCampo);

    // Validaciones específicas para campos numéricos
    if (campo.name === "documento" || campo.name === "telefono") {
      campo.addEventListener("keydown", validaciones.validarNumero);
      campo.addEventListener("input", validaciones.validarCampo);
      const limite = campo.name === "documento" ? 11 : 15;
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, limite));
    } else {
      // Validaciones para campos de texto
      if (campo.name === "nombres" || campo.name === "apellidos") {
        campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));
        campo.addEventListener("keydown", validaciones.validarTexto);
      }

      // Validaciones para campo contraseña
      if (campo.name === "contrasena") {
        campo.addEventListener("keydown", event => validaciones.validarLimite(event, 30));
        campo.addEventListener("input", () => validaciones.validarContrasena(campo));
      }

      // Validaciones para campo correo electrónico
      if (campo.name === "correo") {
        campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));
        campo.addEventListener("keydown", () => validaciones.validarCorreo(campo));
      }
    }
  });

  // Maneja el envío del formulario
  formulario.addEventListener("submit", async event => {
    event.preventDefault(); // Previene el envío por defecto

    // Valida todo el formulario; si falla, no continúa
    if (!validaciones.validarFormulario(event)) return;

    // Elimina la propiedad 'programas' de los datos antes de enviar
    delete validaciones.datos.programas;

    try {
      // Envía los datos de registro a la API
      const respuesta = await api.post('auth/register', validaciones.datos);

      if (respuesta.success) {
        // Muestra alerta de éxito
        await successAlert("Registro éxitoso");

        // Guarda la información del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(respuesta.data));

        // Redirige a inventarios después de un pequeño retraso
        setTimeout(() => {
          location.hash = '#/inventarios';
        }, 500);
      } else {
        // Muestra error recibido de la API
        errorToast(respuesta);
      }

    } catch (e) {
      // Manejo sencillo de errores inesperados
      console.error("Error inesperado en registro:", e);
      errorToast({ message: "Error inesperado, por favor intente más tarde." });
    }
  });
};
