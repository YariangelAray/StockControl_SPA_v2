import controladorErrores from "../views/errors/controlador";
import { routes } from "./routes";
import getCookie from "../utils/getCookie";
import { isAuth } from "../utils/auth";
import { cargarLayout } from "../layouts/layoutManager";
import { initComponentes } from "../helpers/initComponentes";
import hasPermisos from "../utils/hasPermisos";
import modalManager from "../modals/modalManager";
import { cerrarModal } from "../modals/modalsController";
import obtenerHashBase from "../helpers/obtenerHashBase";
import { initTemporizadorAcceso, listenerExpiracion } from "../helpers/temporizadorAcceso";

let hayLayout = false;

export const router = async () => {
  const hash = location.hash.slice(2);
  const segmentos = hash.split("/").filter(Boolean);

  // Redirección por defecto
  if (segmentos.length == 0) {
    location.hash = '#/inicio';
    return;
  }

  const [ruta, parametros] = encontrarRuta(routes, segmentos);

  // Ruta no encontrada

  const roles = getCookie('roles', []);

  if (!ruta) return render404(roles.length != 0);

  const meta = ruta.meta || {};

  // Solo poner título predeterminado si no es modal

  if (!meta.public && !(await isAuth())) {
    location.hash = '#/inicio';
    return;
  }
  // Render sin layout
  if (meta.public && meta.noLayout) {
    document.title = "Stock Control";
    hayLayout = false;
    await cargarLayout("public", ruta.path, hayLayout)
    ruta.controller();
    return;
  }

  if (meta.can) {
    const permisos = getCookie('permisos', []);
    const requeridos = Array.isArray(meta.can) ? meta.can : [meta.can];
    if (!requeridos.some(r => hasPermisos(r, permisos))) return render404(roles.length != 0);
  }

  if (meta.requiresInventory) {
    const inventario = JSON.parse(localStorage.getItem('inventario') || 'null');
    if (!inventario) {
      location.hash = '#/inventarios';
      return;
    }
  }
  
  await initTemporizadorAcceso();

  const desiredLayout = meta.public ? "public" : "private";

  if (!meta.modal) {
    // 🔑 cerrar modal si existe
    const modalAbierto = document.getElementById('app-modal');
    if (modalAbierto) cerrarModal(modalAbierto);
  }

  if (meta.modal) {
    const hashBase = obtenerHashBase();
    const enBase = location.hash.startsWith(hashBase);
    const modalAbierto = document.getElementById('app-modal');

    const [rutaBase, paramsBase] = encontrarRuta(routes, hashBase.slice(2).split('/'));

    if (!enBase || !document.querySelector('.dashboard__layout')) {
      await cargarLayout(desiredLayout, rutaBase.path, false);
      rutaBase.controller(paramsBase);
      initComponentes();
      hayLayout = true;
    }
    
    // Si el modal ya está abierto y es el mismo, solo refrescar el controlador
    if (modalAbierto && meta.sameModal) {
      ruta.controller(modalAbierto, parametros);
      return;
    }
        
    // Si no está abierto o es diferente, abrir normalmente
    await modalManager({
      nombre: ruta.path,
      parametros,
      controlador: ruta.controller,
      mismoModal: meta.sameModal
    });
    return;
  }

  // Si se necesita layout público (auth pages) o privado

  if (!hayLayout && desiredLayout === "private") {
    await cargarLayout("private", ruta.path, false);
    hayLayout = true;
  } else {
    const main = document.querySelector('#app-main') || document.querySelector('main');
    if (main) {
      await cargarLayout(desiredLayout, ruta.path, hayLayout);

    }
    else {
      await cargarLayout(desiredLayout, ruta.path, false);
      hayLayout = (desiredLayout === "private");
    }
  }


  // Llamar controlador (si requiere parámetros, se los pasamos)
  parametros ? ruta.controller(parametros) : ruta.controller();
  initComponentes();  
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
    if (rutaActual.hasOwnProperty(segmento)) {
      rutaActual = rutaActual[segmento];
      rutaEncontrada = true;
    } else {
      // Si el segmento no existe, marcamos la ruta como no encontrada      
      rutaEncontrada = false;
    }

    // Si la ruta actual es un grupo de rutas (es decir, tiene más subniveles)    

    if (rutaEncontrada && esGrupoRutas(rutaActual)) {
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
    initComponentes();
  }
  controladorErrores();
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


export const esRutaModal = () => {
  const hash = location.hash.slice(2);
  const segmentos = hash.split("/").filter(Boolean);
  const [ruta] = encontrarRuta(routes, segmentos);
  return ruta?.meta?.modal ? obtenerHashBase() : location.hash;
};

document.removeEventListener('codigoAccesoExpirado', listenerExpiracion);
document.addEventListener('codigoAccesoExpirado', listenerExpiracion);
