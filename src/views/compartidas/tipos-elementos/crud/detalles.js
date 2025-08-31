import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { removerFilar } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { cerrarModal, mostrarConfirmacion, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { errorToast, infoToast, successToast } from "../../../../utils/alertas";
import { del, get } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import { actualizarStorageTipos } from "../tipos-elementos";

export default async (modal, parametros) => {
    document.title = "Tipos Elementos - Detalles: " + parametros.id;
    modal.dataset.modo = 'detalles';

    modal.querySelector('.modal__title').textContent = 'Detalles del Tipo de Elemento';

    const { data } = await get('tipos-elementos/' + parametros.id);

    const form = modal.querySelector('form');
    llenarCamposFormulario(data, form);
    setLecturaForm(form, true); // lectura

    const botonesVisibles = ['.editar', '.aceptar', '.eliminar'];

    modal.querySelectorAll('.modal__actions .button').forEach(btn => {
        btn.style.display = 'none';
    });

    // mostrar solo los de esta vista
    botonesVisibles.forEach(selector => {
        const btn = modal.querySelector(selector);
        if (btn) {
            btn.style.display = '';
        }
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



    const eliminarBtn = modal.querySelector('.eliminar');


    asignarEvento(eliminarBtn, 'click', async () => {
        const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el tipo de elemento?");
        if (!confirmado) return;

        const respuesta = await del('tipos-elementos/' + parametros.id);
        if (respuesta.success) {
            cerrarModal(modal);
            successToast('Tipo de elemento eliminado con éxito');
            removerFilar(document.querySelector('#dashboard-tipos-elementos .table__body'), parametros.id);
        } else {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
        }

        await actualizarStorageTipos();
    });

    // asignarEvento(editarBtn, 'click', () => {
    //     location.hash = "#/super-admin/ambientes/editar/id=" + parametros.id;
    // })
    // asignarEvento(vermapaBtn, 'click', async () => {
    //     if (data.mapa) {
    //         location.hash = `#/super-admin/ambientes/mapa/ambiente_id=${parametros.id}&nombre=${data.nombre}`;
    //     }
    //     else {
    //         ocultarModal(modal);
    //         await infoToast("Mapa del ambiente", "Este ambiente aún no tiene un mapa disponible");
    //         setTimeout(() => mostrarModal(modal), 100);
    //     }
    // })

    modal.addEventListener('click', async (e) => {

        if (e.target.closest('.editar')) {
            if (location.hash.startsWith('#/inventarios')) location.hash = '#/inventarios/elementos/tipos-elementos/editar/id=' + parametros.id;
            else if (location.hash.startsWith('#/super-admin')) location.hash = '#/super-admin/tipos-elementos/editar/id=' + parametros.id;
            return;
        }
        // if (e.target.closest('.eliminar')) {
        //     const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el ambiente?");
        //     if (!confirmado) return;
        //     const respuesta = await del('ambientes/' + parametros.id);

        //     if (respuesta.successToast) {
        //         cerrarModal(modal);
        //         await successToast('Ambiente eliminado con éxito');
        //         removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        //     }
        //     else {
        //         ocultarModal(modal);
        //         await errorToast(respuesta);
        //         setTimeout(async () => mostrarModal(modal), 100);
        //     }
        //     await actualizarStorageAmbientes();
        //     return;
        // }
    })
}