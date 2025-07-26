import { abrirModal, cerrarModal, initModales, modales, mostrarConfirmacion, ocultarModalTemporal } from "./modalsController";
import { configurarModalTipo, initModalTipo } from "./modalTipoElemento";
import { setLecturaForm } from "../helpers/setLecturaForm";
import { llenarSelect } from "../helpers/select";
import { initModalGenerarReporte } from "./modalGenerarReporte";
import * as validaciones from "../utils/Validaciones";
import { llenarCamposFormulario } from "../utils/llenarCamposFormulario";

export const configurarModalElemento = (modo, modal) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

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
    if (usuario.rol_id == 1) botones.baja.classList.remove('hidden');
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

  await llenarSelect({
    endpoint: 'ambientes',
    selector: '#ambientes',
    optionMapper: ambiente => ({ id: ambiente.id, text: ambiente.nombre })
  });
  await llenarSelect({
    endpoint: 'estados',
    selector: '#estados',
    optionMapper: estado => ({ id: estado.id, text: estado.nombre })
  });
  await llenarSelect({
    endpoint: 'tipos-elementos',
    selector: '#tipos-elementos',
    optionMapper: tipo => ({ id: tipo.id, text: tipo.nombre + ". Marca:" + tipo.marca + ". Modelo:" + tipo.modelo })
  });

  await initModales(['modalGenerarReporte', 'modalTipoElemento']);
  const { modalGenerarReporte, modalTipoElemento } = modales;
  initModalGenerarReporte(modalGenerarReporte);
  initModalTipo(modalTipoElemento);

  const selectTipo = modal.querySelector('#tipos-elementos');
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validaciones.validarFormulario(e)) return;
    const confirmado = await mostrarConfirmacion();
    if (confirmado) {
      alert('El elemento será guardado.');
      localStorage.removeItem('elemento_temp');
      cerrarModal();
    } else {
      alert('Acción cancelada.');
    }
  });

  const campos = [...form];
  campos.forEach(campo => {
    if (campo.hasAttribute('required'))
      campo.addEventListener("input", validaciones.validarCampo);

    if (campo.name == "valor_monetario") {
      campo.addEventListener("keydown", (e) => {
        validaciones.validarNumero(e);
        validaciones.validarLimite(e, 20);
      });

    }
    if (campo.name == "placa" || campo.name == "serial")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));

    if (campo.name == "fecha_adquisicion")
      campo.addEventListener('input', (e) => validaciones.validarFecha(e.target))

    if (campo.name == "placa")
      campo.addEventListener("keydown", validaciones.validarNumero);

    if (campo.name == "observaciones")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 250));
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

    if (e.target.closest('.cancelar')) {
      const estaEditando = modal.querySelector('.modal__title').textContent.includes('Editar');

      if (estaEditando) {
        const temp = JSON.parse(localStorage.getItem('elemento_temp'));
        llenarCamposFormulario(temp, form); // Restaurar valores
        configurarModalElemento('editar', modal);
      } else {
        cerrarModal();
        localStorage.removeItem('elemento_temp');
      }
      form.querySelectorAll('.form__control').forEach(input => {
        input.classList.remove('error');
      });
    }

    if (e.target.closest('.aceptar')) {
      cerrarModal();
      localStorage.removeItem('elemento_temp');
    }

    // Reportar
    if (e.target.closest('.reportar')) {
      ocultarModalTemporal(modal);
      abrirModal(modalGenerarReporte);
    }
  });
};

