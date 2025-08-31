import { cargarCards } from "../../helpers/cargarCards.js";
import * as api from "../../utils/api.js";
import getCookie from "../../utils/getCookie.js";
import { initTemporizadorAcceso } from "./detalles/initTemporizadorAcceso.js";

export default async () => {
    const roles = getCookie('roles', []).map(r => r.id);
    localStorage.clear();

    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    sidebarList.querySelector('.menu__items')?.remove();

    // limpiarModales();
    if (roles.includes(3)) {
        // await initModales(['modalPedirCodigoAcceso']);
        // const { modalPedirCodigoAcceso } = modales;
        // initModalPedirCodigo(modalPedirCodigoAcceso);
        document.querySelector('.agregar-inventario').classList.remove('hidden');
        document.getElementById('dashboard-inventarios').addEventListener('click', (e) => {
            if (e.target.closest('.agregar-inventario')) {
                // abrirModal(modalPedirCodigoAcceso);
            }
        })
        const accessInfo = document.querySelector('.sidebar .access-info');
        if (accessInfo) {
            accessInfo.classList.add('hidden');
        }
    }
    await cargarInventarios(roles);
};

const cargarInventarios = async (roles) => {
    const url = roles.includes(2) ? 'inventarios/me' : 'inventarios/me';
    const respuesta = await api.get(url);

    const contenedor = document.querySelector('.content-cards');

    if (respuesta.success) {

        cargarCards(contenedor, respuesta.data, {
            tipo: 'inventario',
            filas: [
                { valor: 'cantidad_elementos', clave: 'Cantidad de elementos:' },
                { valor: 'ambientes_cubiertos', clave: 'Ambientes cubiertos:' },
                { valor: 'ultima_actualizacion', clave: 'Última actualización:' },
            ],
            click: async (inventario) => {
                localStorage.setItem('inventario', JSON.stringify({ id: inventario.id, nombre: inventario.nombre }));

                if (!localStorage.getItem('codigoAccesoInfo')) {

                    const respuesta = await api.get('codigos-acceso/inventario/' + inventario.id);
                    if (respuesta.success) {
                        // Guardar código específico en localStorage
                        localStorage.setItem('codigoAccesoInfo', JSON.stringify({
                            codigo: respuesta.data.codigo,
                            expiracion: respuesta.data.fecha_expiracion
                        }));
                    }
                }

                const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
                
                if (roles.includes(3) && codigoInfo) {
                    const expiracion = new Date(codigoInfo.expiracion);
                    const ahora = new Date();
                    if (expiracion > ahora) {
                        // Aún está vigente, restaurar UI
                        document.querySelector('.sidebar .access-info').classList.remove('hidden');
                        await initTemporizadorAcceso(codigoInfo.expiracion, inventario.id, () => {
                            document.querySelector('.sidebar .access-info').classList.add('hidden');
                            localStorage.removeItem('codigoAccesoInfo');
                            localStorage.removeItem('inventario');
                        });
                    }
                }
                window.location.hash = '#/inventarios/ambientes';
            }
        });
    }
    if (roles.includes(2) && !respuesta.data) {
        const cardEmpty = document.createElement('div');
        cardEmpty.classList.add('card-empty');

        const icon = document.createElement('i');
        icon.classList.add('ri-information-line', 'icon');
        cardEmpty.appendChild(icon);
        const texto = document.createElement('p');
        texto.classList.add('text-details', 'text-details--medium-sized');
        texto.textContent = 'No se encontraron inventarios a su cargo';
        cardEmpty.appendChild(texto);
        contenedor.appendChild(cardEmpty);
        return;
    }
};
