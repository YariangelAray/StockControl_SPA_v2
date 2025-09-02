import { renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";
import { actualizarStorageInventarios, inventarioClick, cargarInventarios } from "./inventario";

export default async () => {
  // Establece la vista actual para responsive manager como "inventarios"
  setVistaActual("inventarios");

  // Obtiene los permisos del usuario desde cookies, o un array vacío si no existen
  const permisos = getCookie('permisos', []);

  // Carga los inventarios desde la fuente de datos (API o local)
  const inventarios = await cargarInventarios();

  // Guarda los inventarios en localStorage para uso posterior
  localStorage.setItem('inventarios', JSON.stringify({ inventarios: inventarios }));

  // Referencia al cuerpo de la tabla donde se mostrarán los inventarios
  const tbody = document.querySelector('#dashboard-inventarios .table__body');

  // Referencia al acordeón donde también se pueden mostrar inventarios
  const acordeon = document.querySelector('#dashboard-inventarios .acordeon');

  // Renderiza las filas con los inventarios cargados, usando la función de click definida
  renderFilas(inventarios, inventarioClick, acordeon, tbody);

  // Si el usuario no tiene permiso para crear inventarios, elimina el botón correspondiente
  if (!hasPermisos('inventario.create', permisos)) document.querySelector('#crearInventario').remove();

  // Actualización en segundo plano de los inventarios almacenados
  await actualizarStorageInventarios();

  // Referencia al input de búsqueda
  const search = document.querySelector('[type="search"]');

  // Evento para filtrar inventarios según texto ingresado en el input de búsqueda
  search.addEventListener('input', (e) => {
    // Obtiene los inventarios almacenados en localStorage
    let inventarios = JSON.parse(localStorage.getItem('inventarios') || '{}').inventarios || [];

    // Valor de búsqueda en minúsculas
    const valor = e.target.value.toLowerCase();

    // Filtra los inventarios que contienen el texto buscado en cualquiera de sus datos
    const inventariosFiltrados = inventarios.filter(inventario => {
      // Convierte cada dato del inventario a valor string para comparar
      inventario = inventario.map(i => typeof i == 'object' ? i.value : i);
      for (const key in inventario) {
        if (inventario[key] && inventario[key].toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });

    // Renderiza las filas con los inventarios filtrados
    renderFilas(inventariosFiltrados, inventarioClick, acordeon, tbody);
  });

  // Evento que se ejecuta cuando cambia el tamaño de pantalla (responsive) para la vista "inventarios"
  onResponsiveChange("inventarios", async () => {

    // Actualiza en segundo plano los inventarios almacenados
    await actualizarStorageInventarios();

    // Obtiene los inventarios actualizados desde localStorage
    const inventarios = JSON.parse(localStorage.getItem('inventarios') || '{}').inventarios || [];

    // Renderiza las filas con los inventarios actualizados
    renderFilas(inventarios, inventarioClick, acordeon, tbody);
  });
}