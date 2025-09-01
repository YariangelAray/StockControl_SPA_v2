import { esRutaModal } from "../routes/router";
import getCookie from "../utils/getCookie";

export const initComponentes = () => {

    const inventario = JSON.parse(localStorage.getItem('inventario'));
    const roles = getCookie('roles', []).map(r => r.id);

    actualizarHeader(inventario);
    marcarItem();

    const menuActivo = document.getElementById('menu-hamburguer-activar');
    menuActivo.checked = false;
    const menuUserActivo = document.getElementById('menu-activar');
    menuUserActivo.checked = false;

    if ((!roles.includes(1) && !document.querySelector('.menu__items')) || (roles.includes(1) && !document.querySelector('.sidebar__item'))) {
        generarSidebar(roles, inventario);
    }
}

const generarSidebar = (roles, inventario) => {
    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    limpiarSidebarInfo();

    if (!sidebarList.querySelector('.sidebar__item:first-child')) {
        const opcionesIndex = [
            { nombre: 'Inicio', seccion: '#/super-admin', icono: 'ri-home-3-line' },
            { nombre: 'Inventarios', seccion: '#/inventarios', icono: 'ri-archive-line' }
        ]

        let li; if (roles.includes(1)) li = crearItem(opcionesIndex[0]);
        else li = crearItem(opcionesIndex[1]);

        const separacion = document.createElement('hr');
        separacion.classList.add('separacion');

        sidebarList.append(li, separacion);
    }


    if (roles.includes(1)) {
        const base = "#/super-admin/";
        const opciones = [
            { nombre: 'Usuarios', seccion: 'usuarios', icono: 'ri-user-settings-line' },
            { nombre: 'Ambientes', seccion: 'ambientes', icono: 'ri-building-2-line' },
            { nombre: 'Inventarios', seccion: 'inventarios', icono: 'ri-archive-line' },
            { nombre: 'Tipos de Elementos', seccion: 'tipos-elementos', icono: 'ri-git-branch-line' },
        ];

        opciones.forEach(opc => sidebarList.appendChild(crearItem(opc, base)));
    }

    // Menú para administrativo (rol_id === 2) y usuario común (rol_id === 3)
    else {

        if (!inventario) {
            sidebarList.querySelector('.menu__items')?.remove();

            const hash = location.hash.replace(/\/$/, '');
            if (hash === '#/inventarios' && !document.querySelector('.sidebar-info')) {
                const sidebarInfo = document.createElement('div');
                sidebarInfo.classList.add('sidebar-info');
                const sidebarInfoText = document.createElement('p');
                sidebarInfoText.textContent = 'Ingrese a un inventario para continuar con su gestión';
                sidebarInfo.append(sidebarInfoText);
                sidebarList.append(sidebarInfo);
            }

            requestAnimationFrame(() => marcarItem());
            return;
        }

        const menuItems = document.createElement('div');
        menuItems.classList.add('menu__items');
        sidebarList.append(menuItems);
        const base = "#/inventarios/"
        const opciones = [
            { nombre: 'Ambientes', seccion: 'ambientes', icono: 'ri-building-2-line' },
            ...(roles.includes(2) ? [
                { nombre: 'Detalles', seccion: 'detalles', icono: 'ri-file-list-line' },
                { nombre: 'Elementos', seccion: 'elementos', icono: 'ri-clipboard-line' },
                { nombre: 'Reportes', seccion: 'reportes', icono: 'ri-information-line' }
            ] : [
                { nombre: 'Elementos', seccion: 'elementos', icono: 'ri-clipboard-line' }
            ])
        ];

        opciones.forEach(opc => menuItems.appendChild(crearItem(opc, base)));
    }

    requestAnimationFrame(() => marcarItem());
};


const marcarItem = () => {
    const sidebar = document.querySelector('.sidebar__menu');
    if (!sidebar) return;

    const items = sidebar.querySelectorAll('.sidebar__item');
    items.forEach(item => {
        const enlace = item.querySelector('a');
        if (!enlace) return;

        const href = enlace.getAttribute('href').replace(/\/$/, '');
        const hash = location.hash.replace(/\/$/, '');        
        if (href === hash) {            
            item.classList.add('sidebar__item--selected');
        } else {
            item.classList.remove('sidebar__item--selected');            
        }
    });
};

const actualizarHeader = (inventario) => {

    const usuario = getCookie('usuario', {});

    const header = document.querySelector('.header__title');
    header.innerHTML = ''; // Limpiar contenido anterior
    const hash = esRutaModal().slice(2); // quitar "#/"
    const segmentos = hash.split('/').filter(seg => seg);

    // Caso especial: perfil de usuario
    if (segmentos[0] === 'perfil-usuario') {
        const texto = document.createTextNode('PERFIL DE ');
        const span = document.createElement('span');
        span.classList.add('nombre-usuario');
        header.appendChild(texto);
        header.appendChild(span);
        document.title = "Perfil " + usuario.nombre_corto;
    }

    // Caso especial: vista inicial
    if ((segmentos[0] === 'inventarios' || segmentos[0] === 'super-admin') && segmentos.length === 1) {
        const texto = document.createTextNode('BIENVENID@, ');
        const span = document.createElement('span');
        span.classList.add('nombre-usuario');
        span.textContent = 'ADMINISTRADOR';
        header.appendChild(texto);
        header.appendChild(span);
        document.title = "Stock Control";
    }

    const camposNombre = document.querySelectorAll('.nombre-usuario');

    camposNombre.forEach(campo => {
        campo.textContent = usuario.nombre_corto;
    })

    // vistas de inventario
    if (segmentos[0] === 'inventarios' && segmentos.length > 1) {
        const spanInventario = document.createElement('span');
        spanInventario.classList.add('header__inventario');
        spanInventario.textContent = inventario.nombre;
        header.appendChild(spanInventario);

        const partes = segmentos.slice(1); // Omitir 'inventarios'

        partes.forEach(parte => {

            if (parte == 'mapa') partes.splice(partes.length - 1, 1); // Eliminar el último segmento si es 'mapa' (ambiente_id=1&nombre=Ambiente 1)
            const flecha = document.createElement('i');
            flecha.classList.add('ri-arrow-right-s-line', 'header__flecha');
            header.appendChild(flecha);

            const seccion = document.createElement('span');
            seccion.classList.add('header__seccion');
            seccion.textContent = parte.split('-').shift();
            let titulo = parte;
            if (parte == "tipos-elementos") titulo = "Tipos de elementos";
            document.title = titulo.charAt(0).toUpperCase() + titulo.slice(1);
            header.appendChild(seccion);
        });
    }
    else if (segmentos[0] === 'super-admin') {
        const partes = segmentos.slice(1); // Omitir 'super-admin'

        // Si estamos en super-admin/ambientes
        if (partes[0] === 'ambientes') {
            const seccion = document.createElement('span');
            seccion.classList.add('header__seccion');
            seccion.textContent = 'Ambientes';
            header.appendChild(seccion);
            document.title = 'Ambientes';

            // Si hay más segmentos (por ejemplo: super-admin/ambientes/mapa)
            
            if (partes[1] == "mapa") {
                const flecha = document.createElement('i');
                flecha.classList.add('ri-arrow-right-s-line', 'header__flecha');
                header.appendChild(flecha);

                const subSeccion = document.createElement('span');
                subSeccion.classList.add('header__seccion');

                subSeccion.textContent = partes[1];
                document.title = partes[1].charAt(0).toUpperCase() + partes[1].slice(1);

                header.appendChild(subSeccion);
            }
        }
        else {
            // Resto de casos en super-admin
            partes.forEach(parte => {
                let titulo = parte;
                if (parte == "tipos-elementos")
                    titulo = "Tipos de elementos";

                document.title = titulo.charAt(0).toUpperCase() + titulo.slice(1);
                header.textContent = titulo;
            });
        }
    }
};

const crearItem = ({ nombre, seccion, icono }, base = null) => {
    const li = document.createElement('li');
    li.classList.add('sidebar__item');

    const a = document.createElement('a');    
    
    a.href = base ? `${base}${seccion}` : seccion;
    a.textContent = nombre;

    const i = document.createElement('i');
    i.classList.add(icono, 'icon');

    a.insertAdjacentElement('afterbegin', i);
    li.appendChild(a);
    return li;
}

const limpiarSidebarInfo = () => {
    const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');
    const hash = location.hash.replace(/\/$/, '');
    if (sidebarInfo && hash !== '#/inventarios') {
        sidebarInfo.remove();
    }
};
