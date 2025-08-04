import { configurarModalUsuario } from "../../../modals/js/modalUsuario";
import { abrirModal, modales } from "../../../modals/modalsController";
import { get } from "../../../utils/api";
import { llenarCamposFormulario } from "../../../helpers/llenarCamposFormulario";

export const formatearUsuario = async (usuario) => {
    const rol = await get('roles/' + usuario.rol_id);

    return [
        usuario.id,
        usuario.id,
        usuario.documento,
        usuario.nombres + " " + usuario.apellidos,
        "Usuario " + rol.data.nombre,
        usuario.activo ? "Activo" : "Inactivo",
        usuario.activo
    ];
}

export const usuarioClick = async (id) => {
    const { data } = await get('usuarios/' + id)
    localStorage.setItem('usuario_temp', JSON.stringify(data));

    const form = modales.modalUsuario.querySelector('form');

    llenarCamposFormulario(data, form);
    modales.modalUsuario.dataset.id = data.id;
    configurarModalUsuario('editar', modales.modalUsuario);
    const btn = data.activo ? modales.modalUsuario.querySelector('.desactivar') : modales.modalUsuario.querySelector('.reactivar');
    btn.classList.remove('hidden');
    abrirModal(modales.modalUsuario);
}

export const cargarUsuarios = async () => {
    const respuesta = await get('usuarios')
    const usuarios = [];

    if (respuesta.success) {
        for (const usuario of respuesta.data) {
            usuarios.push(await formatearUsuario(usuario))
        };
    }

    return usuarios;
}

export const actualizarStorageUsuarios = async () => {
    const nuevosUsuarios = await cargarUsuarios();
    localStorage.setItem('usuarios', JSON.stringify({ usuarios: nuevosUsuarios }));
}