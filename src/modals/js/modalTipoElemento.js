import { cerrarModal, modales, mostrarConfirmacion, mostrarUltimoModal, ocultarModalTemporal } from "../modalsController";
import { setLecturaForm } from "../../helpers/setLecturaForm";
import * as validaciones from "../../utils/Validaciones";
import { llenarCamposFormulario } from "../../helpers/llenarCamposFormulario";
import * as api from "../../utils/api";
import { actualizarStorageTipos, formatearTipo, tipoClick } from "../../views/compartidas/tipos-elementos/tipos-elementos";
import { agregarFila, reemplazarFila, removerFilar } from "../../helpers/renderFilas";
import { error, success } from "../../utils/alertas";


export const configurarModalTipo = (modo, modal) => {
  const form = modal.querySelector('form');
  const botones = {
    editar: modal.querySelector('.editar'),
    guardar: modal.querySelector('.guardar'),
    eliminar: modal.querySelector('.eliminar'),
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
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const form = modal.querySelector('form');

  const campos = [...form];
  campos.forEach(campo => {
    if (campo.hasAttribute('required')) {
      campo.addEventListener("input", validaciones.validarCampo);
      campo.addEventListener("blur", validaciones.validarCampo);
    }

    if (campo.name == "consecutivo") {
      campo.addEventListener("keydown", validaciones.validarNumero);
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 10));
    }

    if (campo.name == "nombre" || campo.name == "marca" || campo.name == "modelo")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));

    if (campo.name == "observaciones")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 250));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = e.submitter; // Este es el botón que disparó el submit
    const claseBoton = boton.classList;
    if (!validaciones.validarFormulario(e)) return;
    validaciones.datos.consecutivo = parseInt(validaciones.datos.consecutivo);
    const confirmado = await mostrarConfirmacion();
    if (!confirmado) return;
    if (claseBoton.contains('crear')) {
      // Acción para crear
      await crearTipo(validaciones.datos);
    } else if (claseBoton.contains('guardar')) {
      // Acción para editar
      await actualizarTipo(validaciones.datos);
      configurarModalTipo('editar', modal);
      const btn = modal.querySelector('.eliminar');
      if (usuario.rol_id == 1) btn.classList.remove('hidden');
    }
  });

  modal.addEventListener('click', async (e) => {

    if (e.target.closest('.editar')) {
      configurarModalTipo('editar_activo', modal);
      return;
    }

    if (e.target.closest('.cancelar')) {
      const estaEditando = modal.querySelector('.modal__title').textContent.includes('Editar');
      if (estaEditando) {
        const temp = JSON.parse(localStorage.getItem('tipo_temp'));
        llenarCamposFormulario(temp, form); // Restaurar valores
        configurarModalTipo('editar', modal); // volver a modo lectura

        const btn = modal.querySelector('.eliminar');
        if (usuario.rol_id == 1) btn.classList.remove('hidden');
      } else {
        cerrarModal(); // cerrar en modo crear                
      }
      form.querySelectorAll('.form__control').forEach(input => {
        input.classList.remove('error');
      });
    }

    if (e.target.closest('.aceptar')) {
      cerrarModal();
      form.reset();
      localStorage.removeItem('tipo_temp');
    }

    if (e.target.closest('.eliminar')) {
      const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el tipo de elemento?");
      if (!confirmado) return;
      const { id } = JSON.parse(localStorage.getItem('tipo_temp'));
      const respuesta = await api.del('tipos-elementos/' + id);

      if (respuesta.success) {
        cerrarModal();
        await success('Tipo de elemento eliminado con éxito');
        removerFilar(document.querySelector('#dashboard-tipos-elementos .table__body'), id);
      }
      else {
        ocultarModalTemporal(modal);
        await error(respuesta);
        setTimeout(async () => mostrarUltimoModal(), 100);
      }
      await actualizarStorageTipos();
      return;
    }
  })
}

const crearTipo = async (datos) => {
  const respuesta = await api.post('tipos-elementos', datos)

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalTipoElemento);
    await error(respuesta);
    setTimeout(async () => mostrarUltimoModal(), 100);
    return;
  }
  cerrarModal();
  if (document.querySelector('#dashboard-tipos-elementos')) {
    setTimeout(async () => {
      await success('Tipo de elemento creado con éxito');
    }, 100);
  }

  const datosFormateados = formatearTipo(respuesta.data);
  const tbody = document.querySelector('#dashboard-tipos-elementos .table__body');
  agregarFila(tbody, datosFormateados, tipoClick);

  document.dispatchEvent(new CustomEvent('tipoElementoCreado', { detail: respuesta.data }));
  await actualizarStorageTipos();
}


const actualizarTipo = async (datos) => {
  const tipoTemp = JSON.parse(localStorage.getItem('tipo_temp'));
  const respuesta = await api.put('tipos-elementos/' + tipoTemp.id, datos);

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalTipoElemento);
    await error(respuesta);
    setTimeout(async () => mostrarUltimoModal(), 100);
    return;
  }
  configurarModalTipo('editar', modales.modalTipoElemento);

  localStorage.setItem('tipo_temp', JSON.stringify(respuesta.data));

  const datosFormateados = formatearTipo(respuesta.data);
  const tbody = document.querySelector('#dashboard-tipos-elementos .table__body');

  reemplazarFila(tbody, datosFormateados, tipoClick);
  await actualizarStorageTipos();
};
