export const setLecturaForm = (form, lectura = true) => {
  const campos = form.querySelectorAll('input, select, textarea');
  campos.forEach(campo => campo.disabled = lectura);
};
