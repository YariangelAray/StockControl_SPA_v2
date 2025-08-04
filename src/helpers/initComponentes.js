export const initComponentes = (usuario) => {

    const inventario = JSON.parse(localStorage.getItem('inventario'));

    actualizarHeader(usuario, inventario);
    marcarItem();

    const hash = location.hash.slice(2); // quitar "#/"
    const segmentos = hash.split('/').filter(seg => seg);

    if (usuario.rol_id !== 1 && !inventario && segmentos[0] === "inventarios") {
        location.hash = '#/inventarios';
    }

    if ((usuario.rol_id !== 1 && !document.querySelector('.menu__items')) || (usuario.rol_id === 1 && !document.querySelector('.sidebar__item'))) {
        generarSidebar(usuario.rol_id);
    }
}

const generarSidebar = (rol) => {
    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    if (rol === 1) {
        const opciones = [
            { nombre: 'Inicio', hash: '#/super-admin', icono: 'ri-home-3-line' },
            { nombre: 'Usuarios', hash: '#/super-admin/usuarios', icono: 'ri-user-settings-line' },
            { nombre: 'Ambientes', hash: '#/super-admin/ambientes', icono: 'ri-building-2-line' },
            { nombre: 'Inventarios', hash: '#/super-admin/inventarios', icono: 'ri-archive-line' },
            { nombre: 'Tipos de Elementos', hash: '#/super-admin/tipos-elementos', icono: 'ri-git-branch-line' },
        ];

        opciones.forEach(({ nombre, hash, icono }) => {
            const li = document.createElement('li');
            li.classList.add('sidebar__item');

            const a = document.createElement('a');
            a.href = hash;
            a.textContent = nombre;

            const i = document.createElement('i');
            i.classList.add(icono, 'icon');

            a.insertAdjacentElement('afterbegin', i);
            li.appendChild(a);

            sidebarList.appendChild(li);
            if (nombre === 'Inicio') {
                const separacion = document.createElement('hr');
                separacion.classList.add('separacion');
                sidebarList.append(separacion);
            }
        });
    }

    // Menú para administrativo (rol_id === 2) y usuario común (rol_id === 3)
    else {

        const generado = sidebarList.querySelector('.sidebar__menu .sidebar__list > .sidebar__item')

        if (!generado) {
            const li = document.createElement('li');
            li.classList.add('sidebar__item');

            const a = document.createElement('a');
            a.href = '#/inventarios';
            a.textContent = 'Inventarios';

            const i = document.createElement('i');
            i.classList.add('ri-archive-line', 'icon');

            a.insertAdjacentElement('afterbegin', i);
            li.appendChild(a);

            const separacion = document.createElement('hr');
            separacion.classList.add('separacion');

            sidebarList.append(li, separacion);
        }

        const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');

        if (location.hash.includes('perfil-usuario') && sidebarInfo) return;

        sidebarInfo?.remove();

        const menuItems = document.createElement('div');
        menuItems.classList.add('menu__items');
        sidebarList.append(menuItems);

        const opciones = [
            { nombre: 'Ambientes', seccion: 'ambientes', icono: 'ri-building-2-line' },
            ...(rol === 2 ? [
                { nombre: 'Detalles', seccion: 'detalles', icono: 'ri-file-list-line' },
                { nombre: 'Elementos', seccion: 'elementos', icono: 'ri-clipboard-line' },
                { nombre: 'Reportes', seccion: 'reportes', icono: 'ri-information-line' }
            ] : [
                { nombre: 'Elementos', seccion: 'elementos', icono: 'ri-clipboard-line' }
            ])
        ];

        opciones.forEach(({ nombre, seccion, icono }) => {
            const li = document.createElement('li');
            li.classList.add('sidebar__item');

            const a = document.createElement('a');
            a.href = `#/inventarios/${seccion}`;
            a.textContent = nombre;

            const i = document.createElement('i');
            i.classList.add(icono, 'icon');

            a.insertAdjacentElement('afterbegin', i);
            li.appendChild(a);
            menuItems.appendChild(li);
        });

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
        header.appendChild(texto);
        header.appendChild(span);
        pageTitle.textContent = "Perfil";
    }

    // Caso especial: vista inicial
    if ((segmentos[0] === 'inventarios' || segmentos[0] === 'super-admin') && segmentos.length === 1) {
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
        campo.textContent = usuario.nombres.split(" ")[0] + " " + usuario.apellidos.split(" ")[0];
    })

    // Caso: vistas de inventario
    if (segmentos[0] === 'inventarios') {
        if (!inventario) return;

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
            pageTitle.textContent = seccion.textContent.charAt(0).toUpperCase() + seccion.textContent.slice(1);
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
            pageTitle.textContent = 'Ambientes';

            // Si hay más segmentos (por ejemplo: super-admin/ambientes/mapa)
            if (partes[1]) {
                const flecha = document.createElement('i');
                flecha.classList.add('ri-arrow-right-s-line', 'header__flecha');
                header.appendChild(flecha);

                const subSeccion = document.createElement('span');
                subSeccion.classList.add('header__seccion');

                subSeccion.textContent = partes[1];
                pageTitle.textContent = partes[1].charAt(0).toUpperCase() + partes[1].slice(1);                
                
                header.appendChild(subSeccion);
            }
        }
        else {
            // Resto de casos en super-admin
            partes.forEach(parte => {
                let titulo = parte;
                if (parte == "tipos-elementos")
                    titulo = "Tipos de elementos";

                pageTitle.textContent = titulo.charAt(0).toUpperCase() + titulo.slice(1);
                header.textContent = titulo;
            });
        }
    }

};