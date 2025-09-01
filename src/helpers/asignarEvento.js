/**
 * Reemplaza el elemento por una copia sin listeners previos
 * y le asigna un nuevo evento.
 * @param {HTMLElement} elemento - El botón o elemento al que se le asignará el evento
 * @param {string} tipo - Tipo de evento (por ejemplo, 'click')
 * @param {Function} handler - Función que se ejecutará al disparar el evento
 * @returns {HTMLElement} - El nuevo elemento con el evento asignado
 */
export default (elemento, tipo, handler) => {
    // Verifica que el elemento existe antes de proceder
    if (!elemento) return null;

    // Clona el elemento para crear una copia exacta sin eventos
    const nuevoElemento = elemento.cloneNode(true);
    
    // Reemplaza el elemento original con la copia limpia
    elemento.replaceWith(nuevoElemento);
    
    // Asigna el nuevo evento al elemento limpio
    nuevoElemento.addEventListener(tipo, handler);

    // Retorna el nuevo elemento para referencias futuras
    return nuevoElemento;
};