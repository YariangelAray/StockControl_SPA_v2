import { cerrarModal, mostrarConfirmacion } from "./modalsController";
import * as validaciones from "../utils/Validaciones";

export const initModalGenerarReporte = (modal) => {

    const form = modal.querySelector('form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validaciones.validarFormulario(e)) return;
        const confirmado = await mostrarConfirmacion('¿Está seguro de generar el reporte?');

        if (confirmado) {
            alert('Reporte generado exitosamente.');
            form.reset();
            cerrarModal();
        } else {
            alert('Acción cancelada.');
        }
    });

    const campos = [...form]
    campos.forEach(campo => {
    if (campo.hasAttribute('required'))
      campo.addEventListener("input", validaciones.validarCampo);

    if (campo.name == "asunto")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));

    if (campo.name == "mensaje")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 250));
  });

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

    modal.addEventListener('click', async (e) => {
        if (e.target.closest('.cancelar')) {
            form.querySelectorAll('.form__control').forEach(input => {
                input.classList.remove('error');
            });
            cerrarModal();
            form.reset();
        }
    })
}