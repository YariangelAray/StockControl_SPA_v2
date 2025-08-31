// import { cerrarModal } from "../modalsController";
import * as validaciones from "../../utils/Validaciones";
import { errorToast, successToast } from "../../utils/alertas";
import * as api from "../../utils/api";
import { cargarModal, cerrarModal, mostrarModal } from "../modalsController";
// import { error } from "../../utils/alertas";

export const abrirModalPedirCodigo = async () => {

    const modal = await cargarModal("modalPedirCodigoAcceso");
    mostrarModal(modal)

    const form = modal.querySelector('form');
    const input = modal.querySelector('.input');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const codigo = input.value.trim().toUpperCase();
        if (!codigo) {
            validaciones.agregarError(input.parentElement, "Ingrese un código.");
            return;
        }
        validaciones.quitarError(input.parentElement);
        const respuesta = await api.post('accesos/inventarios/acceder', {codigo});

        if (!respuesta.success) {

            errorToast(respuesta);
            form.reset();
            return;
        }

        successToast('Código confirmado. Accediendo al inventario...');

        localStorage.setItem('inventario', JSON.stringify({ id: respuesta.data.inventario_id, nombre: respuesta.data.nombre_inventario }));

        localStorage.setItem('codigoAccesoInfo', JSON.stringify({
            codigo: respuesta.data.codigo,
            expiracion: respuesta.data.fecha_expiracion
        }));

        await cerrarModal(modal);        
        window.location.hash = '#/inventarios/ambientes';
    });


    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            cerrarModal(modal);
        }
    });
};
