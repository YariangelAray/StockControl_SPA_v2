import { agregarFila } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { cerrarModal, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { error, success } from "../../../../utils/alertas";
import { post } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import * as validaciones from '../../../../utils/Validaciones';
import { ambienteClick, formatearAmbiente } from "../ambiente";


export default async (modal) => {

  await llenarSelect({
    endpoint: 'centros',
    selector: '#centros',
    optionMapper: centro => ({ id: centro.id, text: centro.nombre })
  });

  let botones = modal.querySelectorAll('.button');
  botones = [...botones].filter(btn => btn.classList.contains('crear'))

  const permisos = getCookie('permisos');  
  botones.forEach(btn => {
    console.log(btn)
    console.log(!hasPermisos(btn.dataset.permiso, permisos))
  });

  modal.querySelector('.modal__title').textContent = 'Crear Ambiente';

  const form = modal.querySelector('form');
  const mapaInput = form.querySelector('#mapa');

  const campos = [...form];
  campos.forEach(campo => {
    if (campo.hasAttribute('required')) {
      campo.addEventListener("input", validaciones.validarCampo);
      campo.addEventListener("blur", validaciones.validarCampo);
    }

    if (campo.name == "nombre")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = e.submitter; // Este es el botón que disparó el submit

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

    const respuesta = await post('ambientes', validaciones.datos)
    if (!respuesta.success) {
      ocultarModal(modal);
      await error(respuesta);
      setTimeout(async () => mostrarModal(modal), 100);
      return;
    }
    cerrarModal(modal);
    setTimeout(async () => await success('Ambiente creado con éxito'), 100);
    const datosFormateados = await formatearAmbiente(respuesta.data);

    let ambientes = JSON.parse(localStorage.getItem('ambientes'))?.ambientes || [];
    ambientes.unshift(datosFormateados);
    localStorage.setItem('ambientes', JSON.stringify({ ambientes }));

    const tbody = document.querySelector('#dashboard-ambientes .table__body');
    agregarFila(tbody, datosFormateados, ambienteClick);

  });
}