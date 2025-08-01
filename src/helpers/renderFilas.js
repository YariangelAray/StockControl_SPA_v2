// Crea una fila de tabla a partir de un registro y un callback
export const crearFila = (registro, callbackClick) => {  
  
  const fila = document.createElement('tr');
  fila.classList.add('table__row');
  fila.dataset.id = registro[0];

  registro.forEach((dato, index) => {
    if (typeof dato === "boolean" || index === 0) return;
    const td = document.createElement('td');
    td.className = 'table__cell text-details';
    td.textContent = dato ?? 'No Aplica';
    fila.appendChild(td);
  });  
    
  const estadoActivo = typeof registro[registro.length - 1] === "boolean" ? !registro[registro.length - 1] : false;
  if (estadoActivo) fila.classList.add('table__row--red');

  fila.addEventListener('click', () => callbackClick(fila.dataset.id));

  return fila;
};

// Reemplaza el contenido del tbody con todas las filas generadas
export const renderFilas = (registros, callbackClick) => {
  const tbody = document.querySelector('.table__body');
  tbody.innerHTML = '';

  if (!registros || registros.length === 0) {
    const texto = document.createElement('p');
    texto.classList.add('text-floating')
    texto.textContent = 'No se encontraron registros';
    tbody.appendChild(texto);
    return;
  }

  registros.forEach(registro => {
    const fila = crearFila(registro, callbackClick);
    tbody.appendChild(fila);
  });
};

// Agrega una nueva fila al inicio de la tabla
export const agregarFila = (tbody, registro, callbackClick) => {
  if (!tbody) return;
  const fila = crearFila(registro, callbackClick);
  tbody.insertAdjacentElement('afterbegin', fila);
};

// Reemplaza una fila existente manteniendo su posición
export const reemplazarFila = (tbody, registro, callbackClick) => {
  if (!tbody) return;  
  const filaAnterior = tbody.querySelector(`tr[data-id="${registro[0]}"]`);
  if (!filaAnterior) return;

  const nuevaFila = crearFila(registro, callbackClick);
  tbody.replaceChild(nuevaFila, filaAnterior);
};

export const removerFilar = (tbody, id) => {
  if (!tbody) return;
  const fila = tbody.querySelector(`tr[data-id="${id}"]`);
  fila.remove();
}