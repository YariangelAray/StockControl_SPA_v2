/**
 * Reemplaza el elemento por una copia sin listeners previos
 * y le asigna un nuevo evento.
 * @param {HTMLElement} elemento - El botón o elemento al que se le asignará el evento
 * @param {string} tipo - Tipo de evento (por ejemplo, 'click')
 * @param {Function} handler - Función que se ejecutará al disparar el evento
 * @returns {HTMLElement} - El nuevo elemento con el evento asignado
 */
export default (elemento, tipo, handler) => {
    if (!elemento) return null;

    const nuevoElemento = elemento.cloneNode(true);
    elemento.replaceWith(nuevoElemento);
    nuevoElemento.addEventListener(tipo, handler);

    return nuevoElemento;
}
