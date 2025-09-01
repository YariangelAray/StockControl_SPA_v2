/**
 * Llena automáticamente los campos de un formulario con datos de un objeto
 * Maneja diferentes tipos de campos (input, select, textarea) de forma inteligente
 * 
 * @param {Object} objeto - Objeto con las propiedades y valores a asignar
 * @param {HTMLFormElement} formulario - Elemento formulario que contiene los campos a llenar
 */
export const llenarCamposFormulario = (objeto, formulario) => {
    // Selecciona todos los elementos del formulario que tengan atributo 'name'
    const campos = formulario.querySelectorAll('[name]');

    // Itera sobre cada uno de los campos encontrados
    campos.forEach(campo => {
        // Obtiene el nombre del campo desde el atributo 'name'
        const nombre = campo.name;

        // Si el objeto no tiene una propiedad con ese nombre, se omite el campo        
        if (!objeto[nombre]) return;

        // Obtiene el valor correspondiente desde el objeto
        const valor = objeto[nombre];

        // === MANEJO ESPECÍFICO PARA ELEMENTOS <SELECT> ===
        if (campo.tagName === 'SELECT') {
            // Convierte el valor a string para hacer comparaciones consistentes
            const valorStr = String(valor);
            let opcionEncontrada = false;

            // Itera sobre todas las <option> del <select>
            Array.from(campo.options).forEach(option => {
                // Si el valor de la opción coincide con el del objeto...
                if (option.value === valorStr) {
                    // ...marcar esa opción como seleccionada
                    option.selected = true;
                    opcionEncontrada = true;
                } else {
                    // Si no, asegúrate de que esté deseleccionada
                    option.selected = false;
                }
            });

            // Si no se encontró una coincidencia, selecciona el primer <option> como fallback            
            if (!opcionEncontrada) campo.selectedIndex = 0;

        // === MANEJO PARA OTROS TIPOS DE CAMPO (input, textarea, etc.) ===
        } else {
            // Asigna directamente el valor al campo
            campo.value = valor;
        }
    });
};