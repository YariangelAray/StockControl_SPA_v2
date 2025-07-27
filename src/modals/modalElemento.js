import { abrirModal, cerrarModal, initModales, modales, mostrarConfirmacion, mostrarUltimoModal, ocultarModalTemporal } from "./modalsController";
import { configurarModalTipo, initModalTipo } from "./modalTipoElemento";
import { setLecturaForm } from "../helpers/setLecturaForm";
import { llenarSelect } from "../helpers/select";
import { agregarFila, reemplazarFila } from "../helpers/renderFilas";
import { initModalGenerarReporte } from "./modalGenerarReporte";
import * as validaciones from "../utils/Validaciones";
import { llenarCamposFormulario } from "../utils/llenarCamposFormulario";
import { error, success } from '../utils/alertas'
import * as api from "../utils/api";
import { elementoClick, formatearElemento } from '../views/inventarios/elementos/elemento';

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
    ocultarModalTemporal(modal);
    abrirModal(modalTipoElemento);    
  });

  const form = modal.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = e.submitter; // Este es el botón que disparó el submit
    const claseBoton = boton.classList;

    if (!validaciones.validarFormulario(e)) return;
    const confirmado = await mostrarConfirmacion();
    if (!confirmado) return;

    validaciones.datos.valor_monetario = parseFloat(validaciones.datos.valor_monetario);
    validaciones.datos.placa = parseInt(validaciones.datos.placa);
    if (claseBoton.contains('crear')) {
      // Acción para crear
      await crearElemento(validaciones.datos);
    } else if (claseBoton.contains('guardar')) {
      // Acción para editar
      await actualizarElemento(validaciones.datos);
      configurarModalElemento('editar', modal);
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
      if (!confirmado) return;
      const { id } = JSON.parse(localStorage.getItem('elemento_temp'));

      const respuesta = await api.put('elementos/' + id + '/estado/' + false);
      if (respuesta.success) {
        const fila = document.querySelector(`tr[data-id="${id}"]`);
        if (fila) fila.classList.add('table__row--red');
        cerrarModal();
      }
      else {
        ocultarModalTemporal(modal);
        await error(respuesta);
        mostrarUltimoModal();
      }
      return;
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

      } else cerrarModal();

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

  modal.addEventListener('tipoElementoCreado', async (e) => {
    const nuevoTipo = e.detail;        
    
    selectTipo.innerHtml = "";
    const option = document.createElement('option');
    option.value = "otro";
    option.textContent = "Otro";
    selectTipo.appendChild(option);

    await llenarSelect({
      endpoint: 'tipos-elementos',
      selector: '#tipos-elementos',
      optionMapper: tipo => ({
        id: tipo.id,
        text: tipo.nombre + ". Marca:" + tipo.marca??"No Aplica" + ". Modelo:" + tipo.modelo??"No Aplica"
      })
    });

    selectTipo.value = nuevoTipo.id;
    btnAgregarTipo.classList.add('hidden');
  });
};

const crearElemento = async (datos) => {
  const inventario = JSON.parse(localStorage.getItem('inventario'));
  const respuesta = await api.post('elementos', {
    ...datos,
    inventario_id: inventario.id
  })

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalElemento);
    await error(respuesta);
    mostrarUltimoModal();
    return;
  }
  cerrarModal();
  setTimeout(async () => {
    await success('Elemento creado con éxito');
  }, 500);
  const datosFormateados = await formatearElemento(respuesta.data);
  
  const tbody = document.querySelector('#dashboard-elementos .table__body');
  agregarFila(tbody, datosFormateados, elementoClick);

}
const actualizarElemento = async (datos) => {
  const inventario = JSON.parse(localStorage.getItem('inventario'));
  const elementoTemp = JSON.parse(localStorage.getItem('elemento_temp'));
  const respuesta = await api.put('elementos/' + elementoTemp.id, {
    ...datos,
    inventario_id: inventario.id
  });

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalElemento);
    await error(respuesta);
    mostrarUltimoModal();
    return;
  }
  configurarModalElemento('editar', modales.modalElemento);
  
  localStorage.setItem('elemento_temp', JSON.stringify(respuesta.data));
  console.log(respuesta.data);
  
  const datosFormateados = await formatearElemento(respuesta.data);

  const tbody = document.querySelector('#dashboard-elementos .table__body');
  reemplazarFila(tbody, datosFormateados);
};
