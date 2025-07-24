import { routes } from "./routes";

let hayLayout = false;

// Función principal del enrutador SPA
export const router = async () => {
    const hash = location.hash.slice(2); // Eliminamos "#/"    
    const segmentos = hash.split("/").filter(seg => seg); // Extrae y filtra los segmentos del hash

    if (segmentos.length === 0) {
        redirigirARuta("inventarios");
        return;
    }    
    // Buscar la ruta y extraer parámetros
    const ruta = encontrarRuta(routes, segmentos);
    
    if (!ruta) {
        console.log("No hay ruta");
        return;
    }

    
    const body = document.querySelector('body');

    if (ruta.nolayout) {
        hayLayout = false;
        const html = await fetch(`./src/views/${ruta.path}`).then(r => r.text());
        body.innerHTML = html;
        body.classList.remove('content--ui');
        body.classList.add('content--auth');
        return;
    }

    if (hayLayout) {
        const vista = await fetch(`./src/views/${ruta.path}`).then(r => r.text());
        document.querySelector('.dashboard').innerHTML = vista;
        ruta.controller();
        return;
    }

    const layoutHtml = await fetch(`./src/layouts/mainLayout.html`).then(r => r.text());
    body.innerHTML = layoutHtml;
    body.classList.remove('content--auth');
    body.classList.add('content--ui');

    const vista = await fetch(`./src/views/${ruta.path}`).then(r => r.text());
    document.querySelector('.dashboard').innerHTML = vista;

    hayLayout = true;
    ruta.controller();
};

// Redirecciona a una ruta determinada
const redirigirARuta = (ruta) => {
    location.hash = `#/${ruta}`;
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

// Carga una vista HTML externa dentro de un elemento
const cargarVista = async (path, elemento) => {
    try {
        const response = await fetch(`./src/Views/${path}`);
        if (!response.ok) throw new Error("Vista no encontrada");

        const contenido = await response.text();
        elemento.innerHTML = contenido;
    } catch (error) {
        console.error(error);
        elemento.innerHTML = `<h2>Error al cargar la vista</h2>`;
    }
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