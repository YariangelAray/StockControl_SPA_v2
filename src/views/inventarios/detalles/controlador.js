import { abrirModalConfigurar } from "../../../modals/js/modalConfigurarCodigo";
import { get } from "../../../utils/api";
import { infoAlert } from "../../../utils/alertas";
import getCookie from "../../../utils/getCookie";
import { initTemporizadorAcceso } from "../../../helpers/temporizadorAcceso";
import { setVistaActual } from "../../../helpers/responsiveManager";

export default async () => {  

  // Establece la vista actual como 'detalles'
  setVistaActual('detalles');

  // Obtiene datos del usuario desde cookies
  const usuario = getCookie('usuario', {});

  // Obtiene información del inventario desde localStorage
  const inventarioInfo = JSON.parse(localStorage.getItem('inventario'));

  // Solicita datos actualizados del inventario al backend
  const respuesta = await get('inventarios/me/' + inventarioInfo.id);
  const inventario = respuesta.data;
  
  // Asigna nombre del inventario al resumen
  document.querySelector('.nombre-inventario').textContent = inventario.nombre;

  // Asigna nombre completo del usuario
  document.querySelector('.nombre-completo-usuario').textContent = `${usuario.nombres} ${usuario.apellidos}`;

  // Asigna fecha de creación del inventario
  document.querySelector('.fecha-creacion').textContent = inventario.fecha_creacion;

  // Asigna fecha de última actualización
  document.querySelector('.ultima-actualizacion').textContent = inventario.ultima_actualizacion;

  // Asigna cantidad total de bienes
  document.querySelector('.total-bienes').textContent = inventario.cantidad_elementos;

  // Asigna valor monetario formateado
  document.querySelector('.valor-monetario').textContent = `$ ${inventario.valor_monetario.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;

  // Asigna cantidad de ambientes cubiertos
  document.querySelector('.ambientes-cubiertos').textContent = inventario.ambientes_cubiertos;

  // Inicializa temporizador de acceso
  await initTemporizadorAcceso();

  // Escucha clics en el dashboard de detalles
  document.getElementById('dashboard-detalles').addEventListener('click', async (e) => {

    // Si el clic fue en el botón de generar código
    if (e.target.closest('.generar-codigo')) {

      // Obtiene info del código de acceso desde localStorage
      const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));      

      if (codigoInfo) {
        // Calcula tiempo restante del código actual
        const expiracion = new Date(codigoInfo.expiracion);
        const ahora = new Date();
        const restante = expiracion - ahora;

        // Si el código aún está activo, muestra alerta y detiene flujo
        if (restante > 0) {
          await infoAlert("Código activo", `Ya existe un código de acceso generado. Por favor espera a que finalice antes de generar uno nuevo. Hora de expiración: ${expiracion.toLocaleTimeString('es-CO')}`);
          return;
        }

        // Si ya expiró, elimina el código anterior
        localStorage.removeItem('codigoAccesoInfo');
      }

      // Abre modal para configurar nuevo código
      await abrirModalConfigurar();
    }
  });
}
