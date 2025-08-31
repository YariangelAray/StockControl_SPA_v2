// mapaController.js
import Konva from "konva";
import { pcEstilo, mesaEstilo } from "./estilosMapa";
import { get } from "../../../utils/api";
// import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
// import { configurarModalElemento, initModalElemento } from "../../../modals/js/modalElemento";
// import { initComponentes } from "../../../helpers/initComponentes";
import { llenarCamposFormulario } from "../../../helpers/llenarCamposFormulario";
// import {error} from '../../../utils/alertas';

// // Simulamos una respuesta del backend
// const ambiente = [
//     { "id": 1, "tipo": "Mesa", "placa": 92248961, "x": 100, "y": 100, "width": 180, "height": 80 },
//     { "id": 2, "tipo": "Mesa", "placa": 92248960, "x": 300, "y": 100, "width": 180, "height": 80 },
//     { "id": 3, "tipo": "Mesa", "placa": 92248959, "x": 470, "y": 100, "width": 180, "height": 80 },
//     { "id": 4, "tipo": "PC", "placa": 92241017084, "x": 100, "y": 180, "width": 70, "height": 70 },
//     { "id": 5, "tipo": "PC", "placa": 92241017083, "x": 300, "y": 180, "width": 70, "height": 70 },
//     { "id": 6, "tipo": "PC", "placa": 92241017082, "x": 470, "y": 180, "width": 70, "height": 70 }
//   ];

export default async (parametros) => {

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // initComponentes(usuario);

    const ambiente = parametros;

    // limpiarModales();

    const hash = location.hash.slice(2);
    const segmentos = hash.split('/').filter(seg=>seg);
    segmentos.splice(segmentos.length - 2, 2);
    const hashAnterior = segmentos.join("/");
    
    document.querySelector('.dashboard__title').textContent = ambiente.nombre;
    document.querySelector('#btn-volver').href = `#/${hashAnterior}`;

    // await initModales(['modalElemento']);
    // const { modalElemento } = modales;
    // await initModalElemento(modalElemento);

    const respuesta = await get("ambientes/"+ambiente.ambiente_id);
    if(!respuesta.success){
        await error(respuesta);
        location.hash = "#/" + hashAnterior;
    }
    const mapa = JSON.parse(respuesta.data.mapa);

    const contenedor = document.getElementById("mapa-container");
    const tooltip = document.getElementById("tooltip");

    // Crear el escenario (canvas principal)
    const stage = new Konva.Stage({
        container: contenedor,
        width: contenedor.offsetWidth,
        height: contenedor.offsetHeight,
    });

    const layer = new Konva.Layer();


    mapa.forEach((elemento) => {
        // aqui ponerle la clase o algo así
        const rect = new Konva.Rect({
            x: elemento.x,
            y: elemento.y,
            width: elemento.width,
            height: elemento.height,
            ... (elemento.tipo === "Mesa" ? mesaEstilo : pcEstilo)
        });

        const label = new Konva.Text({
            x: elemento.x,
            y: elemento.y + 5,
            text: elemento.tipo,
            fontSize: 12,
            fontFamily: "Work Sans",
            fill: "#555",
            width: elemento.width,
            align: "center",
        });

        // Tooltip
        rect.on("mouseenter", () => {
            document.body.style.cursor = "pointer";
            tooltip.style.display = "flex";
            tooltip.innerText = `Placa: ${elemento.placa}`;
        });

        rect.on("click", () => {
            elementoClick(elemento.placa);
        });

        rect.on("mouseleave", () => {
            document.body.style.cursor = "default";
            tooltip.style.display = "none";
        });

        rect.on("mousemove", (e) => {
            const posicionMouse = stage.getPointerPosition();
            const contenedorRect = contenedor.getBoundingClientRect();

            tooltip.style.left = `${posicionMouse.x + 50}px`;
            tooltip.style.top = `${posicionMouse.y + 40}px`;
        });


        layer.add(rect);
        layer.add(label);
    });

    stage.add(layer);
}

const elementoClick = async (placa) => {
    // const usuario = JSON.parse(localStorage.getItem('usuario'));
    // const { data } = await get('elementos/placa/' + placa)

    // localStorage.setItem('elemento_temp', JSON.stringify(data));

    // const form = modales.modalElemento.querySelector('form');
    // llenarCamposFormulario(data, form);

    // modales.modalElemento.dataset.id = data.id;
    // configurarModalElemento('editar', modales.modalElemento);

    // const btn = data.estado_activo ? modales.modalElemento.querySelector('.dar-baja') : modales.modalElemento.querySelector('.reactivar');
    // if (usuario.rol_id == 2) btn.classList.remove('hidden');
    // abrirModal(modales.modalElemento);
}