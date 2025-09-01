
import { abrirModalDesactivar } from "../../modals/js/modalDesactivarCuenta";

import * as api from "../../utils/api.js";
import { llenarCamposFormulario } from "../../helpers/llenarCamposFormulario.js";
import { llenarSelect } from "../../helpers/select";
import * as validaciones from "../../utils/Validaciones";
import { errorToast, successToast } from "../../utils/alertas.js";

import { setLecturaForm } from "../../helpers/setLecturaForm.js";
import getCookie from "../../utils/getCookie.js";
import hasPermisos from "../../utils/hasPermisos.js";
import { setVistaActual } from "../../helpers/responsiveManager.js";

export default async () => {

  // Establece la vista actual como 'perfil'
  setVistaActual('perfil');

  // Obtiene los permisos del usuario desde cookies
  const permisos = getCookie('permisos', []);

  // Obtiene los nombres de los roles del usuario desde cookies
  const rolesName = getCookie('roles', []).map(r => r.nombre);

  // Obtiene el contenedor del botón de desactivar cuenta
  const contentDesactivar = document.querySelector('.desactivar-cuenta');

  // Verifica si el usuario tiene permiso para desactivar su cuenta
  if (hasPermisos("usuario.disable-own", permisos)) {

    // Muestra el botón de desactivar cuenta
    contentDesactivar.classList.remove('hidden');

    // Escucha clics en el dashboard de perfil
    document.getElementById('dashboard-perfil').addEventListener('click', async (e) => {

      // Si el clic fue en el botón de desactivar cuenta
      if (e.target.closest('#desactivarCuenta')) {

        // Abre el modal para desactivar cuenta
        await abrirModalDesactivar();
      }
    });
  }

  // Solicita los datos del usuario al backend
  const { data } = await api.get('usuarios/me');

  // Asigna los datos del usuario
  const usuario = data;

  // Obtiene el campo donde se muestra el rol
  const campoRol = document.querySelector('.dashboard__title.rol');

  // Asigna el texto con los roles del usuario
  campoRol.textContent = "Usuario " + rolesName.join(" - ");

  // Llena el select de tipos de documento
  await llenarSelect({
    endpoint: 'tipos-documentos',
    selector: '#tipos-documentos',
    optionMapper: tipo => ({ id: tipo.id, text: tipo.nombre })
  });

  // Llena el select de géneros
  await llenarSelect({
    endpoint: 'generos',
    selector: '#generos',
    optionMapper: genero => ({ id: genero.id, text: genero.nombre })
  });

  // Llena el select de programas de formación
  await llenarSelect({
    endpoint: 'programas-formacion',
    selector: '#programas-formacion',
    optionMapper: programa => ({ id: programa.id, text: programa.nombre })
  });

  // Solicita los programas de formación al backend
  const programas = await api.get('programas-formacion');

  // Obtiene el select de programas
  const selectProgramas = document.querySelector('#programas-formacion');

  // Obtiene el select de fichas
  const selectFichas = document.querySelector('#fichas');

  // Busca el programa que contiene la ficha del usuario
  const programaUsuario = programas.data.find(programa =>
    programa.fichas.some(ficha => ficha.id == usuario.ficha_id)
  );

  // Asigna el programa del usuario al select
  selectProgramas.value = programaUsuario.id;

  // Si se encontró el programa del usuario
  if (programaUsuario) {

    // Llena el select de fichas con las fichas del programa
    agregarFichas(selectFichas, programaUsuario);

    // Asigna la ficha del usuario al select
    selectFichas.value = usuario.ficha_id;
  }

  // Escucha cambios en el select de programas
  selectProgramas.addEventListener('change', (e) => {

    // Obtiene el id del programa seleccionado
    const id = e.target.value;

    // Si no se seleccionó ningún programa, desactiva el select de fichas
    if (e.target.selectedIndex == 0) selectFichas.setAttribute('disabled', 'disabled');

    // Si se seleccionó un programa válido
    else {

      // Activa el select de fichas
      selectFichas.removeAttribute('disabled');

      // Busca el programa seleccionado
      const programa = programas.data.find(p => p.id == id);

      // Llena el select de fichas con las fichas del programa
      agregarFichas(selectFichas, programa);
    }
  });

  // Obtiene el formulario de usuario
  const formUsuario = document.getElementById('dashboard-perfil').querySelector('#form-usuario');

  // Llena los campos del formulario con los datos del usuario
  llenarCamposFormulario(usuario, formUsuario);

  // Habilita la edición del formulario
  setLecturaForm(formUsuario, false);

  // Obtiene los campos requeridos del formulario
  const camposUser = [...formUsuario].filter((elemento) => elemento.hasAttribute("required"));

  // Asigna validaciones a cada campo requerido
  camposUser.forEach((campo) => {

    // Valida el campo al perder el foco
    campo.addEventListener("blur", validaciones.validarCampo);

    // Si el campo es documento o teléfono
    if (campo.name == "documento" || campo.name == "telefono") {

      // Valida que solo se ingresen números
      campo.addEventListener("keydown", validaciones.validarNumero);

      // Valida el campo al escribir
      campo.addEventListener("input", validaciones.validarCampo);

      // Asigna límite de caracteres
      const limite = campo.name == "documento" ? 11 : 15;
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, limite));
    }

    // Si el campo es nombres o apellidos
    else if (campo.name == "nombres" || campo.name == "apellidos") {

      // Asigna límite de caracteres
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));

      // Valida que solo se ingresen letras
      campo.addEventListener("keydown", validaciones.validarTexto);
    }

    // Si el campo es correo
    else if (campo.name == "correo") {

      // Asigna límite de caracteres
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));

      // Valida el formato del correo
      campo.addEventListener("keydown", () => validaciones.validarCorreo(campo));
    }
  });

  // Escucha el envío del formulario de usuario
  formUsuario.addEventListener('submit', async (e) => {

    // Previene el comportamiento por defecto
    e.preventDefault();

    // Valida el formulario completo
    if (!validaciones.validarFormulario(e)) return;

    // Elimina el campo programas de los datos
    delete validaciones.datos.programas;

    try {

      // Envía los datos actualizados al backend
      const respuesta = await api.put(`usuarios/me`, validaciones.datos);

      // Si la respuesta fue exitosa, muestra mensaje
      if (respuesta.success) {
        successToast("Usuario actualizado exitosamente");
      }

      // Si hubo error, muestra mensaje
      else {
        errorToast(respuesta);
      }

    } catch (e) {

      // Muestra error inesperado en consola
      console.error("Error inesperado:", e);
    }
  });

  // Obtiene el formulario de contraseña
  const formContrasena = document.getElementById('dashboard-perfil').querySelector('#form-contrasena');

  // Obtiene los campos requeridos del formulario
  const camposContrasena = [...formContrasena].filter((elemento) => elemento.hasAttribute("required"));

  // Asigna validaciones a cada campo
  camposContrasena.forEach((campo) => {

    // Valida el campo al perder el foco
    campo.addEventListener("blur", validaciones.validarCampo);

    // Valida el campo al escribir
    campo.addEventListener("keydown", validaciones.validarCampo);

    // Si el campo es la nueva contraseña
    if (campo.name == "contrasena_nueva") {

      // Asigna límite de caracteres
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 30));

      // Valida el formato de la contraseña
      campo.addEventListener("input", () => validaciones.validarContrasena(campo));
    }
  });

  // Escucha el envío del formulario de contraseña
  formContrasena.addEventListener('submit', async (e) => {

    // Previene el comportamiento por defecto
    e.preventDefault();

    // Valida el formulario completo
    if (!validaciones.validarFormulario(e)) return;

    try {

      // Envía la nueva contraseña al backend
      const respuesta = await api.put(`usuarios/me/contrasena`, validaciones.datos);

      // Si la respuesta fue exitosa, muestra mensaje y limpia el formulario
      if (respuesta.success) {
        successToast("Contraseña actualizada exitosamente");
        formContrasena.reset();
      }

      // Si hubo error, muestra mensaje
      else {
        errorToast(respuesta);
      }

    } catch (e) {

      // Muestra error inesperado en consola
      console.error("Error inesperado:", e);
    }
  });
}

// Llena el select de fichas con las fichas del programa
const agregarFichas = (selectFichas, programa) => {

  // Elimina todas las opciones excepto la primera
  while (selectFichas.options.length > 1) selectFichas.remove(1);

  // Recorre cada ficha del programa
  programa.fichas.forEach((ficha) => {

    // Crea una nueva opción para el select
    const option = document.createElement('option');

    // Asigna el id de la ficha como valor
    option.value = ficha.id;

    // Asigna el texto de la ficha
    option.textContent = ficha.ficha;

    // Agrega la opción al select
    selectFichas.appendChild(option);
  });
}
