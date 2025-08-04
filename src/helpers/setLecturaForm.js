export const setLecturaForm = (form, lectura = true) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rolPermitido = usuario?.rol_id;

  const campos = form.querySelectorAll('input, select, textarea');
  campos.forEach(campo => {
    if (!lectura && campo.dataset.rolPermitido && campo.dataset.rolPermitido !== rolPermitido.toString()) {
      campo.disabled = true;
    } else {
      campo.disabled = lectura;
    }
  });
}
