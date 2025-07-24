import { configurarModalElemento, initModalElemento } from "./modalElemento";
import { abrirModal, cerrarModal, initModales, modales, ocultarModalTemporal } from "./modalsController"

export const initModalReporte = async (modal) => {
    await initModales(['modalElemento']);
    const { modalElemento } = modales;
    await initModalElemento(modalElemento);

    const contenedor = document.querySelector('.reporte__imagenes');
    const sinImagenes = contenedor.querySelector('.reporte__sin-imagenes');

    // Simulando imágenes
    const imagenes = [
        'https://picsum.photos/200',
        'https://picsum.photos/300/700',
        'https://picsum.photos/500/400'
    ];

    // Mostrar imágenes si hay
    if (imagenes.length > 0) {
        sinImagenes.remove(); // quitar el mensaje
        imagenes.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            contenedor.appendChild(img);
        });
    }

    const visor = document.getElementById('visor-imagen');
    const visorImg = visor.querySelector('img');

    modal.addEventListener('click', (e) => {
        if (e.target.closest('.ver-elemento')) {
            ocultarModalTemporal(modal);
            configurarModalElemento("editar", modalElemento);
            abrirModal(modalElemento);
        }

        if (e.target.closest('.aceptar')) {
            cerrarModal();
        }
        if (e.target.closest('.reporte__imagenes img')) {
            visorImg.src = e.target.src;
            visor.showModal();
        }
        // Cerrar con clic fuera
        visor.addEventListener('click', (e) => {
            if (e.target === visor) {
                visor.close();
                visorImg.src = '';
            }
        });
    })
    // Escape
    visor.addEventListener('keydown', (e) => {
        e.preventDefault();
        if (e.key === 'Escape' && visor.open) {
            visor.close();
            visorImg.src = '';
        }
    });
}