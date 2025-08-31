import { ocultarModal, cerrarModal, mostrarModal, cargarModal } from "../../../../modals/modalsController";
import modalManager from "../../../../modals/modalManager";
import { llenarSelect } from "../../../../helpers/select";

import tipoElemento from '../../../compartidas/tipos-elementos/tipos-elementos'
import crearElemento from './crear'
import editarElemento from './editar'


export const gestionarTipoElemento = async (modalElemento, modo, datosPrevios = {}) => {
  ocultarModal(modalElemento);
  const modalTipo = await cargarModal("modalTipoElemento");

  await tipoElemento.crear(modalTipo, { evitarRedireccion: true });
  mostrarModal(modalTipo);

  // Escuchar el evento 'close' ANTES de cerrar el modal
  modalTipo.addEventListener('close', async () => {
    mostrarModal(modalElemento);

    // Reejecutar controlador si quieres refrescar datos
    if (modo === 'crear') {
      // await crearElemento(modalElemento, datosPrevios);
    } else if (modo === 'editar') {
      // await editarElemento(modalElemento, datosPrevios);
    }
  }, { once: true });

  modalTipo.addEventListener('click', async (e) => {
    if (e.target.matches('.cancelar, .aceptar')) {
      cerrarModal(modalTipo);
      // No agregues aquí el listener 'close' porque ya está arriba
    }
  });
};



export const tipoElementoCreado = async (e) => {
  const nuevoTipo = e.detail;

  const modalElemento = document.getElementById('app-modal');
  const selectTipo = modalElemento.querySelector('#tipos-elementos');
  const btnAgregarTipo = modalElemento.querySelector('#agregarTipo');

  reiniciarSelectTipo(selectTipo);

  await llenarSelect({
    endpoint: 'tipos-elementos',
    selector: '#tipos-elementos',
    optionMapper: tipo => ({
      id: tipo.id,
      text: `${tipo.consecutivo}: ${tipo.nombre}. Marca: ${(tipo.marca ?? "No Aplica")}. Modelo: ${(tipo.modelo ?? "No Aplica")}.`
    })
  });

  selectTipo.value = nuevoTipo.id;
  btnAgregarTipo.classList.add('hidden');
}

export const reiniciarSelectTipo = (select) => {
  select.innerHTML = "";
  const placeHolder = document.createElement('option');
  placeHolder.value = "";
  placeHolder.textContent = "Seleccione el tipo de elemento";
  placeHolder.disabled = true;
  placeHolder.selected = true;

  const option = document.createElement('option');
  option.value = "otro";
  option.textContent = "Otro";

  select.append(placeHolder, option);
};
