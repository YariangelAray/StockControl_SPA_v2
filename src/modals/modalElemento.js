import { abrirModal, cerrarModal, initModales, modales, mostrarConfirmacion, ocultarModalTemporal } from "./modalsController";
import { configurarModalTipo, initModalTipo } from "./modalTipoElemento";
import { setLecturaForm } from "../helpers/setLecturaForm";
import { initModalGenerarReporte } from "./modalGenerarReporte";

export const configurarModalElemento = (modo, modal) => {
  const form = modal.querySelector('form');
  const botones = {
    editar: modal.querySelector('.editar'),
    crear: modal.querySelector('.crear'),
    guardar: modal.querySelector('.guardar'),
    baja: modal.querySelector('.dar-baja'),
    reportar: modal.querySelector('.reportar'),
    aceptar: modal.querySelector('.aceptar'),
    cancelar: modal.querySelector('.cancelar')
  };

  // Oculta todo
  Object.values(botones).forEach(btn => btn.classList.add('hidden'));

  if (modo === 'crear') {
    form.reset();
    setLecturaForm(form, false); // todos habilitados
    botones.crear.classList.remove('hidden');
    modal.querySelector('#agregarTipo').classList.add('hidden');;    
    botones.cancelar.classList.remove('hidden');
    modal.querySelector('.modal__title').textContent = 'Crear Elemento';
  }

  if (modo === 'editar') {
    setLecturaForm(form, true); // lectura
    botones.editar.classList.remove('hidden');
    botones.baja.classList.remove('hidden');
    botones.reportar.classList.remove('hidden');
    botones.aceptar.classList.remove('hidden');
    modal.querySelector('.modal__title').textContent = 'Detalles del Elemento';
  }

  if (modo === 'editar_activo') {
    setLecturaForm(form, false); // habilitar campos
    botones.guardar.classList.remove('hidden'); // usar "crear" como "guardar cambios"
    botones.cancelar.classList.remove('hidden'); // cancelar edición
    modal.querySelector('.modal__title').textContent = 'Editar Elemento';
  }
};


export const initModalElemento = async (modal) => {

  await initModales(['modalGenerarReporte', 'modalTipoElemento']);  
  const { modalGenerarReporte, modalTipoElemento } = modales;
  initModalGenerarReporte(modalGenerarReporte);
  initModalTipo(modalTipoElemento);

  const selectTipo = modal.querySelector('#tipo_elemento');  
  const btnAgregarTipo = modal.querySelector('#agregarTipo');
  btnAgregarTipo.classList.add('hidden');

  // Evento change en el select
  selectTipo.addEventListener('change', () => {
    const valorSeleccionado = selectTipo.value;

    if (valorSeleccionado === 'otro') btnAgregarTipo.classList.remove('hidden');
    else btnAgregarTipo.classList.add('hidden');

  });

  btnAgregarTipo.addEventListener('click', (e) => {
    e.preventDefault();
    configurarModalTipo('crear', modalTipoElemento);    
    abrirModal(modalTipoElemento);
  });

  const form = modal.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });


  modal.addEventListener('click', async (e) => {

    if (e.target.closest('.dar-baja')) {
      const confirmado = await mostrarConfirmacion();
      if (confirmado) {
        alert('El elemento será dado de baja.');
      } else {
        alert('Acción cancelada.');
      }
    }

    if (e.target.closest('.editar')) {
      configurarModalElemento('editar_activo', modal);
      return;
    }

    if (e.target.closest('.guardar')) {
      const confirmado = await mostrarConfirmacion();
      if (confirmado) {
        alert('El elemento será actualizado.');
      } else {
        alert('Acción cancelada.');
      }
    }

    if (e.target.closest('.crear')) {
      const confirmado = await mostrarConfirmacion();
      if (confirmado) {
        alert('El elemento será guardado.');
        cerrarModal();
      } else {
        alert('Acción cancelada.');
      }
    }

    if (e.target.closest('.cancelar')) {
      const estaEditando = modal.querySelector('.modal__title').textContent.includes('Editar');
      if (estaEditando) {
        configurarModalElemento('editar', modal); // volver a modo lectura
      } else {
        cerrarModal(); // cerrar en modo crear
      }
    }

    if (e.target.closest('.aceptar')) {
      cerrarModal();
    }

    // Reportar
    if (e.target.closest('.reportar')) {
      ocultarModalTemporal(modal);
      abrirModal(modalGenerarReporte);
    }
  });
};

