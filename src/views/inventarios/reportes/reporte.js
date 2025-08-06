import { configurarModalReporte } from "../../../modals/js/modalReporte";
import { abrirModal, modales } from "../../../modals/modalsController";
import { get } from "../../../utils/api";

export const formatearReporte = async (reporte) => {
    const usuario = await get('usuarios/' + reporte.usuario_id);
    const elemento = await get('elementos/' + reporte.elemento_id);

    return[
        reporte.id,
        reporte.fecha,
        usuario.data.nombres.split(" ")[0] + " " + usuario.data.apellidos.split(" ")[0],
        elemento.data.placa,
        reporte.asunto
    ];
}

export const reporteClick = async (id) => {
    const { data } = await get('reportes/' + id)
    const usuario = await get('usuarios/' + data.usuario_id);
    const elemento = await get('elementos/' + data.elemento_id);

    localStorage.setItem('reporte_temp', JSON.stringify(data));
    configurarModalReporte({
        id: data.id,
        fecha: data.fecha,
        placa: elemento.data.placa,
        usuario: usuario.data.nombres.split(" ")[0] + " " + usuario.data.apellidos.split(" ")[0], 
        asunto: data.asunto, 
        mensaje: data.mensaje,
        fotos: data.fotos
    }, modales.modalReporte, elemento.data.id);
    abrirModal(modales.modalReporte);
}

export const cargarReportes = async (inventario) => {
    const respuesta = await get('reportes/inventario/' + inventario.id)
    const reportes = [];

    if (respuesta.success) {        
        for (const reporte of respuesta.data) {     
            reportes.push(await formatearReporte(reporte))  
        };        
    }

    return reportes;
}

export const actualizarStorageReportes = async (inventario) => {
    const nuevosReportes = await cargarReportes(inventario);
    localStorage.setItem('reportes', JSON.stringify({reportes: nuevosReportes}));
}