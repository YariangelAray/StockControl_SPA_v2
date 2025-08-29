import { configurarModalReporte } from "../../../modals/js/modalReporte";
import { abrirModal, modales } from "../../../modals/modalsController";
import { get } from "../../../utils/api";

export const formatearReporte = (reporte) => {
    return[
        reporte.id,
        reporte.fecha,
        reporte.usuario,
        reporte.elemento.placa,
        reporte.asunto
    ];
}

export const reporteClick = async (id) => {
  location.hash = '#/inventarios/reportes/detalles/id=' + id;
    // const { data } = await get('reportes/me/' + id)

    // localStorage.setItem('reporte_temp', JSON.stringify(data));
    // configurarModalReporte({
    //     id: data.id,
    //     fecha: data.fecha,
    //     placa: data.elemento.placa,
    //     usuario: data.usuario,
    //     asunto: data.asunto, 
    //     mensaje: data.mensaje,
    //     fotos: data.fotos
    // }, modales.modalReporte, data.elemento.id);
    // abrirModal(modales.modalReporte);
}

export const cargarReportes = async () => {
    const inventario = JSON.parse(localStorage.getItem('inventario'));    
    const respuesta = await get('reportes/inventario/me/'+inventario.id)
    const reportes = [];

    if (respuesta.success) {        
        for (const reporte of respuesta.data) {     
            reportes.push(formatearReporte(reporte))  
        };        
    }    
    return reportes;
}

export const actualizarStorageReportes = async () => {
    const nuevosReportes = await cargarReportes();
    localStorage.setItem('reportes', JSON.stringify({reportes: nuevosReportes}));
}

export default (modal, parametros) => async {
  const { data } = await get('reportes/me/' + id)
}