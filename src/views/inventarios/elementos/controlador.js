import { initComponentes } from "../../../helpers/initComponentes";
import { renderFilas } from "../../../helpers/renderFilas";
import { configurarModalElemento, initModalElemento } from "../../../modals/modalElemento";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import * as api from '../../../utils/api';
import { llenarCamposFormulario } from '../../../utils/llenarCamposFormulario';

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const inventario = JSON.parse(localStorage.getItem('inventario'));
    initComponentes(usuario);

    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').classList.add('dashboard--table-section');
    document.querySelector('.dashboard').removeAttribute('id');
    document.querySelector('.dashboard').id = "dashboard-elementos";


    limpiarModales();
    await initModales(['modalElemento']);

    const { modalElemento } = modales;
    await initModalElemento(modalElemento);

    if (usuario.rol_id == 1) {
        const crearBoton = document.getElementById('crearElemento');
        crearBoton.classList.remove('hidden');
        const verTiposBoton = document.getElementById('verTipos');
        verTiposBoton.classList.remove('hidden');

        document.getElementById('dashboard-elementos').addEventListener('click', (e) => {
            if (e.target.closest('#crearElemento')) {
                configurarModalElemento('crear', modalElemento);
                abrirModal(modalElemento);
            }
        })
    }
    
    const respuesta = await api.get('elementos/inventario/' + inventario.id)    
    if (respuesta.success) {
        const elementos = [];

        await Promise.all(respuesta.data.map(async elemento => {
            const tipo = await api.get('tipos-elementos/' + elemento.tipo_elemento_id);
            const ambiente = await api.get('ambientes/' + elemento.ambiente_id);
            const estado = await api.get('estados/' + elemento.estado_id);

            elementos.push([
                elemento.id,
                elemento.placa,
                elemento.serial,
                tipo.data.nombre,
                tipo.data.modelo,
                elemento.fecha_adquisicion,
                ambiente.data.nombre,
                estado.data.nombre,
                elemento.estado_activo // ⚠️ Guarda este booleano para luego marcar rojo si es false
            ]);
        }));
        renderFilas(elementos, elementoClick);
    }

}

const elementoClick = async (id) => {
    const { data } = await api.get('elementos/' + id)

    localStorage.setItem('elemento_temp', JSON.stringify(data));
    const form = modales.modalElemento.querySelector('form');

    llenarCamposFormulario(data, form);
    configurarModalElemento('editar', modales.modalElemento);
    abrirModal(modales.modalElemento);
}