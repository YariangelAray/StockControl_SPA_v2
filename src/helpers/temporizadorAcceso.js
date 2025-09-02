import { infoAlert } from "../utils/alertas";
import { get, del } from "../utils/api";
import getCookie from "../utils/getCookie";
import hasPermisos from "../utils/hasPermisos";

// Variable que indica si el temporizador ya está activo para evitar múltiples instancias
let temporizadorActivo = false;
// Variable para almacenar el ID del intervalo que actualiza el temporizador
let intervalo = null;

/**
 * Inicializa el temporizador de acceso temporal a un inventario.
 * Controla la expiración del código de acceso y actualiza la interfaz según permisos.
 */
export const initTemporizadorAcceso = async () => {
  // Si el temporizador ya está activo, no hacer nada
  if (temporizadorActivo) return;

  // Obtiene la información del código de acceso y el inventario desde localStorage
  const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
  const inventario = JSON.parse(localStorage.getItem('inventario'));
  // Obtiene los permisos del usuario desde cookies
  const permisos = getCookie('permisos', []);

  // Si no hay información de código o inventario, no continuar
  if (!codigoInfo || !inventario) return;

  // Calcula el tiempo restante hasta la expiración del código
  const expiracion = new Date(codigoInfo.expiracion);
  const ahora = new Date();
  const restante = expiracion - ahora;

  // Si el código ya expiró, elimina los accesos y termina
  if (restante <= 0) {
    await eliminarAccesos(inventario.id, permisos);
    return;
  }

  // Marca el temporizador como activo para evitar reinicios
  temporizadorActivo = true;

  // Aquí podrían ir acciones específicas si el usuario tiene ciertos permisos
  if (hasPermisos('inventario.view-access-own', permisos)) {
    // Código pendiente o reservado para permisos 'inventario.view-access-own'
  }

  if (hasPermisos('inventario.view-own', permisos)) {
    // Código pendiente o reservado para permisos 'inventario.view-own'
  }

  // Inicia un intervalo que se ejecuta cada segundo para actualizar el temporizador
  intervalo = setInterval(async () => {
    const ahora = new Date();

    if(location.hash == "#/inicio" || location.hash == "#/registro" || location.hash == "#/inventarios"){
      clearInterval(intervalo)
      temporizadorActivo = false;      
      document.querySelector('.sidebar .access-info')?.classList.add('hidden');
      localStorage.removeItem('codigoAccesoInfo');
      if (hasPermisos('inventario.view-access-own', permisos)) localStorage.removeItem('inventario');
      return;
    }

    // Si el tiempo actual supera la expiración, limpia el intervalo y elimina accesos
    if (ahora >= expiracion) {
      clearInterval(intervalo);
      temporizadorActivo = false;
      await eliminarAccesos(inventario.id, permisos);
    } else {
      // Mientras no expire, actualiza la interfaz según permisos
      if (hasPermisos('inventario.view-access-own', permisos)) mostrarTemporizadorSidebar(expiracion);
      if (hasPermisos('inventario.view-own', permisos)) {
        mostrarTemporizadorDashboard(expiracion, codigoInfo.codigo, inventario.id);
      }
    }
  }, 1000);
};

/**
 * Muestra el temporizador en la barra lateral (sidebar).
 * @param {Date} expiracion - Fecha y hora de expiración del acceso.
 */
const mostrarTemporizadorSidebar = (expiracion) => {
  const info = document.querySelector('.sidebar .access-info');
  if (info) {
    info.classList.remove('hidden'); // Muestra el contenedor de información de acceso
    actualizarTemporizadorSidebar(expiracion); // Actualiza el tiempo restante visible
  }
};

/**
 * Actualiza el texto del temporizador en la barra lateral.
 * @param {Date} expiracion - Fecha y hora de expiración del acceso.
 */
const actualizarTemporizadorSidebar = (expiracion) => {
  const span = document.querySelector('.sidebar .access-info .tiempo-acceso');
  if (span) span.textContent = formatoTiempo(expiracion);
};

/**
 * Muestra el temporizador y la información de acceso en el dashboard principal.
 * @param {Date} expiracion - Fecha y hora de expiración del acceso.
 * @param {string} codigo - Código de acceso temporal.
 * @param {number} inventarioId - ID del inventario.
 */
const mostrarTemporizadorDashboard = (expiracion, codigo, inventarioId) => {
  const accessInfoRow = document.querySelector('.dashboard .access-info');
  const usuariosAcces = document.querySelector('.dashboard .access-info + .dashboard__row');
  const codigoAccesoText = document.querySelector('.codigo-acceso');

  if (accessInfoRow && usuariosAcces && codigoAccesoText) {
    accessInfoRow.classList.remove('hidden'); // Muestra la fila de información de acceso
    usuariosAcces.classList.remove('hidden'); // Muestra la fila con usuarios gestionando
    codigoAccesoText.textContent = codigo; // Muestra el código de acceso
    actualizarTemporizadorDashboard(expiracion); // Actualiza el temporizador visible
    actualizarUsuariosGestionando(inventarioId); // Actualiza el conteo de usuarios gestionando
  }
};

/**
 * Actualiza el texto del temporizador en el dashboard.
 * @param {Date} expiracion - Fecha y hora de expiración del acceso.
 */
const actualizarTemporizadorDashboard = (expiracion) => {
  const tiempoAcceso = document.querySelector('.dashboard .tiempo-acceso');
  if (tiempoAcceso) tiempoAcceso.textContent = formatoTiempo(expiracion);
};

/**
 * Obtiene y actualiza el número de usuarios que están gestionando el inventario.
 * @param {number} inventarioId - ID del inventario.
 */
const actualizarUsuariosGestionando = async (inventarioId) => {
  const usuariosAcces = document.querySelector('.dashboard .usuarios-gestionando');
  // Solicita la lista de usuarios con acceso al inventario
  const respuesta = await get('accesos/usuarios/inventarios/' + inventarioId);
  if (usuariosAcces) {
    // Muestra la cantidad de usuarios o 0 si no hay datos
    usuariosAcces.textContent = respuesta.success && respuesta.data ? respuesta.data.length : 0;
  }
};

/**
 * Formatea el tiempo restante hasta la expiración en formato "HHh MMm SSs".
 * @param {Date} expiracion - Fecha y hora de expiración.
 * @returns {string} Tiempo formateado.
 */
const formatoTiempo = (expiracion) => {
  const restante = expiracion - new Date();
  const horas = Math.floor((restante / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((restante / (1000 * 60)) % 60);
  const segundos = Math.floor((restante / 1000) % 60);
  // Devuelve el tiempo con ceros a la izquierda para horas, minutos y segundos
  return `${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`;
};

/**
 * Elimina los accesos temporales y limpia la información relacionada.
 * @param {number} inventarioId - ID del inventario.
 * @param {Array} permisos - Lista de permisos del usuario.
 */
const eliminarAccesos = async (inventarioId, permisos) => {
  // Elimina la información del código de acceso del almacenamiento local
  localStorage.removeItem('codigoAccesoInfo');
  // Si el usuario tiene permiso, elimina también la información del inventario
  if (hasPermisos('inventario.view-access-own', permisos)) localStorage.removeItem('inventario');
  // Realiza una petición DELETE para eliminar el acceso en el backend
  await del('accesos/inventarios/' + inventarioId);

  // Dispara un evento personalizado para notificar que el código de acceso expiró
  document.dispatchEvent(new CustomEvent('codigoAccesoExpirado', {
    detail: { inventarioId }
  }));
};

/**
 * Listener para manejar la expiración del acceso temporal.
 * Muestra alertas y oculta elementos de la interfaz según permisos.
 * 
 * @param {Event} e - Evento disparado al expirar el acceso.
 */
export const listenerExpiracion = async (e) => {
  const permisos = getCookie('permisos', []);

  // Si el usuario tiene permiso para ver acceso propio, muestra alerta y redirige
  if (hasPermisos('inventario.view-access-own', permisos)) {
    document.querySelector('.sidebar .access-info')?.classList.add('hidden');
    await infoAlert("Acceso expirado", "Tu acceso temporal al inventario ha finalizado.");
    location.hash = '#/inventarios'; // Redirige al listado de inventarios
  }

  // Si el usuario tiene permiso para ver inventario propio, oculta elementos del dashboard
  if (hasPermisos('inventario.view-own', permisos)) {
    document.querySelector('.dashboard .access-info')?.classList.add('hidden');
    document.querySelector('.dashboard .access-info + .dashboard__row')?.classList.add('hidden');
  }
};
