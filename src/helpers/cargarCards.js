export const cargarCards = (contenedor, data, config) => {        
    data.forEach(item => {        
        const card = document.createElement('div');
        card.classList.add('card');
        if (config.tipo === 'ambiente') card.classList.add('card--large');

        // Header
        const header = document.createElement('div');
        header.className = 'card__header';

        if (config.tipo === 'ambiente') {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'card__img';
            const img = document.createElement('img');
            img.src = '/public/img/mapa-placeholder.png';
            img.alt = 'map-img';
            imgWrapper.appendChild(img);
            header.appendChild(imgWrapper);
        }

        const title = document.createElement('h3');
        title.className = 'card__title';
        title.textContent = item.nombre;
        header.appendChild(title);
        card.appendChild(header);

        // Content
        const content = document.createElement('div');
        content.className = 'card__content';

        config.filas.forEach(({ valor, clave }) => {
            const fila = document.createElement('div');
            fila.className = 'card__details';

            const label = document.createElement('p');
            label.className = 'text-details';
            label.textContent = clave;

            const value = document.createElement('p');
            value.className = 'text-details text-details--bold';
            value.textContent = item[valor] ?? '-';

            fila.appendChild(label);
            fila.appendChild(value);
            content.appendChild(fila);
        });

        card.appendChild(content);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'card__actions';

        const button = document.createElement('button');
        button.className = 'button';
        button.textContent = config.tipo === 'inventario' ? 'Ver inventario' : 'Ver mapa';

        button.addEventListener('click', () => config.click(item));
        actions.appendChild(button);
        card.appendChild(actions);

        contenedor.appendChild(card);
    });
}
