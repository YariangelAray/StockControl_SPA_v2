export const mostrarModal = (modal) => {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal__backdrop';
  document.body.appendChild(backdrop);

  requestAnimationFrame(() => {
    modal.classList.add('visible');
    backdrop.classList.add('visible');
  });
};

export const ocultarModal = (modal) => {
  const backdrop = document.querySelector('.modal__backdrop');
  modal.classList.remove('visible');
  backdrop?.classList.remove('visible');
};

export const cerrarModal = (modal) => {
  return new Promise(resolve => {
    const backdrop = document.querySelector('.modal__backdrop');
    backdrop?.classList.remove('visible');
    modal.classList.remove('visible');

    modal.addEventListener('transitionend', () => {
      modal.remove();
      backdrop?.remove();
      resolve();
    }, { once: true });
  });
};

export const cargarModal = async (modalNombre) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = await (await fetch(`./src/modals/html/${modalNombre}.html`)).text();
  const modal = tempDiv.querySelector('.modal');
  document.body.appendChild(modal);
  return modal;
};

export const mostrarConfirmacion = async (mensaje = '¿Está seguro de continuar?') => {
  const modalConfirmacion = await cargarModal('modalConfirmacion');
  const mensajeSpan = modalConfirmacion.querySelector('.modal__mensaje');
  mensajeSpan.textContent = mensaje;

  const btnSi = modalConfirmacion.querySelector('.si');
  const btnNo = modalConfirmacion.querySelector('.no');

  // Backdrop exclusivo para confirmación
  const backdrop = document.createElement('div');
  backdrop.className = 'modal__backdrop--confirmacion';
  document.body.appendChild(backdrop);
  document.body.appendChild(modalConfirmacion);

  requestAnimationFrame(() => {
    backdrop.classList.add('visible');
    modalConfirmacion.classList.add('visible');
  });

  return new Promise((resolve) => {
    const resolver = (valor) => {
      modalConfirmacion.classList.remove('visible');
      backdrop.classList.remove('visible');

      modalConfirmacion.addEventListener('transitionend', () => {
        modalConfirmacion.remove();
        backdrop.remove();
        resolve(valor);
      }, { once: true });
    };

    modalConfirmacion.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') resolver(false);
    });

    btnSi.onclick = () => resolver(true);
    btnNo.onclick = () => resolver(false);
  });
};
