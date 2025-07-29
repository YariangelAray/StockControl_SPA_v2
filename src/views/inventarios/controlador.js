import { cargarCards } from "../../helpers/cargarCards.js";
import { initComponentes } from "../../helpers/initComponentes.js";
import { initModalPedirCodigo } from "../../modals/modalPedirCodigoAcceso.js";
import { abrirModal, initModales, limpiarModales, modales } from "../../modals/modalsController.js";
import * as api from "../../utils/api.js";
import { initTemporizadorAcceso } from "./detalles/initTemporizadorAcceso.js";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    localStorage.removeItem('inventario');
    localStorage.removeItem('ambientes');
    localStorage.removeItem('elementos');
    localStorage.removeItem('reportes');
    localStorage.removeItem('tipos');
    localStorage.removeItem('codigoAccesoInfo');

    const accessInfo = document.querySelector('.sidebar .access-info');
    if (accessInfo) {
        accessInfo.classList.add('hidden');
        accessInfo.querySelector('.tiempo-acceso').textContent = ""; // opcional: limpiar el texto también
    }


    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');

    sidebarList.querySelector('.menu__items')?.remove();

    if (sidebarInfo.classList.contains('hidden')) sidebarInfo.classList.remove('hidden');

    initComponentes(usuario);

    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').removeAttribute('id');
    document.querySelector('.dashboard').id = "dashboard-inventarios";

    limpiarModales();
    if (usuario.rol_id === 2) {
        await initModales(['modalPedirCodigoAcceso']);
        const { modalPedirCodigoAcceso } = modales;
        initModalPedirCodigo(modalPedirCodigoAcceso);
        document.querySelector('.agregar-inventario').classList.remove('hidden');
        document.getElementById('dashboard-inventarios').addEventListener('click', (e) => {
            if (e.target.closest('.agregar-inventario')) {
                abrirModal(modalPedirCodigoAcceso);
            }
        })
    }
    await cargarInventarios(usuario);
};


const cargarInventarios = async (usuario) => {
    const respuesta = usuario.rol_id == 1 ? await api.get('inventarios/usuario/' + usuario.id)
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

                    try {
                        const respuesta = await api.get('codigos-acceso/inventario/' + inventario.id);
                        if (respuesta.success) {
                            // Guardar código específico en localStorage
                            localStorage.setItem('codigoAccesoInfo', JSON.stringify({
                                codigo: respuesta.data.codigo,
                                expiracion: respuesta.data.fecha_expiracion
                            }));
                        }
                    } catch (error) {

                    }
                }
                const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
                if (usuario.rol_id == 2 && codigoInfo) {
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
};
