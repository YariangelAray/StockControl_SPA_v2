import { marcarItem } from "./marcarItem";

export const generarSidebar = (rol = 'usuario') => {
    
    const inventario = localStorage.getItem('inventario');
    if (!inventario) return;
    
    const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');
    const sidebarInfo = document.querySelector('.sidebar__menu .sidebar-info');
    
    sidebarInfo?.classList.add('hidden');
    sidebarList.querySelector('.menu__items')?.remove();

    // Define menú según rol
    const listamenu = [
        { nombre: 'Ambientes', icono: 'ri-building-2-line' },
        ...(rol == 'admin' ? [
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

    sidebarList.appendChild(menuItems);
    requestAnimationFrame(() => marcarItem()); 
};
