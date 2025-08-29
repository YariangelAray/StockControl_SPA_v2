// import { error, info, success } from "../../utils/alertas";
import { llenarSelect } from "../../helpers/select";
import { setLecturaForm } from "../../helpers/setLecturaForm";
import { llenarCamposFormulario } from "../../helpers/llenarCamposFormulario";
import * as validaciones from '../../utils/Validaciones';
import * as api from '../../utils/api';
import { cerrarModal, mostrarConfirmacion, mostrarUltimoModal, ocultarModalTemporal, modales } from "../modalsController";
import { actualizarStorageAmbientes, ambienteClick, formatearAmbiente } from "../../views/super-admin/ambientesGestion/ambiente";
import { agregarFila, reemplazarFila, removerFilar } from "../../helpers/renderFilas";

export const configurarModalAmbiente = (modo, modal) => {

  const form = modal.querySelector('form');

  const botones = {
    editar: modal.querySelector('.editar'),
    crear: modal.querySelector('.crear'),
    guardar: modal.querySelector('.guardar'),
    eliminar: modal.querySelector('.eliminar'),
    ver_mapa: modal.querySelector('.ver-mapa'),
    aceptar: modal.querySelector('.aceptar'),
    cancelar: modal.querySelector('.cancelar')
  };

  // Oculta todo
  Object.values(botones).forEach(btn => btn.classList.add('hidden'));

  if (modo === 'crear') {
    form.reset();
    setLecturaForm(form, false); // todos habilitados
    botones.crear.classList.remove('hidden');
    botones.cancelar.classList.remove('hidden');
    modal.querySelector('.modal__title').textContent = 'Crear Ambiente';
  }

  if (modo === 'editar') {
    setLecturaForm(form, true); // lectura
    botones.editar.classList.remove('hidden');
    botones.ver_mapa.classList.remove('hidden');
    botones.eliminar.classList.remove('hidden');
    botones.aceptar.classList.remove('hidden');
    modal.querySelector('.modal__title').textContent = 'Detalles del Ambiente';
  }

  if (modo === 'editar_activo') {
    setLecturaForm(form, false); // habilitar campos
    botones.guardar.classList.remove('hidden');
    botones.cancelar.classList.remove('hidden'); // cancelar edición
    modal.querySelector('.modal__title').textContent = 'Editar Ambiente';
  }
};


export const initModalAmbiente = async (modal) => {
  await llenarSelect({
    endpoint: 'centros',
    selector: '#centros',
    optionMapper: centro => ({ id: centro.id, text: centro.nombre })
  });

  const form = modal.querySelector('form');

  const mapaInput = form.querySelector('#mapa');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = e.submitter; // Este es el botón que disparó el submit
    const claseBoton = boton.classList;

    if (!validaciones.validarFormulario(e)) return;
    if (mapaInput.value.trim() !== "") {
      try {
        JSON.parse(mapaInput.value.trim());
      } catch (err) {
        validaciones.agregarError(mapaInput, "El mapa no contiene un JSON válido.");
        return; // Cancelar envío
      }
    }
    const confirmado = await mostrarConfirmacion();
    if (!confirmado) return;

    if (claseBoton.contains('crear')) {
      // Acción para crear
      await crearAmbiente(validaciones.datos);
      form.querySelectorAll('.form__control').forEach(input => {
        input.classList.remove('error');
      });
    } else if (claseBoton.contains('guardar')) {
      // Acción para editar
      await actualizarAmbiente(validaciones.datos);
      configurarModalAmbiente('editar', modal);
      const temp = JSON.parse(localStorage.getItem('ambiente_temp'));
      const btn = modal.querySelector('.ver-mapa');
      if (!temp.mapa) btn.classList.add('hidden');
    }
  });

  const campos = [...form];
  campos.forEach(campo => {
    if (campo.hasAttribute('required')) {
      campo.addEventListener("input", validaciones.validarCampo);
      campo.addEventListener("blur", validaciones.validarCampo);
    }

    if (campo.name == "nombre")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));
  });


  modal.addEventListener('click', async (e) => {

    if (e.target.closest('.editar')) {
      configurarModalAmbiente('editar_activo', modal);
      return;
    }

    if (e.target.closest('.cancelar')) {
      const estaEditando = modal.querySelector('.modal__title').textContent.includes('Editar');

      if (estaEditando) {
        const temp = JSON.parse(localStorage.getItem('ambiente_temp'));
        llenarCamposFormulario(temp, form); // Restaurar valores        
        configurarModalAmbiente('editar', modal);
        const btn = modal.querySelector('.ver-mapa');
        if (!temp.mapa) btn.classList.add('hidden');

      } else cerrarModal();

      form.querySelectorAll('.form__control').forEach(input => {
        input.classList.remove('error');
      });
    }

    if (e.target.closest('.aceptar')) {
      cerrarModal();
      form.reset();
      localStorage.removeItem('ambiente_temp');
    }


    if (e.target.closest('.ver-mapa')) {
      const temp = JSON.parse(localStorage.getItem('ambiente_temp'));
      if (temp.mapa) {
        window.location.hash = `#/super-admin/ambientes/mapa/ambiente_id=${temp.id}&nombre=${temp.nombre}`;
      }
      else {
        ocultarModalTemporal(modal);
        await info("Mapa del ambiente", "Este ambiente aún no tiene un mapa disponible");
        setTimeout(() => mostrarUltimoModal(), 100);
      }
    }

    if (e.target.closest('.eliminar')) {
      const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el ambiente?");
      if (!confirmado) return;
      const { id } = JSON.parse(localStorage.getItem('ambiente_temp'));
      const respuesta = await api.del('ambientes/' + id);

      if (respuesta.success) {
        cerrarModal();
        await success('Ambiente eliminado con éxito');
        removerFilar(document.querySelector('#dashboard-ambientes .table__body'), id);
      }
      else {
        ocultarModalTemporal(modal);
        await error(respuesta);
        setTimeout(async () => mostrarUltimoModal(), 100);
      }
      await actualizarStorageAmbientes();
      return;
    }
  });
};

const crearAmbiente = async (datos) => {
  const respuesta = await api.post('ambientes', datos)

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalAmbiente);
    await error(respuesta);
    setTimeout(async () => mostrarUltimoModal(), 100);
    return;
  }
  cerrarModal();
  setTimeout(async () => await success('Ambiente creado con éxito'), 100);
  const datosFormateados = await formatearAmbiente(respuesta.data);

  let ambientes = JSON.parse(localStorage.getItem('ambientes'))?.ambientes || [];

  ambientes.unshift(datosFormateados); // agrega al principio
  localStorage.setItem('ambientes', JSON.stringify({ ambientes }));

  const tbody = document.querySelector('#dashboard-ambientes .table__body');
  agregarFila(tbody, datosFormateados, ambienteClick);
}

const actualizarAmbiente = async (datos) => {
  const ambienteTemp = JSON.parse(localStorage.getItem('ambiente_temp'));
  const respuesta = await api.put('ambientes/' + ambienteTemp.id, {
    ...datos,
  });

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalAmbiente);
    await error(respuesta);
    setTimeout(async () => mostrarUltimoModal(), 100);
    return;
  }
  configurarModalAmbiente('editar', modales.modalAmbiente);

  localStorage.setItem('ambiente_temp', JSON.stringify(respuesta.data));

  const datosFormateados = await formatearAmbiente(respuesta.data);

  const tbody = document.querySelector('#dashboard-ambientes .table__body');
  reemplazarFila(tbody, datosFormateados, ambienteClick);
  await actualizarStorageAmbientes();
};