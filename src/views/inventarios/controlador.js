import { cargarCards } from "../../helpers/cargarCards.js";
import { initComponentes } from "../../helpers/initComponentes.js";
import { initModalPedirCodigo } from "../../modals/modalPedirCodigoAcceso.js";
import { abrirModal, initModales, limpiarModales, modales } from "../../modals/modalsController.js";
import * as api from "../../utils/api.js";

export default async () => {

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    localStorage.removeItem('inventario');

    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');

    // Limpia menú anterior si existe
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
        document.getElementById('dashboard-inventarios').addEventListener('click', (e) => {
            if (e.target.closest('.agregar-inventario')) {
                abrirModal(modalPedirCodigoAcceso);
            }
        })        
    }
    else{        
        await cargarInventarios(usuario);
    }
};


const cargarInventarios = async (usuario) => {
    const respuesta = await api.get('inventarios/usuario/' + usuario.rol_id);    
    const contenedor = document.querySelector('.content-cards');    
    console.log(respuesta)
    if (respuesta.success) {
        console.log(respuesta)
        cargarCards(contenedor, respuesta.data, {
            tipo: 'inventario',
            filas: [
                { valor: 'cantidad_elementos', clave: 'Cantidad de elementos:' },                
                { valor: 'ambientes_cubiertos', clave: 'Ambientes cubiertos:' },
                { valor: 'ultima_actualizacion', clave: 'Última actualización:' },
            ],
            onClick: (inventario) => {
                localStorage.setItem('inventario', JSON.stringify({id:inventario.id, nombre:inventario.nombre}));
                window.location.hash = '#/inventarios/ambientes';
            }
        });
    }
};
