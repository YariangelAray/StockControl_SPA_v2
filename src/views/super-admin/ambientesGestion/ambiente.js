import { configurarModalAmbiente } from "../../../modals/js/modalAmbiente";
import { abrirModal, modales } from "../../../modals/modalsController";
import { get } from "../../../utils/api";
import { llenarCamposFormulario } from "../../../helpers/llenarCamposFormulario";

export const formatearAmbiente = async (ambiente) => {
    const centro = await get('centros/' + ambiente.centro_id);    

    return[
        ambiente.id,
        ambiente.id,
        ambiente.nombre,
        centro.data.nombre,        
        ambiente.mapa ? "Disponible": "No disponible"
    ];
}

export const ambienteClick = async (id) => {  
  const { data } = await get('ambientes/' + id)
  localStorage.setItem('ambiente_temp', JSON.stringify(data));

  const form = modales.modalAmbiente.querySelector('form');

  llenarCamposFormulario(data, form);
  modales.modalAmbiente.dataset.id = data.id;
  configurarModalAmbiente('editar', modales.modalAmbiente);  
  
  abrirModal(modales.modalAmbiente);
}

export const cargarAmbientes = async () => {
    const respuesta = await get('ambientes')
    const ambientes = [];

    if (respuesta.success) {        
        for (const ambiente of respuesta.data) {     
            ambientes.push(await formatearAmbiente(ambiente))  
        };        
    }

    return ambientes;
}

export const actualizarStorageAmbientes = async () => {
    const nuevosAmbientes = await cargarAmbientes();
    localStorage.setItem('ambientes', JSON.stringify({ambientes: nuevosAmbientes}));
}