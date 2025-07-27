import { initComponentes } from "../../../../helpers/initComponentes";
import { renderFilas } from "../../../../helpers/renderFilas";
import { abrirModal, initModales, limpiarModales, modales } from "../../../../modals/modalsController";
import { configurarModalTipo, initModalTipo } from "../../../../modals/modalTipoElemento";
import * as api from '../../../../utils/api';
import { formatearTipo, tipoClick } from "./tipos-elementos";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    initComponentes(usuario);
    if (usuario.rol_id != 1) location.hash = '#/inventarios';

    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').classList.add('dashboard--table-section');
    document.querySelector('.dashboard').removeAttribute('id');
    document.querySelector('.dashboard').id = "dashboard-tipos-elementos";

    limpiarModales();
    await initModales(['modalTipoElemento']);
    const { modalTipoElemento } = modales;

    initModalTipo(modalTipoElemento);

    const respuesta = await api.get('tipos-elementos');
    console.log(respuesta);
    
    if (respuesta.success) {
        const tipos = [];
        respuesta.data.map( tipo => {
            tipos.push(formatearTipo(tipo));
        });
        renderFilas(tipos, tipoClick);
    }

    document.getElementById('dashboard-tipos-elementos').addEventListener('click', (e) => {
        // Botón Agregar → AGREGAR
        if (e.target.closest('#crearTipo')) {
            configurarModalTipo('crear', modalTipoElemento);
            abrirModal(modalTipoElemento);
        }
    });
}