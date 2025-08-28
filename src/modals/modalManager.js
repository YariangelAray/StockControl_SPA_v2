export default async (modal) => {

  const modalAbierto = document.getElementById('app-modal');

  if (modalAbierto && modal.mismoModal) {
    modal.controlador(modalAbierto)
  }
  if (modalAbierto && !modal.mismoModal) {
    // cerrar modal, abrir modal
  }

  if (!modalAbierto) {
    const modalCargado = await cargarModal(modal.nombre);
    modal.controlador(modalCargado);
    modalCargado.showModal();
    requestAnimationFrame(() => modalCargado.classList.add('visible'));
  }
}

const cargarModal = async (modalNombre) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = await (await fetch(`./src/modals/html/${modalNombre}.html`)).text();
  const modal = tempDiv.querySelector('dialog');

  document.body.appendChild(modal);
  return modal;
}