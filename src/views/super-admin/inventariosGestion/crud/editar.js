import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { reemplazarFila } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { mostrarConfirmacion } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { get, put } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import * as validaciones from '../../../../utils/Validaciones';
import { actualizarStorageInventarios, inventarioClick, formatearInventario } from "../inventario";


export default async (modal, parametros) => {
    document.title = "Inventarios - Editar: " + parametros.id;
    modal.dataset.modo = 'editar';

    if (!modal.dataset.inicializado) {
        await llenarSelect({
            endpoint: 'usuarios/administrativos',
            selector: '#usuarios',
            optionMapper: usuario => ({ id: usuario.id, text: `${usuario.documento} - ${usuario.nombre}` })
        });
        modal.dataset.inicializado = "true";
    }

    modal.querySelector('.modal__title').textContent = 'Editar Inventario';

    const { data } = await get('inventarios/' + parametros.id);

    const form = modal.querySelector('form');
    llenarCamposFormulario(data, form);
    setLecturaForm(form, false); // lectura

    const botonesVisibles = ['.guardar', '.cancelar'];

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
    ('permisos');
    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        if (!hasPermisos(btn.dataset.permiso, permisos)) {
            btn.remove();
        }
    });


    [...form].forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);
        if (campo.name == "nombre") {
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));
            campo.addEventListener("keydown", validaciones.validarTexto);
        }
        if (campo.name == "fecha_creacion")
            campo.addEventListener('input', (e) => validaciones.validarFecha(e.target))
    });



    form.onsubmit = async (e) => {
        e.preventDefault();

        if (!validaciones.validarFormulario(e)) return;

        const confirmado = await mostrarConfirmacion();
        if (!confirmado) return;

        const respuesta = await put('inventarios/' + parametros.id, validaciones.datos);
        if (!respuesta.success) {
            errorToast(respuesta);
            return;
        }

        successToast('Inventario actualizado con éxito');
        location.hash = "#/super-admin/inventarios/detalles/id=" + parametros.id;

        const datosFormateados = formatearInventario(respuesta.data);

        const tbody = document.querySelector('#dashboard-inventarios .table__body');
        reemplazarFila(tbody, datosFormateados, inventarioClick);
        await actualizarStorageInventarios();
    };

    const cancelarBtn = modal.querySelector('.cancelar');

    asignarEvento(cancelarBtn, 'click', async () => {
        form.querySelectorAll('.form__control').forEach(input => {
            input.classList.remove('error');
        });
        location.hash = '#/super-admin/inventarios/detalles/id=' + parametros.id;
    });

}