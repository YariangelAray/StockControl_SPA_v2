import { agregarFila, esResponsive, renderFilas } from "../../../helpers/renderFilas";
import { actualizarStorageTipos, cargarTipos, formatearTipo, tipoClick } from "./tipos-elementos";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";

export default async () => {

  setVistaActual("tipos-elementos");
  const permisos = getCookie('permisos', []);

  const btnVolver = document.querySelector("#btn-volver");
  const btnCrear = document.querySelector('#crearTipo');

  if (!hasPermisos('tipo-elemento.view-inventory-own', permisos)) {
    btnVolver.classList.add('hidden')
  }
  const historial = sessionStorage.getItem("rutaAnterior");
  btnVolver.setAttribute("href", historial);

  const tipos = await cargarTipos();
  localStorage.setItem('tipos', JSON.stringify({ tipos: tipos }));


  const tbody = document.querySelector('#dashboard-tipos-elementos .table__body');
  const acordeon = document.querySelector('#dashboard-tipos-elementos .acordeon');

  renderFilas(tipos, tipoClick, acordeon, tbody);

  if (location.hash.startsWith('#/inventarios')) btnCrear.href = '#/inventarios/elementos/tipos-elementos/crear';
  else if (location.hash.startsWith('#/super-admin')) btnCrear.href = '#/super-admin/tipos-elementos/crear';

  if (!hasPermisos('tipo-elemento.create', permisos)) btnCrear.remove();


  // Actualización en segundo plano
  await actualizarStorageTipos();

  const search = document.querySelector('[type="search"]');
  search.addEventListener('input', (e) => {
    let tipos = JSON.parse(localStorage.getItem('tipos') || '{}').tipos || [];

    const valor = e.target.value.toLowerCase();
    const tiposFiltrados = tipos.filter(tipo => {
      tipo = tipo.map(t => typeof t == 'object' ? t.value : t);
      for (const dato of tipo) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });
    renderFilas(tiposFiltrados, tipoClick, acordeon, tbody);
  });

  onResponsiveChange("tipos-elementos", async () => {
    console.log("Resize detectado SOLO en tipos-elementos");
    await actualizarStorageTipos();
    const tipos = JSON.parse(localStorage.getItem('tipos') || '{}').tipos || [];
    renderFilas(tipos, tipoClick, acordeon, tbody);
  });
}
