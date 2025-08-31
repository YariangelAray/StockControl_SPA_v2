import { cerrarModal } from "../../../modals/modalsController";
import { get } from "../../../utils/api";
import getCookie from "../../../utils/getCookie";
import hasPermisos from "../../../utils/hasPermisos";

export const formatearReporte = (reporte) => {
    return [
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
    const respuesta = await get('reportes/inventario/me/' + inventario.id)
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
    localStorage.setItem('reportes', JSON.stringify({ reportes: nuevosReportes }));
}

export default async (modal, parametros) => {

    document.title = "Reportes - Detalles: " + parametros.id;
    const { data } = await get('reportes/me/' + parametros.id)

    // botones que deben estar visibles en este flujo
    const botonesVisibles = ['.ver-elemento', '.aceptar'];
    // ocultar todos los botones primero
    modal.querySelectorAll('.modal__actions .button').forEach(btn => {
        btn.style.display = 'none';
    });

    // mostrar solo los de esta vista
    botonesVisibles.forEach(selector => {
        const btn = modal.querySelector(selector);
        if (btn) btn.style.display = '';
    });


    // aplicar permisos sobre los visibles
    const permisos = getCookie('permisos', []);
    ('permisos');
    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        if (!hasPermisos(btn.dataset.permiso, permisos)) {
            btn.remove();
        }
    });

    modal.querySelector("#fecha").textContent = data.fecha;
    modal.querySelector("#usuario").textContent = data.usuario;
    modal.querySelector("#asunto").textContent = data.asunto;
    modal.querySelector("#placa").textContent = data.elemento.placa;
    modal.querySelector("#placa").dataset.id = data.elemento.id;
    modal.querySelector("#mensaje").textContent = data.mensaje;

    // 2. Mostrar imágenes
    const contenedor = modal.querySelector('.reporte__imagenes');
    contenedor.innerHTML = ""; // Limpiar contenedor        

    if (data.fotos && data.fotos.length > 0) {
        data.fotos.forEach(({ url }) => {
            const img = document.createElement('img');            
            img.src = 'http://localhost:3000/stockcontrol_api/' + url;
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

    const visor = modal.querySelector('#visor-imagen');
    const visorImg = visor.querySelector('img');

    modal.addEventListener('click', async (e) => {
        if (e.target.closest('.ver-elemento')) {
            e.stopPropagation();
            await cerrarModal(modal);
            location.hash = "#/inventarios/elementos/detalles/id=" + data.elemento.id;
            // const id_elemento = modal.querySelector("#placa").dataset.id;

            // const { data } = await api.get('elementos/' + id_elemento)

            // localStorage.setItem('elemento_temp', JSON.stringify(data));
            // const form = modales.modalElemento.querySelector('form');

            // llenarCamposFormulario(data, form);
            // configurarModalElemento('editar', modalElemento);
            // const btn = data.estado_activo ? modales.modalElemento.querySelector('.dar-baja') : modales.modalElemento.querySelector('.reactivar');
            // if (usuario.rol_id == 2) btn.classList.remove('hidden');
            // ocultarModalTemporal(modal);
            // abrirModal(modalElemento);
        }

        // if (e.target.closest('.aceptar')) {
        //     cerrarModal();
        //     localStorage.removeItem('reporte_temp');
        // }
        if (e.target.closest('.reporte__imagenes img')) {
            visorImg.src = e.target.src;
            visor.showModal();
        }
        // Cerrar con clic fuera
    })

    visor.addEventListener('click', (e) => {
        if (e.target === visor) {
            visor.close();
            visorImg.src = '';
        }
    });
    // Escape
    visor.addEventListener('keydown', (e) => {
        e.preventDefault();
        if (e.key === 'Escape' && visor.open) {
            visor.close();
            visorImg.src = '';
        }
    });
}