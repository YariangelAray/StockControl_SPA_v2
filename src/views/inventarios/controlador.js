import { cargarCards } from "../../helpers/cargarCards.js";
import { setVistaActual } from "../../helpers/responsiveManager.js";
import { abrirModalPedirCodigo } from "../../modals/js/modalPedirCodigoAcceso.js";
import * as api from "../../utils/api.js";
import getCookie from "../../utils/getCookie.js";
import hasPermisos from "../../utils/hasPermisos.js";

export default async () => {  

  // Establece la vista actual para responsive manager
  setVistaActual('inventarios-home');

  // Obtiene los permisos del usuario desde cookies
  const permisos = getCookie('permisos', []);

  // Limpia el almacenamiento local para evitar datos residuales
  localStorage.clear();

  // Referencia a la lista del menú lateral
  const sidebarList = document.querySelector('.sidebar__menu .sidebar__list');

  // Elimina elementos con clase 'menu__items' dentro de la lista lateral si existen
  sidebarList.querySelector('.menu__items')?.remove();  

  // Si el usuario tiene permiso para acceder con código, muestra botón y configura eventos
  if (hasPermisos('inventario.access-code', permisos)) {
    // Muestra el botón para agregar inventario
    document.querySelector('.agregar-inventario').classList.remove('hidden');

    // Agrega listener para abrir modal al hacer click en el botón agregar inventario
    document.getElementById('dashboard-inventarios-home').addEventListener('click', (e) => {
      if (e.target.closest('.agregar-inventario')) {
        abrirModalPedirCodigo();
      }
    });

    // Oculta la información de acceso en la barra lateral si existe
    const accessInfo = document.querySelector('.sidebar .access-info');
    if (accessInfo) {
      accessInfo.classList.add('hidden');
    }
  }

  // Carga y muestra los inventarios según permisos
  await cargarInventarios(permisos);
};

/**
 * Carga los inventarios del usuario según permisos y los muestra en la interfaz.
 * @param {Array} permisos - Lista de permisos del usuario.
 */
const cargarInventarios = async (permisos) => {
  // Determina la URL para obtener inventarios según permisos
  const url = hasPermisos('inventario.view-own', permisos)
    ? 'inventarios/me'
    : (hasPermisos('inventario.view-access-own', permisos) ? 'accesos/inventarios/me' : null);

  // Realiza la petición para obtener inventarios o accesos
  const respuesta = url ? await api.get(url) : { success: false, data: [] };

  // Referencia al contenedor donde se mostrarán las tarjetas
  const contenedor = document.querySelector('.content-cards');

  if (respuesta.success) {
    // Carga las tarjetas con los datos recibidos
    cargarCards(contenedor, respuesta.data, {
      tipo: 'inventario',
      filas: [
        { valor: 'cantidad_elementos', clave: 'Cantidad de elementos:' },
        { valor: 'ambientes_cubiertos', clave: 'Ambientes cubiertos:' },
        { valor: 'ultima_actualizacion', clave: 'Última actualización:' },
      ],
      click: async (inventario) => {
        // Guarda el inventario seleccionado en localStorage
        localStorage.setItem('inventario', JSON.stringify({ id: inventario.id, nombre: inventario.nombre }));

        // Si no hay código de acceso guardado, intenta obtenerlo
        if (!localStorage.getItem('codigoAccesoInfo')) {
          const respuesta = await api.get('accesos/inventario/' + inventario.id);
          if (respuesta.success) {
            // Guarda el código y su expiración en localStorage
            localStorage.setItem('codigoAccesoInfo', JSON.stringify({
              codigo: respuesta.data.codigo,
              expiracion: respuesta.data.fecha_expiracion
            }));
          }
        }

        // Redirige a la vista de ambientes del inventario
        window.location.hash = '#/inventarios/ambientes';
      }
    });
  }

  // Si el usuario tiene permiso para ver inventarios propios pero no hay datos, muestra mensaje vacío
  if (hasPermisos('inventario.view-own', permisos) && !respuesta.data) {
    // Crea un contenedor para el mensaje vacío
    const cardEmpty = document.createElement('div');
    cardEmpty.classList.add('card-empty');

    // Icono informativo
    const icon = document.createElement('i');
    icon.classList.add('ri-information-line', 'icon');
    cardEmpty.appendChild(icon);

    // Texto explicativo
    const texto = document.createElement('p');
    texto.classList.add('text-details', 'text-details--medium-sized');
    texto.textContent = 'No se encontraron inventarios a su cargo';
    cardEmpty.appendChild(texto);

    // Añade el mensaje al contenedor principal
    contenedor.appendChild(cardEmpty);
    return;
  }
};
