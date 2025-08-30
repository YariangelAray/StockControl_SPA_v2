import { configurarModalAmbiente } from "../../../modals/js/modalAmbiente";
import { abrirModal, modales } from "../../../modals/modalsController";
import { get } from "../../../utils/api";
import { llenarCamposFormulario } from "../../../helpers/llenarCamposFormulario";

import crear from './crud/crear';
import detalles from './crud/detalles';
import editar from './crud/editar';

export default { crear, detalles, editar };

export const formatearAmbiente = (ambiente) => {    
    return [
        ambiente.id,
        ambiente.id,
        ambiente.nombre,
        ambiente.centro,
        ambiente.mapa ? "Disponible" : "No disponible"
    ];
}

export const ambienteClick = async (id) => {
    // const { data } = await get('ambientes/' + id)
    // localStorage.setItem('ambiente_temp', JSON.stringify(data));
    location.hash = '#/super-admin/ambientes/detalles/id='+id;



    // const form = modales.modalAmbiente.querySelector('form');

    // llenarCamposFormulario(data, form);
    // modales.modalAmbiente.dataset.id = data.id;
    // configurarModalAmbiente('editar', modales.modalAmbiente);
    // const btn = modales.modalAmbiente.querySelector('.ver-mapa');
    // if (!data.mapa) btn.classList.add('hidden');
    // abrirModal(modales.modalAmbiente);
}

export const cargarAmbientes = async () => {
    const respuesta = await get('ambientes')
    const ambientes = [];
    console.log(respuesta)
    if (respuesta.success) {
        for (const ambiente of respuesta.data) {
            ambientes.push(formatearAmbiente(ambiente))
        };
    }

    return ambientes;
}

export const actualizarStorageAmbientes = async () => {
    const nuevosAmbientes = await cargarAmbientes();
    localStorage.setItem('ambientes', JSON.stringify({ ambientes: nuevosAmbientes }));
}