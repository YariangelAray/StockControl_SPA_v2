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

// Variable global para controlar si el layout ya está cargado
let hayLayout = false;

/**
 * Router principal que maneja todas las rutas de la aplicación
 * Procesa el hash de la URL y renderiza la vista correspondiente
 * @returns {Promise<void>} No retorna valor, maneja el enrutamiento internamente
 */
export const router = async () => {
  // Obtiene el hash sin los primeros dos caracteres (#/)
  const hash = location.hash.slice(2);
  // Divide el hash en segmentos y filtra los vacíos
  const segmentos = hash.split("/").filter(Boolean);

  // Si no hay segmentos, redirige a la página de inicio
  if (segmentos.length == 0) {
    location.hash = '#/inicio';
    return;
  }

  // Busca la ruta correspondiente en el objeto de rutas
  const [ruta, parametros] = encontrarRuta(routes, segmentos);

  // Obtiene los roles del usuario desde las cookies
  const roles = getCookie('roles', []);

  // Si la ruta no existe, renderiza página 404
  if (!ruta) return render404(roles.length != 0);

  // Obtiene los metadatos de la ruta
  const meta = ruta.meta || {};

  // Verifica autenticación para rutas privadas
  if (!meta.public && !(await isAuth())) {
    location.hash = '#/inicio';
    return;
  }

  // Renderiza vistas públicas sin layout (como páginas de login)
  if (meta.public && meta.noLayout) {
    document.title = "Stock Control";
    hayLayout = false;
    // Carga el layout público sin estructura
    await cargarLayout("public", ruta.path, hayLayout)
    // Ejecuta el controlador de la vista
    ruta.controller();
    return;
  }

  // Verifica permisos específicos si se requieren
  if (meta.can) {
    const permisos = getCookie('permisos', []);
    const requeridos = Array.isArray(meta.can) ? meta.can : [meta.can];
    // Si no tiene los permisos necesarios, muestra 404
    if (!requeridos.some(r => hasPermisos(r, permisos))) return render404(roles.length != 0);
  }

  // Verifica si se requiere un inventario seleccionado
  if (meta.requiresInventory) {
    const inventario = JSON.parse(localStorage.getItem('inventario') || 'null');
    if (!inventario) {
      location.hash = '#/inventarios';
      return;
    }
  }

  // Inicializa el temporizador de acceso para sesiones
  await initTemporizadorAcceso();

  // Determina qué layout usar (público o privado)
  const desiredLayout = meta.public ? "public" : "private";

  // Cierra cualquier modal abierto si no es una ruta modal
  if (!meta.modal) {
    const modalAbierto = document.getElementById('app-modal');
    if (modalAbierto) cerrarModal(modalAbierto);
  }

  // Manejo especial para rutas que son modales
  if (meta.modal) {
    // Obtiene el hash base (ruta padre del modal)
    const hashBase = obtenerHashBase();
    // Verifica si estamos en la ruta base
    const enBase = location.hash.startsWith(hashBase);
    const modalAbierto = document.getElementById('app-modal');

    // Busca la ruta base correspondiente
    const [rutaBase, paramsBase] = encontrarRuta(routes, hashBase.slice(2).split('/'));

    // Si no estamos en la base o no hay dashboard, carga la vista base primero
    if (!enBase || !document.querySelector('.dashboard__layout')) {
      await cargarLayout(desiredLayout, rutaBase.path, false);
      rutaBase.controller(paramsBase);
      initComponentes();
      hayLayout = true;
    }

    // Si el modal ya está abierto y es el mismo, solo actualiza el controlador
    if (modalAbierto && meta.sameModal) {
      ruta.controller(modalAbierto, parametros);
      return;
    }

    // Abre el modal con el gestor de modales
    await modalManager({
      nombre: ruta.path,
      parametros,
      controlador: ruta.controller,
      mismoModal: meta.sameModal
    });
    return;
  }

  // Carga el layout privado si no está cargado
  if (!hayLayout && desiredLayout === "private") {
    await cargarLayout("private", ruta.path, false);
    hayLayout = true;
  } else {
    // Busca el contenedor principal
    const main = document.querySelector('#app-main') || document.querySelector('main');
    if (main) {
      // Carga el layout manteniendo el estado actual
      await cargarLayout(desiredLayout, ruta.path, hayLayout);
    }
    else {
      // Carga el layout desde cero
      await cargarLayout(desiredLayout, ruta.path, false);
      hayLayout = (desiredLayout === "private");
    }
  }

  // Ejecuta el controlador con o sin parámetros
  parametros ? ruta.controller(parametros) : ruta.controller();
  // Inicializa los componentes de la vista
  initComponentes();
};

/**
 * Busca una ruta específica dentro del objeto de rutas anidadas
 * Retorna la ruta encontrada y sus parámetros
 * @param {Object} routes - Objeto de rutas de la aplicación
 * @param {string[]} segmentos - Array de segmentos del hash URL
 * @returns {[Object|null, Object]} Ruta encontrada y sus parámetros
 */
const encontrarRuta = (routes, segmentos) => {
  let rutaActual = routes;
  let rutaEncontrada = false;
  let parametros = {};

  // Extrae parámetros del último segmento si los contiene
  if (segmentos.length > 1 && segmentos[segmentos.length - 1].includes("=")) {
    parametros = extraerParametros(segmentos[segmentos.length - 1]);
    // Remueve el segmento de parámetros para procesar solo la ruta
    segmentos.pop();
  }

  // Recorre cada segmento del hash para navegar por el árbol de rutas
  segmentos.forEach((segmento, index) => {
    // Verifica si el segmento existe en el nivel actual de rutas
    if (rutaActual.hasOwnProperty(segmento)) {
      rutaActual = rutaActual[segmento];
      rutaEncontrada = true;
    } else {
      // Marca la ruta como no encontrada si el segmento no existe
      rutaEncontrada = false;
    }

    // Maneja grupos de rutas con ruta índice "/"
    if (rutaEncontrada && esGrupoRutas(rutaActual)) {
      // Si hay una ruta índice y estamos en el último segmento
      if (rutaActual["/"] && (index == segmentos.length - 1)) {
        rutaActual = rutaActual["/"];
        rutaEncontrada = true;
      } else {
        // Si no hay ruta índice válida, marca como no encontrada
        rutaEncontrada = false;
      }
    }
  });

  // Retorna la ruta encontrada con sus parámetros o null si no existe
  return rutaEncontrada ? [rutaActual, parametros] : [null, null];
}

/**
 * Renderiza la página de error 404
 * Maneja diferentes layouts según el estado de autenticación
 * @param {boolean} autenticado - Si el usuario está autenticado o no
 * @returns {Promise<void>} No retorna valor, renderiza la vista de error

 */
const render404 = async (autenticado) => {
  if (!autenticado) {
    // Carga layout público para usuarios no autenticados
    await cargarLayout("public", "errors/noEncontrado.html", false);
  } else {
    // Carga la vista de error dentro del layout privado
    const html = await fetch(`./src/views/errors/noEncontrado.html`).then(r => r.text());
    const divError = document.createElement('div');
    divError.innerHTML = html;
    const vista = divError.querySelector('.error__container');
    let main = document.querySelector('#app-main');

    // Si no hay contenedor principal, carga el layout privado
    if (!main) {
      await cargarLayout("private", "errors/noEncontrado.html", false);
      main = document.querySelector('#app-main');
    }
    // Inserta la vista de error en el contenedor principal
    main.innerHTML = '';
    main.appendChild(vista);
    // Inicializa los componentes de la vista
    initComponentes();
  }
  // Ejecuta el controlador de errores
  controladorErrores();
  // Establece el título de la página
  document.querySelector('title').textContent = "No Encontrada";
};

/**
 * Verifica si un objeto representa un grupo de rutas anidadas
 * Un grupo de rutas contiene solo objetos como valores
 * @param {Object} obj - Objeto a verificar
 * @returns {boolean} True si es un grupo de rutas, false en caso contrario
 */
const esGrupoRutas = (obj) => {
  for (let key in obj) {
    // Si alguna propiedad no es un objeto, no es un grupo de rutas
    if (typeof obj[key] !== 'object' || obj[key] === null) {
      return false;
    }
  }
  return true;
}

/**
 * Convierte un string de parámetros URL en un objeto clave-valor
 * @param {string} parametros - String con parámetros en formato "id=1&nombre=mesa"
 * @returns {Object} Objeto con los parámetros parseados
 */
const extraerParametros = (parametros) => {
  // Divide los parámetros por el separador &
  const pares = parametros.split("&");
  const params = {};

  // Procesa cada par clave=valor
  pares.forEach(par => {
    const [clave, valor] = par.split("=");
    // Decodifica caracteres especiales en la URL
    params[clave] = valor ? decodeURIComponent(valor) : "";
  });

  return params;
};

/**
 * Determina si la ruta actual es un modal y retorna el hash apropiado
 * Para modales retorna el hash base, para rutas normales el hash completo
 * @returns {string} Hash base si es modal, hash completo si no lo es
 */
export const esRutaModal = () => {
  // Obtiene los segmentos de la ruta actual
  const hash = location.hash.slice(2);
  const segmentos = hash.split("/").filter(Boolean);
  // Busca la ruta correspondiente
  const [ruta] = encontrarRuta(routes, segmentos);
  // Retorna hash base si es modal, hash completo si no lo es
  return ruta?.meta?.modal ? obtenerHashBase() : location.hash;
};

// Remueve el listener anterior para evitar duplicados
document.removeEventListener('codigoAccesoExpirado', listenerExpiracion);
// Añade el listener para manejar la expiración del código de acceso
document.addEventListener('codigoAccesoExpirado', listenerExpiracion);