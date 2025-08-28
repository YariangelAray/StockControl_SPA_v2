import { cerrarModal, modales, mostrarConfirmacion, mostrarUltimoModal, ocultarModalTemporal } from "../modalsController";
import { setLecturaForm } from "../../helpers/setLecturaForm";
import { llenarSelect } from "../../helpers/select";
import { agregarFila, reemplazarFila } from "../../helpers/renderFilas";
import * as validaciones from "../../utils/Validaciones";
import { llenarCamposFormulario } from "../../helpers/llenarCamposFormulario";
import { error, success } from '../../utils/alertas'
import * as api from "../../utils/api";
import { usuarioClick, actualizarStorageUsuarios, formatearUsuario } from "../../views/super-admin/usuariosGestion/usuario";

export const configurarModalUsuario = async (modo, modal) => {

    const form = modal.querySelector('form');

    const botones = {
        editar: modal.querySelector('.editar'),
        crear: modal.querySelector('.crear'),
        reactivar: modal.querySelector('.reactivar'),
        desactivar: modal.querySelector('.desactivar'),
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
        modal.querySelector('.modal__title').textContent = 'Crear Usuario';
        modal.querySelector('#form__control-contrasena').classList.remove('hidden');
        modal.querySelector('#fichas').setAttribute('disabled', 'disabled');
    }

    if (modo === 'editar') {
        setLecturaForm(form, true); // lectura
        botones.editar.classList.remove('hidden');
        botones.aceptar.classList.remove('hidden');
        modal.querySelector('.modal__title').textContent = 'Detalles del Usuario';
        modal.querySelector('#form__control-contrasena').classList.add('hidden');
    }

    if (modo === 'editar_activo') {
        setLecturaForm(form, false); // habilitar campos
        botones.guardar.classList.remove('hidden');
        botones.cancelar.classList.remove('hidden'); // cancelar edición
        modal.querySelector('.modal__title').textContent = 'Editar Usuario';
    }


    const programas = await api.get('programas-formacion');
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

    const usuario = JSON.parse(localStorage.getItem('usuario_temp'));
    if (!usuario) return;
    const programaUsuario = programas.data.find(programa =>
        programa.fichas.some(ficha => ficha.id == usuario.ficha_id)
    );
    selectProgramas.value = programaUsuario.id;

    if (programaUsuario) {
        agregarFichas(selectFichas, programaUsuario)
        selectFichas.value = usuario.ficha_id;
    }
};


export const initModalUsuario = async (modal) => {

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
            await crearUsuario(validaciones.datos);
        } else if (claseBoton.contains('guardar')) {
            // Acción para editar
            await actualizarUsuario(validaciones.datos);
            configurarModalUsuario('editar', modal);
            const temp = JSON.parse(localStorage.getItem('usuario_temp'));
            const btn = temp.activo ? modal.querySelector('.desactivar') : modal.querySelector('.reactivar');
            btn.classList.remove('hidden');
        }
    });

    const campos = [...form];
    campos.forEach((campo) => {
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


    modal.addEventListener('click', async (e) => {
        const usuario = JSON.parse(localStorage.getItem('usuario'));

        if (e.target.closest('.reactivar')) {
            const confirmado = await mostrarConfirmacion("¿Está seguro de reactivar al usuario?");
            if (!confirmado) return;
            const { id } = JSON.parse(localStorage.getItem('usuario_temp'));
            const respuesta = await api.put('usuarios/' + id + '/estado/' + true + "/permiso/" + usuario.rol_id);

            if (respuesta.success) {
                const fila = document.querySelector(`#dashboard-usuarios .table__row[data-id="${id}"]`);
                if (fila) {
                    fila.classList.remove('table__row--red');
                    const ultimaCelda = fila.querySelector('td:last-child');
                    ultimaCelda.textContent = 'Activo';
                }
                cerrarModal();
                setTimeout(async () => {
                    await success('Usuario reactivado con éxito');
                }, 100);
            }
            else {
                ocultarModalTemporal(modal);
                await error(respuesta);
                setTimeout(async () => mostrarUltimoModal(), 100);
            }
            await actualizarStorageUsuarios();
            return;
        }

        if (e.target.closest('.desactivar')) {
            const confirmado = await mostrarConfirmacion("¿Está seguro de desactivar al usuario?");

            if (!confirmado) return;
            const { id } = JSON.parse(localStorage.getItem('usuario_temp'));

            const respuesta = await api.put('usuarios/' + id + '/estado/' + false + "/permiso/" + usuario.rol_id);
            if (respuesta.success) {
                const fila = document.querySelector(`#dashboard-usuarios .table__row[data-id="${id}"]`);
                if (fila) {
                    fila.classList.add('table__row--red')
                    const ultimaCelda = fila.querySelector('td:last-child');
                    ultimaCelda.textContent = 'Inactivo';
                }
                cerrarModal();
                setTimeout(async () => {
                    await success('Usuario desactivado con éxito');
                }, 100);
            }
            else {
                ocultarModalTemporal(modal);
                await error(respuesta);
                setTimeout(async () => mostrarUltimoModal(), 100);
            }
            await actualizarStorageUsuarios();
            return;
        }

        if (e.target.closest('.editar')) {
            configurarModalUsuario('editar_activo', modal);
            return;
        }

        if (e.target.closest('.cancelar')) {
            const estaEditando = modal.querySelector('.modal__title').textContent.includes('Editar');

            if (estaEditando) {
                const temp = JSON.parse(localStorage.getItem('usuario_temp'));
                llenarCamposFormulario(temp, form);
                configurarModalUsuario('editar', modal);
                const btn = temp.activo ? modal.querySelector('.desactivar') : modal.querySelector('.reactivar');
                btn.classList.remove('hidden');

            } else cerrarModal();

            form.querySelectorAll('.form__control').forEach(input => {
                input.classList.remove('error');
            });
        }

        if (e.target.closest('.aceptar')) {
            cerrarModal();
            form.reset();
            localStorage.removeItem('usuario_temp');
        }
    });
};


const crearUsuario = async (datos) => {
    delete datos.programas
    const respuesta = await api.post('usuarios', datos)

    if (!respuesta.success) {
        ocultarModalTemporal(modales.modalUsuario);
        await error(respuesta);
        setTimeout(async () => mostrarUltimoModal(), 100);
        return;
    }
    cerrarModal();

    setTimeout(async () => {
        await success('Usuario creado con éxito');
    }, 100);
    const datosFormateados = await formatearUsuario(respuesta.data);

    let usuarios = JSON.parse(localStorage.getItem('usuarios'))?.usuarios || [];
    usuarios.unshift(datosFormateados);
    localStorage.setItem('usuarios', JSON.stringify({ usuarios }));

    const tbody = document.querySelector('#dashboard-usuarios .table__body');
    agregarFila(tbody, datosFormateados, usuarioClick);
}

const actualizarUsuario = async (datos) => {
    const usuarioTemp = JSON.parse(localStorage.getItem('usuario_temp'));
    delete datos.programas
    datos['contrasena'] = 'restringido';
    const respuesta = await api.put('usuarios/' + usuarioTemp.id, datos);

    if (!respuesta.success) {
        ocultarModalTemporal(modales.modalUsuario);
        await error(respuesta);
        setTimeout(async () => mostrarUltimoModal(), 100);
        return;
    }
    configurarModalUsuario('editar', modales.modalUsuario);

    localStorage.setItem('usuario_temp', JSON.stringify(respuesta.data));

    const datosFormateados = await formatearUsuario(respuesta.data);

    const tbody = document.querySelector('#dashboard-usuarios .table__body');
    reemplazarFila(tbody, datosFormateados, usuarioClick);
    await actualizarStorageUsuarios();
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