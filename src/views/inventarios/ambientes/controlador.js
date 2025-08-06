import Swal from "sweetalert2";
import { cargarCards } from "../../../helpers/cargarCards";
import { initComponentes } from "../../../helpers/initComponentes";
import { limpiarModales } from "../../../modals/modalsController";
import * as api from "../../../utils/api";
import { info } from "../../../utils/alertas";
import { eliminarAccesos, initTemporizadorAcceso } from "../detalles/initTemporizadorAcceso";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const inventario = JSON.parse(localStorage.getItem('inventario'));
    initComponentes(usuario);

    limpiarModales();

    let ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];
    if (!ambientes || ambientes.length === 0) {
        const respuesta = await api.get(`inventarios/${inventario.id}/ambientes`);
        if (respuesta.success) {
            localStorage.setItem('ambientes', JSON.stringify({ ambientes: respuesta.data ?? []}));
            ambientes = respuesta.data;
        }
    }

    await cargarAmbientes(ambientes, inventario)

    if (usuario.rol_id === 3) {
        const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
        
        if (codigoInfo) {
            const limpiar = () => {
                document.querySelector('.sidebar .access-info')?.classList.add('hidden');
              localStorage.removeItem('inventario');
              localStorage.removeItem('codigoAccesoInfo');
            }
            const expiracion = new Date(codigoInfo.expiracion);
            const ahora = new Date();

            if (expiracion > ahora) {
                document.querySelector('.sidebar .access-info')?.classList.remove('hidden');
                await initTemporizadorAcceso(expiracion, inventario.id, limpiar);
            } else {
                await eliminarAccesos(inventario.id, limpiar);
                window.location.hash = '#/inventarios';
            }
        } else {
            window.location.hash = '#/inventarios';
        }
    }

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
            else await info("Mapa del ambiente", "Este ambiente aún no tiene un mapa disponible");
        }
    });
};


const actualizarStorageAmbientes = async (inventario) => {
    const respuesta = await api.get(`inventarios/${inventario.id}/ambientes`);
    if (respuesta.success) localStorage.setItem('ambientes', JSON.stringify({ ambientes: respuesta.data ?? [] }));
}
