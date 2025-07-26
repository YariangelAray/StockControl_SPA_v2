import { initComponentes } from "../../helpers/initComponentes";

export default async () => {

    const usuario = JSON.parse(localStorage.getItem('usuario'));
initComponentes(usuario); 

    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').classList.add('dashboard--error');

    const header = document.querySelector('.header__title');
    
    header.innerHTML = '...';
}