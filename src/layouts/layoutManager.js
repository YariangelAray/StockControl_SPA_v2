import getCookie from "../utils/getCookie";
import { get } from "../utils/api";
import { errorToast } from "../utils/alertas";
import hasPermisos from "../utils/hasPermisos";
import { clearResponsiveManager } from "../helpers/responsiveManager";

/**
 * Carga el layout apropiado e inyecta la vista especificada
 * @param {string} tipo - Tipo de layout: "public" o "private"
 * @param {string} vistaPath - Ruta relativa de la vista dentro de ./src/views/
 * @param {boolean} hayLayout - Indica si ya existe un layout cargado
 * @returns {Promise<void>} No retorna valor, modifica el DOM directamente
 */
export const cargarLayout = async (tipo = "public", vistaPath = '', hayLayout = false) => {
  // Obtiene los permisos del usuario desde cookies
  const permisos = getCookie('permisos', []);
  
  // Construye la URL del layout según el tipo solicitado
  const layoutUrl = `./src/layouts/${tipo}Layout.html`;
  
  // Realiza la petición para obtener el HTML del layout
  const layoutResp = await fetch(layoutUrl);
  const layoutHTML = await layoutResp.text();

  // Determina si debe inyectar el layout en el DOM
  // Public: siempre se recarga (para limpiar el estado)
  // Private: solo si no existe layout previo
  if (tipo === "public" || (tipo === "private" && !hayLayout)) {
    // Inyecta el HTML del layout en el body
    document.body.innerHTML = layoutHTML;

    // Configura las clases CSS según el tipo de layout
    if (tipo === "public") {
      // Remueve clases del layout privado y añade las del público
      document.body.classList.remove('content--ui');
      document.body.classList.add('content--auth');
    } else {
      // Remueve clases del layout público y añade las del privado
      document.body.classList.remove('content--auth');
      document.body.classList.add('content--ui');
    }
  }

  // Inicialización específica para layout privado recién cargado
  if (tipo === "private" && !hayLayout) {
    // Configura la información del usuario en el header
    setupUserInfo();
    
    // Configura el botón de perfil según permisos
    setupProfileButton(permisos);
    
    // Configura el listener para el botón de logout
    setupLogoutHandler();
  }

  // Carga la vista específica en el contenedor principal
  await loadViewIntoMain(vistaPath);
};

/**
 * Configura la información del usuario en el header del layout privado
 * @returns {void} No retorna valor, modifica el DOM directamente
 */
const setupUserInfo = () => {
  // Obtiene los roles del usuario desde cookies
  const roles = getCookie('roles', []).map(r => r.nombre);
  
  // Busca el elemento donde mostrar el rol en el header
  const rolElement = document.querySelector('.rol');
  
  // Actualiza el texto con los roles del usuario
  if (rolElement) {
    rolElement.textContent = "Usuario " + roles.join(" - ");
  }
};

/**
 * Configura la visibilidad del botón de perfil según permisos del usuario
 * @param {Array} permisos - Array de permisos del usuario
 * @returns {void} No retorna valor, modifica el DOM si es necesario
 */
const setupProfileButton = (permisos) => {
  // Busca el botón de perfil en el DOM
  const btnPerfil = document.querySelector('#perfil-usuario');
  
  // Verifica si el usuario tiene permisos para ver su propio perfil
  if (btnPerfil && !hasPermisos("usuario.view-own", permisos)) {
    // Remueve el botón si no tiene permisos
    btnPerfil.remove();
  }
};

/**
 * Configura el manejador de eventos para el botón de logout
 * @returns {void} No retorna valor, añade event listener al documento
 */
const setupLogoutHandler = () => {
  // Añade listener global para clicks en el botón de logout
  document.addEventListener('click', async (e) => {
    // Verifica si el click fue en el botón de logout o sus elementos hijos
    if (e.target.closest('#logout')) {
      try {
        // Realiza la petición de logout al servidor
        const logout = await get('auth/logout');
        
        // Si el logout fue exitoso
        if (logout.success) {
          // Limpia todo el almacenamiento local
          localStorage.clear();
          
          // Limpia el gestor responsive
          clearResponsiveManager();
          
          // Redirige a la página de inicio
          location.hash = '#/inicio';
        } else {
          // Muestra error si el logout falló
          errorToast('Error al cerrar sesión: ' + logout.message);
        }
      } catch (err) {
        // Captura errores de red o del servidor
        console.error('Error en logout:', err);
        errorToast('Error al cerrar sesión.');
      }
    }
  });
};

/**
 * Carga una vista específica en el contenedor principal del layout
 * @param {string} vistaPath - Ruta relativa de la vista a cargar
 * @returns {Promise<void>} No retorna valor, modifica el contenido del main
 */
const loadViewIntoMain = async (vistaPath) => {
  // Busca el contenedor principal en el DOM
  const main = document.querySelector('#app-main') || document.querySelector('main');
  
  // Si hay una ruta de vista especificada
  if (vistaPath && main) {
    // Construye la URL completa de la vista
    const vistaUrl = `./src/views/${vistaPath}`;
    
    try {
      // Realiza la petición para obtener el HTML de la vista
      const vistaResp = await fetch(vistaUrl);
      
      // Verifica que la respuesta sea exitosa
      if (!vistaResp.ok) {
        throw new Error(`Error al cargar vista: ${vistaResp.status}`);
      }
      
      // Obtiene el HTML de la vista
      const vistaHTML = await vistaResp.text();
      
      // Inyecta el HTML en el contenedor principal
      main.innerHTML = vistaHTML;
      
    } catch (error) {
      // Manejo de errores al cargar la vista
      console.error('Error cargando vista:', error);
      
      // Muestra mensaje de error en el contenedor principal
      if (main) {
        main.innerHTML = '<div class="error-message">Error al cargar la vista</div>';
      }
    }
  }
};