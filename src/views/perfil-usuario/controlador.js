import { abrirModal, initModales, limpiarModales, modales } from "../../modals/modalsController";
import { initModalEliminar } from "../../modals/modalDesactivarCuenta";

export default async () => {
    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').classList.add('dashboard--profile');

    document.querySelector('.dashboard').removeAttribute('id');
    document.querySelector('.dashboard').id = "dashboard-perfil";

    limpiarModales();
    await initModales(['modalDesactivarCuenta']);

    const { modalDesactivarCuenta } = modales;
    initModalEliminar(modalDesactivarCuenta);

    document.getElementById('dashboard-perfil').addEventListener('click', (e) => {
        if (e.target.closest('#desactivarCuenta')) {
            abrirModal(modalDesactivarCuenta);
        }
    })
}