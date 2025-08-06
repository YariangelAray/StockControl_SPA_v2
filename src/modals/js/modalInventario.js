import { cerrarModal, modales, mostrarConfirmacion, mostrarUltimoModal, ocultarModalTemporal } from "../modalsController";
import { setLecturaForm } from "../../helpers/setLecturaForm";
import { llenarSelect } from "../../helpers/select";
import { agregarFila, reemplazarFila, removerFilar } from "../../helpers/renderFilas";
import * as validaciones from "../../utils/Validaciones";
import { llenarCamposFormulario } from "../../helpers/llenarCamposFormulario";
import { error, success } from '../../utils/alertas'
import * as api from "../../utils/api";
import { inventarioClick, actualizarStorageInventarios, formatearInventario } from "../../views/super-admin/inventariosGestion/inventario";

export const configurarModalInventario = async (modo, modal) => {

    const form = modal.querySelector('form');

    const botones = {
        editar: modal.querySelector('.editar'),
        crear: modal.querySelector('.crear'),
        eliminar: modal.querySelector('.eliminar'),
        guardar: modal.querySelector('.guardar'),
        aceptar: modal.querySelector('.aceptar'),
        cancelar: modal.querySelector('.cancelar')
    };

    // Oculta todo
    Object.values(botones).forEach(btn => btn.classList.add('hidden'));

    if (modo === 'crear') {
        form.reset();
        setLecturaForm(form, false); // todos habilitados
        botones.crear.classList.remove('hidden');
        botones.cancelar.classList.remove('hidden');
        modal.querySelector('.modal__title').textContent = 'Crear Inventario';
    }

    if (modo === 'editar') {
        setLecturaForm(form, true); // lectura
        botones.editar.classList.remove('hidden');
        botones.aceptar.classList.remove('hidden');
        botones.eliminar.classList.remove('hidden');
        modal.querySelector('.modal__title').textContent = 'Detalles del Inventario';
    }

    if (modo === 'editar_activo') {
        setLecturaForm(form, false); // habilitar campos
        botones.guardar.classList.remove('hidden');
        botones.cancelar.classList.remove('hidden'); // cancelar edición
        modal.querySelector('.modal__title').textContent = 'Editar Inventario';
    }
};


export const initModalInventario = async (modal) => {

    await llenarSelect({
        endpoint: 'usuarios/administrativos',
        selector: '#usuarios',
        optionMapper: usuario => ({ id: usuario.id, text: usuario.nombres.split(" ")[0] + " " + usuario.apellidos.split(" ")[0] })
    });

    const form = modal.querySelector('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const boton = e.submitter; // Este es el botón que disparó el submit
        const claseBoton = boton.classList;

        if (!validaciones.validarFormulario(e)) return;
        const confirmado = await mostrarConfirmacion();
        if (!confirmado) return;

        if (claseBoton.contains('crear')) {
            // Acción para crear
            await crearInventario(validaciones.datos);
        } else if (claseBoton.contains('guardar')) {
            // Acción para editar
            await actualizarInventario(validaciones.datos);
            configurarModalInventario('editar', modal);
        }
    });

    const campos = [...form];
    campos.forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);
        if (campo.name == "nombre") {
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));
            campo.addEventListener("keydown", validaciones.validarTexto);
        }
    });

    modal.addEventListener('click', async (e) => {
        const usuario = JSON.parse(localStorage.getItem('usuario'));

        if (e.target.closest('.eliminar')) {
            const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el inventario?");
            if (!confirmado) return;
            const { id } = JSON.parse(localStorage.getItem('inventario_temp'));
            const respuesta = await api.del('inventarios/' + id);

            if (respuesta.success) {
                cerrarModal();
                await success('Inventario eliminado con éxito');
                removerFilar(document.querySelector('#dashboard-inventarios .table__body'), id);
            }
            else {
                ocultarModalTemporal(modal);
                await error(respuesta);
                setTimeout(async () => mostrarUltimoModal(), 100);
            }
            await actualizarStorageInventarios();
            return;
        }

        if (e.target.closest('.editar')) {
            configurarModalInventario('editar_activo', modal);
            return;
        }

        if (e.target.closest('.cancelar')) {
            const estaEditando = modal.querySelector('.modal__title').textContent.includes('Editar');

            if (estaEditando) {
                const temp = JSON.parse(localStorage.getItem('inventario_temp'));
                llenarCamposFormulario(temp, form);
                configurarModalInventario('editar', modal);

            } else cerrarModal();

            form.querySelectorAll('.form__control').forEach(input => {
                input.classList.remove('error');
            });
        }

        if (e.target.closest('.aceptar')) {
            cerrarModal();
            form.reset();
            localStorage.removeItem('inventario_temp');
        }
    });
};


const crearInventario = async (datos) => {    
    const respuesta = await api.post('inventarios', datos)

    if (!respuesta.success) {
        ocultarModalTemporal(modales.modalInventario);
        await error(respuesta);
        setTimeout(async () => mostrarUltimoModal(), 100);
        return;
    }
    cerrarModal();

    setTimeout(async () => {
        await success('Inventario creado con éxito');
    }, 100);

    const datosFormateados = await formatearInventario(respuesta.data);

    let inventarios = JSON.parse(localStorage.getItem('inventarios'))?.inventarios || [];
    inventarios.unshift(datosFormateados);
    localStorage.setItem('inventarios', JSON.stringify({ inventarios }));

    const tbody = document.querySelector('#dashboard-inventarios .table__body');
    agregarFila(tbody, datosFormateados, inventarioClick);
}

const actualizarInventario = async (datos) => {
    const inventarioTemp = JSON.parse(localStorage.getItem('inventario_temp'));    
    const respuesta = await api.put('inventarios/' + inventarioTemp.id, datos);
    

    if (!respuesta.success) {
        ocultarModalTemporal(modales.modalInventario);
        await error(respuesta);
        setTimeout(async () => mostrarUltimoModal(), 100);
        return;
    }
    configurarModalInventario('editar', modales.modalInventario);

    localStorage.setItem('inventario_temp', JSON.stringify(respuesta.data));    

    const datosFormateados = await formatearInventario(respuesta.data);

    const tbody = document.querySelector('#dashboard-inventarios .table__body');
    reemplazarFila(tbody, datosFormateados, inventarioClick);
    await actualizarStorageInventarios();
};