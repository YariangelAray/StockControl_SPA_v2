
import { renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import { llenarSelect } from "../../../helpers/select";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";
import { actualizarStorageElementos, cargarElementos, elementoClick } from "./elemento";


export default async () => {

  // Establece la vista actual como 'elementos'
  setVistaActual("elementos");

  // Obtiene los permisos del usuario desde cookies
  const permisos = getCookie('permisos', []);

  // Obtiene el inventario actual desde localStorage
  const inventario = JSON.parse(localStorage.getItem('inventario'));

  // Verifica si el usuario tiene permiso para crear elementos
  if (hasPermisos('elemento.create-inventory-own', permisos)) {
    // Muestra el botón de crear elemento
    const crearBoton = document.getElementById('crearElemento');
    crearBoton.classList.remove('hidden');
  }

  // Verifica si el usuario tiene permiso para ver tipos de elementos
  if (hasPermisos('tipo-elemento.view-inventory-own', permisos)) {
    // Guarda la ruta actual en sessionStorage
    sessionStorage.setItem("rutaAnterior", location.hash);
    // Muestra el botón de ver tipos
    const verTiposBoton = document.getElementById('verTipos');
    verTiposBoton.classList.remove('hidden');
  }

  // Carga los elementos desde el backend
  const elementos = await cargarElementos();

  // Guarda los elementos en localStorage
  localStorage.setItem('elementos', JSON.stringify({ elementos }));

  // Obtiene el tbody de la tabla
  const tbody = document.querySelector('#dashboard-elementos .table__body');

  // Obtiene el contenedor del acordeón
  const acordeon = document.querySelector('#dashboard-elementos .acordeon');

  // Renderiza las filas con los elementos cargados
  renderFilas(elementos, elementoClick, acordeon, tbody);

  // Llena el select de ambientes con datos del backend
  await llenarSelect({
    endpoint: `inventarios/me/${inventario.id}/ambientes`,
    selector: '#filtro-ambientes',
    optionMapper: ambiente => ({ id: ambiente.id, text: ambiente.nombre })
  });

  // Llena el select de estados con datos del backend
  await llenarSelect({
    endpoint: 'estados',
    selector: '#filtro-estados',
    optionMapper: estado => ({ id: estado.id, text: estado.nombre })
  });

  // Actualiza los elementos en segundo plano
  await actualizarStorageElementos();

  // Obtiene el input de búsqueda
  const search = document.querySelector('[type="search"]');

  // Escucha el evento input en el campo de búsqueda
  search.addEventListener('input', (e) => {
    // Obtiene el valor del input en minúsculas
    const valor = e.target.value.toLowerCase();

    // Obtiene los elementos desde localStorage
    const elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];

    // Filtra los elementos que coincidan con el texto
    const elementosFiltrados = elementos.filter(elemento => {
      elemento = elemento.map(e => typeof e === 'object' ? e.value : e);
      for (const dato of elemento) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });

    // Renderiza las filas filtradas
    renderFilas(elementosFiltrados, elementoClick, acordeon, tbody);
  });

  // Obtiene el select de estados
  const filtroEstado = document.getElementById('filtro-estados');

  // Variable para guardar el estado seleccionado
  let estadoActual = '';

  // Escucha el cambio en el select de estados
  filtroEstado.addEventListener('change', (e) => {
    // Obtiene el índice seleccionado
    const indice = e.target.selectedIndex;

    // Asigna el estado actual si hay selección válida
    estadoActual = indice > 0 ? e.target.options[indice].textContent.trim() : '';

    // Obtiene los elementos desde localStorage
    const elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];

    // Filtra los elementos por estado y ambiente
    const resultado = filtrarElementos({ elementos, estado: estadoActual, ambiente: ambienteActual });

    // Renderiza las filas filtradas
    renderFilas(resultado, elementoClick, acordeon, tbody);
  });

  // Obtiene el select de ambientes
  const filtroAmbiente = document.getElementById('filtro-ambientes');

  // Variable para guardar el ambiente seleccionado
  let ambienteActual = '';

  // Escucha el cambio en el select de ambientes
  filtroAmbiente.addEventListener('change', (e) => {
    // Obtiene el índice seleccionado
    const indice = e.target.selectedIndex;

    // Asigna el ambiente actual si hay selección válida
    ambienteActual = indice > 0 ? e.target.options[indice].textContent.trim() : '';

    // Obtiene los elementos desde localStorage
    const elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];

    // Filtra los elementos por estado y ambiente
    const resultado = filtrarElementos({ elementos, estado: estadoActual, ambiente: ambienteActual });

    // Renderiza las filas filtradas
    renderFilas(resultado, elementoClick, acordeon, tbody);
  });

  // Escucha cambios de tamaño de pantalla
  onResponsiveChange("elementos", async () => {
    // Muestra mensaje en consola
    console.log("Resize detectado SOLO en elementos");

    // Actualiza los elementos en segundo plano
    await actualizarStorageElementos();

    // Obtiene los elementos desde localStorage
    const elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];

    // Renderiza las filas actualizadas
    renderFilas(elementos, elementoClick, acordeon, tbody);
  });
}

// Función para filtrar elementos por estado y ambiente
const filtrarElementos = ({ elementos, estado = '', ambiente = '' }) => {
  // Filtra cada lista de datos
  return elementos.filter(lista => {
    // Convierte objetos a valores simples
    lista = lista.map(e => typeof e === 'object' ? e.value : e);

    // Verifica si contiene el estado buscado
    const contieneEstado = estado ? lista.some(d => d?.toString().toLowerCase() === estado.toLowerCase()) : true;

    // Verifica si contiene el ambiente buscado
    const contieneAmbiente = ambiente ? lista.some(d => d?.toString().toLowerCase() === ambiente.toLowerCase()) : true;

    // Devuelve true si cumple ambos filtros
    return contieneEstado && contieneAmbiente;
  });
}
