/**
 * Muestra un modal agregando el backdrop y aplicando animaciones de entrada
 * 
 * @param {HTMLElement} modal - Elemento del modal a mostrar
 */
export const mostrarModal = (modal) => {
  // Crea el elemento backdrop para oscurecer el fondo
  const backdrop = document.createElement('div');
  backdrop.className = 'modal__backdrop';
  document.body.appendChild(backdrop);

  // Usa requestAnimationFrame para asegurar que las clases se apliquen correctamente
  requestAnimationFrame(() => {
    // Aplica la clase visible para activar las animaciones CSS
    modal.classList.add('visible');
    backdrop.classList.add('visible');
  });
};

/**
 * Oculta un modal removiendo las clases de visibilidad
 * 
 * @param {HTMLElement} modal - Elemento del modal a ocultar
 */
export const ocultarModal = (modal) => {
  // Busca el backdrop existente en el DOM
  const backdrop = document.querySelector('.modal__backdrop');
  
  // Remueve las clases de visibilidad para activar animaciones de salida
  modal.classList.remove('visible');
  backdrop?.classList.remove('visible');
};

/**
 * Cierra un modal completamente removiéndolo del DOM después de la animación
 * 
 * @param {HTMLElement} modal - Elemento del modal a cerrar
 * @returns {Promise<void>} Promesa que se resuelve cuando el modal se ha cerrado completamente
 */
export const cerrarModal = (modal) => {
  return new Promise(resolve => {
    // Busca el backdrop para removerlo también
    const backdrop = document.querySelector('.modal__backdrop');
    
    // Inicia las animaciones de salida
    backdrop?.classList.remove('visible');
    modal.classList.remove('visible');

    // Espera a que termine la transición CSS antes de remover del DOM
    modal.addEventListener('transitionend', () => {
      // Remueve completamente los elementos del DOM
      modal.remove();
      backdrop?.remove();
      // Resuelve la promesa indicando que el cierre está completo
      resolve();
    }, { once: true }); // Se ejecuta solo una vez
  });
};

/**
 * Carga un modal desde un archivo HTML externo
 * 
 * @param {string} modalNombre - Nombre del archivo del modal (sin extensión)
 * @returns {Promise<HTMLElement>} Promesa que retorna el elemento modal cargado
 */
export const cargarModal = async (modalNombre) => {
  // Crea un contenedor temporal para parsear el HTML
  const tempDiv = document.createElement('div');
  
  // Carga el contenido HTML del modal desde el archivo
  tempDiv.innerHTML = await (await fetch(`./src/modals/html/${modalNombre}.html`)).text();
  
  // Extrae el elemento modal del HTML cargado
  const modal = tempDiv.querySelector('.modal');
  
  // Agrega el modal al DOM
  document.body.appendChild(modal);
  
  // Retorna el elemento modal para su uso
  return modal;
};

/**
 * Muestra un modal de confirmación con mensaje personalizable
 * 
 * @param {string} mensaje - Mensaje a mostrar en el modal (default: '¿Está seguro de continuar?')
 * @returns {Promise<boolean>} Promesa que retorna true si confirma, false si cancela
 */
export const mostrarConfirmacion = async (mensaje = '¿Está seguro de continuar?') => {
  // Carga el modal de confirmación desde archivo HTML
  const modalConfirmacion = await cargarModal('modalConfirmacion');
  
  // Busca el elemento donde se mostrará el mensaje
  const mensajeSpan = modalConfirmacion.querySelector('.modal__mensaje');
  mensajeSpan.textContent = mensaje;

  // Obtiene referencias a los botones de confirmación
  const btnSi = modalConfirmacion.querySelector('.si');
  const btnNo = modalConfirmacion.querySelector('.no');

  // Crea backdrop específico para modal de confirmación
  const backdrop = document.createElement('div');
  backdrop.className = 'modal__backdrop--confirmacion';
  document.body.appendChild(backdrop);
  document.body.appendChild(modalConfirmacion);

  // Aplica animaciones de entrada
  requestAnimationFrame(() => {
    backdrop.classList.add('visible');
    modalConfirmacion.classList.add('visible');
  });

  // Retorna promesa que maneja la respuesta del usuario
  return new Promise((resolve) => {
    // Función helper para resolver y cerrar el modal
    const resolver = (valor) => {
      // Inicia animaciones de salida
      modalConfirmacion.classList.remove('visible');
      backdrop.classList.remove('visible');

      // Espera a que termine la transición antes de limpiar
      modalConfirmacion.addEventListener('transitionend', () => {
        // Remueve elementos del DOM
        modalConfirmacion.remove();
        backdrop.remove();
        // Resuelve la promesa con el valor seleccionado
        resolve(valor);
      }, { once: true });
    };

    // Maneja tecla Enter como cancelar (false)
    modalConfirmacion.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') resolver(false);
    });

    // Asigna eventos a los botones
    btnSi.onclick = () => resolver(true);  // Confirmar
    btnNo.onclick = () => resolver(false); // Cancelar
  });
};