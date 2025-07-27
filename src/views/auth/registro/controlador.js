import { llenarSelect } from "../../../helpers/select";
import * as validaciones from "../../../utils/Validaciones";
import { error, success } from "../../../utils/alertas";
import * as api from "../../../utils/api";

export default async () => {

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
    console.log(programas);
    
    const selectProgramas = document.querySelector('#programas-formacion');
    const selectFichas = document.querySelector('#fichas');

    selectProgramas.addEventListener('change', (e) => {
        const id = e.target.value;

        while (selectFichas.options.length > 1) selectFichas.remove(1);

        if (e.target.selectedIndex == 0) selectFichas.setAttribute('disabled', 'disabled');
        else {
            selectFichas.removeAttribute('disabled')
            const programa = programas.data.find(p => p.id == id);
            console.log(programa);
            
            programa.fichas.forEach((ficha) => {
                const option = document.createElement('option');
                option.value = ficha.id
                option.textContent = ficha.ficha
                selectFichas.appendChild(option);
            })
        }
    })


    const formulario = document.querySelector(".form--signup");
    const campos = [...formulario].filter((elemento) => elemento.hasAttribute("required"));

    campos.forEach((campo) => {
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

            if (campo.name == "contrasena") {
                campo.addEventListener("keydown", event => validaciones.validarLimite(event, 30));
                campo.addEventListener("input", () => validaciones.validarContrasena(campo));
            }

            if (campo.name == "correo") {
                campo.addEventListener("keydown", event => validaciones.validarLimite(event, 100));
                campo.addEventListener("keydown", () => validaciones.validarCorreo(campo));
            }
        }
    });

    formulario.addEventListener("submit", async event => {
        event.preventDefault();

        if (!validaciones.validarFormulario(event)) return;        
        delete validaciones.datos.programas;        

        try {

            const respuesta = await api.post('usuarios', validaciones.datos);

            if (respuesta.success) {
                await success("Registro éxitoso");
                localStorage.setItem('usuario', JSON.stringify(respuesta.data));
                setTimeout(() => {
                    location.hash = '#/inventarios';
                },500);
            } else {
                error(respuesta);
            }

        } catch (e) {
            console.error("Error inesperado:", e);
            error({});
        }
    });
}