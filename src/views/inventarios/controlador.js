import { cargarCards } from "../../helpers/cargarCards.js";
import { initComponentes } from "../../helpers/initComponentes.js";
import { initModalPedirCodigo } from "../../modals/js/modalPedirCodigoAcceso.js";
import { abrirModal, initModales, limpiarModales, modales } from "../../modals/modalsController.js";
import * as api from "../../utils/api.js";
import { initTemporizadorAcceso } from "./detalles/initTemporizadorAcceso.js";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    localStorage.clear();
    localStorage.setItem('usuario', JSON.stringify(usuario));


    initComponentes(usuario);

    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    sidebarList.querySelector('.menu__items')?.remove();

    // Verificamos si el ítem ya fue insertado

    const sidebarInfo = document.createElement('div');
    sidebarInfo.classList.add('sidebar-info');
    const sidebarInfoText = document.createElement('p');
    sidebarInfoText.textContent = 'Ingrese a un inventario para continuar con su gestión';
    sidebarInfo.append(sidebarInfoText);

    sidebarList.append(sidebarInfo);


    limpiarModales();
    if (usuario.rol_id === 3) {
        await initModales(['modalPedirCodigoAcceso']);
        const { modalPedirCodigoAcceso } = modales;
        initModalPedirCodigo(modalPedirCodigoAcceso);
        document.querySelector('.agregar-inventario').classList.remove('hidden');
        document.getElementById('dashboard-inventarios').addEventListener('click', (e) => {
            if (e.target.closest('.agregar-inventario')) {
                abrirModal(modalPedirCodigoAcceso);
            }
        })
        const accessInfo = document.querySelector('.sidebar .access-info');
        if (accessInfo) {
            accessInfo.classList.add('hidden');
        }
    }
    await cargarInventarios(usuario);
};

const cargarInventarios = async (usuario) => {
    const respuesta = usuario.rol_id == 2 ? await api.get('inventarios/usuario/' + usuario.id)
        : await api.get('accesos-temporales/' + usuario.id);

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
                if (usuario.rol_id === 3 && codigoInfo) {
                    const expiracion = new Date(codigoInfo.expiracion);
                    const ahora = new Date();
                    if (expiracion > ahora) {
                        // Aún está vigente, restaurar UI
                        document.querySelector('.sidebar .access-info').classList.remove('hidden');
                        await initTemporizadorAcceso(codigoInfo.expiracion, inventario.id, () => {
                            document.querySelector('.sidebar .access-info').classList.add('hidden');
                        });
                    }
                }
                window.location.hash = '#/inventarios/ambientes';
            }
        });
    }
    if (usuario.rol_id === 2 && !respuesta.data) {
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
