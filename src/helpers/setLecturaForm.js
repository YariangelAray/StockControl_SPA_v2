import getCookie from "../utils/getCookie";

/**
 * Establece el estado de lectura (solo lectura) en los campos de un formulario.
 * 
 * @param {HTMLFormElement} form - Elemento formulario cuyos campos se modificarán.
 * @param {boolean} [lectura=true] - Indica si se debe activar el modo lectura (true) o edición (false).
 * 
 * Cuando lectura es true, todos los campos se deshabilitan.
 * Cuando lectura es false, solo se habilitan los campos para los que el usuario tiene rol permitido.
 */
export const setLecturaForm = (form, lectura = true) => {
  // Obtiene los roles del usuario desde la cookie 'roles', extrayendo solo los IDs
  const roles = getCookie('roles', []).map(r => r.id);

  // Selecciona todos los campos input, select y textarea dentro del formulario
  const campos = form.querySelectorAll('input, select, textarea');

  // Itera sobre cada campo para establecer su estado disabled según permisos y modo lectura
  campos.forEach(campo => {
    // Si no es modo lectura y el campo tiene un rol permitido definido,
    // verifica si el usuario tiene ese rol; si no, deshabilita el campo
    if (!lectura && campo.dataset.rolPermitido && !roles.includes(Number(campo.dataset.rolPermitido))) {
      campo.disabled = true;
    } else {
      // En modo lectura o si el usuario tiene permiso, establece el estado disabled según lectura
      campo.disabled = lectura;
    }
  });
}
