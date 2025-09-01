import { cargarCards } from "../../../helpers/cargarCards";
import * as api from "../../../utils/api";
import { infoToast } from "../../../utils/alertas";
import { setVistaActual } from "../../../helpers/responsiveManager";

export default async () => {
    // Establece la vista actual como 'ambientes'
    setVistaActual('ambientes');

    // Obtiene inventario desde localStorage
    const inventario = JSON.parse(localStorage.getItem('inventario'));

    // Intenta obtener ambientes desde localStorage
    let ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];

    // Si no hay ambientes en storage, los pide al backend
    if (!ambientes || ambientes.length === 0) {
        try {
            const respuesta = await api.get(`inventarios/me/${inventario.id}/ambientes`);
            if (respuesta.success) {
                localStorage.setItem('ambientes', JSON.stringify({ ambientes: respuesta.data ?? [] }));
                ambientes = respuesta.data;
            }
        } catch (error) {
            console.error('Error al cargar ambientes:', error);
            return;
        }
    }

    // Renderiza los ambientes en pantalla
    await cargarAmbientes(ambientes);

    // Actualiza storage con datos más recientes
    await actualizarStorageAmbientes(inventario);

    // Filtro en tiempo real por input de búsqueda
    const search = document.querySelector('[type="search"]');
    search.addEventListener('input', (e) => {
        const valor = e.target.value.toLowerCase();
        const ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];

        // Filtra ambientes por coincidencia en cualquier campo
        const ambientesFiltrados = ambientes.filter(ambiente => {
            for (const key in ambiente) {
                if (ambiente[key] && ambiente[key].toString().toLowerCase().includes(valor)) return true;
            }
            return false;
        });

        // Renderiza los ambientes filtrados
        cargarAmbientes(ambientesFiltrados);
    });
};

// Renderiza tarjetas de ambientes
const cargarAmbientes = async (ambientes) => {
    const contenedor = document.querySelector('.content-cards');
    contenedor.innerHTML = '';

    // Si no hay ambientes, muestra mensaje vacío
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

    // Renderiza tarjetas con datos de ambientes
    cargarCards(contenedor, ambientes, {
        tipo: 'ambiente',
        filas: [
            { valor: 'cantidad_elementos', clave: 'Cantidad de elementos:' }
        ],
        click: async (ambiente) => {
            // Si el ambiente tiene mapa, redirige
            if (ambiente.mapa) {
                window.location.hash = `#/inventarios/ambientes/mapa/ambiente_id=${ambiente.id}&nombre=${ambiente.nombre}`;
            } else {
                // Si no tiene mapa, muestra alerta
                infoToast("Este ambiente aún no tiene un mapa disponible");
            }
        }
    });
};

// Actualiza el storage con ambientes desde backend
const actualizarStorageAmbientes = async (inventario) => {
    try {
        const respuesta = await api.get(`inventarios/me/${inventario.id}/ambientes`);
        if (respuesta.success) {
            localStorage.setItem('ambientes', JSON.stringify({ ambientes: respuesta.data ?? [] }));
        }
    } catch (error) {
        console.error('Error al actualizar storage de ambientes:', error);
    }
};
