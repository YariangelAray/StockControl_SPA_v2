import controladorErrores from "../views/errors/controlador";
import { routes } from "./routes";
import * as api from "../utils/api";
import getCookie from "../utils/getCookie";
import { isAuth } from "../utils/auth";
import { cargarLayout } from "../layouts/layoutManager";
import { hasPermisos } from "../utils/hasPermisos";

let hayLayout = false;

export const router = async () => {
    const hash = location.hash.slice(2);
    const segmentos = hash.split("/").filter(Boolean);
    // const usuario = JSON.parse(localStorage.getItem('usuario')); // Control de sesión 
    const roles = getCookie('roles', []);
    const autenticado = await isAuth();
    

    document.title = "Stock Control";

    // Redirección por defecto
    if (segmentos.length == 0) {        
        location.hash = autenticado ? (roles.includes(1) ? '#/super-admin' : '#/inventarios') : '#/inicio';
    }

    const [ruta, parametros] = encontrarRuta(routes, segmentos);
    // Ruta no encontrada
    if (!ruta) return render404(autenticado);
    // const body = document.querySelector('body');

    const meta = ruta.meta || {};

    if (!meta.public && !autenticado) {        
        location.hash = '#/inicio';
        return;
    }

    if (meta.requiresInventory) {
        const inventario = JSON.parse(localStorage.getItem('inventario') || 'null');
        if (!inventario) {
            location.hash = '#/inventarios';
            return;
        }
    }
    if (meta.can) {
        const permisos = getCookie('permisos', []);                
        if (!hasPermisos(meta.can, permisos)) return render404(autenticado);
    }
    // Render sin layout
    if (meta.public && meta.noLayout) {
        hayLayout = false;
        await cargarLayout("public", ruta.path, hayLayout)
        // const html = await fetch(`./src/views/${ruta.path}`).then(r => r.text());
        // body.innerHTML = html;
        // body.classList.remove('content--ui');
        // body.classList.add('content--auth');
        ruta.controller(parametros || undefined);
        return;
    }

    // // Render con layout
    // if (!hayLayout) {
    //     await cargarLayout("public", ruta.path, hayLayout)
    //     // const layoutHtml = await fetch(`./src/layouts/mainLayout.html`).then(r => r.text());
    //     // body.innerHTML = layoutHtml;
    //     // body.classList.remove('content--auth');
    //     // body.classList.add('content--ui');
    //     // const respuesta = await api.get('roles/' + usuario.rol_id);
    //     // const campoRol = document.querySelector('.rol');

    //     // campoRol.textContent = "Usuario " + respuesta.data.nombre;

    //     // document.addEventListener('click', (e) => {
    //     //     if (e.target.closest('#logout')) {
    //     //         localStorage.clear();
    //     //         location.hash = '#/inicio'
    //     //     }
    //     // })
    //     hayLayout = true;
    // }

    // const vista = await fetch(`./src/views/${ruta.path}`).then(r => r.text());
    // const dashboard = document.querySelector('.dashboard');
    // if (!dashboard) {
    //     // si algo raro pasó, recargar layout para recuperar la dashboard
    //     await cargarLayout(desiredLayout);
    // }
    // document.querySelector('.dashboard').innerHTML = vista;




    // Si se necesita layout público (auth pages) o privado
    const desiredLayout = meta.public ? "public" : "private";

    if (!hayLayout || desiredLayout === "public") {
        // Si piden layout público, forzamos recarga completa del layout (útil para login)
        await cargarLayout(desiredLayout, ruta.path, hayLayout);
        hayLayout = (desiredLayout === "private");
    } else {
        // Layout privado ya cargado: solo inyectamos la vista
        const main = document.querySelector('#app-main') || document.querySelector('main');
        if (main) {
            const vista = await fetch(`./src/views/${ruta.path}`).then(r => r.text());
            main.innerHTML = vista;
        } else {
            // si por alguna razón main faltó, recargar layout completo
            await cargarLayout(desiredLayout, ruta.path, false);
            hayLayout = (desiredLayout === "private");
        }
    }



    // Llamar controlador (si requiere parámetros, se los pasamos)
    parametros ? ruta.controller(parametros) : ruta.controller();
};

const encontrarRuta = (routes, segmentos) => {

    let rutaActual = routes;
    let rutaEncontrada = false;
    let parametros = {};


    // Si el último segmento contiene parámetros, los extraemos
    if (segmentos.length > 1 && segmentos[segmentos.length - 1].includes("=")) {
        parametros = extraerParametros(segmentos[segmentos.length - 1]);
        segmentos.pop(); // Quitamos el segmento de parámetros para procesar la ruta
    }

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
    return rutaEncontrada ? [rutaActual, parametros] : [null, null];

}

const render404 = async (autenticado) => {
    if (!autenticado) {
        await cargarLayout("public", "errors/noEncontrado.html", false);
    } else {
        const html = await fetch(`./src/views/errors/noEncontrado.html`).then(r => r.text());    
        const divError = document.createElement('div');
        divError.innerHTML = html;
        const vista = divError.querySelector('.error__container');
        let main = document.querySelector('#app-main');

        if (!main) {            
            await cargarLayout("private", "errors/noEncontrado.html", false);
            main = document.querySelector('#app-main');
        }
        main.innerHTML = '';
        main.appendChild(vista);
        controladorErrores();
    }
    document.querySelector('title').textContent = "No Encontrada";
};

// Verifica si un objeto representa un grupo de rutas (todas sus claves son objetos)
const esGrupoRutas = (obj) => {
    for (let key in obj) {
        if (typeof obj[key] !== 'object' || obj[key] === null) {
            return false;
        }
    }
    return true;
}

// Extrae un objeto clave-valor desde un string de parámetros tipo "id=1&nombre=mesa"
const extraerParametros = (parametros) => {
    const pares = parametros.split("&");
    const params = {};

    pares.forEach(par => {
        const [clave, valor] = par.split("=");
        // decodeURIComponent decodifica cualquier caracter especial
        params[clave] = valor ? decodeURIComponent(valor) : "";
    });

    return params;
};
