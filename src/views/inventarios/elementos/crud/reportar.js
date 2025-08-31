import asignarEvento from '../../../../helpers/asignarEvento';
import { cerrarModal, mostrarConfirmacion } from '../../../../modals/modalsController';
import { errorToast, successToast } from '../../../../utils/alertas';
import { post } from '../../../../utils/api';
import getCookie from '../../../../utils/getCookie';
import hasPermisos from '../../../../utils/hasPermisos';
import * as validaciones from '../../../../utils/Validaciones';
import { actualizarStorageReportes, formatearReporte } from '../../reportes/reporte';

export default (modal, parametros) => {

    document.title = "Elementos - Reportar: " + parametros.id;
    const usuario = getCookie('usuario', {})
    const inputFile = modal.querySelector('#imagenes');
    const nombreArchivo = modal.querySelector('#nombre-archivos');

    inputFile.addEventListener('change', () => {
        if (inputFile.files.length > 0) {
            const nombres = Array.from(inputFile.files).map(f => f.name).join(', ');
            nombreArchivo.textContent = nombres;
        } else {
            nombreArchivo.textContent = 'Ningún archivo seleccionado.';
        }
    });

    const botonesVisibles = ['.reportar', '.cancelar'];

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
    ('permisos');
    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        if (!hasPermisos(btn.dataset.permiso, permisos)) {
            btn.remove();
        }
    });

    const form = modal.querySelector('form');

    const campos = [...form]
    campos.forEach(campo => {
        if (campo.hasAttribute('required')) {
            campo.addEventListener("input", validaciones.validarCampo);
            campo.addEventListener("blur", validaciones.validarCampo);
        }

        if (campo.name == "asunto")
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));

        if (campo.name == "mensaje")
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 1000));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validaciones.validarFormulario(e)) return;
        const confirmado = await mostrarConfirmacion('¿Está seguro de generar el reporte?');

        if (!confirmado) return;        

        const respuestaReporte = await post('reportes', {
            asunto: validaciones.datos.asunto,
            mensaje: validaciones.datos.mensaje,
            usuario_id: usuario.id,
            elemento_id: parametros.id
        })
        if (!respuestaReporte.success) {
            // ocultarModalTemporal(modal);
            errorToast(respuestaReporte);
            // setTimeout(async () => mostrarUltimoModal(), 100);
            return;
        }
        
        try {
            if (inputFile.files.length > 0) {
                for (const archivo of inputFile.files) {
                    const formData = new FormData();
                    formData.append("reporte_id", respuestaReporte.data.id);
                    formData.append("foto", archivo);                    
                    const respuesta = await post("fotos/me", formData);

                    if (!respuesta.success) {
                        errorToast('Error al subir la imagen: ' + archivo.name);
                        console.error('Error al subir la imagen:', respuesta);
                    }

                }
            }
        } catch (error) {
            return;
        }        
        successToast('Reporte generado con éxito');
        cerrarModal(modal)
        location.hash = "#/inventarios/elementos/detalles/id=" + parametros.id;

        await actualizarStorageReportes();
    });

    const cancelarBtn = modal.querySelector('.cancelar');

    cancelarBtn.addEventListener('click', e => {
        e.stopPropagation(); // evita que el listener global lo capture
        cerrarModal(modal);
        location.hash = "#/inventarios/elementos/detalles/id=" + parametros.id;
    });

}