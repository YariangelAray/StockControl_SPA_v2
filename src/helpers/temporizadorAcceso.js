import { infoAlert } from "../utils/alertas";
import { get, del } from "../utils/api";
import getCookie from "../utils/getCookie";
import hasPermisos from "../utils/hasPermisos";

let temporizadorActivo = false;
let intervalo = null;

export const initTemporizadorAcceso = async () => {
  // console.log(temporizadorActivo)
  if (temporizadorActivo) return;

  const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
  const inventario = JSON.parse(localStorage.getItem('inventario'));
  const permisos = getCookie('permisos', []);

  if (!codigoInfo || !inventario) return;

  const expiracion = new Date(codigoInfo.expiracion);
  const ahora = new Date();
  const restante = expiracion - ahora;

  if (restante <= 0) {
    await eliminarAccesos(inventario.id, permisos);
    return;
  }

  temporizadorActivo = true;

  if (hasPermisos('inventario.view-access-own', permisos)) {
    
  }

  if (hasPermisos('inventario.view-own', permisos)) {
    
  }

  intervalo = setInterval(async () => {
    const ahora = new Date();
    if (ahora >= expiracion) {
      clearInterval(intervalo);
      temporizadorActivo = false;
      await eliminarAccesos(inventario.id, permisos);
    } else {
      if (hasPermisos('inventario.view-access-own', permisos)) mostrarTemporizadorSidebar(expiracion);;
      if (hasPermisos('inventario.view-own', permisos)) {
        mostrarTemporizadorDashboard(expiracion, codigoInfo.codigo, inventario.id);
      }
    }
  }, 1000);
};

const mostrarTemporizadorSidebar = (expiracion) => {
  const info = document.querySelector('.sidebar .access-info');
  if (info) {
    info.classList.remove('hidden');
    actualizarTemporizadorSidebar(expiracion);
  }
};

const actualizarTemporizadorSidebar = (expiracion) => {
  const span = document.querySelector('.sidebar .access-info .tiempo-acceso');
  if (span) span.textContent = formatoTiempo(expiracion);
};

const mostrarTemporizadorDashboard = (expiracion, codigo, inventarioId) => {
  const accessInfoRow = document.querySelector('.dashboard .access-info');
  const usuariosAcces = document.querySelector('.dashboard .access-info + .dashboard__row');
  const codigoAccesoText = document.querySelector('.codigo-acceso');

  if (accessInfoRow && usuariosAcces && codigoAccesoText) {
    accessInfoRow.classList.remove('hidden');
    usuariosAcces.classList.remove('hidden');
    codigoAccesoText.textContent = codigo;
    actualizarTemporizadorDashboard(expiracion);
    actualizarUsuariosGestionando(inventarioId);
  }
};

const actualizarTemporizadorDashboard = (expiracion) => {
  const tiempoAcceso = document.querySelector('.dashboard .tiempo-acceso');
  if (tiempoAcceso) tiempoAcceso.textContent = formatoTiempo(expiracion);
};

const actualizarUsuariosGestionando = async (inventarioId) => {
  const usuariosAcces = document.querySelector('.dashboard .usuarios-gestionando');
  const respuesta = await get('accesos/usuarios/inventarios/' + inventarioId);  
  if (usuariosAcces) {
    usuariosAcces.textContent = respuesta.success && respuesta.data ? respuesta.data.length : 0;
  }
};

const formatoTiempo = (expiracion) => {
  const restante = expiracion - new Date();
  const horas = Math.floor((restante / (1000 * 60 * 60)) % 24);
  const minutos = Math.floor((restante / (1000 * 60)) % 60);
  const segundos = Math.floor((restante / 1000) % 60);
  return `${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`;
};

const eliminarAccesos = async (inventarioId, permisos) => {
  localStorage.removeItem('codigoAccesoInfo');
  if (hasPermisos('inventario.view-access-own', permisos)) localStorage.removeItem('inventario');
  await del('accesos/inventario/' + inventarioId);

  document.dispatchEvent(new CustomEvent('codigoAccesoExpirado', {
    detail: { inventarioId }
  }));
};

export const listenerExpiracion = async (e) => {
  const permisos = getCookie('permisos', []);


  if (hasPermisos('inventario.view-access-own', permisos)) {
    document.querySelector('.sidebar .access-info')?.classList.add('hidden');
    await infoAlert("Acceso expirado", "Tu acceso temporal al inventario ha finalizado.");
    location.hash = '#/inventarios';
  }

  if (hasPermisos('inventario.view-own', permisos)) {
    document.querySelector('.dashboard .access-info')?.classList.add('hidden');
    document.querySelector('.dashboard .access-info + .dashboard__row')?.classList.add('hidden');
  }
}