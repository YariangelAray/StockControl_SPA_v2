import { cargarCards } from "../../../helpers/cargarCards";

import * as api from "../../../utils/api";
import { infoToast } from "../../../utils/alertas";
import { setVistaActual } from "../../../helpers/responsiveManager";

export default async () => {

    setVistaActual('ambientes');

    const inventario = JSON.parse(localStorage.getItem('inventario'));    

    let ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];
    if (!ambientes || ambientes.length === 0) {
        const respuesta = await api.get(`inventarios/me/${inventario.id}/ambientes`);
        if (respuesta.success) {
            localStorage.setItem('ambientes', JSON.stringify({ ambientes: respuesta.data ?? []}));
            ambientes = respuesta.data;
        }
    }

    await cargarAmbientes(ambientes, inventario)

    await actualizarStorageAmbientes(inventario);
    const search = document.querySelector('[type="search"]');
    search.addEventListener('input', (e) => {
        let ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];
        const valor = e.target.value.toLowerCase();
        const ambientesFiltrados = ambientes.filter(ambiente => {
            for (const key in ambiente) {
                if (ambiente[key] && ambiente[key].toString().toLowerCase().includes(valor)) return true;
            }
            return false;
        });
        cargarAmbientes(ambientesFiltrados);
    });
};

const cargarAmbientes = async (ambientes) => {
    const contenedor = document.querySelector('.content-cards');
    contenedor.innerHTML = '';

    if (!ambientes || ambientes.length === 0) {
        const cardEmpty = document.createElement('div');
        cardEmpty.classList.add('card-empty');

        const icon = document.createElement('i');
        icon.classList.add('ri-information-line', 'icon');
        cardEmpty.appendChild(icon);
        const texto = document.createElement('p');
        texto.classList.add('text-details', 'text-details--medium-sized');
        texto.textContent = 'No se encontraron ambientes';
        cardEmpty.appendChild(texto);
        contenedor.appendChild(cardEmpty);
        return;
    }

    cargarCards(contenedor, ambientes, {
        tipo: 'ambiente',
        filas: [
            { valor: 'cantidad_elementos', clave: 'Cantidad de elementos:' }
        ],
        click: async (ambiente) => {
            if (ambiente.mapa) {
                window.location.hash = `#/inventarios/ambientes/mapa/ambiente_id=${ambiente.id}&nombre=${ambiente.nombre}`;
            }
            else infoToast( "Este ambiente aún no tiene un mapa disponible");
        }
    });
};


const actualizarStorageAmbientes = async (inventario) => {
  const respuesta = await api.get(`inventarios/me/${inventario.id}/ambientes`);  
    if (respuesta.success) localStorage.setItem('ambientes', JSON.stringify({ ambientes: respuesta.data ?? [] }));
}
