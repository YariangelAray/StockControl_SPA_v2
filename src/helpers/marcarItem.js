export const marcarItem = () => {

    const sidebar = document.querySelector('.sidebar__menu');
    if (!sidebar) return; // ← Evita errores si estás en login, etc.    
    
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
