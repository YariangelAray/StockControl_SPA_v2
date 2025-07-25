import { initComponentes } from "../../../helpers/initComponentes";
import {limpiarModales  }from "../../../modals/modalsController";

export default async () => {
    if (!initComponentes()) return; 

    limpiarModales();
    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').removeAttribute('id'); 
    document.querySelector('.dashboard').id = "dashboard-ambientes";
};
