import { cerrarModal, modales, mostrarConfirmacion } from "./modalsController";
import { setLecturaForm } from "../helpers/setLecturaForm";
import * as validaciones from "../utils/Validaciones";
import { llenarCamposFormulario } from "../utils/llenarCamposFormulario";
import * as api from "../utils/api";
import { actualizarStorageTipos, formatearTipo, tipoClick } from "../views/inventarios/elementos/tipos-elementos/tipos-elementos";
import { agregarFila, reemplazarFila } from "../helpers/renderFilas";
import { error, success } from "../utils/alertas";


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

  const campos = [...form];
  campos.forEach(campo => {
    if (campo.hasAttribute('required'))
      campo.addEventListener("input", validaciones.validarCampo);

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
    const confirmado = await mostrarConfirmacion();
    if (!confirmado) return;
    if (claseBoton.contains('crear')) {
      // Acción para crear
      await crearTipo(validaciones.datos);
    } else if (claseBoton.contains('guardar')) {
      // Acción para editar
      await actualizarTipo(validaciones.datos);
      configurarModalTipo('editar', modal);
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
      } else {
        cerrarModal(); // cerrar en modo crear                
      }
      form.querySelectorAll('.form__control').forEach(input => {
        input.classList.remove('error');
      });
    }

    if (e.target.closest('.aceptar')) {
      cerrarModal();
      localStorage.removeItem('tipo_temp');
    }

  })
}

const crearTipo = async (datos) => {
  const respuesta = await api.post('tipos-elementos', datos)

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalTipoElemento);
    await error(respuesta);
    mostrarUltimoModal();
    return;
  }
  cerrarModal();
  if (document.querySelector('#dashboard-tipos-elementos')){
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
    mostrarUltimoModal();
    return;
  }
  configurarModalTipo('editar', modales.modalTipoElemento);
  
  localStorage.setItem('tipo_temp', JSON.stringify(respuesta.data));
  
  const datosFormateados = formatearTipo(respuesta.data);
  const tbody = document.querySelector('#dashboard-tipos-elementos .table__body');

  reemplazarFila(tbody, datosFormateados, tipoClick);
  await actualizarStorageTipos();
};
