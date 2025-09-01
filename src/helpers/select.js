import * as api from "../utils/api.js";

/**
 * Llena un elemento <select> con opciones obtenidas desde un endpoint API.
 * 
 * @param {Object} params - Parámetros para llenar el select.
 * @param {string} params.endpoint - URL del endpoint para obtener los datos.
 * @param {string} params.selector - Selector CSS para obtener el elemento <select>.
 * @param {function} params.optionMapper - Función que mapea cada ítem de datos a un objeto {id, text}.
 * 
 * @returns {Promise<void>} No retorna valor, pero llena el select con opciones.
 */
export async function llenarSelect({ endpoint, selector, optionMapper }) {
    // Obtiene el elemento <select> del DOM usando el selector proporcionado
    const select = document.querySelector(selector);

    // Realiza una petición GET al endpoint para obtener los datos
    const respuesta = await api.get(endpoint);

    // Verifica si la respuesta fue exitosa, si no, muestra error y termina la función
    if (!respuesta.success) {
        console.error(respuesta.message || respuesta.errors);
        return;
    }

    // Itera sobre cada elemento de los datos recibidos
    respuesta.data.forEach(item => {
        // Aplica la función optionMapper para obtener id y texto para la opción
        const { id, text } = optionMapper(item);

        // Crea un nuevo elemento <option>
        const option = document.createElement('option');

        // Asigna el valor y el texto visible de la opción
        option.value = id;
        option.textContent = text;

        // Agrega la opción al select
        select.appendChild(option);
    });
}
