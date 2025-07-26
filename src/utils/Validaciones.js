// Teclas espeiales
const teclasEspeciales = ["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"]; // Teclas especiales que se permiten

// Validación para los campos de texto con límite de caracteres
export const validarLimite = (event, limite) => {
    const key = event.key;
    if (!teclasEspeciales.includes(key) && event.target.value.length >= limite) event.preventDefault(); // Evitamos la acción de la tecla si el campo supera el límite    
};

// Validación para los campos de texto
export const validarTexto = (event) => {
    const key = event.key; // Obtenemos la tecla presionada
    const regex = /^[\D]*$/i; // Expresión regular para letras y caracteres especiales

    // Validamos si la tecla no es una letra
    if ((!regex.test(key)) &&
        !teclasEspeciales.includes(key)) {

        event.preventDefault(); // Evitamos la acción de la tecla
    }
    validarCampo(event); // Validamos el campo para agregar o quitar el error
};

// Validación para los campos de número
export const validarNumero = (event) => {
    const key = event.key; // Obtenemos la tecla presionada
    const regex = /^[\d]*$/; // Expresión regular para números

    // Validamos si la tecla no es un número
    if (!regex.test(key) && !teclasEspeciales.includes(key))
        event.preventDefault(); // Evitamos la acción de la tecla

    validarCampo(event); // Validamos el campo para agregar o quitar el error
};

// Validación para la contraseña
export const validarContrasena = (campo) => {
    const tipo = campo.dataset.tipo;
    const valor = campo.value.trim();

    if (valor === "") {
        agregarError(campo);
        return false;
    }


    // Solo se aplica validación estricta si es nueva contraseña
    if (tipo === "nueva") {
        let regexContra = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/; // Expresión regular para validar la contraseña

        // Validamos si la contraseña es válida
        if (!regexContra.test(valor)) {
            let error = "";

            if (!/[A-Z]/.test(valor)) error = " Una mayúscula.";
            if (!/[a-z]/.test(valor)) error = " Una minúscula.";
            if (!/\d/.test(valor)) error = " Un número.";
            if (!/\W/.test(valor)) error = " Un carácter especial.";
            if (valor.length < 8) error = " Al menos 8 caracteres.";

            agregarError(campo, "Requisitos: " + error); // Agregamos el error
            return false;// Si la contraseña es inválida, el formulario no es válido
        }
    }
    quitarError(campo);
    return true;
}

export const validarFecha = (campo) => {
    const valor = campo.value;
    const fechaIngresada = new Date(valor);
    const hoy = new Date();

    // Fecha inválida (NaN) o con año poco realista
    if (isNaN(fechaIngresada.getTime()) || valor.length !== 10) {
        agregarError(campo, "La fecha no es válida.");
        return false;
    }

    // Fecha futura
    if (fechaIngresada > hoy) {
        agregarError(campo, "La fecha no puede ser futura.");
        return false;
    }

    // Si todo está bien
    quitarError(campo);
    return true;
};


// Validación para el correo electrónico
export const validarCorreo = (campo) => {
    let regexCorreo = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Expresión regular para validar el correo electrónico
    // Validamos si el correo es válido

    const valor = campo.value.trim();

    if (valor === "") return true;

    if (!regexCorreo.test(campo.value)) {
        agregarError(campo, "El correo electrónico no es válido."); // Agregamos el error
        return false; // Si el correo es inválido, el formulario no es válido
    }
    quitarError(campo);
    return true;
}

// Validación especial para selects que no deben permitir "otro"
const validarSelectEspecial = (campo) => {
    if (campo.tagName === "SELECT" && campo.name === "tipo_elemento_id" && campo.value === "otro") {
        console.log("hola")
        agregarError(campo, "Debe agregar un tipo válido.");
        return false;
    }
    return true;
};


// --------------------------------------------------------

// Validación para los campos de texto y las listas desplegables
// Retorna true o false dependiendo de si el campo es válido o no
export const validarCampo = (event) => {

    let campo = event.target; // Obtenemos el campo que disparó el evento

    if (((campo.tagName == "INPUT" || campo.tagName == "TEXTAREA") && campo.value.trim() == "") || // Validamos si el campo es un input y está vacío
        (campo.tagName == "SELECT" && campo.selectedIndex == 0) // Validamos si es un select y no se ha seleccionado una opción
    ) {
        agregarError(campo); // Agregamos el error
        return false;
    }

    if (obtenerContenedor(campo).className.includes('error'))
        quitarError(campo); // Quitamos el error

    return true;
};

// --------------------------------------------------------
// Funciones para agregar y quitar errores

const obtenerContenedor = (campo) => {
    return campo.closest(".form__control") || campo.parentElement;
};

// Agrega un borde rojo y un mensaje de advertencia al campo
export const agregarError = (campo, mensaje = "El campo es obligatorio.") => {
    const contenedor = obtenerContenedor(campo);
    contenedor.classList.add('error');
    contenedor.style.setProperty('--error-content', `"${mensaje}"`);
};


// Quita el borde rojo y el mensaje de advertencia del campo
export const quitarError = (campo) => {
    const contenedor = obtenerContenedor(campo);
    contenedor.classList.remove('error');
};

// --------------------------------------------------------
// Función para validar todos los campos del formulario

export let datos = {}; // Objeto para almacenar los datos del formulario
export const validarFormulario = (event) => {
    let valido = true; // Variable para validar si el formulario es válido
    datos = {};

    // Obtenemos todos los campos del formulario que tienen el atributo required y son de tipo input o select
    const campos = [...event.target].filter(
        (elemento) =>
            elemento.hasAttribute("required") &&
            (elemento.tagName == "INPUT" || elemento.tagName == "SELECT" || elemento.tagName == "TEXTAREA")
    );


    // Recorremos los campos y validamos cada uno de ellos
    campos.forEach((campo) => {
        if (!validarCampo({ target: campo })) valido = false;

        if (!validarSelectEspecial(campo)) valido = false;

        if (campo.type == "date")
            if (!validarFecha(campo)) valido = false;

        const valor = campo.value.trim();

        if (campo.tagName === "SELECT" && /^\d+$/.test(valor)) {
            datos[campo.getAttribute("name")] = parseInt(valor);
        } else {
            datos[campo.getAttribute("name")] = valor;
        }

    });

    // Validación para la contraseña
    // Obtenemos los campo de la contraseña
    const contrasenas = campos.filter(campo => campo.classList.contains('contrasena'));
    contrasenas.forEach((campo) => {
        if (!validarContrasena(campo)) valido = false;
    });

    // Validación para el correo electrónico
    // Obtenemos el campo del correo electrónico
    const correo = campos.find((campo) => campo.name == 'correo');
    if (correo && !validarCorreo(correo)) valido = false; // Si el correo es inválido, el formulario no es válido

    return valido; // Retornamos si el formulario es válido o no
};