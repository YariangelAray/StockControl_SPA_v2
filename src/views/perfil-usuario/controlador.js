import { abrirModal, initModales, limpiarModales, modales } from "../../modals/modalsController";
import { initModalEliminar } from "../../modals/js/modalDesactivarCuenta";
import { initComponentes } from "../../helpers/initComponentes";
import * as api from "../../utils/api.js";
import { llenarCamposFormulario } from "../../helpers/llenarCamposFormulario.js";
import { llenarSelect } from "../../helpers/select";
import * as validaciones from "../../utils/Validaciones";
import { error, success } from "../../utils/alertas.js";
import { eliminarAccesos, initTemporizadorAcceso } from "../inventarios/detalles/initTemporizadorAcceso.js";
import { setLecturaForm } from "../../helpers/setLecturaForm.js";

export default async () => {

    const usuarioInfo = JSON.parse(localStorage.getItem('usuario'));
    initComponentes(usuarioInfo);
    
    const contentDesactivar = document.querySelector('.desactivar-cuenta');
    if (usuarioInfo.rol_id != 1) contentDesactivar.classList.remove('hidden');

    const { data } = await api.get('usuarios/' + usuarioInfo.id);
    const usuario = data;

    const roles = await api.get('roles/' + usuarioInfo.rol_id);
    const campoRol = document.querySelector('.dashboard__title.rol');

    campoRol.textContent = "Usuario " + roles.data.nombre;


    await llenarSelect({
        endpoint: 'tipos-documento',
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

    const programas = await api.get('programas-formacion');
    if (!programas.success) console.log(programas.message || programas.errors);

    const selectProgramas = document.querySelector('#programas-formacion');
    const selectFichas = document.querySelector('#fichas');

    const programaUsuario = programas.data.find(programa =>
        programa.fichas.some(ficha => ficha.id == usuario.ficha_id)
    );

    selectProgramas.value = programaUsuario.id;
    if (programaUsuario) {
        agregarFichas(selectFichas, programaUsuario)
        // Selecciona la ficha correspondiente al usuario
        selectFichas.value = usuario.ficha_id;
    }

    selectProgramas.addEventListener('change', (e) => {
        const id = e.target.value;

        if (e.target.selectedIndex == 0) selectFichas.setAttribute('disabled', 'disabled');
        else {
            selectFichas.removeAttribute('disabled')
            const programa = programas.data.find(p => p.id == id);
            agregarFichas(selectFichas, programa)
        }
    })

    const formUsuario = document.getElementById('dashboard-perfil').querySelector('#form-usuario');
    llenarCamposFormulario(usuario, formUsuario);
    setLecturaForm(formUsuario, false);

    const camposUser = [...formUsuario].filter((elemento) => elemento.hasAttribute("required"));

    camposUser.forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);

        if (campo.name == "documento" || campo.name == "telefono") {
            campo.addEventListener("keydown", validaciones.validarNumero);
            campo.addEventListener("input", validaciones.validarCampo);
            const limite = campo.name == "documento" ? 11 : 15;
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

    formUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validaciones.validarFormulario(e)) return;
        delete validaciones.datos.programas
        validaciones.datos['contrasena'] = 'restringido';        

        try {

            const respuesta = await api.put(`usuarios/${usuario.id}`, validaciones.datos);

            if (respuesta.success) {
                await success("Usuario actualizado exitosamente");
                localStorage.setItem('usuario', JSON.stringify({ id: respuesta.data.id, nombres: respuesta.data.nombres, apellidos: respuesta.data.apellidos, rol_id: respuesta.data.rol_id }));

                const usuarioInfo = JSON.parse(localStorage.getItem('usuario'));
                initComponentes(usuarioInfo);

            } else {
                error(respuesta);
            }

        } catch (e) {
            console.error("Error inesperado:", e);
            error({});
        }
    })

    const formContrasena = document.getElementById('dashboard-perfil').querySelector('#form-contrasena');
    const camposContrasena = [...formContrasena].filter((elemento) => elemento.hasAttribute("required"));
    camposContrasena.forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);
        campo.addEventListener("keydown", validaciones.validarCampo);
        if (campo.name == "contrasena_nueva") {
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 30));
            campo.addEventListener("input", () => validaciones.validarContrasena(campo));
        }
    })

    formContrasena.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validaciones.validarFormulario(e)) return;
        try {
            const respuesta = await api.put(`usuarios/${usuario.id}/contrasena`, validaciones.datos);

            if (respuesta.success) {
                await success("Contraseña actualizada exitosamente");
                formContrasena.reset()
            } else {
                error(respuesta);
            }

        } catch (e) {
            console.error("Error inesperado:", e);
            error({});
        }
    })


    limpiarModales();
    await initModales(['modalDesactivarCuenta']);

    const { modalDesactivarCuenta } = modales;
    initModalEliminar(modalDesactivarCuenta, usuario);

    if (usuario.rol_id === 3) {
        const codigoInfo = JSON.parse(localStorage.getItem('codigoAccesoInfo'));
        const inventario = JSON.parse(localStorage.getItem('inventario') || '{}');
        if (codigoInfo && inventario.id) {
            const limpiar = () => {
                document.querySelector('.sidebar .access-info')?.classList.add('hidden');
                localStorage.removeItem('codigoAccesoInfo');
            }
            const expiracion = new Date(codigoInfo.expiracion);
            const ahora = new Date();

            if (expiracion > ahora) {
                document.querySelector('.sidebar .access-info')?.classList.remove('hidden');
                await initTemporizadorAcceso(expiracion, inventario.id, limpiar);
            } else {
                await eliminarAccesos(inventario.id, limpiar);                
            }                    
        }
    }

    document.getElementById('dashboard-perfil').addEventListener('click', (e) => {
        if (e.target.closest('#desactivarCuenta')) {
            abrirModal(modalDesactivarCuenta);
        }
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