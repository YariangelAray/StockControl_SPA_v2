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
        const respuesta =  await api.post('accesos-temporales/acceder/' + codigo, {
            usuario_id: usuario.id,            
        });   

        if (!respuesta.success) {
            cerrarModal();
            setTimeout(async () => {
                error(respuesta);
            }, 100)
            form.reset();
            return;
        }

        localStorage.setItem('inventario', JSON.stringify({ id: respuesta.data.inventario_id, nombre: respuesta.data.nombre_inventario }));
        
        localStorage.setItem('codigoAccesoInfo', JSON.stringify({
            codigo: respuesta.data.codigo,
            expiracion: respuesta.data.fecha_expiracion
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
