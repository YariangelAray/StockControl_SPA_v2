import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { esResponsive, removerFilar } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { cerrarModal, mostrarConfirmacion } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { del, get } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import { actualizarStorageInventarios } from "../inventario";

export default async (modal, parametros) => {
    document.title = "Inventarios - Detalles: " + parametros.id;
    modal.dataset.modo = 'detalles';

    if (!modal.dataset.inicializado) {
        await llenarSelect({
            endpoint: 'usuarios/administrativos',
            selector: '#usuarios',
            optionMapper: usuario => ({ id: usuario.id, text: `${usuario.documento} - ${usuario.nombre}` })
        });
        modal.dataset.inicializado = "true";
    }

    // botones que deben estar visibles en este flujo
    const botonesVisibles = ['.editar', '.aceptar', '.eliminar'];
    // ocultar todos los botones primero
    modal.querySelectorAll('.modal__actions .button').forEach(btn => {
        btn.style.display = 'none';
    });

    // mostrar solo los de esta vista
    botonesVisibles.forEach(selector => {
        const btn = modal.querySelector(selector);
        if (btn) btn.style.display = '';
    });


    // aplicar permisos sobre los visibles
    const permisos = getCookie('permisos', []);

    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        const requeridos = btn.dataset.permiso.split(',').map(p => p.trim());
        const tienePermiso = requeridos.some(p => hasPermisos(p, permisos));

        if (!tienePermiso) {
            btn.remove();
        }
    });


    modal.querySelector('.modal__title').textContent = 'Detalles del Inventario';

    const { data } = await get('inventarios/' + parametros.id);

    const form = modal.querySelector('form');
    llenarCamposFormulario(data, form);
    setLecturaForm(form, true); // lectura

    const eliminarBtn = modal.querySelector('.eliminar');

    asignarEvento(eliminarBtn, 'click', async () => {
        const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el inventario?");
        if (!confirmado) return;

        const respuesta = await del('inventarios/' + parametros.id);
        if (respuesta.success) {
            cerrarModal(modal);
            successToast('Inventario eliminado con éxito');
            const contenedor = esResponsive() ? document.querySelector('#dashboard-inventarios .acordeon') : document.querySelector('#dashboard-inventarios .table__body');
            removerFilar(contenedor, parametros.id);
        } else {
            errorToast(respuesta);
        }

        await actualizarStorageInventarios();
    });

    modal.addEventListener('click', async (e) => {

        if (e.target.closest('.editar')) {
            location.hash = "#/super-admin/inventarios/editar/id=" + parametros.id;
            return;
        }
    })
}