import { abrirModalConfigurar } from "../../../modals/js/modalConfigurarCodigo";

import { get } from "../../../utils/api";

import { infoAlert } from "../../../utils/alertas";
import getCookie from "../../../utils/getCookie";
import { initTemporizadorAcceso } from "../../../helpers/temporizadorAcceso";
import { setVistaActual } from "../../../helpers/responsiveManager";

export default async () => {  

  setVistaActual('detalles');

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

  const accessInfoRow = document.querySelector('.dashboard .access-info');
  const usuariosAcces = document.querySelector('.dashboard .access-info + .dashboard__row');
  const codigoAccesoText = document.querySelector('.codigo-acceso');

  await initTemporizadorAcceso();

  document.getElementById('dashboard-detalles').addEventListener('click', async (e) => {
    if (e.target.closest('.generar-codigo')) {
      const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
      console.log(codigoInfo)
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
  
    }
  });
}