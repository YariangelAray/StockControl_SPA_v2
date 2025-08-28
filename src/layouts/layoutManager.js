import getCookie from "../utils/getCookie";
import { get } from "../utils/api";
import { error } from "../utils/alertas";

/**
 * Carga el layout (public/private) e inyecta la vista indicada en el main.
 * @param {string} tipo - "public" | "private"
 * @param {string} vistaPath - ruta relativa dentro de ./src/views/ (ej 'auth/inicio/index.html')
 * @param {boolean} hayLayout - si ya existe el layout cargado (para no recargarlo)
 */
export const cargarLayout = async (tipo = "public", vistaPath = '', hayLayout = false) => {
  // Ajusta la ruta del layout según tu estructura de proyecto.
  const layoutUrl = `./src/layouts/${tipo}Layout.html`;
  const layoutResp = await fetch(layoutUrl);

  const layoutHTML = await layoutResp.text();

  // Inyectamos layout sólo si no está cargado o si es public (forzar recarga auth)
  // Para private: sólo inyectamos si no hayLayout
  if (tipo === "public" || (tipo === "private" && !hayLayout)) {
    document.body.innerHTML = layoutHTML;

    if (tipo === "public") {
      document.body.classList.remove('content--ui');
      document.body.classList.add('content--auth');
    } else {
      document.body.classList.remove('content--auth');
      document.body.classList.add('content--ui');
    }
  }

  // Si es private y se acaba de cargar, inicializamos datos de UI (roles, logout, etc.)
  if (tipo === "private" && !hayLayout) {

    // Si tienes un elemento .rol en el header del layout
    const roles = getCookie('roles', []).map(r => r.nombre);
    document.querySelector('.rol').textContent = "Usuario " + roles.join(" - ");

    document.addEventListener('click', async (e) => {
      if (e.target.closest('#logout')) {
        try {
          const logout = await get('auth/logout');
          if (logout.success) {
            localStorage.clear();
            location.hash = '#/inicio';
          }
        } catch (err) {
          console.error(err);
          error('Error al cerrar sesión.');
        }
      }
    });
  }

  // Inicializar componentes (si layout privado)

  // Cargar la vista dentro del main
  const main = document.querySelector('#app-main') || document.querySelector('main');

  if (vistaPath) {
    const vistaUrl = `./src/views/${vistaPath}`;
    const vistaResp = await fetch(vistaUrl);
    const vistaHTML = await vistaResp.text();
    main.innerHTML = vistaHTML;
  }
};