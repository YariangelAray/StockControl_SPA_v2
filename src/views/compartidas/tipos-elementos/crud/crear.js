import { agregarFila } from "../../../../helpers/renderFilas";
import { cerrarModal, mostrarConfirmacion, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { post } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import obtenerHashBase from "../../../../utils/obtenerHashBase";

import * as validaciones from '../../../../utils/Validaciones';
import { tipoClick, formatearTipo } from "../tipos-elementos";

export default async (modal) => {

    document.title = "Tipos Elementos - Crear"
    modal.dataset.modo = 'crear';

    // botones que deben estar visibles en este flujo
    const botonesVisibles = ['.crear', '.cancelar'];
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
    ('permisos');
    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        if (!hasPermisos(btn.dataset.permiso, permisos)) {
            btn.remove();
        }
    });


    modal.querySelector('.modal__title').textContent = 'Crear Tipo de Elemento';

    // inicializar validaciones
    const form = modal.querySelector('form');

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

        const respuesta = await post('tipos-elementos', validaciones.datos);
        if (!respuesta.success) {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
            return;
        }

        cerrarModal(modal);
        setTimeout(async () => successToast('Tipo de elemento creado con éxito'), 100);
        location.hash = obtenerHashBase();

        const datosFormateados = formatearTipo(respuesta.data);

        // actualizar cache y tabla
        let tipos = JSON.parse(localStorage.getItem('tipos'))?.tipos || [];
        tipos.unshift(datosFormateados);
        localStorage.setItem('tipos', JSON.stringify({ tipos }));

        const tbody = document.querySelector('#dashboard-tipos-elementos .table__body');
        agregarFila(tbody, datosFormateados, tipoClick);

        document.dispatchEvent(new CustomEvent('tipoElementoCreado', { detail: respuesta.data }));

    };
};
