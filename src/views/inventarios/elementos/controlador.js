import { initComponentes } from "../../../helpers/initComponentes";
import { renderFilas } from "../../../helpers/renderFilas";
import { llenarSelect } from "../../../helpers/select";
import { configurarModalElemento, initModalElemento } from "../../../modals/js/modalElemento";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import { eliminarAccesos, initTemporizadorAcceso } from "../detalles/initTemporizadorAcceso";
import { actualizarStorageElementos, cargarElementos, elementoClick } from "./elemento";


export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const inventario = JSON.parse(localStorage.getItem('inventario'));

    initComponentes(usuario);

    if (usuario.rol_id === 2) {
        const crearBoton = document.getElementById('crearElemento');
        crearBoton.classList.remove('hidden');

        sessionStorage.setItem("rutaAnterior", location.hash);
        const verTiposBoton = document.getElementById('verTipos');
        verTiposBoton.classList.remove('hidden');

        document.getElementById('dashboard-elementos').addEventListener('click', (e) => {
            if (e.target.closest('#crearElemento')) {
                configurarModalElemento('crear', modalElemento);
                abrirModal(modalElemento);
            }
        })
    }

    let elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];

    if (!elementos || elementos.length === 0) {
        const elementosFormateados = await cargarElementos(inventario);
        localStorage.setItem('elementos', JSON.stringify({ elementos: elementosFormateados }));
        elementos = elementosFormateados;
    }

    renderFilas(elementos, elementoClick);

    await llenarSelect({
        endpoint: `inventarios/${inventario.id}/ambientes`,
        selector: '#filtro-ambientes',
        optionMapper: ambiente => ({ id: ambiente.id, text: ambiente.nombre })
    });
    await llenarSelect({
        endpoint: 'estados',
        selector: '#filtro-estados',
        optionMapper: estado => ({ id: estado.id, text: estado.nombre })
    });


    limpiarModales();
    await initModales(['modalElemento']);

    const { modalElemento } = modales;
    await initModalElemento(modalElemento);


    // Actualización en segundo plano
    await actualizarStorageElementos(inventario);

    if (usuario.rol_id === 3) {
        const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));

        if (codigoInfo) {
            const limpiar = () => {
              document.querySelector('.sidebar .access-info')?.classList.add('hidden');
              localStorage.removeItem('codigoAccesoInfo');
              localStorage.removeItem('inventario');
            }
            const expiracion = new Date(codigoInfo.expiracion);
            const ahora = new Date();

            if (expiracion > ahora) {
                document.querySelector('.sidebar .access-info')?.classList.remove('hidden');
                await initTemporizadorAcceso(expiracion, inventario.id, limpiar);
            } else {
                await eliminarAccesos(inventario.id, limpiar);
                window.location.hash = '#/inventarios';
            }
        } else {
            window.location.hash = '#/inventarios';
        }
    }
    const search = document.querySelector('[type="search"]');
    search.addEventListener('input', (e) => {
        let elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];
        const valor = e.target.value.toLowerCase();
        const elementosFiltrados = elementos.filter(elemento => {
            for (const dato of elemento) {
                if (dato && dato.toString().toLowerCase().includes(valor)) return true;
            }
            return false;
        });
        renderFilas(elementosFiltrados, elementoClick);
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

        renderFilas(resultado, elementoClick);
    });

    filtroAmbiente.addEventListener('change', (e) => {
        const indice = e.target.selectedIndex;
        ambienteActual = indice > 0 ? e.target.options[indice].textContent.trim() : '';

        const elementos = JSON.parse(localStorage.getItem('elementos') || '{}').elementos || [];
        const resultado = filtrarElementos({ elementos, estado: estadoActual, ambiente: ambienteActual });

        renderFilas(resultado, elementoClick);
    });


}

const filtrarElementos = ({ elementos, estado = '', ambiente = '' }) => {
    return elementos.filter(lista => {
        const contieneEstado = estado ? lista.some(d => d?.toString().toLowerCase() === estado.toLowerCase()) : true;
        const contieneAmbiente = ambiente ? lista.some(d => d?.toString().toLowerCase() === ambiente.toLowerCase()) : true;
        return contieneEstado && contieneAmbiente;
    });
}
