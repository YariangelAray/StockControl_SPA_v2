import { error, info } from "../utils/alertas";
import { llenarSelect } from "../helpers/select";
import { setLecturaForm } from "../helpers/setLecturaForm";
import { llenarCamposFormulario } from "../utils/llenarCamposFormulario";
import * as validaciones from '../utils/Validaciones';
import * as api from '../utils/api';
import { cerrarModal, mostrarConfirmacion, mostrarUltimoModal, ocultarModalTemporal, modales } from "./modalsController";
import { actualizarStorageAmbientes, ambienteClick, formatearAmbiente } from "../views/super-admin/ambientesGestion/ambiente";
import { agregarFila, reemplazarFila } from "../helpers/renderFilas";

export const configurarModalAmbiente = (modo, modal) => {

  const form = modal.querySelector('form');

  const botones = {
    editar: modal.querySelector('.editar'),
    crear: modal.querySelector('.crear'),    
    guardar: modal.querySelector('.guardar'),        
    ver_mapa: modal.querySelector('.ver-mapa'),        
    aceptar: modal.querySelector('.aceptar'),
    cancelar: modal.querySelector('.cancelar')
  };

  // Oculta todo
  Object.values(botones).forEach(btn => btn.classList.add('hidden'));

  if (modo === 'crear') {
    form.reset();
    setLecturaForm(form, false); // todos habilitados
    botones.crear.classList.remove('hidden');    
    botones.cancelar.classList.remove('hidden');
    modal.querySelector('.modal__title').textContent = 'Crear Ambiente';
  }

  if (modo === 'editar') {
    setLecturaForm(form, true); // lectura
    botones.editar.classList.remove('hidden');    
    botones.ver_mapa.classList.remove('hidden');    
    botones.aceptar.classList.remove('hidden');
    modal.querySelector('.modal__title').textContent = 'Detalles del Ambiente';
  }

  if (modo === 'editar_activo') {
    setLecturaForm(form, false); // habilitar campos
    botones.guardar.classList.remove('hidden');
    botones.cancelar.classList.remove('hidden'); // cancelar edición
    modal.querySelector('.modal__title').textContent = 'Editar Ambiente';
  }
};


export const initModalAmbiente = async (modal) => {
  await llenarSelect({
    endpoint: 'centros',
    selector: '#centros',
    optionMapper: centro => ({ id: centro.id, text: centro.nombre })
  });

  const form = modal.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = e.submitter; // Este es el botón que disparó el submit
    const claseBoton = boton.classList;

    if (!validaciones.validarFormulario(e)) return;
    const confirmado = await mostrarConfirmacion();
    if (!confirmado) return;

    if (claseBoton.contains('crear')) {
      // Acción para crear
      await crearAmbiente(validaciones.datos);
    } else if (claseBoton.contains('guardar')) {
      // Acción para editar
      await actualizarAmbiente(validaciones.datos);
      configurarModalAmbiente('editar', modal);
    }
  });

  const campos = [...form];
  campos.forEach(campo => {
    if (campo.hasAttribute('required')){
        campo.addEventListener("input", validaciones.validarCampo);
        campo.addEventListener("blur", validaciones.validarCampo);
    }

    if (campo.name == "placa" || campo.name == "serial")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 50));

    if (campo.name == "fecha_adquisicion")
      campo.addEventListener('input', (e) => validaciones.validarFecha(e.target))

    if (campo.name == "placa")
      campo.addEventListener("keydown", validaciones.validarNumero);

    if (campo.name == "observaciones")
      campo.addEventListener("keydown", event => validaciones.validarLimite(event, 250));
  });


  modal.addEventListener('click', async (e) => {

    if (e.target.closest('.editar')) {
      configurarModalAmbiente('editar_activo', modal);
      return;
    }

    if (e.target.closest('.cancelar')) {
      const estaEditando = modal.querySelector('.modal__title').textContent.includes('Editar');

      if (estaEditando) {
        const temp = JSON.parse(localStorage.getItem('ambiente_temp'));
        llenarCamposFormulario(temp, form); // Restaurar valores        
        configurarModalAmbiente('editar', modal);

      } else cerrarModal();

      form.querySelectorAll('.form__control').forEach(input => {
        input.classList.remove('error');
      });
    }

    if (e.target.closest('.aceptar')) {
      cerrarModal();
      form.reset();
      localStorage.removeItem('ambiente_temp');
    }

    // Reportar
    if (e.target.closest('.ver-mapa')) {
        ocultarModalTemporal(modal);
        await info("Próximamente: Vista de Mapa", "Estamos trabajando para integrar el manejo de mapas interactivos. ¡Podrás visualizar la ubicación de tus ambientes muy pronto!")
        setTimeout(() => mostrarUltimoModal(), 100);
       
    }
  });
};

const crearAmbiente = async (datos) => {
    console.log(datos);
    
  const respuesta = await api.post('ambientes',datos)

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalAmbiente);
    await error(respuesta);
    setTimeout(async() => mostrarUltimoModal(), 100);    
    return;
  }
  cerrarModal();
  setTimeout(async () => await success('Ambiente creado con éxito'), 100);
  const datosFormateados = await formatearAmbiente(respuesta.data);

  let ambientes = JSON.parse(localStorage.getItem('ambientes'))?.ambientes || [];

  ambientes.unshift(datosFormateados); // agrega al principio
  localStorage.setItem('ambientes', JSON.stringify({ ambientes }));

  const tbody = document.querySelector('#dashboard-ambientes .table__body');
  agregarFila(tbody, datosFormateados, ambienteClick);  
}

const actualizarAmbiente = async (datos) => {  
  const ambienteTemp = JSON.parse(localStorage.getItem('ambiente_temp'));
  const respuesta = await api.put('ambientes/' + ambienteTemp.id, {
    ...datos,    
  });

  if (!respuesta.success) {
    ocultarModalTemporal(modales.modalAmbiente);
    await error(respuesta);
    setTimeout(async() => mostrarUltimoModal(), 100);    
    return;
  }
  configurarModalAmbiente('editar', modales.modalAmbiente);

  localStorage.setItem('ambiente_temp', JSON.stringify(respuesta.data));  

  const datosFormateados = await formatearAmbiente(respuesta.data);

  const tbody = document.querySelector('#dashboard-ambientes .table__body');
  reemplazarFila(tbody, datosFormateados, ambienteClick);
  await actualizarStorageAmbientes();
};