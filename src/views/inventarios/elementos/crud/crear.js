import asignarEvento from "../../../../helpers/asignarEvento";
import { llenarCamposFormulario } from "../../../../helpers/llenarCamposFormulario";
import { agregarFila } from "../../../../helpers/renderFilas";
import { llenarSelect } from "../../../../helpers/select";
import { cerrarModal, mostrarConfirmacion, mostrarModal, ocultarModal } from "../../../../modals/modalsController";
import { errorToast, successToast } from "../../../../utils/alertas";
import { post } from "../../../../utils/api";
import getCookie from "../../../../utils/getCookie";
import hasPermisos from "../../../../utils/hasPermisos";
import obtenerHashBase from "../../../../utils/obtenerHashBase";

import * as validaciones from '../../../../utils/Validaciones';
import { elementoClick, formatearElemento } from "../elemento";
import { gestionarTipoElemento, reiniciarSelectTipo, tipoElementoCreado } from "./helperTipoElemento";

export default async (modal, parametros = {}) => {

    document.title = "Elementos - Crear"
    modal.dataset.modo = 'crear';

    const selectTipo = modal.querySelector('#tipos-elementos');
    const btnAgregarTipo = modal.querySelector('#agregarTipo');    
    if (!modal.dataset.inicializado) {
        await llenarSelect({
            endpoint: 'ambientes',
            selector: '#ambientes',
            optionMapper: ambiente => ({ id: ambiente.id, text: ambiente.nombre })
        });
        await llenarSelect({
            endpoint: 'estados',
            selector: '#estados',
            optionMapper: estado => ({ id: estado.id, text: estado.nombre })
        });

        reiniciarSelectTipo(selectTipo);

        await llenarSelect({
            endpoint: 'tipos-elementos',
            selector: '#tipos-elementos',
            optionMapper: tipo => ({
                id: tipo.id,
                text: `${tipo.consecutivo}: ${tipo.nombre}. Marca: ${(tipo.marca ?? "No Aplica")}. Modelo: ${(tipo.modelo ?? "No Aplica")}.`
            })
        });

        selectTipo.addEventListener('change', () => {
            const valor = selectTipo.value;
            if (valor == 'otro' && hasPermisos("tipo-elemento.create", permisos)) btnAgregarTipo.classList.remove('hidden');
            else btnAgregarTipo.classList.add('hidden');
        });

        btnAgregarTipo.addEventListener('click', async (e) => {
            e.preventDefault();
            await gestionarTipoElemento(modal, modal.dataset.modo, validaciones.datos);
        });
        modal.dataset.inicializado = "true";
    }

    // botones que deben estar visibles en este flujo
    const botonesVisibles = ['.crear', '.cancelar', '#agregarTipo'];
    // ocultar todos los botones primero
    modal.querySelectorAll('.modal__actions .button').forEach(btn => {
        btn.classList.add('hidden');
    });

    // mostrar solo los de esta vista
    botonesVisibles.forEach(selector => {
        const btn = modal.querySelector(selector);
        if (btn) btn.classList.remove('hidden');
    });
    btnAgregarTipo.classList.add('hidden'); 

    // aplicar permisos sobre los visibles
    const permisos = getCookie('permisos', []);
    ('permisos');
    modal.querySelectorAll('.modal__actions .button[data-permiso]').forEach(btn => {
        if (!hasPermisos(btn.dataset.permiso, permisos)) {
            btn.remove();
        }
    })    

    modal.querySelector('.modal__title').textContent = 'Crear Elemento';

    // inicializar validaciones
    const form = modal.querySelector('form');

    [...form].forEach(campo => {
        if (campo.hasAttribute('required')) {
            campo.addEventListener("input", validaciones.validarCampo);
            campo.addEventListener("blur", validaciones.validarCampo);
        }

        if (campo.name == "valor_monetario") {
            campo.addEventListener("keydown", (e) => {
                validaciones.validarNumero(e);
                validaciones.validarLimite(e, 20);
            });

        }
        if (campo.name == "placa" || campo.name == "serial")
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 15));

        if (campo.name == "fecha_adquisicion")
            campo.addEventListener('input', (e) => validaciones.validarFecha(e.target))

        if (campo.name == "placa")
            campo.addEventListener("keydown", validaciones.validarNumero);

        if (campo.name == "observaciones")
            campo.addEventListener("keydown", event => validaciones.validarLimite(event, 250));
    });


    const inventario = JSON.parse(localStorage.getItem('inventario'));    

    form.onsubmit = async (e) => {
        e.preventDefault();

        if (!validaciones.validarFormulario(e)) return;
        const confirmado = await mostrarConfirmacion();
        if (!confirmado) return;

        validaciones.datos.valor_monetario = parseFloat(validaciones.datos.valor_monetario);
        validaciones.datos.placa = parseInt(validaciones.datos.placa);
        validaciones.datos.inventario_id = inventario.id

        const respuesta = await post('elementos/me', validaciones.datos);
        if (!respuesta.success) {
            // ocultarModal(modal);
            errorToast(respuesta);
            // setTimeout(() => mostrarModal(modal), 100);
            return;
        }

        cerrarModal(modal);
        setTimeout(async () => successToast('Elemento creado con éxito'), 100);
        location.hash = obtenerHashBase();

        const datosFormateados = formatearElemento(respuesta.data);

        // actualizar cache y tabla
        let elementos = JSON.parse(localStorage.getItem('elementos'))?.elementos || [];
        elementos.unshift(datosFormateados);
        localStorage.setItem('elementos', JSON.stringify({ elementos }));

        const tbody = document.querySelector('#dashboard-elementos .table__body');
        agregarFila(tbody, datosFormateados, elementoClick);
    };

    // asignarEvento(btnAgregarTipo, 'click', ()=>gestionarTipoElemento(modal, 'crear', validaciones.datos))
    document.removeEventListener('tipoElementoCreado', tipoElementoCreado)
    document.addEventListener('tipoElementoCreado', tipoElementoCreado);
};
