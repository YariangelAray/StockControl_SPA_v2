import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { agregarFila, esResponsive } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { cerrarModal, mostrarConfirmacion, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { get, patch, put } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import obtenerHashBase from "../../../../helpers/obtenerHashBase";

import * as validaciones from '../../../../utils/Validaciones';
import { actualizarStorageElementos, elementoClick, formatearElemento } from "../elemento";
import { gestionarTipoElemento, reiniciarSelectTipo, tipoElementoCreado } from "./helperTipoElemento";

export default async (modal, parametros) => {

    document.title = "Elementos - Detalles: " + parametros.id
    modal.dataset.modo = 'detalles';

    const selectTipo = modal.querySelector('#tipos-elementos');
    const btnAgregarTipo = modal.querySelector('#agregarTipo');
    if (!modal.dataset.inicializado) {
        await llenarSelect({
            endpoint: 'ambientes',
            selector: '#ambientes',
            optionMapper: ambiente => ({ id: ambiente.id, text: ambiente.nombre })
        });
        await llenarSelect({
            endpoint: 'estados',
            selector: '#estados',
            optionMapper: estado => ({ id: estado.id, text: estado.nombre })
        });

        reiniciarSelectTipo(selectTipo);

        await llenarSelect({
            endpoint: 'tipos-elementos',
            selector: '#tipos-elementos',
            optionMapper: tipo => ({
                id: tipo.id,
                text: `${tipo.consecutivo}: ${tipo.nombre}. Marca: ${(tipo.marca ?? "No Aplica")}. Modelo: ${(tipo.modelo ?? "No Aplica")}.`
            })
        });

        selectTipo.addEventListener('change', () => {
            const valor = selectTipo.value;
            if (valor == 'otro' && (hasPermisos("tipo-elemento.create", permisos) || hasPermisos("tipo-elemento.create-inventory-own", permisos))) btnAgregarTipo.classList.remove('hidden');
            else btnAgregarTipo.classList.add('hidden');
        });

        btnAgregarTipo.addEventListener('click', async (e) => {
            e.preventDefault();
            await gestionarTipoElemento(modal, modal.dataset.modo, validaciones.datos);
        });
        modal.dataset.inicializado = "true";
    }

    // botones que deben estar visibles en este flujo
    const botonesVisibles = ['.editar', '.aceptar', '.reportar', '.reactivar', '.dar-baja', '#agregarTipo'];
    // ocultar todos los botones primero
    modal.querySelectorAll('.modal__actions .button').forEach(btn => {
        btn.classList.add('hidden');
    });

    // mostrar solo los de esta vista
    botonesVisibles.forEach(selector => {
        const btn = modal.querySelector(selector);
        if (btn) btn.classList.remove('hidden');
    });
    btnAgregarTipo.classList.add('hidden');

    const permisos = getCookie('permisos', []);

    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        const requeridos = btn.dataset.permiso.split(',').map(p => p.trim());
        const tienePermiso = requeridos.some(p => hasPermisos(p, permisos));

        if (!tienePermiso) {
            btn.remove();
        }
    });

    const { data } = await get('elementos/me/' + parametros.id)
    // const {data}=respuesta;    


    const btn = data.activo ? modal.querySelector('.reactivar') : modal.querySelector('.dar-baja');
    btn?.classList.add('hidden');

    modal.querySelector('.modal__title').textContent = 'Editar Elemento';

    const form = modal.querySelector('form');
    llenarCamposFormulario(data, form);
    setLecturaForm(form, true); // lectura

    const darBaja = modal.querySelector('.dar-baja');
    const reactivar = modal.querySelector('.reactivar');

    asignarEvento(darBaja, 'click', async () => {
        const confirmado = await mostrarConfirmacion("¿Está seguro de dar de baja el elemento?");
        if (!confirmado) return;

        const respuesta = await patch('elementos/me/' + parametros.id, { activo: false });

        if (respuesta.success) {
            await actualizarStorageElementos();
            const fila = esResponsive() ? document.querySelector(`#dashboard-elementos .acordeon__item[data-id="${parametros.id}"]`) : document.querySelector(`#dashboard-elementos .table__row[data-id="${parametros.id}"]`);
            if (fila) fila.classList.add('row--red');

            cerrarModal(modal);
            requestAnimationFrame(() => location.hash = obtenerHashBase());
            successToast('Elemento dado de baja con éxito');
            // removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        } else {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
        }

    });

    asignarEvento(reactivar, 'click', async () => {
        const confirmado = await mostrarConfirmacion("¿Está seguro de reactivar el elemento?");
        if (!confirmado) return;

        const respuesta = await patch('elementos/me/' + parametros.id, { activo: true });
        if (respuesta.success) {
            await actualizarStorageElementos();
            const fila = esResponsive() ? document.querySelector(`#dashboard-elementos .acordeon__item[data-id="${parametros.id}"]`) : document.querySelector(`#dashboard-elementos .table__row[data-id="${parametros.id}"]`);
            if (fila) fila.classList.remove('row--red');
            cerrarModal(modal);
            requestAnimationFrame(() => location.hash = obtenerHashBase());
            successToast('Elemento reactivado con éxito');
            // removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        } else {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
        }

    });

    modal.addEventListener('click', async (e) => {

        if (e.target.closest('.editar')) {
            location.hash = "#/inventarios/elementos/editar/id=" + parametros.id;
            return;
        }
        if (e.target.closest('.reportar')) {
            location.hash = "#/inventarios/elementos/reportar/id=" + parametros.id;
            return;
        }
        if (e.target.closest('.aceptar')) {
            e.stopPropagation();
            // si viene del reporte, regresar al reporte
            const volverAReporteId = sessionStorage.getItem('volverAReporteId');
            if (volverAReporteId) {
                sessionStorage.removeItem('volverAReporteId');
                await cerrarModal(modal);
                location.hash = "#/inventarios/reportes/detalles/id=" + volverAReporteId;
            }
        }
    })
};
