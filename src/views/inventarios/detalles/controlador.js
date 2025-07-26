import { initModalConfigurar } from "../../../modals/modalConfigurarCodigo";
import { abrirModal, initModales, limpiarModales, modales } from "../../../modals/modalsController";
import { initComponentes } from "../../../helpers/initComponentes";
import { get } from "../../../utils/api";

export default async () => {

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const inventarioInfo = JSON.parse(localStorage.getItem('inventario'));
    
    initComponentes(usuario);
    
    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').classList.add('dashboard--details-section');
    document.querySelector('.dashboard').removeAttribute('id');
    document.querySelector('.dashboard').id = "dashboard-detalles";
    
    document.querySelector('.access-info').classList.add('hidden');
    
    limpiarModales();
    await initModales(['modalConfigurarCodigo']);
    const { modalConfigurarCodigo } = modales;
    await initModalConfigurar(modalConfigurarCodigo);

    const respuesta = await get('inventarios/' + inventarioInfo.id);
    if (!respuesta.success){
        console.warn(respuesta)
        return;
    }

    const inventario = respuesta.data

    // Asignar datos al resumen general
    document.querySelector('.nombre-inventario').textContent = inventario.nombre;
    document.querySelector('.nombre-completo-usuario').textContent = `${usuario.nombres} ${usuario.apellidos}`;
    document.querySelector('.fecha-creacion').textContent = inventario.fecha_creacion;
    document.querySelector('.ultima-actualizacion').textContent = inventario.ultima_actualizacion;

    // Asignar datos a las estadísticas
    document.querySelector('.total-bienes').textContent = inventario.cantidad_elementos;
    document.querySelector('.valor-monetario').textContent = `$ ${inventario.valor_monetario.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`;
    document.querySelector('.ambientes-cubiertos').textContent = inventario.ambientes_cubiertos;


    document.getElementById('dashboard-detalles').addEventListener('click', (e) => {
        if (e.target.closest('.generar-codigo')) {
            abrirModal(modalConfigurarCodigo);
        }
    });
}