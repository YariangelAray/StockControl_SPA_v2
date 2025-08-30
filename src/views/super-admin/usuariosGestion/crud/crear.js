import { agregarFila } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { cerrarModal, mostrarConfirmacion, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { get, post } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import obtenerHashBase from "../../../../utils/obtenerHashBase";

import * as validaciones from '../../../../utils/Validaciones';
import { formatearUsuario, usuarioClick } from "../usuario";

export default async (modal) => {

    document.title = "Usuarios - Crear"
    modal.dataset.modo = 'crear';

    if (!modal.dataset.inicializado) {
        await llenarSelect({
            endpoint: 'tipos-documentos',
            selector: '#tipos-documentos',
            optionMapper: tipo => ({ id: tipo.id, text: tipo.nombre })
        });

        await llenarSelect({
            endpoint: 'generos',
            selector: '#generos',
            optionMapper: genero => ({ id: genero.id, text: genero.nombre })
        });

        await llenarSelect({
            endpoint: 'programas-formacion',
            selector: '#programas-formacion',
            optionMapper: programa => ({ id: programa.id, text: programa.nombre })
        });

        await llenarSelect({
            endpoint: 'roles',
            selector: '#roles',
            optionMapper: rol => ({ id: rol.id, text: "Usuario " + rol.nombre })
        });

        const programas = await get('programas-formacion');
        const selectProgramas = document.querySelector('#programas-formacion');
        const selectFichas = document.querySelector('#fichas');

        selectProgramas.addEventListener('change', (e) => {
            const id = e.target.value;

            if (e.target.selectedIndex == 0) selectFichas.setAttribute('disabled', 'disabled');
            else {
                selectFichas.removeAttribute('disabled')
                const programa = programas.data.find(p => p.id == id);
                agregarFichas(selectFichas, programa)
            }
        })
        modal.dataset.inicializado = "true";
    }

    // botones que deben estar visibles en este flujo
    const botonesVisibles = ['.crear', '.cancelar'];
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


    modal.querySelector('.modal__title').textContent = 'Crear Usuario';

    // inicializar validaciones
    const form = modal.querySelector('form');

    [...form].forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);

        if (campo.name == "documento" || campo.name == "telefono") {
            campo.addEventListener("keydown", validaciones.validarNumero);
            campo.addEventListener("input", validaciones.validarCampo);
            const limite = campo.name == "documento" ? 10 : 15;
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, limite));
        } else {

            if (campo.name == "nombres" || campo.name == "apellidos") {
                campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));
                campo.addEventListener("keydown", validaciones.validarTexto);
            }

            if (campo.name == "correo") {
                campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));
                campo.addEventListener("keydown", () => validaciones.validarCorreo(campo));
            }
        }
    });

    form.onsubmit = async (e) => {
        e.preventDefault();

        if (!validaciones.validarFormulario(e)) return;


        const confirmado = await mostrarConfirmacion();
        if (!confirmado) return;

        const rolSeleccionado = validaciones.datos.rol_id;
        delete validaciones.datos.programas
        delete validaciones.datos.rol_id

        const respuesta = await post('usuarios', validaciones.datos);
        if (!respuesta.success) {            
            errorToast(respuesta);            
            return;
        }

        const respuestaRol = await post('roles-usuarios', { usuario_id: respuesta.data.id, rol_id: rolSeleccionado });
        if (!respuestaRol.success) {
            // ocultarModal(modal);
            errorToast(respuestaRol);
            // setTimeout(() => mostrarModal(modal), 100);
            return;
        }

        cerrarModal(modal);

        setTimeout(async () => successToast('Usuario creado con éxito'), 100);
        location.hash = obtenerHashBase();

        const { data } = await get('usuarios/' + respuesta.data.id);
        const datosFormateados = formatearUsuario(data);

        // actualizar cache y tabla
        let usuarios = JSON.parse(localStorage.getItem('usuarios'))?.usuarios || [];
        usuarios.unshift(datosFormateados);
        localStorage.setItem('usuarios', JSON.stringify({ usuarios }));

        const tbody = document.querySelector('#dashboard-usuarios .table__body');
        agregarFila(tbody, datosFormateados, usuarioClick);
    };
};

const agregarFichas = (selectFichas, programa) => {
    while (selectFichas.options.length > 1) selectFichas.remove(1);
    programa.fichas.forEach((ficha) => {
        const option = document.createElement('option');
        option.value = ficha.id
        option.textContent = ficha.ficha
        selectFichas.appendChild(option);
    })
}