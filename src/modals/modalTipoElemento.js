import { cerrarModal, mostrarConfirmacion } from "./modalsController";
import { setLecturaForm } from "../helpers/setLecturaForm";

export const configurarModalTipo = (modo, modal) => {
  const form = modal.querySelector('form');
  const botones = {
    editar: modal.querySelector('.editar'),
    guardar: modal.querySelector('.guardar'),
    crear: modal.querySelector('.crear'),
    aceptar: modal.querySelector('.aceptar'),
    cancelar: modal.querySelector('.cancelar')
  };

  Object.values(botones).forEach(btn => btn.classList.add('hidden'));

  if (modo === 'crear') {
    form.reset();
    setLecturaForm(form, false); // lectura
    botones.crear.classList.remove('hidden');
    botones.cancelar.classList.remove('hidden');
    modal.querySelector('.modal__title').textContent = 'Registrar Tipo';
  }

  if (modo === 'editar') {
    setLecturaForm(form, true); // lectura
    botones.editar.classList.remove('hidden');
    botones.aceptar.classList.remove('hidden');
    modal.querySelector('.modal__title').textContent = 'Detalles del Tipo';
  }
  if (modo === 'editar_activo') {
    setLecturaForm(form, false); // habilitar campos
    botones.guardar.classList.remove('hidden'); // usar "crear" como "guardar cambios"
    botones.cancelar.classList.remove('hidden'); // cancelar edición
    modal.querySelector('.modal__title').textContent = 'Editar Tipo';
  }
};

export const initModalTipo = (modal) => {
  const form = modal.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  modal.addEventListener('click', async (e) => {

    if (e.target.closest('.crear')) {
      const confirmado = await mostrarConfirmacion();
      if (confirmado) {
        alert('Tipo creado exitosamente.');
        cerrarModal();
      }
    }

    if (e.target.closest('.editar')) {
      configurarModalTipo('editar_activo', modal);
      return;
    }

    if (e.target.closest('.guardar')) {
      const confirmado = await mostrarConfirmacion();
      if (confirmado) {
        alert('El Tipo será actualizado.');
      } else {
        alert('Acción cancelada.');
      }
    }

    if (e.target.closest('.cancelar')) {
      const estaEditando = modal.querySelector('.modal__title').textContent.includes('Editar');
      if (estaEditando) {
        configurarModalTipo('editar', modal); // volver a modo lectura
      } else {
        cerrarModal(); // cerrar en modo crear
      }
    }

    if (e.target.closest('.aceptar')) {
      cerrarModal();
    }
    
  })
}