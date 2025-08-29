import { cerrarModal, mostrarConfirmacion, mostrarUltimoModal, ocultarModalTemporal } from "../modalsController";
import * as validaciones from "../../utils/Validaciones";
import * as api from "../../utils/api";
// import { error, success } from "../../utils/alertas";
import { actualizarStorageReportes, formatearReporte } from "../../views/inventarios/reportes/reporte";

export const initModalGenerarReporte = (modal) => {

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

    const form = modal.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validaciones.validarFormulario(e)) return;
        const confirmado = await mostrarConfirmacion('¿Está seguro de generar el reporte?');

        if (!confirmado) return;

        const info = JSON.parse(localStorage.getItem('info_reporte'));

        const respuestaReporte = await api.post('reportes', {
            asunto: validaciones.datos.asunto,
            mensaje: validaciones.datos.mensaje,
            ...info
        })
        if (!respuestaReporte.success) {
            ocultarModalTemporal(modal);
            await error(respuestaReporte);
            setTimeout(async() => mostrarUltimoModal(), 100);    
            return;
        }

        if (inputFile.files.length > 0) {
            for (const archivo of inputFile.files) {
                const formData = new FormData();
                formData.append("foto", archivo);
                formData.append("reporte_id", respuestaReporte.data.id);

                try {
                    const response = await fetch("http://localhost:8080/StockControl_API/api/fotos", {
                        method: "POST",
                        body: formData
                    });
                    const respuesta = await response.json()

                    if (!respuesta.success) {
                        console.warn(`Error al subir la imagen ${archivo.name}:`, respuesta);
                    }
                } catch (err) {
                    console.error(`Error de red al subir ${archivo.name}:`, err);
                }
            }
        }
        ocultarModalTemporal(modal)
        setTimeout(async () => {
            await success('Reporte generado exitosamente')
            setTimeout(async () => cerrarModal(), 100);
        }, 100);
        form.reset();

        localStorage.removeItem('info_reporte')
        let reportes = JSON.parse(localStorage.getItem('reportes'))?.reportes || [];
        reportes.unshift(await formatearReporte(respuestaReporte.data)); // agrega al principio
        localStorage.setItem('reportes', JSON.stringify({ reportes }));
        // await actualizarStorageReportes(inventario);
    });

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

    modal.addEventListener('click', async (e) => {
        if (e.target.closest('.cancelar')) {
            form.querySelectorAll('.form__control').forEach(input => {
                input.classList.remove('error');
            });
            form.reset();
            localStorage.removeItem('info_reporte')
            cerrarModal();
        }
    })
}