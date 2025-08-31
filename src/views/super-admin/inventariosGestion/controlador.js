
import { esResponsive, renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";
import { actualizarStorageInventarios, inventarioClick, cargarInventarios } from "./inventario";

export default async () => {
  setVistaActual("inventarios");
  const permisos = getCookie('permisos', []);

  const inventarios = await cargarInventarios();
  localStorage.setItem('inventarios', JSON.stringify({ inventarios: inventarios }));

  const tbody = document.querySelector('#dashboard-inventarios .table__body');
  const acordeon = document.querySelector('#dashboard-inventarios .acordeon');

  renderFilas(inventarios, inventarioClick, acordeon, tbody);


  if (!hasPermisos('inventario.create', permisos)) document.querySelector('#crearInventario').remove();

  // Actualización en segundo plano
  await actualizarStorageInventarios();

  const search = document.querySelector('[type="search"]');
  search.addEventListener('input', (e) => {
    let inventarios = JSON.parse(localStorage.getItem('inventarios') || '{}').inventarios || [];
    const valor = e.target.value.toLowerCase();
    const inventariosFiltrados = inventarios.filter(inventario => {
      inventario = inventario.map(i => typeof i == 'object' ? i.value : i);
      for (const key in inventario) {
        if (inventario[key] && inventario[key].toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });
    renderFilas(inventariosFiltrados, inventarioClick, acordeon, tbody);
  });

  onResponsiveChange("inventarios", async () => {
    console.log("Resize detectado SOLO en inventarios");
    await actualizarStorageInventarios();
    const inventarios = JSON.parse(localStorage.getItem('inventarios') || '{}').inventarios || [];
    renderFilas(inventarios, inventarioClick, acordeon, tbody);
  });
}


