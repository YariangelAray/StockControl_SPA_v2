export const renderFilas = (registros, callbackClick) => {
    const tbody = document.querySelector('.table__body');
    tbody.innerHTML = '';

    registros.forEach(registro => {
        const fila = document.createElement('tr');
        fila.classList.add('table__row');
        fila.dataset.id = registro[0];

        registro.forEach((dato, index) => {
            if (index === registro.length - 1 || index === 0) return; // saltamos el booleano
            const td = document.createElement('td');
            td.className = 'table__cell text-details';
            td.textContent = dato ?? '—';
            fila.appendChild(td);
        });

        // Aplica color rojo si estado_activo es false
        const estadoActivo = registro[registro.length - 1];
        if (!estadoActivo) fila.classList.add('table__row--red');

        fila.addEventListener('click', () => callbackClick(fila.dataset.id));        
        tbody.appendChild(fila);
    });
};
