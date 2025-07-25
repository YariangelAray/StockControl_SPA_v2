import { initComponentes } from "../../helpers/initComponentes";

export default async () => {

    if (!initComponentes()) return; 

    document.querySelector('.dashboard').className = "dashboard";
    document.querySelector('.dashboard').classList.add('dashboard--error');
}