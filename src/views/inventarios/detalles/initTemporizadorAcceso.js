import { info } from "../../../utils/alertas";
import { del, get } from "../../../utils/api";

/**
 * Inicia el temporizador que muestra cuánto tiempo queda para que expire
 * el código de acceso a un inventario. Si se vence, elimina el acceso.
 * 
 * @param {Date | string} fechaExpiracion - Fecha y hora de expiración del código
 * @param {number} inventarioId - ID del inventario asociado al código
 * @param {function} limpiar - Función que limpia el estado del frontend
 */
export const initTemporizadorAcceso = async (fechaExpiracion, inventarioId, limpiar) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Selecciona el elemento donde se mostrará el tiempo restante
    let tiempoAcceso = usuario.rol_id == 2 ? document.querySelector('.dashboard .tiempo-acceso') : document.querySelector('.sidebar .tiempo-acceso');
    const usuariosAcces = document.querySelector('.dashboard .access-info + .dashboard__row .usuarios-gestionando');

    // Variable para guardar el intervalo que actualiza el tiempo
    let intervalo;

    // Función que calcula y actualiza el tiempo restante cada segundo
    const actualizarTiempo = async () => {
        // Obtiene la fecha y hora actual
        const ahora = new Date();

        // Calcula el tiempo restante en milisegundos
        const restante = new Date(fechaExpiracion) - ahora;

        // Si ya expiró el tiempo
        if (restante <= 0) {
            clearInterval(intervalo); // Detiene el intervalo
            tiempoAcceso.textContent = "Expirado"; // Muestra el texto "Expirado"
            
            if (usuario.rol_id === 3) {
                const hash = location.hash;
                
                const dentroDeInventario = hash == '#/inventario' || hash == '#/perfil-usuario';
                
                if (!dentroDeInventario) {
                    await info("Acceso expirado", "Tu acceso temporal al inventario ha finalizado.");
                    setTimeout(() => {
                        window.location.hash = '#/inventarios';
                    }, 500);
                }
            }
            await eliminarAccesos(inventarioId, limpiar); // Llama función para eliminar acceso            
            return;
        }

        if (usuario.rol_id === 2) {            
            const respuesta = await get('accesos-temporales/inventario/' + inventarioId);  // aqui
            usuariosAcces.textContent = respuesta.success && respuesta.data ? respuesta.data.length : 0;
        }

        // Calcula las horas, minutos y segundos restantes
        const horas = Math.floor((restante / (1000 * 60 * 60)) % 24);
        const minutos = Math.floor((restante / (1000 * 60)) % 60);
        const segundos = Math.floor((restante / 1000) % 60);

        // Actualiza el contenido del elemento con el tiempo restante, en formato hh:mm:ss
        tiempoAcceso.textContent =
            `${horas.toString().padStart(2, '0')}h ${minutos.toString().padStart(2, '0')}m ${segundos.toString().padStart(2, '0')}s`;
    }

    // Ejecuta una primera vez la actualización para no esperar un segundo
    await actualizarTiempo();

    // Inicia el intervalo que actualiza el tiempo cada 1000 milisegundos (1 segundo)
    intervalo = setInterval(actualizarTiempo, 1000);
}

/**
 * Llama al backend para eliminar los accesos temporales asociados a un inventario.
 * Luego ejecuta una función para limpiar el estado en la interfaz.
 * 
 * @param {number} inventarioId - ID del inventario cuyos accesos se van a eliminar
 * @param {function} limpiar - Función que limpia el frontend (UI y localStorage)
 */
export const eliminarAccesos = async (inventarioId, limpiar) => {
    
    // Llama la función limpiar para actualizar la interfaz
    limpiar();
    // Realiza la petición DELETE al backend para eliminar accesos del inventario
    const respuesta = await del('codigos-acceso/inventario/' + inventarioId);
    
    // Si hubo un error, lo muestra en consola
    if (!respuesta.success) {
        console.warn("No se pudo eliminar accesos temporales");
    }
    
}
