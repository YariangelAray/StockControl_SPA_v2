import { renderFilas } from "../../../helpers/renderFilas";
import { actualizarStorageTipos, cargarTipos, tipoClick } from "./tipos-elementos";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";

export default async () => {  

  // Establece la vista actual para responsive manager
  setVistaActual("tipos-elementos");

  // Obtiene los permisos del usuario desde cookies
  const permisos = getCookie('permisos', []);

  // Referencias a botones de la interfaz
  const btnVolver = document.querySelector("#btn-volver");
  const btnCrear = document.querySelector('#crearTipo');

  // Obtiene el historial de navegación previo guardado en sessionStorage
  const historial = sessionStorage.getItem("rutaAnterior");

  // Referencias a elementos donde se renderizan los tipos
  const tbody = document.querySelector('#dashboard-tipos-elementos .table__body');
  const acordeon = document.querySelector('#dashboard-tipos-elementos .acordeon');

  // Referencia al input de búsqueda
  const search = document.querySelector('[type="search"]');
  

  // Oculta el botón volver si el usuario no tiene permiso para ver los tipos de un inventario propio
  if (!hasPermisos('tipo-elemento.view-inventory-own', permisos)) {
    btnVolver.classList.add('hidden');
  }

  // Establece el enlace del botón volver al historial guardado
  btnVolver.setAttribute("href", historial);

  // Carga los tipos desde la fuente de datos (API o local)
  const tipos = await cargarTipos();

  // Guarda los tipos en localStorage para uso posterior
  localStorage.setItem('tipos', JSON.stringify({ tipos: tipos }));

  // Renderiza las filas iniciales con los tipos cargados
  renderFilas(tipos, tipoClick, acordeon, tbody);

  // Ajusta el enlace del botón crear según la ruta actual
  if (location.hash.startsWith('#/inventarios')) {
    btnCrear.href = '#/inventarios/elementos/tipos-elementos/crear';
  } else if (location.hash.startsWith('#/super-admin')) {
    btnCrear.href = '#/super-admin/tipos-elementos/crear';
  }

  // Elimina el botón crear si el usuario no tiene permiso para crear tipos
  if (!hasPermisos('tipo-elemento.create', permisos)) {
    btnCrear.remove();
  }

  // Actualiza en segundo plano los tipos almacenados
  await actualizarStorageTipos();
  

  // Evento para filtrar tipos según texto ingresado en el input de búsqueda
  search.addEventListener('input', (e) => {
    // Obtiene los tipos almacenados en localStorage
    let tipos = JSON.parse(localStorage.getItem('tipos') || '{}').tipos || [];

    // Valor de búsqueda en minúsculas
    const valor = e.target.value.toLowerCase();

    // Filtra los tipos que contienen el texto buscado en cualquiera de sus datos
    const tiposFiltrados = tipos.filter(tipo => {
      // Convierte cada dato del tipo a valor string para comparar
      tipo = tipo.map(t => typeof t == 'object' ? t.value : t);
      for (const dato of tipo) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });

    // Renderiza las filas con los tipos filtrados
    renderFilas(tiposFiltrados, tipoClick, acordeon, tbody);
  });

  // Evento que se ejecuta cuando cambia el tamaño de pantalla (responsive)
  onResponsiveChange("tipos-elementos", async () => {
    console.log("Resize detectado SOLO en tipos-elementos");

    // Actualiza los tipos en segundo plano
    await actualizarStorageTipos();

    // Obtiene los tipos actualizados desde localStorage
    const tipos = JSON.parse(localStorage.getItem('tipos') || '{}').tipos || [];

    // Renderiza las filas con los tipos actualizados
    renderFilas(tipos, tipoClick, acordeon, tbody);
  });
};
