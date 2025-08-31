import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { llenarSelect } from "../../../../helpers/select";
import { setLecturaForm } from "../../../../helpers/setLecturaForm";
import { cerrarModal, mostrarConfirmacion, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { errorToast, infoToast, successToast } from "../../../../utils/alertas";
import { del, get, patch, put } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import obtenerHashBase from "../../../../helpers/obtenerHashBase";
import { actualizarStorageUsuarios } from "../usuario";

export default async (modal, parametros) => {
    document.title = "Usuarios - Detalles: " + parametros.id;
    modal.dataset.modo = 'detalles';

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

    modal.querySelector('.modal__title').textContent = 'Detalles del Usuarios';

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
    }

    setLecturaForm(form, true); // lectura

    const botonesVisibles = ['.editar', '.aceptar', '.reactivar', '.restaurar', '.desactivar'];

    modal.querySelectorAll('.modal__actions .button').forEach(btn => {
        btn.style.display = 'none';
    });

    // mostrar solo los de esta vista
    botonesVisibles.forEach(selector => {
        const btn = modal.querySelector(selector);
        if (btn) {
            btn.style.display = '';
            if (!data.mapa && btn.classList.contains('ver-mapa')) btn.remove();
        }
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

    const btn = data.activo ? modal.querySelector('.reactivar') : modal.querySelector('.desactivar');
    btn.classList.add('hidden');


    const desactivar = modal.querySelector('.desactivar');
    const reactivar = modal.querySelector('.reactivar');
    const restaurar = modal.querySelector('.restaurar');

    asignarEvento(desactivar, 'click', async () => {
        const confirmado = await mostrarConfirmacion("¿Está seguro de desactivar al usuario?");
        if (!confirmado) return;

        const respuesta = await patch('usuarios/' + parametros.id, { activo: false });
        if (respuesta.success) {
            const fila = document.querySelector(`#dashboard-usuarios .table__row[data-id="${parametros.id}"]`);
            if (fila) {
                fila.classList.add('table__row--red')
                const ultimaCelda = fila.querySelector('td:last-child');
                ultimaCelda.textContent = 'Inactivo';
            }
            cerrarModal(modal);
            requestAnimationFrame(() => location.hash = obtenerHashBase());
            successToast('Usuario desactivado con éxito');
            // removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        } else {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
        }

        await actualizarStorageUsuarios();
    });

    asignarEvento(reactivar, 'click', async () => {
        const confirmado = await mostrarConfirmacion("¿Está seguro de reactivar al usuario?");
        if (!confirmado) return;

        const respuesta = await patch('usuarios/' + parametros.id, { activo: true });
        if (respuesta.success) {
            const fila = document.querySelector(`#dashboard-usuarios .table__row[data-id="${parametros.id}"]`);
            if (fila) {
                fila.classList.remove('table__row--red')
                const ultimaCelda = fila.querySelector('td:last-child');
                ultimaCelda.textContent = 'Activo';
            }
            cerrarModal(modal);
            requestAnimationFrame(() => location.hash = obtenerHashBase());
            successToast('Usuario reactivado con éxito');
            // removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        } else {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
        }

        await actualizarStorageUsuarios();
    });
    asignarEvento(restaurar, 'click', async () => {
        const confirmado = await mostrarConfirmacion("¿Está seguro de reiniciar la contraseña del usuario?");
        if (!confirmado) return;

        const respuesta = await patch('usuarios/' + parametros.id + '/contrasena');
        if (respuesta.success) {
            infoToast('La nueva contraseña del usuario es su número de documento');
            successToast('Contraseña restaurada con éxito');
            // removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        } else {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
        }

        await actualizarStorageUsuarios();
    });

    modal.addEventListener('click', async (e) => {

        if (e.target.closest('.editar')) {
            location.hash = "#/super-admin/usuarios/editar/id=" + parametros.id;
            return;
        }
        // if (e.target.closest('.ver-mapa')) {
        //     // const temp = JSON.parse(localStorage.getItem('ambiente_temp'));
        //     if (data.mapa) {
        //         window.location.hash = `#/super-admin/ambientes/mapa/ambiente_id=${parametros.id}&nombre=${data.nombre}`;
        //     }
        //     else {
        //         // ocultarModal(modal);
        //         infoToast("Este ambiente aún no tiene un mapa disponible");
        //         // setTimeout(() => mostrarModal(modal), 100);
        //     }
        //     return;
        // }
        // if (e.target.closest('.eliminar')) {
        //     const confirmado = await mostrarConfirmacion("¿Está seguro de eliminar el ambiente?");
        //     if (!confirmado) return;
        //     const respuesta = await del('ambientes/' + parametros.id);

        //     if (respuesta.successToast) {
        //         cerrarModal(modal);
        //         await successToast('Ambiente eliminado con éxito');
        //         removerFilar(document.querySelector('#dashboard-ambientes .table__body'), parametros.id);
        //     }
        //     else {
        //         ocultarModal(modal);
        //         await errorToast(respuesta);
        //         setTimeout(async () => mostrarModal(modal), 100);
        //     }
        //     await actualizarStorageAmbientes();
        //     return;
        // }
    })
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