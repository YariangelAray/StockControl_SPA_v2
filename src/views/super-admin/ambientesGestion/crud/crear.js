import { agregarFila, esResponsive } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { cerrarModal, mostrarConfirmacion, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { post } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import obtenerHashBase from "../../../../helpers/obtenerHashBase";

import * as validaciones from '../../../../utils/Validaciones';
import { ambienteClick, formatearAmbiente } from "../ambiente";

export default async (modal) => {

  document.title = "Ambientes - Crear"
  modal.dataset.modo = 'crear';

  if (!modal.dataset.inicializado) {
    await llenarSelect({
      endpoint: 'centros',
      selector: '#centros',
      optionMapper: centro => ({ id: centro.id, text: centro.nombre })
    });
    modal.dataset.inicializado = "true";
  }

  // botones que deben estar visibles en este flujo
  const botonesVisibles = ['.crear', '.cancelar'];
  // ocultar todos los botones primero
  modal.querySelectorAll('.modal__actions .button').forEach(btn => {
    btn.style.display = 'none';
  });

  // mostrar solo los de esta vista
  botonesVisibles.forEach(selector => {
    const btn = modal.querySelector(selector);
    if (btn) btn.style.display = '';
  });


  // aplicar permisos sobre los visibles
  const permisos = getCookie('permisos', []);

  modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
    const requeridos = btn.dataset.permiso.split(',').map(p => p.trim());
    const tienePermiso = requeridos.some(p => hasPermisos(p, permisos));

    if (!tienePermiso) {
      btn.remove();
    }
  });


  modal.querySelector('.modal__title').textContent = 'Crear Ambiente';

  // inicializar validaciones
  const form = modal.querySelector('form');
  const mapaInput = form.querySelector('#mapa');

  [...form].forEach(campo => {
    if (campo.hasAttribute('required')) {
      campo.addEventListener("input", validaciones.validarCampo);
      campo.addEventListener("blur", validaciones.validarCampo);
    }
    if (campo.name === "nombre") {
      campo.addEventListener("keydown", e => validaciones.validarLimite(e, 50));
      campo.addEventListener("keydown", validaciones.validarTexto);
    }
  });

  form.onsubmit = async (e) => {
    e.preventDefault();

    if (!validaciones.validarFormulario(e)) return;

    if (mapaInput.value.trim() !== "") {
      try {
        JSON.parse(mapaInput.value.trim());
      } catch {
        validaciones.agregarError(mapaInput, "El mapa no contiene un JSON válido.");
        return;
      }
    }

    const confirmado = await mostrarConfirmacion();
    if (!confirmado) return;

    const respuesta = await post('ambientes', validaciones.datos);
    if (!respuesta.success) {
      // ocultarModal(modal);
      errorToast(respuesta);
      // setTimeout(() => mostrarModal(modal), 100);
      return;
    }

    cerrarModal(modal);
    setTimeout(async () => successToast('Ambiente creado con éxito'), 100);
    location.hash = obtenerHashBase();

    const datosFormateados = formatearAmbiente(respuesta.data);

    // actualizar cache y tabla
    let ambientes = JSON.parse(localStorage.getItem('ambientes'))?.ambientes || [];
    ambientes.unshift(datosFormateados);
    localStorage.setItem('ambientes', JSON.stringify({ ambientes }));

    const contenedor = esResponsive() ? document.querySelector('#dashboard-ambientes .acordeon') : document.querySelector('#dashboard-ambientes .table__body');
    agregarFila(contenedor, datosFormateados, ambienteClick);
  };
};
