// mapaController.js
import Konva from "konva";

// Simulamos una respuesta del backend
const ambiente = {
    nombre: "Salón 101",
    mapa_json: {
        mesas: [
            { id: 1, nombre: "Mesa A1", x: 100, y: 100, width: 80, height: 50 },
            { id: 2, nombre: "Mesa A2", x: 220, y: 100, width: 80, height: 50 },
            { id: 3, nombre: "Mesa B1", x: 100, y: 200, width: 80, height: 50 },
            { id: 4, nombre: "Mesa B2", x: 220, y: 200, width: 80, height: 50 },
        ],
    },
};

export function initMapaView() {
    const contenedor = document.getElementById("mapa-container");
    const tooltip = document.getElementById("tooltip");

    // Crear el escenario (canvas principal)
    const stage = new Konva.Stage({
        container: contenedor,
        width: contenedor.offsetWidth,
        height: contenedor.offsetHeight,
    });

    const layer = new Konva.Layer();

    ambiente.mapa_json.mesas.forEach((mesa) => {
        const rect = new Konva.Rect({
            x: mesa.x,
            y: mesa.y,
            width: mesa.width,
            height: mesa.height,
            fill: "#99CCFF",
            stroke: "#333",
            strokeWidth: 1,
            cornerRadius: 4,
        });

        const label = new Konva.Text({
            x: mesa.x,
            y: mesa.y + mesa.height / 2 - 8,
            text: mesa.nombre,
            fontSize: 12,
            fontFamily: "Arial",
            fill: "#000",
            width: mesa.width,
            align: "center",
        });

        // Tooltip
        rect.on("mouseenter", () => {
            document.body.style.cursor = "pointer";
            tooltip.style.display = "block";
            tooltip.innerText = mesa.nombre;
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
