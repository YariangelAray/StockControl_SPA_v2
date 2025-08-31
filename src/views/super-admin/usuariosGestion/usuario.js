import { esResponsive } from "../../../helpers/renderFilas";
import { get } from "../../../utils/api";


import crear from './crud/crear';
import detalles from './crud/detalles';
import editar from './crud/editar';

export default { crear, detalles, editar };

export const formatearUsuario = (usuario) => {

    if (esResponsive()){
        return [
            {name: 'id-fila', value: usuario.id},
            {name: 'Documento', value: usuario.documento},
            {name: 'Nombre', value: usuario.nombres + " " + usuario.apellidos},
            {name: 'ID', value: usuario.id},
            {name: 'Rol', value: "Usuario " + usuario.roles.map(r => r.nombre).join(" - ")},
            {name: 'Estado', value: usuario.activo ? "Activo" : "Inactivo"},
            {name: 'Activo', value: usuario.activo}
        ]
    }else{
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

}

export const usuarioClick = (id) => {
    location.hash = "#/super-admin/usuarios/detalles/id="+id;
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