
import { esResponsive, renderFilas } from "../../../helpers/renderFilas";
import { onResponsiveChange, setVistaActual } from "../../../helpers/responsiveManager";
import { llenarSelect } from "../../../helpers/select";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";

import { actualizarStorageElementos, cargarElementos, elementoClick } from "./elemento";


export default async () => {

  setVistaActual("elementos");
  const permisos = getCookie('permisos', [])
  const inventario = JSON.parse(localStorage.getItem('inventario'));

  if (hasPermisos('elemento.create-inventory-own', permisos)) {
    const crearBoton = document.getElementById('crearElemento');
    crearBoton.classList.remove('hidden');
  }
  if (hasPermisos('tipo-elemento.view-inventory-own', permisos)) {
    sessionStorage.setItem("rutaAnterior", location.hash);
    const verTiposBoton = document.getElementById('verTipos');
    verTiposBoton.classList.remove('hidden');

  }

  const elementos = await cargarElementos();
  localStorage.setItem('elementos', JSON.stringify({ elementos: elementos }));

  const tbody = document.querySelector('#dashboard-elementos .table__body');
  const acordeon = document.querySelector('#dashboard-elementos .acordeon');

  renderFilas(elementos, elementoClick, acordeon, tbody);

  await llenarSelect({
    endpoint: `inventarios/me/${inventario.id}/ambientes`,
    selector: '#filtro-ambientes',
    optionMapper: ambiente => ({ id: ambiente.id, text: ambiente.nombre })
  });
  await llenarSelect({
    endpoint: 'estados',
    selector: '#filtro-estados',
    optionMapper: estado => ({ id: estado.id, text: estado.nombre })
  });



  // Actualización en segundo plano
  await actualizarStorageElementos();

  const search = document.querySelector('[type="search"]');
  search.addEventListener('input', (e) => {
    let elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];
    const valor = e.target.value.toLowerCase();
    const elementosFiltrados = elementos.filter(elemento => {
      elemento = elemento.map(e => typeof e == 'object' ? e.value : e);
      for (const dato of elemento) {
        if (dato && dato.toString().toLowerCase().includes(valor)) return true;
      }
      return false;
    });
    renderFilas(elementosFiltrados, elementoClick, acordeon, tbody);
  });

  const filtroEstado = document.getElementById('filtro-estados');
  const filtroAmbiente = document.getElementById('filtro-ambientes');

  let estadoActual = '';
  let ambienteActual = '';

  filtroEstado.addEventListener('change', (e) => {
    const indice = e.target.selectedIndex;
    estadoActual = indice > 0 ? e.target.options[indice].textContent.trim() : '';

    const elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];
    const resultado = filtrarElementos({ elementos, estado: estadoActual, ambiente: ambienteActual });

    renderFilas(resultado, elementoClick, acordeon, tbody);
  });

  filtroAmbiente.addEventListener('change', (e) => {
    const indice = e.target.selectedIndex;
    ambienteActual = indice > 0 ? e.target.options[indice].textContent.trim() : '';

    const elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];
    const resultado = filtrarElementos({ elementos, estado: estadoActual, ambiente: ambienteActual });

    renderFilas(resultado, elementoClick, acordeon, tbody);
  });

  onResponsiveChange("elementos", async () => {
    console.log("Resize detectado SOLO en elementos");
    await actualizarStorageElementos();
    const elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];
    renderFilas(elementos, elementoClick, acordeon, tbody);
  });
}

const filtrarElementos = ({ elementos, estado = '', ambiente = '' }) => {
  return elementos.filter(lista => {
    lista = lista.map(e => typeof e == 'object' ? e.value : e);
    const contieneEstado = estado ? lista.some(d => d?.toString().toLowerCase() === estado.toLowerCase()) : true;
    const contieneAmbiente = ambiente ? lista.some(d => d?.toString().toLowerCase() === ambiente.toLowerCase()) : true;
    return contieneEstado && contieneAmbiente;
  });
}