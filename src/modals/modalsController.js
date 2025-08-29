export let modales = {};

export const initModales = async (modalesUsar) => {

  for (const modalNombre of modalesUsar) {

    if (modales[modalNombre]) continue;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = await (await fetch(`./src/modals/html/${modalNombre}.html`)).text();
    const modal = tempDiv.querySelector('dialog');

    document.body.appendChild(modal);
    modales[modalNombre] = modal;
  }
};

const modalStack = [];

export const abrirModal = (modal) => {
  if (!modalStack.includes(modal)) {
    modalStack.push(modal);
  }
  modal.showModal();
  requestAnimationFrame(() => modal.classList.add('visible'));
};

export const mostrarUltimoModal = () => {
  const modal = modalStack.at(-1);
  modal.showModal();
  requestAnimationFrame(() => modal.classList.add('visible'));
}

export const ocultarModalTemporal = (modal) => {
  modal.classList.remove('visible');
  setTimeout(() => modal.close(), 300);
};

export const ocultarModal = (modal) => { // este
  modal.classList.remove('visible');
  setTimeout(() => modal.close(), 300);
};
export const mostrarModal = (modal) => { // este
  modal.showModal();
  requestAnimationFrame(() => modal.classList.add('visible'));
}

export const cerrarModal = (modal) => { // este
  if (modal.id == 'app-modal') {
    modal.dataset.inicializado = "";
    modal.dataset.modo = "";
  }
  modal.classList.remove('visible');
  modal.addEventListener('transitionend', () => {
    modal.close();
    modal.remove();
  }, { once: true });
};


export const cargarModal = async (modalNombre) => { // este
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = await (await fetch(`./src/modals/html/${modalNombre}.html`)).text();
  const modal = tempDiv.querySelector('dialog');
  document.body.appendChild(modal);
  return modal;
};



// export const cerrarModal = (modal) => {
//   modal.classList.remove('visible');
//   // setTimeout(() => modal.close(), 300);
//   requestAnimationFrame(() => modal.remove());
//   // modal.remove()
// }

// export const cerrarModal = () => {
//     const modal = modalStack.pop();
//     if (!modal) return;

//     modal.classList.remove('visible');
//     setTimeout(() => modal.close(), 300);
//     const anterior = modalStack.at(-1);
//     if (anterior) abrirModal(anterior);
// }


export const mostrarConfirmacion = async (mensaje = '¿Está seguro de continuar?') => { // este

  const modalConfirmacion = await cargarModal('modalConfirmacion');
  
  const mensajeSpan = modalConfirmacion.querySelector('.modal__mensaje');
  mensajeSpan.textContent = mensaje;

  const btnSi = modalConfirmacion.querySelector('.si');
  const btnNo = modalConfirmacion.querySelector('.no');

  modalConfirmacion.showModal();
  requestAnimationFrame(() => modalConfirmacion.classList.add('visible'));

  return new Promise((resolve) => {
    const resolver = (valor) => {
      modalConfirmacion.classList.remove('visible');
      setTimeout(() => {
        modalConfirmacion.close();
        modalConfirmacion.remove();
        modales.modalConfirmacion = null;
        resolve(valor);
      }, 300);
    }

    modalConfirmacion.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') resolver(false);
    });

    btnSi.onclick = () => resolver(true);
    btnNo.onclick = () => resolver(false);
  });
};

export const cerrarTodo = () => {
  while (modalStack.length > 0) {
    const modal = modalStack.pop();
    modal.classList.remove('visible');
    setTimeout(() => modal.close(), 400);
  }
};

export const limpiarModales = () => {
  document.querySelectorAll('.modal').forEach(m => m.remove());
  modales = {};
};
