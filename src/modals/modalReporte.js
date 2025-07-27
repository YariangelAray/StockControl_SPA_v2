import * as api from "../utils/api";
import { llenarCamposFormulario } from "../utils/llenarCamposFormulario";
import { configurarModalElemento, initModalElemento } from "./modalElemento";
import { abrirModal, cerrarModal, initModales, modales, ocultarModalTemporal } from "./modalsController"

export const initModalReporte = async (modal) => {

    await initModales(['modalElemento']);
    const { modalElemento } = modales;
    await initModalElemento(modalElemento);

    const visor = document.getElementById('visor-imagen');
    const visorImg = visor.querySelector('img');

    modal.addEventListener('click', async (e) => {
        if (e.target.closest('.ver-elemento')) {
            const id_elemento = modal.querySelector("#placa").dataset.id;

            const { data } = await api.get('elementos/' + id_elemento)      

            localStorage.setItem('elemento_temp', JSON.stringify(data));
            const form = modales.modalElemento.querySelector('form');

            llenarCamposFormulario(data, form);
            configurarModalElemento('editar', modalElemento);
            ocultarModalTemporal(modal);            
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

export const configurarModalReporte = async (reporte, modal, id_elemento) => {

    // 1. Insertar datos en los <p>
    modal.querySelector("#fecha").textContent = reporte.fecha || "Sin fecha";
    modal.querySelector("#usuario").textContent = reporte.usuario || "Sin usuario";
    modal.querySelector("#asunto").textContent = reporte.asunto || "Sin asunto";
    modal.querySelector("#placa").textContent = reporte.placa || "Sin placa";
    modal.querySelector("#placa").dataset.id = id_elemento;
    modal.querySelector("#mensaje").textContent = reporte.mensaje || "Sin mensaje";

    // 2. Mostrar imágenes
    const contenedor = modal.querySelector('.reporte__imagenes');
    const sinImagenes = contenedor.querySelector('.reporte__sin-imagenes');
    contenedor.innerHTML = ""; // Limpiar contenedor

    try {
        const { data } = await api.get('fotos/reporte/' + reporte.id);        
        

        if (data && data.length > 0) {
            data.forEach(({url}) => {
                const img = document.createElement('img');
                img.src = url;
                contenedor.appendChild(img);
            });
        } else {
            contenedor.appendChild(sinImagenes);
        }

    } catch (err) {
        console.error("Error cargando imágenes del reporte:", err);
        contenedor.appendChild(sinImagenes);
    }
};
