/**
 * Crea una fila de tabla o elemento de acordeón según el tamaño de pantalla
 * Maneja tanto vista desktop (tabla) como responsive (acordeón)
 * 
 * @param {Array} registro - Array con datos del registro. Para desktop: valores simples. Para responsive: objetos {name, value}
 * @param {Function} callbackClick - Función callback a ejecutar cuando se hace click en la fila
 * @returns {HTMLElement|null} Elemento fila (tr) o acordeón (div), null si no hay datos
 */
export const crearFila = (registro, callbackClick) => {
  // Valida que existan datos para procesar
  if (!registro || registro.length === 0) return null;

  if (!esResponsive()) {
    // === VISTA DESKTOP: FILA DE TABLA ===
    const fila = document.createElement('tr');
    fila.classList.add('table__row');
    // Usa el primer elemento como ID (índice 0)
    fila.dataset.id = registro[0];

    // Crea celdas para cada dato (excepto ID y booleanos)
    registro.forEach((dato, index) => {
      // Omite el ID (índice 0) y valores booleanos
      if (typeof dato === "boolean" || index === 0) return;
      
      const td = document.createElement('td');
      td.className = 'table__cell text-details';
      td.textContent = dato ?? 'No Aplica';
      fila.appendChild(td);
    });

    // Aplica estilo especial si el último valor booleano es false (inactivo)
    const estadoActivo = typeof registro[registro.length - 1] === "boolean" ? !registro[registro.length - 1] : false;
    if (estadoActivo) fila.classList.add('row--red');

    // Asigna evento click con el ID del registro
    fila.addEventListener('click', () => callbackClick(fila.dataset.id));

    return fila;
  } else {
    // === VISTA RESPONSIVE: ELEMENTO ACORDEÓN ===
    const contenedor = document.createElement('div');
    contenedor.classList.add('acordeon__item');
    // Extrae ID desde objeto o valor directo
    contenedor.dataset.id = registro[0]?.value ?? registro[0];

    // === CABECERA DEL ACORDEÓN ===
    const botonCabecera = document.createElement('button');
    botonCabecera.type = 'button';
    botonCabecera.classList.add('acordeon__header');

    // Usa las dos primeras columnas después del ID para la cabecera
    const col1 = registro[1];
    const col2 = registro[2];

    // Columna principal (más prominente)
    const spanPrincipal = document.createElement('span');
    spanPrincipal.classList.add('acordeon__columna-principal');
    spanPrincipal.textContent = col1?.value ?? 'No Aplica';

    // Columna secundaria 
    const spanSecundaria = document.createElement('span');
    spanSecundaria.classList.add('acordeon__columna-secundaria');
    spanSecundaria.textContent = col2?.value ?? 'No Aplica';

    // Wrapper para las columnas de información
    const infoWrapper = document.createElement('div');
    infoWrapper.classList.add('info');
    infoWrapper.appendChild(spanPrincipal);
    infoWrapper.appendChild(spanSecundaria);

    botonCabecera.appendChild(infoWrapper);    

    // Icono de expansión
    const icon = document.createElement('i');
    icon.classList.add('ri-arrow-down-s-line', 'icon');
    botonCabecera.appendChild(icon);

    contenedor.appendChild(botonCabecera);

    // === CONTENIDO EXPANDIBLE DEL ACORDEÓN ===
    const detalles = document.createElement('div');
    detalles.classList.add('acordeon__content');

    // Crea filas de detalles para columnas restantes (después de ID, col1, col2)
    registro.forEach((obj, index) => {      
      // Omite ID y las dos primeras columnas ya mostradas en cabecera
      if (index === 0 || index === 1 || index === 2) return;
      // Ignora valores booleanos de estado
      if (typeof obj.value === "boolean") return;

      const div = document.createElement('div');
      div.classList.add('acordeon__detalle');
      div.innerHTML = `<p class="text-details">${obj.name}:</p> <p class="text-details text-details--bold">${obj.value ?? 'No Aplica'}</p>`;
      detalles.appendChild(div);
    });

    // Botón de acción para ver más detalles
    const btnDetalles = document.createElement('button');
    btnDetalles.type = 'button';
    btnDetalles.classList.add('button');
    btnDetalles.textContent = 'Ver más detalles';

    detalles.appendChild(btnDetalles);
    contenedor.appendChild(detalles);

    // === EVENTOS DEL ACORDEÓN ===
    // Toggle de expansión al hacer click en cabecera
    botonCabecera.addEventListener('click', () => {
      contenedor.classList.toggle('activo');
    });

    // Callback de acción al hacer click en botón de detalles
    btnDetalles.addEventListener('click', () => {
      callbackClick(contenedor.dataset.id);
    });

    // Aplica estilo especial si está inactivo (mismo lógica que desktop)
    const ultimo = registro[registro.length - 1];
    const estadoActivo = typeof (ultimo.value ?? ultimo) === "boolean" ? !(ultimo.value ?? ultimo) : false;
    if (estadoActivo) contenedor.classList.add('row--red');

    return contenedor;
  }
};

/**
 * Renderiza múltiples filas en los contenedores apropiados según el viewport
 * Limpia contenedores previos y maneja estado sin datos
 * 
 * @param {Array} registros - Array de registros para renderizar
 * @param {Function} callbackClick - Función callback para clicks en filas
 * @param {HTMLElement} acordeonContenedor - Contenedor para vista responsive
 * @param {HTMLElement} tbody - Contenedor tbody para vista desktop
 */
export const renderFilas = (registros, callbackClick, acordeonContenedor, tbody) => {
  // Valida que al menos uno de los contenedores exista
  if (!acordeonContenedor && !tbody) return;

  // === MANEJO DE ESTADO SIN DATOS ===
  if (!registros || registros.length === 0) {
    const texto = document.createElement('p');
    texto.classList.add('text-floating');
    texto.textContent = 'No se encontraron registros';

    if (esResponsive()) {
      // Limpia acordeón y muestra mensaje, limpia tabla
      acordeonContenedor.innerHTML = '';
      acordeonContenedor.appendChild(texto);
      tbody.innerHTML = '';
    } else {
      // Limpia tabla y muestra mensaje, limpia acordeón
      tbody.innerHTML = '';
      tbody.appendChild(texto);
      acordeonContenedor.innerHTML = '';
    }
    return;
  }

  // === RENDERIZADO SEGÚN VIEWPORT ===
  if (esResponsive()) {
    // Vista responsive: usa acordeón
    acordeonContenedor.innerHTML = '';
    tbody.innerHTML = '';
    registros.forEach(registro => {
      const fila = crearFila(registro, callbackClick);
      if (fila) acordeonContenedor.appendChild(fila);
    });
  } else {
    // Vista desktop: usa tabla
    tbody.innerHTML = '';
    acordeonContenedor.innerHTML = '';
    registros.forEach(registro => {
      const fila = crearFila(registro, callbackClick);
      if (fila) tbody.appendChild(fila);
    });
  }
};

/**
 * Agrega una nueva fila al inicio del contenedor correspondiente
 * 
 * @param {HTMLElement} contenedor - Contenedor donde agregar la fila (tbody o acordeón)
 * @param {Array} registro - Datos del registro a agregar
 * @param {Function} callbackClick - Función callback para el click
 */
export const agregarFila = (contenedor, registro, callbackClick) => {
  if (!contenedor) return;
  
  // Crea la fila según el viewport actual
  const fila = crearFila(registro, callbackClick);
  if (!fila) return;

  // Inserta al inicio del contenedor (tanto responsive como desktop)
  contenedor.insertAdjacentElement('afterbegin', fila);
};

/**
 * Reemplaza una fila existente con datos actualizados
 * Busca la fila por ID y la sustituye completamente
 * 
 * @param {HTMLElement} contenedor - Contenedor que contiene la fila a reemplazar
 * @param {Array} registro - Nuevos datos del registro
 * @param {Function} callbackClick - Función callback para el click
 */
export const reemplazarFila = (contenedor, registro, callbackClick) => {
  if (!contenedor) return;

  // Construye selector según el tipo de vista
  let selector;
  if (esResponsive()) {
    // Para acordeón: busca por data-id en div
    selector = `.acordeon__item[data-id="${registro[0]?.value ?? registro[0]}"]`;
  } else {
    // Para tabla: busca por data-id en tr
    selector = `tr[data-id="${registro[0]}"]`;
  }

  // Busca la fila existente
  const filaAnterior = contenedor.querySelector(selector);
  if (!filaAnterior) return;

  // Crea la nueva fila con los datos actualizados
  const nuevaFila = crearFila(registro, callbackClick);
  if (!nuevaFila) return;

  // Reemplaza la fila anterior por la nueva
  contenedor.replaceChild(nuevaFila, filaAnterior);
};

/**
 * Remueve una fila específica del contenedor
 * 
 * @param {HTMLElement} contenedor - Contenedor que contiene la fila
 * @param {string|number} id - ID del registro a remover
 */
export const removerFilar = (contenedor, id) => {
  if (!contenedor) return;

  // Construye selector según el tipo de vista
  let selector;
  if (esResponsive()) {
    selector = `.acordeon__item[data-id="${id}"]`;
  } else {
    selector = `tr[data-id="${id}"]`;
  }

  // Busca y remueve la fila si existe
  const fila = contenedor.querySelector(selector);
  if (fila) fila.remove();
};

/**
 * Determina si la vista actual es responsive basándose en el ancho de ventana
 * 
 * @returns {boolean} true si está en vista responsive (≤900px), false si es desktop
 */
export const esResponsive = () => window.innerWidth <= 900;