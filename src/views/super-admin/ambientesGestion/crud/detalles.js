import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { removerFilar } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { cerrarModal, mostrarConfirmacion, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { error, info, success } from "../../../../utils/alertas";
import { del, get } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import { actualizarStorageAmbientes } from "../ambiente";

export default async (modal, parametros) => {
    document.title = "Ambientes - Detalles: " + parametros.id;
    modal.dataset.modo = 'detalles';

    if (!modal.dataset.inicializado) {
        await llenarSelect({
            endpoint: 'centros',
            selector: '#centros',
            optionMapper: centro => ({ id: centro.id, text: centro.nombre })
        });
        modal.dataset.inicializado = "true";
    }


    modal.querySelector('.modal__title').textContent = 'Detalles del Ambiente';

    const { data } = await get('ambientes/' + parametros.id);

    const form = modal.querySelector('form');
    llenarCamposFormulario(data, form);
    setLecturaForm(form, true); // lectura

    const botonesVisibles = ['.editar', '.aceptar', '.ver-mapa', '.eliminar'];

    modal.querySelectorAll('.modal__actions .button').forEach(btn => {
        btn.style.display = 'none';
    });

    // mostrar solo los de esta vista
    botonesVisibles.forEach(selector => {
        const btn = modal.querySelector(selector);
        if (btn) {
            btn.style.display = '';
            if (!data.mapa && btn.classList.contains('ver-mapa')) btn.remove();
        }
    });


    // aplicar permisos sobre los visibles
    const permisos = getCookie('permisos', []);
    ('permisos');
    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        if (!hasPermisos(btn.dataset.permiso, permisos)) {
            btn.remove();
        }
    });


    const eliminarBtn = modal.querySelector('.eliminar');
    const editarBtn = modal.querySelector('.editar');
    const vermapaBtn = modal.querySelector('.ver-mapa');


    asignarEvento(eliminarBtn, 'click', async () => {
        const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el ambiente?");
        if (!confirmado) return;

        const respuesta = await del('ambientes/' + parametros.id);
        if (respuesta.success) {
            cerrarModal(modal);
            success('Ambiente eliminado con éxito');
            removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        } else {
            // ocultarModal(modal);
            error(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
        }

        await actualizarStorageAmbientes();
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
    //         await info("Mapa del ambiente", "Este ambiente aún no tiene un mapa disponible");
    //         setTimeout(() => mostrarModal(modal), 100);
    //     }
    // })

    modal.addEventListener('click', async (e) => {
    
        if (e.target.closest('.editar')) {
            location.hash = "#/super-admin/ambientes/editar/id=" + parametros.id;
            return;
        }
        if (e.target.closest('.ver-mapa')) {
            // const temp = JSON.parse(localStorage.getItem('ambiente_temp'));
            if (data.mapa) {
                window.location.hash = `#/super-admin/ambientes/mapa/ambiente_id=${parametros.id}&nombre=${data.nombre}`;
            }
            else {
                ocultarModal(modal);
                await info("Mapa del ambiente", "Este ambiente aún no tiene un mapa disponible");
                setTimeout(() => mostrarModal(modal), 100);
            }
            return;
        }
        // if (e.target.closest('.eliminar')) {
        //     const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el ambiente?");
        //     if (!confirmado) return;
        //     const respuesta = await del('ambientes/' + parametros.id);
    
        //     if (respuesta.success) {
        //         cerrarModal(modal);
        //         await success('Ambiente eliminado con éxito');
        //         removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        //     }
        //     else {
        //         ocultarModal(modal);
        //         await error(respuesta);
        //         setTimeout(async () => mostrarModal(modal), 100);
        //     }
        //     await actualizarStorageAmbientes();
        //     return;
        // }
    })
}