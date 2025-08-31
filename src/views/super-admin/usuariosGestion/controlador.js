
import { esResponsive, renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";
import { actualizarStorageUsuarios, usuarioClick, cargarUsuarios } from "./usuario";

export default async () => {
  const permisos = getCookie('permisos', []);
  setVistaActual("usuarios");

  const usuarios = await cargarUsuarios();
  localStorage.setItem('usuarios', JSON.stringify({ usuarios: usuarios }));

  const tbody = document.querySelector('#dashboard-usuarios .table__body');
  const acordeon = document.querySelector('#dashboard-usuarios .acordeon');

  renderFilas(usuarios, usuarioClick, acordeon, tbody);


  if (!hasPermisos('usuario.create', permisos)) document.querySelector('#crearUsuario').remove();

  // Actualización en segundo plano
  await actualizarStorageUsuarios();

  const search = document.querySelector('[type="search"]');
  search.addEventListener('input', (e) => {
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}').usuarios || [];
    const valor = e.target.value.toLowerCase();
    const usuariosFiltrados = usuarios.filter(usuario => {
      usuario = usuario.map(u => typeof u == 'object' ? u.value : u);
      for (const dato of usuario) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });
    renderFilas(usuariosFiltrados, usuarioClick, acordeon, tbody);
  });

  onResponsiveChange("usuarios", async () => {
    console.log("Resize detectado SOLO en usuarios");
    await actualizarStorageUsuarios();
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '{}').usuarios || [];
    renderFilas(usuarios, usuarioClick, acordeon, tbody);
  });
}

