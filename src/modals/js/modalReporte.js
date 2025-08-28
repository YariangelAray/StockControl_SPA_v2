import * as api from "../../utils/api";
import { llenarCamposFormulario } from "../../helpers/llenarCamposFormulario";
import { configurarModalElemento, initModalElemento } from "./modalElemento";
import { abrirModal, cerrarModal, initModales, modales, ocultarModalTemporal } from "../modalsController"

export const initModalReporte = async (modal) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
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
            const btn = data.estado_activo ? modales.modalElemento.querySelector('.dar-baja') : modales.modalElemento.querySelector('.reactivar');
            if (usuario.rol_id == 2) btn.classList.remove('hidden');
            ocultarModalTemporal(modal);
            abrirModal(modalElemento);
        }

        if (e.target.closest('.aceptar')) {
            cerrarModal();
            localStorage.removeItem('reporte_temp');
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
    modal.querySelector("#fecha").textContent = reporte.fecha;
    modal.querySelector("#usuario").textContent = reporte.usuario;
    modal.querySelector("#asunto").textContent = reporte.asunto;
    modal.querySelector("#placa").textContent = reporte.placa;
    modal.querySelector("#placa").dataset.id = id_elemento;
    modal.querySelector("#mensaje").textContent = reporte.mensaje;

    // 2. Mostrar imágenes
    const contenedor = modal.querySelector('.reporte__imagenes');
    contenedor.innerHTML = ""; // Limpiar contenedor        

    if (reporte.fotos && reporte.fotos.length > 0) {
        reporte.fotos.forEach(({ url }) => {
            const img = document.createElement('img');
            img.src = 'http://localhost:8080/stockcontrol_api/' + url;
            contenedor.appendChild(img);
        });
    } else {
        const sinImagenes = document.createElement('p');
        sinImagenes.classList.add('reporte__sin-imagenes', 'text-details');

        const icono = document.createElement('i');
        icono.classList.add('ri-camera-off-line');

        // Añadimos el icono y el texto al `<p>`
        sinImagenes.appendChild(icono);
        sinImagenes.append(' No hay imágenes.');

        contenedor.appendChild(sinImagenes);
    }
};
