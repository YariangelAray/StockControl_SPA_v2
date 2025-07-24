import { generarSidebar } from "../../../helpers/generarSidebar";
import {limpiarModales  }from "../../../modals/modalsController";

export default async () => {
    const inventario = localStorage.getItem('inventario');
    const usuario = localStorage.getItem('rolUsuario');

    if (!inventario) {
        window.location.hash = '#/inventarios';
        return;
    }
    
    if (!document.querySelector('.menu__items')) {
        generarSidebar(usuario);
    }

    limpiarModales();
    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').removeAttribute('id'); 
    document.querySelector('.dashboard').id = "dashboard-ambientes";
};
