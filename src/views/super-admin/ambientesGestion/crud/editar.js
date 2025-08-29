import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { reemplazarFila } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { mostrarConfirmacion } from "../../../../modals/modalsController";
import { error, success } from "../../../../utils/alertas";
import { get, put } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import * as validaciones from '../../../../utils/Validaciones';
import { actualizarStorageAmbientes, ambienteClick, formatearAmbiente } from "../ambiente";

import detalles from "./detalles";


export default async (modal, parametros) => {
  document.title = "Ambientes - Editar: " + parametros.id;
  modal.dataset.modo = 'editar';

  if (!modal.dataset.inicializado) {
    await llenarSelect({
      endpoint: 'centros',
      selector: '#centros',
      optionMapper: centro => ({ id: centro.id, text: centro.nombre })
    });
    modal.dataset.inicializado = "true";
  }

  modal.querySelector('.modal__title').textContent = 'Editar Ambiente';

  const { data } = await get('ambientes/' + parametros.id);

  const form = modal.querySelector('form');
  llenarCamposFormulario(data, form);
  setLecturaForm(form, false); // lectura

  const botonesVisibles = ['.guardar', '.cancelar'];

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
  ('permisos');
  modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
    if (!hasPermisos(btn.dataset.permiso, permisos)) {
      btn.remove();
    }
  });


  const mapaInput = form.querySelector('#mapa');

  [...form].forEach(campo => {
    if (campo.hasAttribute('required')) {
      campo.addEventListener("input", validaciones.validarCampo);
      campo.addEventListener("blur", validaciones.validarCampo);
    }
    if (campo.name === "nombre") {
      campo.addEventListener("keydown", e => validaciones.validarLimite(e, 50));
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

    const respuesta = await put('ambientes/' + parametros.id, validaciones.datos);
    if (!respuesta.success) {
      // ocultarModal(modal);
      error(respuesta);
      // setTimeout(() => mostrarModal(modal), 100);
      return;
    }

    success('Ambiente actualizado con éxito');
    // cerrarModal(modal);
    // modal.dataset.modo = 'detalles'; // para que modalManager no lo cierre
    // await detalles(modal, parametros); // reutiliza la lógica
    location.hash = "#/super-admin/ambientes/detalles/id=" + parametros.id;

    const datosFormateados = await formatearAmbiente(respuesta.data);

    const tbody = document.querySelector('#dashboard-ambientes .table__body');
    reemplazarFila(tbody, datosFormateados, ambienteClick);
    await actualizarStorageAmbientes();
  };

  const cancelarBtn = modal.querySelector('.cancelar');


  asignarEvento(cancelarBtn, 'click', async () => {
      form.querySelectorAll('.form__control').forEach(input => {
          input.classList.remove('error');
      });
      // await detalles(modal, parametros); // reutiliza la lógica
      location.hash = '#/super-admin/ambientes/detalles/id=' + parametros.id;
      // modal.dataset.modo = 'detalles'; // para que modalManager no lo cierre
    });


  // modal.addEventListener('click', async (e) => {
  //   if (e.target.closest('.cancelar')) {
  //     form.querySelectorAll('.form__control').forEach(input => {
  //       input.classList.remove('error');
  //     });
  //     modal.dataset.modo = 'detalles'; // para que modalManager no lo cierre
  //     await detalles(modal, parametros); // reutiliza la lógica
  //     location.hash = '#/super-admin/ambientes/detalles/id=' + parametros.id;
  //   }
  // })
}