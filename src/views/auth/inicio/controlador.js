import * as validaciones from "../../../helpers/Validaciones";
export default async () => {
    const formulario = document.querySelector(".form--signin");

    const campos = [...formulario].filter((elemento) => elemento.hasAttribute("required") && (elemento.tagName == "INPUT" || elemento.tagName == "SELECT"));

    campos.forEach((campo) => {
        campo.addEventListener("blur", validaciones.validarCampo);
        if (campo.name == "documento") {
            campo.addEventListener("keydown", validaciones.validarNumero);
            campo.addEventListener("input", validaciones.validarCampo);
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 11));
        }
    })

    formulario.addEventListener("submit", async event => {
        event.preventDefault();

        if (!validaciones.validarFormulario(event)) return;

        console.log(validaciones.datos);
        formulario.reset()
    })
}