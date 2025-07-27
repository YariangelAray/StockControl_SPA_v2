
import { initComponentes } from "../../../helpers/initComponentes";
import { renderFilas } from "../../../helpers/renderFilas";
import { configurarModalReporte, initModalReporte } from "../../../modals/modalReporte";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import * as api from '../../../utils/api';

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const inventario = JSON.parse(localStorage.getItem('inventario'));
    initComponentes(usuario);

    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').classList.add('dashboard--table-section');

    document.querySelector('.dashboard').removeAttribute('id');
    document.querySelector('.dashboard').id = "dashboard-reportes";

    limpiarModales();
    await initModales(['modalReporte']);
    const { modalReporte } = modales;
    await initModalReporte(modalReporte)

    const respuesta = await api.get('reportes/inventario/' + inventario.id)

    if (respuesta.success) {
        const reportes = [];

        await Promise.all(respuesta.data.map(async reporte => {
            const usuario = await api.get('usuarios/' + reporte.usuario_id);
            const elemento = await api.get('elementos/' + reporte.elemento_id);

            reportes.push([
                reporte.id,
                reporte.fecha,
                usuario.data.nombres.split(" ")[0] + " " + usuario.data.apellidos.split(" ")[0],
                elemento.data.placa,
                reporte.asunto
            ]);
        }));
        renderFilas(reportes, reporteClick);
    }
}

const reporteClick = async (id) => {
    const { data } = await api.get('reportes/' + id)
    const usuario = await api.get('usuarios/' + data.usuario_id);
    const elemento = await api.get('elementos/' + data.elemento_id);

    localStorage.setItem('reporte_temp', JSON.stringify(data));
    configurarModalReporte({
        id: data.id,
        fecha: data.fecha,
        placa: elemento.data.placa,
        usuario: usuario.data.nombres.split(" ")[0] + " " + usuario.data.apellidos.split(" ")[0], 
        asunto: data.asunto, 
        mensaje: data.mensaje
    }, modales.modalReporte, elemento.data.id);
    abrirModal(modales.modalReporte);
}