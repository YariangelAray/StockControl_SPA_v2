import { agregarFila, esResponsive } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { cerrarModal, mostrarConfirmacion } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { post } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import obtenerHashBase from "../../../../helpers/obtenerHashBase";
import * as validaciones from '../../../../utils/Validaciones';
import { formatearInventario, inventarioClick } from "../inventario";

export default async (modal) => {
    document.title = "Inventarios - Crear"
    modal.dataset.modo = 'crear';
    if (!modal.dataset.inicializado) {
        await llenarSelect({
            endpoint: 'usuarios/administrativos',
            selector: '#usuarios',
            optionMapper: usuario => ({ id: usuario.id, text: `${usuario.documento} - ${usuario.nombre}` })
        });
        modal.dataset.inicializado = "true";
    }

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

    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        const requeridos = btn.dataset.permiso.split(',').map(p => p.trim());
        const tienePermiso = requeridos.some(p => hasPermisos(p, permisos));

        if (!tienePermiso) {
            btn.remove();
        }
    });


    modal.querySelector('.modal__title').textContent = 'Crear Inventario';

    const form = modal.querySelector('form');

    const campos = [...form];
    campos.forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);
        if (campo.name == "nombre") {
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));
            campo.addEventListener("keydown", validaciones.validarTexto);
        }
        if (campo.name == "fecha_creacion")
            campo.addEventListener('input', (e) => validaciones.validarFecha(e.target))
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const boton = e.submitter; // Este es el botón que disparó el submit        

        if (!validaciones.validarFormulario(e)) return;
        const confirmado = await mostrarConfirmacion();
        if (!confirmado) return;

        const respuesta = await post('inventarios', validaciones.datos);
        if (!respuesta.success) {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
            return;
        }

        cerrarModal(modal);
        setTimeout(async () => successToast('Inventario creado con éxito'), 100);
        location.hash = obtenerHashBase();

        const datosFormateados = formatearInventario(respuesta.data);

        // actualizar cache y tabla
        let inventarios = JSON.parse(localStorage.getItem('inventarios'))?.inventarios || [];
        inventarios.unshift(datosFormateados);
        localStorage.setItem('inventarios', JSON.stringify({ inventarios }));

        const contenedor = esResponsive() ? document.querySelector('#dashboard-inventarios .acordeon') : document.querySelector('#dashboard-inventarios .table__body');
        agregarFila(contenedor, datosFormateados, inventarioClick);
    });

}