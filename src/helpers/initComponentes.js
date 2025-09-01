import { esRutaModal } from "../routes/router";
import getCookie from "../utils/getCookie";

/**
 * Inicializa los componentes principales de la interfaz
 * Configura header, sidebar y navegación según roles y contexto
 */
export const initComponentes = () => {
    // Obtiene datos del inventario actual desde localStorage
    const inventario = JSON.parse(localStorage.getItem('inventario'));
    
    // Extrae IDs de roles del usuario desde cookies
    const roles = getCookie('roles', []).map(r => r.id);

    // Actualiza el header con información contextual
    actualizarHeader(inventario);
    
    // Marca el elemento activo en el sidebar
    marcarItem();

    // Resetea estados de menús móviles
    const menuActivo = document.getElementById('menu-hamburguer-activar');
    menuActivo.checked = false;
    const menuUserActivo = document.getElementById('menu-activar');
    menuUserActivo.checked = false;

    // Regenera sidebar si la estructura no coincide con el rol actual
    if ((!roles.includes(1) && !document.querySelector('.menu__items')) || 
        (roles.includes(1) && !document.querySelector('.sidebar__item'))) {
        generarSidebar(roles, inventario);
    }
};

/**
 * Genera el sidebar dinámicamente según roles y contexto de inventario
 * 
 * @param {number[]} roles - Array de IDs de roles del usuario
 * @param {Object|null} inventario - Objeto con datos del inventario actual
 */
const generarSidebar = (roles, inventario) => {
    // Obtiene referencia al contenedor del menú lateral
    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    
    // Limpia información previa del sidebar
    limpiarSidebarInfo();

    // Agrega elemento inicial si no existe
    if (!sidebarList.querySelector('.sidebar__item:first-child')) {
        const opcionesIndex = [
            { nombre: 'Inicio', seccion: '#/super-admin', icono: 'ri-home-3-line' },
            { nombre: 'Inventarios', seccion: '#/inventarios', icono: 'ri-archive-line' }
        ];

        // Selecciona opción inicial según el rol (1=super-admin, otros=inventarios)
        let li;
        if (roles.includes(1)) li = crearItem(opcionesIndex[0]);
        else li = crearItem(opcionesIndex[1]);

        // Agrega separador visual
        const separacion = document.createElement('hr');
        separacion.classList.add('separacion');

        sidebarList.append(li, separacion);
    }

    // Menú para super-administrador (rol_id === 1)
    if (roles.includes(1)) {
        const base = "#/super-admin/";
        const opciones = [
            { nombre: 'Usuarios', seccion: 'usuarios', icono: 'ri-user-settings-line' },
            { nombre: 'Ambientes', seccion: 'ambientes', icono: 'ri-building-2-line' },
            { nombre: 'Inventarios', seccion: 'inventarios', icono: 'ri-archive-line' },
            { nombre: 'Tipos de Elementos', seccion: 'tipos-elementos', icono: 'ri-git-branch-line' },
        ];

        // Crea cada opción del menú de super-admin
        opciones.forEach(opc => sidebarList.appendChild(crearItem(opc, base)));
    }
    // Menú para administrativo (rol_id === 2) y usuario común (rol_id === 3)
    else {
        // Si no hay inventario seleccionado, muestra mensaje informativo
        if (!inventario) {
            // Remueve opciones de menú previas
            sidebarList.querySelector('.menu__items')?.remove();

            // Normaliza hash actual
            const hash = location.hash.replace(/\/$/, '');
            
            // Muestra mensaje solo en la vista de inventarios
            if (hash === '#/inventarios' && !document.querySelector('.sidebar-info')) {
                const sidebarInfo = document.createElement('div');
                sidebarInfo.classList.add('sidebar-info');
                const sidebarInfoText = document.createElement('p');
                sidebarInfoText.textContent = 'Ingrese a un inventario para continuar con su gestión';
                sidebarInfo.append(sidebarInfoText);
                sidebarList.append(sidebarInfo);
            }

            // Actualiza selección de elementos
            requestAnimationFrame(() => marcarItem());
            return;
        }

        // Crea contenedor para opciones de inventario
        const menuItems = document.createElement('div');
        menuItems.classList.add('menu__items');
        sidebarList.append(menuItems);
        
        const base = "#/inventarios/";
        const opciones = [
            { nombre: 'Ambientes', seccion: 'ambientes', icono: 'ri-building-2-line' },
            // Opciones adicionales solo para administradores (rol 2)
            ...(roles.includes(2) ? [
                { nombre: 'Detalles', seccion: 'detalles', icono: 'ri-file-list-line' },
                { nombre: 'Elementos', seccion: 'elementos', icono: 'ri-clipboard-line' },
                { nombre: 'Reportes', seccion: 'reportes', icono: 'ri-information-line' }
            ] : [
                // Solo elementos para usuarios comunes (rol 3)
                { nombre: 'Elementos', seccion: 'elementos', icono: 'ri-clipboard-line' }
            ])
        ];

        // Crea cada opción del menú de inventario
        opciones.forEach(opc => menuItems.appendChild(crearItem(opc, base)));
    }

    // Actualiza marcado de elementos tras generar el menú
    requestAnimationFrame(() => marcarItem());
};

/**
 * Marca el elemento activo en el sidebar según la ruta actual
 */
const marcarItem = () => {
    // Busca el contenedor del sidebar
    const sidebar = document.querySelector('.sidebar__menu');
    if (!sidebar) return;

    // Obtiene todos los elementos de navegación
    const items = sidebar.querySelectorAll('.sidebar__item');
    
    items.forEach(item => {
        const enlace = item.querySelector('a');
        if (!enlace) return;

        // Normaliza URLs para comparación (sin slash final)
        const href = enlace.getAttribute('href').replace(/\/$/, '');
        const hash = location.hash.replace(/\/$/, '');
        
        // Marca como seleccionado si coincide con la ruta actual
        if (href === hash) {            
            item.classList.add('sidebar__item--selected');
        } else {
            item.classList.remove('sidebar__item--selected');            
        }
    });
};

/**
 * Actualiza el header con breadcrumbs y título según la ruta actual
 * 
 * @param {Object|null} inventario - Objeto con datos del inventario actual
 */
const actualizarHeader = (inventario) => {
    // Obtiene información del usuario desde cookies
    const usuario = getCookie('usuario', {});

    // Limpia contenido previo del header
    const header = document.querySelector('.header__title');
    header.innerHTML = '';
    
    // Obtiene segmentos de la ruta actual
    const hash = esRutaModal().slice(2); // quitar "#/"
    const segmentos = hash.split('/').filter(seg => seg);

    // === CASO ESPECIAL: PERFIL DE USUARIO ===
    if (segmentos[0] === 'perfil-usuario') {
        const texto = document.createTextNode('PERFIL DE ');
        const span = document.createElement('span');
        span.classList.add('nombre-usuario');
        header.appendChild(texto);
        header.appendChild(span);
        document.title = "Perfil " + usuario.nombre_corto;
    }

    // === CASO ESPECIAL: VISTA INICIAL ===
    if ((segmentos[0] === 'inventarios' || segmentos[0] === 'super-admin') && segmentos.length === 1) {
        const texto = document.createTextNode('BIENVENID@, ');
        const span = document.createElement('span');
        span.classList.add('nombre-usuario');
        span.textContent = 'ADMINISTRADOR';
        header.appendChild(texto);
        header.appendChild(span);
        document.title = "Stock Control";
    }

    // Actualiza todos los campos de nombre de usuario en la página
    const camposNombre = document.querySelectorAll('.nombre-usuario');
    camposNombre.forEach(campo => {
        campo.textContent = usuario.nombre_corto;
    });

    // === VISTAS DE INVENTARIO ===
    if (segmentos[0] === 'inventarios' && segmentos.length > 1) {
        // Muestra nombre del inventario actual
        const spanInventario = document.createElement('span');
        spanInventario.classList.add('header__inventario');
        spanInventario.textContent = inventario.nombre;
        header.appendChild(spanInventario);

        // Procesa breadcrumbs de secciones
        const partes = segmentos.slice(1); // Omitir 'inventarios'

        partes.forEach(parte => {
            // Limpia segmento 'mapa' con parámetros (ambiente_id=1&nombre=Ambiente 1)
            if (parte == 'mapa') partes.splice(partes.length - 1, 1);
            
            // Agrega flecha de separación
            const flecha = document.createElement('i');
            flecha.classList.add('ri-arrow-right-s-line', 'header__flecha');
            header.appendChild(flecha);

            // Crea breadcrumb de sección
            const seccion = document.createElement('span');
            seccion.classList.add('header__seccion');
            seccion.textContent = parte.split('-').shift();
            
            // Configura título de página
            let titulo = parte;
            if (parte == "tipos-elementos") titulo = "Tipos de elementos";
            document.title = titulo.charAt(0).toUpperCase() + titulo.slice(1);
            header.appendChild(seccion);
        });
    }
    // === VISTAS DE SUPER-ADMIN ===
    else if (segmentos[0] === 'super-admin') {
        const partes = segmentos.slice(1); // Omitir 'super-admin'

        // Caso especial: super-admin/ambientes
        if (partes[0] === 'ambientes') {
            const seccion = document.createElement('span');
            seccion.classList.add('header__seccion');
            seccion.textContent = 'Ambientes';
            header.appendChild(seccion);
            document.title = 'Ambientes';

            // Sub-ruta: super-admin/ambientes/mapa
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

/**
 * Crea un elemento de navegación para el sidebar
 * 
 * @param {Object} item - Configuración del elemento
 * @param {string} item.nombre - Texto visible del elemento
 * @param {string} item.seccion - Ruta o sección del elemento
 * @param {string} item.icono - Clase CSS del icono
 * @param {string|null} base - URL base a concatenar con la sección
 * @returns {HTMLElement} Elemento li configurado para el sidebar
 */
const crearItem = ({ nombre, seccion, icono }, base = null) => {
    // Crea contenedor del elemento
    const li = document.createElement('li');
    li.classList.add('sidebar__item');

    // Crea enlace de navegación
    const a = document.createElement('a');    
    a.href = base ? `${base}${seccion}` : seccion;
    a.textContent = nombre;

    // Crea icono del elemento
    const i = document.createElement('i');
    i.classList.add(icono, 'icon');

    // Ensambla la estructura: enlace con icono + texto
    a.insertAdjacentElement('afterbegin', i);
    li.appendChild(a);
    
    return li;
};

/**
 * Limpia el mensaje informativo del sidebar cuando no corresponde mostrarlo
 */
const limpiarSidebarInfo = () => {
    // Busca elemento de información del sidebar
    const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');
    
    // Normaliza hash actual
    const hash = location.hash.replace(/\/$/, '');
    
    // Remueve información si no estamos en la vista de inventarios
    if (sidebarInfo && hash !== '#/inventarios') {
        sidebarInfo.remove();
    }
};