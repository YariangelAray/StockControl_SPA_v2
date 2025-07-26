import * as api from "../utils/api.js";
export async function llenarSelect({ endpoint, selector, optionMapper }) {
    const select = document.querySelector(selector);

    const respuesta = await api.get(endpoint);
    if (!respuesta.success) {
        console.error(respuesta.message || respuesta.errors);
        return;
    }

    respuesta.data.forEach(item => {
        const { id, text } = optionMapper(item);
        const option = document.createElement('option');
        option.value = id;
        option.textContent = text;
        select.appendChild(option);
    });
}
