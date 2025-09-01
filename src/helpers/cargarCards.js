/**
 * Genera y carga cards dinámicamente en un contenedor
 * Crea cards con header, contenido detallado y acciones según configuración
 * 
 * @param {HTMLElement} contenedor - Elemento DOM donde se insertarán las cards
 * @param {Array} data - Array de objetos con datos para cada card
 * @param {Object} config - Configuración para el tipo y comportamiento de las cards
 * @param {string} config.tipo - Tipo de card ('ambiente' | 'inventario')
 * @param {Array} config.filas - Array de objetos con estructura {valor, clave} para mostrar detalles
 * @param {Function} config.click - Función callback a ejecutar al hacer click en el botón
 */
export const cargarCards = (contenedor, data, config) => {        
    // Itera sobre cada elemento de datos para crear su card correspondiente
    data.forEach(item => {        
        // Crea el contenedor principal de la card
        const card = document.createElement('div');
        card.classList.add('card');

        // ===== HEADER DE LA CARD =====
        const header = document.createElement('div');
        header.className = 'card__header';

        // Agrega imagen solo para cards de tipo 'ambiente'
        if (config.tipo === 'ambiente') {
            // Crea wrapper para la imagen
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'card__img';
            
            // Crea y configura la imagen placeholder
            const img = document.createElement('img');
            img.src = '/public/img/mapa-placeholder.png';
            img.alt = 'map-img';
            
            // Ensambla la estructura de imagen
            imgWrapper.appendChild(img);
            header.appendChild(imgWrapper);
        }

        // Crea y configura el título de la card
        const title = document.createElement('h3');
        title.className = 'card__title';
        title.textContent = item.nombre;
        
        // Ensambla el header completo
        header.appendChild(title);
        card.appendChild(header);

        // ===== CONTENIDO/DETALLES DE LA CARD =====
        const content = document.createElement('div');
        content.className = 'card__content';

        // Genera filas de detalles según configuración
        config.filas.forEach(({ valor, clave }) => {
            // Crea contenedor para cada fila de detalle
            const fila = document.createElement('div');
            fila.className = 'card__details';

            // Crea label/etiqueta del campo
            const label = document.createElement('p');
            label.className = 'text-details';
            label.textContent = clave;

            // Crea valor del campo con fallback a '-' si no existe
            const value = document.createElement('p');
            value.className = 'text-details text-details--bold';
            value.textContent = item[valor] ?? '-';

            // Ensambla la fila de detalle
            fila.appendChild(label);
            fila.appendChild(value);
            content.appendChild(fila);
        });

        // Agrega el contenido a la card
        card.appendChild(content);

        // ===== ACCIONES DE LA CARD =====
        const actions = document.createElement('div');
        actions.className = 'card__actions';

        // Crea botón con texto dinámico según el tipo
        const button = document.createElement('button');
        button.className = 'button';
        button.textContent = config.tipo === 'inventario' ? 'Ver inventario' : 'Ver mapa';

        // Asigna evento click que ejecuta callback con los datos del item
        button.addEventListener('click', () => config.click(item));
        
        // Ensambla las acciones
        actions.appendChild(button);
        card.appendChild(actions);

        // Agrega la card completa al contenedor
        contenedor.appendChild(card);
    });
};