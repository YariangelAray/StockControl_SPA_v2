export const initComponentes = (usuario) => {        
    
    const inventario = JSON.parse(localStorage.getItem('inventario'));

    actualizarHeader(usuario, inventario);
    marcarItem();

    const hash = location.hash.slice(2); // quitar "#/"
    const segmentos = hash.split('/').filter(seg => seg);

    if (!inventario && segmentos[0] === "inventarios") {
        location.hash = '#/inventarios';        
    }

    if (inventario && !document.querySelector('.menu__items')) {
        generarSidebar(usuario.rol_id);
    }
}

const generarSidebar = (rol = 2) => {
    
    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');
    
    sidebarInfo?.classList.add('hidden');
    sidebarList?.querySelector('.menu__items')?.remove();

    // Define menú según rol
    const listamenu = [
        { nombre: 'Ambientes', icono: 'ri-building-2-line' },
        ...(rol == 1 ? [
            { nombre: 'Detalles', icono: 'ri-file-list-line' },
            { nombre: 'Elementos', icono: 'ri-clipboard-line' },
            { nombre: 'Reportes', icono: 'ri-information-line' }
        ] : [
            { nombre: 'Elementos', icono: 'ri-clipboard-line' }
        ])
    ];

    const menuItems = document.createElement('div');
    menuItems.classList.add('menu__items');
    
    listamenu.forEach(({ nombre, icono }) => {
        const li = document.createElement('li');
        li.classList.add('sidebar__item');
        
        const a = document.createElement('a');
        a.href = `#/inventarios/${nombre.toLowerCase()}`;
        a.textContent = nombre;
        
        const i = document.createElement('i');
        i.classList.add(icono, 'icon');
        
        a.insertAdjacentElement('afterbegin', i);
        li.appendChild(a);
        menuItems.appendChild(li);
    });

    sidebarList?.appendChild(menuItems);
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

const actualizarHeader = (usuario, inventario) => {
    const header = document.querySelector('.header__title');
    const pageTitle = document.querySelector('title');
    
    header.innerHTML = ''; // Limpiar contenido anterior
    const hash = location.hash.slice(2); // quitar "#/"
    const segmentos = hash.split('/').filter(seg => seg);

    // Caso especial: perfil de usuario
    if (segmentos[0] === 'perfil-usuario') {
        const texto = document.createTextNode('PERFIL DE ');
        const span = document.createElement('span');
        span.classList.add('nombre-usuario');
        span.textContent = 'ADMINISTRADOR';
        header.appendChild(texto);
        header.appendChild(span);
        pageTitle.textContent = "Perfil";
    }

    // Caso especial: vista inicial
    if (segmentos[0] === 'inventarios' && segmentos.length === 1) {
        const texto = document.createTextNode('BIENVENID@, ');
        const span = document.createElement('span');
        span.classList.add('nombre-usuario');
        span.textContent = 'ADMINISTRADOR';
        header.appendChild(texto);
        header.appendChild(span);
        pageTitle.textContent = "Stock Control"; 
    }

    const camposNombre = document.querySelectorAll('.nombre-usuario');

    camposNombre.forEach(campo => {
        campo.textContent = usuario.nombres.split(" ")[0] +" "+ usuario.apellidos.split(" ")[0];
    })

    // Caso: vistas de inventario
    if (segmentos[0] === 'inventarios') {        
        if (!inventario) return;

        const nombreInventario = inventario.nombre;
        const spanInventario = document.createElement('span');
        spanInventario.classList.add('header__inventario');
        spanInventario.textContent = nombreInventario;
        header.appendChild(spanInventario);

        const partes = segmentos.slice(1); // Omitir 'inventarios'

        partes.forEach(parte => {
            const flecha = document.createElement('i');
            flecha.classList.add('ri-arrow-right-s-line', 'header__flecha');
            header.appendChild(flecha);

            const seccion = document.createElement('span');
            seccion.classList.add('header__seccion');
            seccion.textContent = parte.split('-').shift();
            pageTitle.textContent = seccion.textContent.charAt(0).toUpperCase() + seccion.textContent.slice(1);
            header.appendChild(seccion);
        });
    }
};