import controladorErrores from "../views/errors/controlador";
import { routes } from "./routes";
import * as api from "../utils/api";
let hayLayout = false;

export const router = async () => {
    const hash = location.hash.slice(2);
    const segmentos = hash.split("/").filter(Boolean);

    const ruta = encontrarRuta(routes, segmentos);
    const body = document.querySelector('body');

    const usuario = JSON.parse(localStorage.getItem('usuario')); // Control de sesión
    const pageTitle = document.querySelector('title');
    pageTitle.textContent = "Stock Control";

    // Redirección por defecto
    if (segmentos.length === 0) {
        location.hash = usuario ? (usuario.rol_id == 1 ? '#/super-admin' : '#/inventarios') : '#/inicio';
        return;
    }

    // Ruta no encontrada
    if (!ruta) {
        const html = await fetch(`./src/views/errors/noEncontrado.html`).then(r => r.text());
        pageTitle.textContent = "No Encontrada"
        if (!usuario) {
            body.classList.remove('content--ui');
            body.classList.add('content--auth');
            body.innerHTML = html;
        } else {
            const divError = document.createElement('div');
            divError.innerHTML = html;
            const vista = divError.querySelector('.error__container');
            document.querySelector('.dashboard').innerHTML = '';
            document.querySelector('.dashboard').appendChild(vista);
            controladorErrores()
        }
        return;
    }

    const meta = ruta.meta || {};    

    if (!meta.public && !usuario) {
        location.hash = "#/inicio";
        return;
    }

    if (meta.rolesPermitidos && !meta.rolesPermitidos.includes(usuario.rol_id)) {
        location.hash = "#/no-encontrada";
        return;
    }

    // Render sin layout
    if (meta.nolayout) {
        hayLayout = false;
        const html = await fetch(`./src/views/${ruta.path}`).then(r => r.text());
        body.innerHTML = html;
        body.classList.remove('content--ui');
        body.classList.add('content--auth');
        ruta.controller();
        return;
    }

    // Render con layout
    if (!hayLayout) {
        const layoutHtml = await fetch(`./src/layouts/mainLayout.html`).then(r => r.text());
        body.innerHTML = layoutHtml;
        body.classList.remove('content--auth');
        body.classList.add('content--ui');
        const respuesta = await api.get('roles/' + usuario.rol_id);
        const campoRol = document.querySelector('.rol');

        campoRol.textContent = "Usuario " + respuesta.data.nombre;

        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout')) {
                localStorage.clear();
                location.hash = '#/inicio'
            }
        })
        hayLayout = true;
    }

    const vista = await fetch(`./src/views/${ruta.path}`).then(r => r.text());
    document.querySelector('.dashboard').innerHTML = vista;

    ruta.controller();
    hayLayout = true;
};

const encontrarRuta = (routes, segmentos) => {

    let rutaActual = routes;
    let rutaEncontrada = false;

    // Recorremos los segmentos del hash para encontrar la ruta correspondiente
    segmentos.forEach((segmento, index) => {

        // Si el segmento existe dentro del objeto de rutas actual, avanzamos al siguiente nivel
        if (rutaActual[segmento]) {
            rutaActual = rutaActual[segmento];
            rutaEncontrada = true;
        } else {
            // Si el segmento no existe, marcamos la ruta como no encontrada
            rutaEncontrada = false;
        }

        // Si la ruta actual es un grupo de rutas (es decir, tiene más subniveles)    

        if (esGrupoRutas(rutaActual)) {

            if (rutaActual["/"] && (index == segmentos.length - 1)) {
                rutaActual = rutaActual["/"];
                rutaEncontrada = true;
            } else {
                // Si no cumple con esa condición, entonces la ruta no es válida
                rutaEncontrada = false;
            }
        }

    });

    // Retornamos la ruta encontrada junto a sus parámetros, o null si no se halló una ruta válida
    return rutaEncontrada ? rutaActual : null;

}

// Verifica si un objeto representa un grupo de rutas (todas sus claves son objetos)
const esGrupoRutas = (obj) => {
    for (let key in obj) {
        if (typeof obj[key] !== 'object' || obj[key] === null) {
            return false;
        }
    }
    return true;
}