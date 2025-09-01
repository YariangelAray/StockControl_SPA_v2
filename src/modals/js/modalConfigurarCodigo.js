import * as validaciones from "../../utils/Validaciones";
import { cargarModal, cerrarModal, mostrarModal } from "../modalsController";
import { errorToast } from "../../utils/alertas";
import { post } from "../../utils/api";
import { initTemporizadorAcceso } from "../../helpers/temporizadorAcceso";

/**
 * Abre el modal para configurar códigos de acceso temporal
 * Permite al usuario establecer duración en horas y minutos
 */
export const abrirModalConfigurar = async () => {
  // Carga y muestra el modal de configuración
  const modal = await cargarModal("modalConfigurarCodigo");  
  mostrarModal(modal);

  // Obtiene referencias a elementos del formulario
  const form = modal.querySelector('form');  
  const inputHoras = modal.querySelector('input[name="horas"]');
  const inputMinutos = modal.querySelector('input[name="minutos"]');
  
  // Configura validaciones y comportamiento de los inputs de tiempo
  configurarInputsTiempo(inputHoras, inputMinutos);

  // Maneja el envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtiene los valores de tiempo ingresados
    const horas = parseInt(inputHoras.value) || 0;
    const minutos = parseInt(inputMinutos.value) || 0;

    // Valida que el tiempo sea válido (no ambos en cero, horas <= 6, minutos <= 59)
    if ((horas === 0 && minutos === 0) || horas > 6 || minutos > 59) {
      validaciones.agregarError(inputHoras.parentElement, "Tiempo inválido");
      validaciones.agregarError(inputMinutos.parentElement, "Tiempo inválido");
      return;
    }

    // Limpia errores de validación previos
    validaciones.quitarError(inputHoras.parentElement);
    validaciones.quitarError(inputMinutos.parentElement);

    // Obtiene la información del inventario desde localStorage
    const inventario = JSON.parse(localStorage.getItem('inventario'));

    // Envía petición al backend para generar el código de acceso
    const respuesta = await post('accesos/inventarios/me/generar/' + inventario.id, { horas, minutos });

    // Maneja errores de la API
    if (!respuesta.success) {      
      errorToast(respuesta);      
      return;
    }

    // Extrae datos de la respuesta exitosa
    const codigoGenerado = respuesta.data.codigo;
    const fechaExpiracion = new Date(respuesta.data.fecha_expiracion);
    
    // Guarda información del código en localStorage para persistencia
    localStorage.setItem('codigoAccesoInfo', JSON.stringify({
      codigo: codigoGenerado,
      expiracion: fechaExpiracion
    }));
    
    // Cierra modal actual y abre modal de código generado
    cerrarModal(modal);
    const modalCodigoAcceso = await cargarModal("modalCodigoAcceso");
    
    // Muestra el código generado en el nuevo modal
    modalCodigoAcceso.querySelector('.codigo-acceso').textContent = codigoGenerado;
    mostrarModal(modalCodigoAcceso);
    
    // Inicia el temporizador para mostrar tiempo restante
    await initTemporizadorAcceso();

    // Configura evento de cierre para el modal de código
    modalCodigoAcceso.addEventListener('click', (e) => {
      if (e.target.closest('.aceptar')) {
        cerrarModal(modalCodigoAcceso);
      }
    });
  });

  // Configura evento de cancelación
  modal.addEventListener('click', (e) => {
    if (e.target.closest('.cancelar')) {
      cerrarModal(modal);
    }
  });
};

/**
 * Configura validaciones y comportamiento para inputs de tiempo (horas/minutos)
 * Aplica límites máximos y maneja la interdependencia entre horas y minutos
 * 
 * @param {HTMLInputElement} inputHoras - Input para las horas
 * @param {HTMLInputElement} inputMinutos - Input para los minutos
 * @param {number} maxHoras - Máximo de horas permitidas (default: 6)
 * @param {number} maxMinutos - Máximo de minutos permitidos (default: 59)
 */
const configurarInputsTiempo = (inputHoras, inputMinutos, maxHoras = 6, maxMinutos = 59) => {
  /**
   * Valida el input de horas aplicando límites
   */
  const validarHoras = () => {
    let horas = parseInt(inputHoras.value) || 0;

    // Si alcanza el máximo de horas, resetea minutos
    if (horas >= maxHoras) {
      horas = maxHoras;
      inputMinutos.value = 0;
    } else if (horas < 0) {
      // No permite valores negativos
      horas = 0;
    }

    // Actualiza el valor del input
    inputHoras.value = horas;
  };

  /**
   * Valida el input de minutos manejando overflow hacia horas
   */
  const validarMinutos = () => {
    let horas = parseInt(inputHoras.value) || 0;
    let minutos = parseInt(inputMinutos.value) || 0;

    // Si ya está en máximo de horas, no permite minutos
    if (horas >= maxHoras) {
      inputMinutos.value = 0;
      return;
    }

    // Maneja overflow de minutos hacia horas
    if (minutos > maxMinutos) {
      minutos = 0;
      horas++;
    } else if (minutos < 0) {
      // Maneja valores negativos
      minutos = maxMinutos;
      horas--;
    }

    // Aplica límites finales
    if (horas >= maxHoras) {
      horas = maxHoras;
      minutos = 0;
    } else if (horas < 0) {
      horas = 0;
      minutos = 0;
    }

    // Actualiza ambos inputs
    inputHoras.value = horas;
    inputMinutos.value = minutos;
  };

  // Configura eventos de validación en tiempo real
  inputHoras.addEventListener('input', validarHoras);
  inputHoras.addEventListener('change', validarHoras);
  inputMinutos.addEventListener('input', validarMinutos);
  inputMinutos.addEventListener('change', validarMinutos);

  // Establece valores iniciales
  inputHoras.value = 0;
  inputMinutos.value = 0;
};