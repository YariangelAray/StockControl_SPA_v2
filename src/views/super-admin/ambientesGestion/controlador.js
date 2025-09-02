import { renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";
import { actualizarStorageAmbientes, ambienteClick, cargarAmbientes } from "./ambiente";

export default async () => {
  // Establece la vista actual para responsive manager como "ambientes"
  setVistaActual("ambientes");

  // Obtiene los permisos del usuario desde cookies, o un array vacío si no existen
  const permisos = getCookie('permisos', []);

  // Carga los ambientes desde la fuente de datos (API o local)
  const ambientes = await cargarAmbientes();

  // Guarda los ambientes en localStorage para uso posterior
  localStorage.setItem('ambientes', JSON.stringify({ ambientes: ambientes }));

  // Referencia al cuerpo de la tabla donde se mostrarán los ambientes
  const tbody = document.querySelector('#dashboard-ambientes .table__body');

  // Referencia al acordeón donde también se pueden mostrar ambientes
  const acordeon = document.querySelector('#dashboard-ambientes .acordeon');

  // Renderiza las filas con los ambientes cargados, usando la función de click definida
  renderFilas(ambientes, ambienteClick, acordeon, tbody);

  // Obtiene todos los botones dentro del dashboard de ambientes
  let botones = document.getElementById('dashboard-ambientes').querySelectorAll('button');

  // Recorre cada botón y elimina aquellos para los que el usuario no tiene permiso
  botones.forEach(btn => !hasPermisos(btn.dataset.permiso, permisos) ? btn.remove() : "");

  // Actualización en segundo plano de los ambientes almacenados
  await actualizarStorageAmbientes();

  // Referencia al input de búsqueda
  const search = document.querySelector('[type="search"]');

  // Evento para filtrar ambientes según texto ingresado en el input de búsqueda
  search.addEventListener('input', (e) => {
    // Obtiene los ambientes almacenados en localStorage
    let ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];

    // Valor de búsqueda en minúsculas
    const valor = e.target.value.toLowerCase();

    // Filtra los ambientes que contienen el texto buscado en cualquiera de sus datos
    const ambientesFiltrados = ambientes.filter(ambiente => {
      // Convierte cada dato del ambiente a valor string para comparar
      ambiente = ambiente.map(a => typeof a == 'object' ? a.value : a);
      for (const dato of ambiente) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });

    // Renderiza las filas con los ambientes filtrados
    renderFilas(ambientesFiltrados, ambienteClick, acordeon, tbody);
  });

  // Evento que se ejecuta cuando cambia el tamaño de pantalla (responsive) para la vista "ambientes"
  onResponsiveChange("ambientes", async () => {

    // Actualiza en segundo plano los ambientes almacenados
    await actualizarStorageAmbientes();

    // Obtiene los ambientes actualizados desde localStorage
    const ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];

    // Renderiza las filas con los ambientes actualizados
    renderFilas(ambientes, ambienteClick, acordeon, tbody);
  });
}
