import getCookie from "../utils/getCookie";

export const setLecturaForm = (form, lectura = true) => {
  const roles = getCookie('roles', [].map(r => r.id))

  const campos = form.querySelectorAll('input, select, textarea');
  campos.forEach(campo => {
    if (!lectura && campo.dataset.rolPermitido && !roles.includes(campo.dataset.rolPermitido)) {
      campo.disabled = true;
    } else {
      campo.disabled = lectura;
    }
  });
}
