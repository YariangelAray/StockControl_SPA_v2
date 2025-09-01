import { setVistaActual } from "../../helpers/responsiveManager";
import { get } from "../../utils/api";

export default async () => {    
  // Establece la vista actual como 'super-admin' para el responsive manager
  setVistaActual('super-admin');

  // Realiza petición para obtener la lista de usuarios
  const respuestaU = await get('usuarios');

  // Realiza petición para obtener la lista de ambientes
  const respuestaA = await get('ambientes');

  // Realiza petición para obtener la lista de inventarios
  const respuestaI = await get('inventarios');

  // Realiza petición para obtener la lista de tipos de elementos
  const respuestaT = await get('tipos-elementos');

  // Actualiza el texto del contador de usuarios con la cantidad obtenida o 0 si falla
  document.querySelector('.cant-usuarios').textContent = respuestaU.success ? respuestaU.data.length : 0;

  // Actualiza el texto del contador de ambientes con la cantidad obtenida o 0 si falla
  document.querySelector('.cant-ambientes').textContent = respuestaA.success ? respuestaA.data.length : 0;

  // Actualiza el texto del contador de inventarios con la cantidad obtenida o 0 si falla
  document.querySelector('.cant-inventarios').textContent = respuestaI.success ? respuestaI.data.length : 0;

  // Actualiza el texto del contador de tipos con la cantidad obtenida o 0 si falla
  document.querySelector('.cant-tipos').textContent = respuestaT.success ? respuestaT.data.length : 0;
}
