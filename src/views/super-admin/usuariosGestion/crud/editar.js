import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { reemplazarFila } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { mostrarConfirmacion } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { get, put } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import * as validaciones from '../../../../utils/Validaciones';
import { actualizarStorageUsuarios, formatearUsuario, usuarioClick } from "../usuario";

export default async (modal, parametros) => {
    document.title = "Usuarios - Editar: " + parametros.id;
    modal.dataset.modo = 'editar';
    const programas = await get('programas-formacion');
    const selectProgramas = document.querySelector('#programas-formacion');
    const selectFichas = document.querySelector('#fichas');

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

    modal.querySelector('.modal__title').textContent = 'Editar Usuarios';

    const { data } = await get('usuarios/' + parametros.id);

    const programaUsuario = programas.data.find(programa =>
        programa.fichas.some(ficha => ficha.id == data.ficha_id)
    );
    selectProgramas.value = programaUsuario.id;

    if (programaUsuario) {
        agregarFichas(selectFichas, programaUsuario)
        selectFichas.value = data.ficha_id;
    }


    const form = modal.querySelector('form');
    llenarCamposFormulario(data, form);

    const relaciones = await get('roles-usuarios/usuario/' + parametros.id);
    if (relaciones.success && relaciones.data.length > 0) {
        // asumo que solo manejas un rol activo por usuario
        const rolUsuario = relaciones.data[0];
        form.querySelector('[name="rol_id"]').value = rolUsuario.rol_id;
        // guarda el id de la relación en dataset para luego actualizar
        form.dataset.relacionRolId = rolUsuario.id;
    }

    setLecturaForm(form, false); // lectura

    const botonesVisibles = ['.guardar', '.cancelar'];

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

    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        const requeridos = btn.dataset.permiso.split(',').map(p => p.trim());
        const tienePermiso = requeridos.some(p => permisos.includes(p));

        if (!tienePermiso) {
            btn.remove();
        }
    });



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

        const nuevoRolId = validaciones.datos.rol_id;
        delete validaciones.datos.rol_id;
        delete validaciones.datos.programas;

        // 1. actualizar usuario
        const respuestaUsuario = await put('usuarios/' + parametros.id, validaciones.datos);
        if (!respuestaUsuario.success) {
            errorToast(respuestaUsuario);
            return;
        }

        // 2. actualizar rol
        const relacionRolId = form.dataset.relacionRolId;
        if (relacionRolId) {
            const respuestaRol = await put('roles-usuarios/' + relacionRolId, {
                usuario_id: parametros.id,
                rol_id: nuevoRolId
            });
            if (!respuestaRol.success) {
                errorToast(respuestaRol);
                return;
            }
        } else {
            // si no existía relación, la creamos
            const respuestaRol = await post('roles-usuarios', {
                usuario_id: parametros.id,
                rol_id: nuevoRolId
            });
            if (!respuestaRol.success) {
                errorToast(respuestaRol);
                return;
            }
        }

        successToast('Usuario actualizado con éxito');

        // refrescar tabla y storage
        const { data } = await get('usuarios/' + parametros.id);
        const datosFormateados = formatearUsuario(data);
        const tbody = document.querySelector('#dashboard-usuarios .table__body');
        reemplazarFila(tbody, datosFormateados, usuarioClick);
        await actualizarStorageUsuarios();

        location.hash = "#/super-admin/usuarios/detalles/id=" + parametros.id;
    };


    const cancelarBtn = modal.querySelector('.cancelar');


    asignarEvento(cancelarBtn, 'click', async () => {
        form.querySelectorAll('.form__control').forEach(input => {
            input.classList.remove('error');
        });
        // await detalles(modal, parametros); // reutiliza la lógica
        location.hash = '#/super-admin/usuarios/detalles/id=' + parametros.id;
        // modal.dataset.modo = 'detalles'; // para que modalManager no lo cierre
    });


    // modal.addEventListener('click', async (e) => {
    //   if (e.target.closest('.cancelar')) {
    //     form.querySelectorAll('.form__control').forEach(input => {
    //       input.classList.remove('errorToast');
    //     });
    //     modal.dataset.modo = 'detalles'; // para que modalManager no lo cierre
    //     await detalles(modal, parametros); // reutiliza la lógica
    //     location.hash = '#/super-admin/ambientes/detalles/id=' + parametros.id;
    //   }
    // })
}

const agregarFichas = (selectFichas, programa) => {
    while (selectFichas.options.length > 1) selectFichas.remove(1);
    programa.fichas.forEach((ficha) => {
        const option = document.createElement('option');
        option.value = ficha.id
        option.textContent = ficha.ficha
        selectFichas.appendChild(option);
    })
}