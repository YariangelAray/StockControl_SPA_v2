import { cerrarModal, mostrarConfirmacion } from "./modalsController";

export const initModalGenerarReporte = (modal) => {
    
    const form = modal.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
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
            cerrarModal();
        }
        if (e.target.closest('.confirmar')) {
            const confirmado = await mostrarConfirmacion('¿Está seguro de generar el reporte?');
            if (confirmado) {
                alert('Reporte generado exitosamente.');
                cerrarModal();
            }
        }
    })
}