import { renderFilas } from "../../../helpers/renderFilas"; // Funciones para renderizar filas y detectar responsive
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager"; // Funciones para manejo responsive y vista actual
import getCookie from "../../../utils/getCookie"; // Función para obtener cookies
import hasPermisos from "../../../utils/hasPermisos"; // Función para verificar permisos
import { actualizarStorageUsuarios, usuarioClick, cargarUsuarios } from "./usuario"; // Funciones específicas para usuarios

export default async () => {
  // Obtiene los permisos del usuario desde cookies, o un array vacío si no existen
  const permisos = getCookie('permisos', []);

  // Establece la vista actual para responsive manager como "usuarios"
  setVistaActual("usuarios");

  // Carga los usuarios desde la fuente de datos (API o local)
  const usuarios = await cargarUsuarios();

  // Guarda los usuarios en localStorage para uso posterior
  localStorage.setItem('usuarios', JSON.stringify({ usuarios: usuarios }));

  // Referencia al cuerpo de la tabla donde se mostrarán los usuarios
  const tbody = document.querySelector('#dashboard-usuarios .table__body');

  // Referencia al acordeón donde también se pueden mostrar usuarios
  const acordeon = document.querySelector('#dashboard-usuarios .acordeon');

  // Renderiza las filas con los usuarios cargados, usando la función de click definida
  renderFilas(usuarios, usuarioClick, acordeon, tbody);

  // Si el usuario no tiene permiso para crear usuarios, elimina el botón correspondiente
  if (!hasPermisos('usuario.create', permisos)) document.querySelector('#crearUsuario').remove();

  // Actualización en segundo plano de los usuarios almacenados
  await actualizarStorageUsuarios();

  // Referencia al input de búsqueda
  const search = document.querySelector('[type="search"]');

  // Evento para filtrar usuarios según texto ingresado en el input de búsqueda
  search.addEventListener('input', (e) => {
    // Obtiene los usuarios almacenados en localStorage
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}').usuarios || [];

    // Valor de búsqueda en minúsculas
    const valor = e.target.value.toLowerCase();

    // Filtra los usuarios que contienen el texto buscado en cualquiera de sus datos
    const usuariosFiltrados = usuarios.filter(usuario => {
      // Convierte cada dato del usuario a valor string para comparar
      usuario = usuario.map(u => typeof u == 'object' ? u.value : u);
      for (const dato of usuario) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });

    // Renderiza las filas con los usuarios filtrados
    renderFilas(usuariosFiltrados, usuarioClick, acordeon, tbody);
  });

  // Evento que se ejecuta cuando cambia el tamaño de pantalla (responsive) para la vista "usuarios"
  onResponsiveChange("usuarios", async () => {
    // Mensaje en consola para debug cuando se detecta resize en esta vista
    console.log("Resize detectado SOLO en usuarios");

    // Actualiza en segundo plano los usuarios almacenados
    await actualizarStorageUsuarios();

    // Obtiene los usuarios actualizados desde localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}').usuarios || [];

    // Renderiza las filas con los usuarios actualizados
    renderFilas(usuarios, usuarioClick, acordeon, tbody);
  });
}
