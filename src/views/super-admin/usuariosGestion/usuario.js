import { get } from "../../../utils/api";


import crear from './crud/crear';
import detalles from './crud/detalles';
import editar from './crud/editar';

export default { crear, detalles, editar };

export const formatearUsuario = (usuario) => {

    return [
        usuario.id,
        usuario.id,
        usuario.documento,
        usuario.nombres + " " + usuario.apellidos,
        "Usuario " + usuario.roles.map(r => r.nombre).join(" - "),
        usuario.activo ? "Activo" : "Inactivo",
        usuario.activo
    ];
}

export const usuarioClick = (id) => {
    location.hash = "#/super-admin/usuarios/detalles/id="+id;
    // const { data } = await get('usuarios/' + id)
    // localStorage.setItem('usuario_temp', JSON.stringify(data));

    // const form = modales.modalUsuario.querySelector('form');

    // llenarCamposFormulario(data, form);
    // modales.modalUsuario.dataset.id = data.id;
    // configurarModalUsuario('editar', modales.modalUsuario);
    // const btn = data.activo ? modales.modalUsuario.querySelector('.desactivar') : modales.modalUsuario.querySelector('.reactivar');
    // btn.classList.remove('hidden');
    // abrirModal(modales.modalUsuario);
}

export const cargarUsuarios = async () => {
    const respuesta = await get('usuarios')
    const usuarios = [];

    if (respuesta.success) {
        for (const usuario of respuesta.data) {
            usuarios.push(formatearUsuario(usuario))
        };
    }

    return usuarios;
}

export const actualizarStorageUsuarios = async () => {
    const nuevosUsuarios = await cargarUsuarios();
    localStorage.setItem('usuarios', JSON.stringify({ usuarios: nuevosUsuarios }));
}