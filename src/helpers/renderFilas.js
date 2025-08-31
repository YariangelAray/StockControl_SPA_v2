export const crearFila = (registro, callbackClick) => {
  if (!registro || registro.length === 0) return null;

  if (!esResponsive()) {
    // === Desktop: fila tabla ===
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
    if (estadoActivo) fila.classList.add('row--red');

    fila.addEventListener('click', () => callbackClick(fila.dataset.id));

    return fila;
  } else {
    // === Responsive: acordeón ===
    // registro es arreglo de objetos { name, value }
    const contenedor = document.createElement('div');
    contenedor.classList.add('acordeon__item');
    contenedor.dataset.id = registro[0]?.value ?? registro[0]; // si el id viene en objeto o string

    // Botón cabecera con las dos primeras columnas (después del id)
    const botonCabecera = document.createElement('button');
    botonCabecera.type = 'button';
    botonCabecera.classList.add('acordeon__header');

    // Tomamos las dos primeras columnas (índices 1 y 2)
    const col1 = registro[1];
    const col2 = registro[2];

    const spanPrincipal = document.createElement('span');
    spanPrincipal.classList.add('acordeon__columna-principal');
    spanPrincipal.textContent = col1?.value ?? 'No Aplica';

    const spanSecundaria = document.createElement('span');
    spanSecundaria.classList.add('acordeon__columna-secundaria');
    spanSecundaria.textContent = col2?.value ?? 'No Aplica';

    const infoWrapper = document.createElement('div');
    infoWrapper.classList.add('info');
    infoWrapper.appendChild(spanPrincipal);
    infoWrapper.appendChild(spanSecundaria);

    botonCabecera.appendChild(infoWrapper);    

    const icon = document.createElement('i');
    icon.classList.add('ri-arrow-down-s-line', 'icon');
    botonCabecera.appendChild(icon);

    contenedor.appendChild(botonCabecera);

    // Contenedor detalles con el resto de columnas (excepto id, col1 y col2)
    const detalles = document.createElement('div');
    detalles.classList.add('acordeon__content');

    
    registro.forEach((obj, index) => {      
      if (index === 0 || index === 1 || index === 2) return;
      if (typeof obj.value === "boolean") return; // ignorar booleanos si quieres

      const div = document.createElement('div');
      div.classList.add('acordeon__detalle');
      div.innerHTML = `<p class="text-details">${obj.name}:</p> <p class="text-details text-details--bold">${obj.value ?? 'No Aplica'}</p>`;
      detalles.appendChild(div);
    });

    // Botón "Ver más detalles"
    const btnDetalles = document.createElement('button');
    btnDetalles.type = 'button';
    btnDetalles.classList.add('button');
    btnDetalles.textContent = 'Ver más detalles';

    detalles.appendChild(btnDetalles);
    contenedor.appendChild(detalles);

    // Eventos
    botonCabecera.addEventListener('click', () => {
      contenedor.classList.toggle('activo');
    });

    btnDetalles.addEventListener('click', () => {
      callbackClick(contenedor.dataset.id);
    });

    // Color rojo si el último valor booleano es false (igual que en tabla)
    const ultimo = registro[registro.length - 1];
    const estadoActivo = typeof (ultimo.value ?? ultimo) === "boolean" ? !(ultimo.value ?? ultimo) : false;
    if (estadoActivo) contenedor.classList.add('row--red');

    return contenedor;
  }
};

export const renderFilas = (registros, callbackClick, acordeonContenedor, tbody) => {

  if (!acordeonContenedor && !tbody) return;

  if (!registros || registros.length === 0) {
    const texto = document.createElement('p');
    texto.classList.add('text-floating');
    texto.textContent = 'No se encontraron registros';

    if (esResponsive()) {
      acordeonContenedor.innerHTML = '';
      acordeonContenedor.appendChild(texto);
      tbody.innerHTML = '';
    } else {
      tbody.innerHTML = '';
      tbody.appendChild(texto);
      acordeonContenedor.innerHTML = '';
    }
    return;
  }

  if (esResponsive()) {
    acordeonContenedor.innerHTML = '';
    tbody.innerHTML = '';
    registros.forEach(registro => {
      const fila = crearFila(registro, callbackClick);
      if (fila) acordeonContenedor.appendChild(fila);
    });
  } else {
    tbody.innerHTML = '';
    acordeonContenedor.innerHTML = '';
    registros.forEach(registro => {
      const fila = crearFila(registro, callbackClick);
      if (fila) tbody.appendChild(fila);
    });
  }
};

export const agregarFila = (contenedor, registro, callbackClick) => {
  if (!contenedor) return;
  const fila = crearFila(registro, callbackClick);
  if (!fila) return;

  if (esResponsive()) {
    contenedor.insertAdjacentElement('afterbegin', fila);
  } else {
    contenedor.insertAdjacentElement('afterbegin', fila);
  }
};

export const reemplazarFila = (contenedor, registro, callbackClick) => {
  if (!contenedor) return;

  let selector;
  if (esResponsive()) {
    selector = `.acordeon__item[data-id="${registro[0]?.value ?? registro[0]}"]`;
  } else {
    selector = `tr[data-id="${registro[0]}"]`;
  }

  const filaAnterior = contenedor.querySelector(selector);
  if (!filaAnterior) return;

  const nuevaFila = crearFila(registro, callbackClick);
  if (!nuevaFila) return;

  contenedor.replaceChild(nuevaFila, filaAnterior);
};

export const removerFilar = (contenedor, id) => {
  if (!contenedor) return;

  let selector;
  if (esResponsive()) {
    selector = `.acordeon__item[data-id="${id}"]`;
  } else {
    selector = `tr[data-id="${id}"]`;
  }

  const fila = contenedor.querySelector(selector);
  if (fila) fila.remove();
};


export const esResponsive = () => window.innerWidth <= 900;