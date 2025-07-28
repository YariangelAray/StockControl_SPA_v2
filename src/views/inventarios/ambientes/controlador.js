import Swal from "sweetalert2";
import { cargarCards } from "../../../helpers/cargarCards";
import { initComponentes } from "../../../helpers/initComponentes";
import { limpiarModales } from "../../../modals/modalsController";
import * as api from "../../../utils/api";
import { info } from "../../../utils/alertas";
import { eliminarAccesos, initTemporizadorAcceso } from "../detalles/initTemporizadorAcceso";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const inventario = JSON.parse(localStorage.getItem('inventario'));
    initComponentes(usuario);

    limpiarModales();
    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').removeAttribute('id');
    document.querySelector('.dashboard').id = "dashboard-ambientes";

    await cargarAmbientes(inventario)

    if (usuario.rol_id === 2) {
        const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
        const limpiar = () => {
            document.querySelector('.sidebar .access-info')?.classList.add('hidden');
            localStorage.removeItem('codigoAccesoInfo');
        }

        if (codigoInfo) {
            const expiracion = new Date(codigoInfo.expiracion);
            const ahora = new Date();

            if (expiracion > ahora) {
                document.querySelector('.sidebar .access-info')?.classList.remove('hidden');
                await initTemporizadorAcceso(expiracion, inventario.id, limpiar);
            } else {
                await eliminarAccesos(inventario.id, limpiar);
                window.location.hash = '#/inventarios';
            }
        } else {
            window.location.hash = '#/inventarios';
        }
    }
};

const cargarAmbientes = async (inventario) => {
    const respuesta = await api.get(`inventarios/${inventario.id}/ambientes`);
    const contenedor = document.querySelector('.content-cards');
    if (respuesta.success) {
        cargarCards(contenedor, respuesta.data, {
            tipo: 'ambiente',
            filas: [
                { valor: 'cantidad_elementos', clave: 'Cantidad de elementos:' }
            ],
            onClick: (ambiente) => { info("Mapa del ambiente", "Este ambiente aún no tiene un mapa disponible") }
        });
    }
};
