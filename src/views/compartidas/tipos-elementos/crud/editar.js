import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { esResponsive, reemplazarFila } from "../../../../helpers/renderFilas";

import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { mostrarConfirmacion } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { get, put } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import * as validaciones from '../../../../utils/Validaciones';
import { actualizarStorageTipos, formatearTipo, tipoClick } from "../tipos-elementos";


export default async (modal, parametros) => {
    document.title = "Tipos Elementos - Editar: " + parametros.id;
    modal.dataset.modo = 'editar';

    modal.querySelector('.modal__title').textContent = 'Editar Tipo de Elemento';

    const { data } = await get('tipos-elementos/' + parametros.id);

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

    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        const requeridos = btn.dataset.permiso.split(',').map(p => p.trim());
        const tienePermiso = requeridos.some(p => hasPermisos(p, permisos));

        if (!tienePermiso) {
            btn.remove();
        }
    });




    const campos = [...form];
    campos.forEach(campo => {
        if (campo.hasAttribute('required')) {
            campo.addEventListener("input", validaciones.validarCampo);
            campo.addEventListener("blur", validaciones.validarCampo);
        }

        if (campo.name == "consecutivo") {
            campo.addEventListener("keydown", validaciones.validarNumero);
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 10));
        }

        if (campo.name == "nombre" || campo.name == "marca" || campo.name == "modelo")
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));

        if (campo.name == "observaciones")
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 250));
    });



    form.onsubmit = async (e) => {
        e.preventDefault();

        if (!validaciones.validarFormulario(e)) return;
        validaciones.datos.consecutivo = parseInt(validaciones.datos.consecutivo);

        const confirmado = await mostrarConfirmacion();
        if (!confirmado) return;

        const respuesta = await put('tipos-elementos/' + parametros.id, validaciones.datos);
        if (!respuesta.success) {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
            return;
        }

        successToast('Tipo de elemento actualizado con éxito');
        // cerrarModal(modal);
        // modal.dataset.modo = 'detalles'; // para que modalManager no lo cierre
        // await detalles(modal, parametros); // reutiliza la lógica
        if (location.hash.startsWith('#/inventarios')) location.hash = '#/inventarios/elementos/tipos-elementos/detalles/id=' + parametros.id;
        else if (location.hash.startsWith('#/super-admin')) location.hash = '#/super-admin/tipos-elementos/detalles/id=' + parametros.id;

        const datosFormateados = formatearTipo(respuesta.data);

        const contenedor = esResponsive() ? document.querySelector('#dashboard-tipos-elementos .acordeon') : document.querySelector('#dashboard-tipos-elementos .table__body');
        reemplazarFila(contenedor, datosFormateados, tipoClick);
        await actualizarStorageTipos();
    };

    const cancelarBtn = modal.querySelector('.cancelar');


    asignarEvento(cancelarBtn, 'click', async () => {
        form.querySelectorAll('.form__control').forEach(input => {
            input.classList.remove('error');
        });
        // await detalles(modal, parametros); // reutiliza la lógica
        if (location.hash.startsWith('#/inventarios')) location.hash = '#/inventarios/elementos/tipos-elementos/detalles/id=' + parametros.id;
        else if (location.hash.startsWith('#/super-admin')) location.hash = '#/super-admin/tipos-elementos/detalles/id=' + parametros.id;
        // modal.dataset.modo = 'detalles'; // para que modalManager no lo cierre
    });

}