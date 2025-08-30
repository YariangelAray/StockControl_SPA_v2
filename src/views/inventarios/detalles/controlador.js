import { abrirModalConfigurar } from "../../../modals/js/modalConfigurarCodigo";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import { get } from "../../../utils/api";
import { eliminarAccesos, initTemporizadorAcceso } from "./initTemporizadorAcceso";
import { infoAlert } from "../../../utils/alertas";
import getCookie from "../../../utils/getCookie";

export default async () => {  
  const usuario = getCookie('usuario',{})
  const inventarioInfo = JSON.parse(localStorage.getItem('inventario'));

  const respuesta = await get('inventarios/me/' + inventarioInfo.id);
  const inventario = respuesta.data;
  
  // Asignar datos al resumen general
  document.querySelector('.nombre-inventario').textContent = inventario.nombre;
  document.querySelector('.nombre-completo-usuario').textContent = `${usuario.nombres} ${usuario.apellidos}`;
  document.querySelector('.fecha-creacion').textContent = inventario.fecha_creacion;
  document.querySelector('.ultima-actualizacion').textContent = inventario.ultima_actualizacion;

  // Asignar datos a las estadísticas
  document.querySelector('.total-bienes').textContent = inventario.cantidad_elementos;
  document.querySelector('.valor-monetario').textContent = `$ ${inventario.valor_monetario.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
  document.querySelector('.ambientes-cubiertos').textContent = inventario.ambientes_cubiertos;

  // limpiarModales();
  // await initModales(['modalConfigurarCodigo']);
  // const { modalConfigurarCodigo } = modales;

  // await abrirModalConfigurar(modalConfigurarCodigo); //Aqui se inicializan los eventos del modal

  const accessInfoRow = document.querySelector('.dashboard .access-info');
  const usuariosAcces = document.querySelector('.dashboard .access-info + .dashboard__row');
  const codigoAccesoText = document.querySelector('.codigo-acceso');

  // // Verificar si hay código activo en localStorage
  // const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));

  // const limpiar = () => {
  //   accessInfoRow.classList.add('hidden');
  //   usuariosAcces.classList.add('hidden');
  //   localStorage.removeItem('codigoAccesoInfo');
  // }

  // if (codigoInfo) {
  //   const expiracion = new Date(codigoInfo.expiracion);

  //   const ahora = new Date();

  //   if (expiracion > ahora) {
  //     // Aún está vigente, restaurar UI
  //     accessInfoRow.classList.remove('hidden');
  //     usuariosAcces.classList.remove('hidden');
  //     codigoAccesoText.textContent = codigoInfo.codigo;

  //     await initTemporizadorAcceso(expiracion, inventarioInfo.id, limpiar);
  //   } else {
  //     await eliminarAccesos(inventarioInfo.id, limpiar);
  //   }
  // } else {
  //   const respuestaCodigo = await get('codigos-acceso/inventario/' + inventarioInfo.id);

  //   if (respuestaCodigo.success && respuestaCodigo.data) {
  //     const codigo = respuestaCodigo.data;
  //     const expiracion = new Date(codigo.fecha_expiracion);

  //     localStorage.setItem('codigoAccesoInfo', JSON.stringify({
  //       codigo: codigo.codigo,
  //       expiracion
  //     }));

  //     // Restaurar UI
  //     accessInfoRow.classList.remove('hidden');
  //     usuariosAcces.classList.remove('hidden');
  //     codigoAccesoText.textContent = codigo.codigo;

  //     await initTemporizadorAcceso(expiracion, inventarioInfo.id, limpiar);
  //   } else {
  //     // No hay código vigente en BD
  //     accessInfoRow.classList.add('hidden');
  //     usuariosAcces.classList.add('hidden');
  //     localStorage.removeItem('codigoAccesoInfo');
  //   }
  // }

  document.getElementById('dashboard-detalles').addEventListener('click', async (e) => {
    if (e.target.closest('.generar-codigo')) {
      const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
      if (codigoInfo) {        
        const expiracion = new Date(codigoInfo.expiracion);
        // Obtiene la fecha y hora actual
        const ahora = new Date();
        // Calcula el tiempo restante en milisegundos
        const restante = new Date(expiracion) - ahora;

        if (restante > 0) { 
          await infoAlert("Código activo", `Ya existe un código de acceso generado. Por favor espera a que finalice antes de generar uno nuevo. Hora de expiración: ${expiracion.toLocaleTimeString('es-CO')}`);
          return;
        }
        localStorage.removeItem('codigoAccesoInfo');
      }
      await abrirModalConfigurar();
      // abrirModal(modalConfigurarCodigo); // Aqui se abre el modal para configurar el código
    }
  });
}