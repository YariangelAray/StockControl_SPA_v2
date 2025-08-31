import { agregarFila, renderFilas } from "../../../helpers/renderFilas";
import { actualizarStorageTipos, cargarTipos, formatearTipo, tipoClick } from "./tipos-elementos";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";

export default async () => {
  const permisos = getCookie('permisos', []);

  const btnVolver = document.querySelector("#btn-volver");
  const btnCrear = document.querySelector('#crearTipo');

  if (!hasPermisos('tipo-elemento.view-inventory-own', permisos)) {
    btnVolver.classList.add('hidden')
  }
  const historial = sessionStorage.getItem("rutaAnterior");
  btnVolver.setAttribute("href", historial);

  let tipos = JSON.parse(localStorage.getItem('tipos') || '{}').tipos || [];

  if (!tipos || tipos.length === 0) {
    const tiposFormateados = await cargarTipos();
    localStorage.setItem('tipos', JSON.stringify({ tipos: tiposFormateados }));
    tipos = tiposFormateados;
  }
  renderFilas(tipos, tipoClick);

  if(location.hash.startsWith('#/inventarios')) btnCrear.href = '#/inventarios/elementos/tipos-elementos/crear';
  else if(location.hash.startsWith('#/super-admin')) btnCrear.href = '#/super-admin/tipos-elementos/crear';

  if (!hasPermisos('tipo-elemento.create', permisos)) btnCrear.remove();

  // limpiarModales();
  // await initModales(['modalTipoElemento']);
  // const { modalTipoElemento } = modales;

  // initModalTipo(modalTipoElemento);

  // Actualización en segundo plano
  await actualizarStorageTipos();

  // document.getElementById('dashboard-tipos-elementos').addEventListener('click', (e) => {
  //   if (e.target.closest('#crearTipo')) {
  //     configurarModalTipo('crear', modalTipoElemento);
  //     abrirModal(modalTipoElemento);
  //   }
  // });

  const search = document.querySelector('[type="search"]');
  search.addEventListener('input', (e) => {
    let tipos = JSON.parse(localStorage.getItem('tipos') || '{}').tipos || [];

    const valor = e.target.value.toLowerCase();
    const tiposFiltrados = tipos.filter(tipo => {
      for (const dato of tipo) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });
    renderFilas(tiposFiltrados, tipoClick);
  });
}