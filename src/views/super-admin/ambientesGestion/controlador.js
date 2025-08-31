
import { esResponsive, renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";
import { actualizarStorageAmbientes, ambienteClick, cargarAmbientes } from "./ambiente";

export default async () => {

  setVistaActual("ambientes");
  const permisos = getCookie('permisos', []);  

  const ambientes = await cargarAmbientes();
  localStorage.setItem('ambientes', JSON.stringify({ ambientes: ambientes }));

  const tbody = document.querySelector('#dashboard-ambientes .table__body');
  const acordeon = document.querySelector('#dashboard-ambientes .acordeon');

  renderFilas(ambientes, ambienteClick, acordeon, tbody);

  let botones = document.getElementById('dashboard-ambientes').querySelectorAll('button');
  botones.forEach(btn => !hasPermisos(btn.dataset.permiso, permisos) ? btn.remove() : "");


  // Actualización en segundo plano
  await actualizarStorageAmbientes();

  const search = document.querySelector('[type="search"]');
  search.addEventListener('input', (e) => {
    let ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];
    const valor = e.target.value.toLowerCase();
    const ambientesFiltrados = ambientes.filter(ambiente => {
      ambiente = ambiente.map(a => typeof a == 'object' ? a.value : a);
      for (const dato of ambiente) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });
    renderFilas(ambientesFiltrados, ambienteClick, acordeon, tbody);
  });

  onResponsiveChange("ambientes", async () => {
    console.log("Resize detectado SOLO en ambientes");
    await actualizarStorageAmbientes();
    const ambientes = JSON.parse(localStorage.getItem('ambientes') || '{}').ambientes || [];
    renderFilas(ambientes, ambienteClick, acordeon, tbody);
  });
}

