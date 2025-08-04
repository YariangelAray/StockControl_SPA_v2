import { cerrarModal } from "../modalsController";
import * as validaciones from "../../utils/Validaciones";
import * as api from "../../utils/api";
import { error } from "../../utils/alertas";

export const initModalPedirCodigo = (modal) => {

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

        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const consultarAcceso = await api.get('codigos-acceso/validar/' + codigo);

        if (!consultarAcceso.success) {
            cerrarModal();
            setTimeout(async () => {
                error(consultarAcceso);
            }, 100)
            return;
        }

        console.log(consultarAcceso);
        
        const registroAcceso = await api.post('accesos-temporales/acceder', {
            usuario_id: usuario.id,
            inventario_id: consultarAcceso.data.inventario_id
        });
        console.log(registroAcceso); // no imprime esto porque el error está en el post

        if (!registroAcceso.success) {
            cerrarModal();
            setTimeout(async () => {
                error(registroAcceso);
            }, 100)
            return;
        }

        localStorage.setItem('inventario', JSON.stringify({ id: consultarAcceso.data.inventario_id, nombre: consultarAcceso.data.inventario_nombre }));
        
        localStorage.setItem('codigoAccesoInfo', JSON.stringify({
            codigo: consultarAcceso.data.codigo,
            expiracion: consultarAcceso.data.fecha_expiracion
        }));

        cerrarModal();
        form.reset();
        window.location.hash = '#/inventarios/ambientes';        
    });


    modal.addEventListener('click', (e) => {
        if (e.target.closest('.cancelar')) {
            form.reset();
            form.querySelectorAll('.form__control').forEach(input => {
                input.classList.remove('error');
            });
            cerrarModal();
        }
    });
};
