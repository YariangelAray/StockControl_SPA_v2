import { initComponentes } from "../../helpers/initComponentes";
import { get } from "../../utils/api";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    initComponentes(usuario);
    
    const respuestaU = await get('usuarios');
    const respuestaA = await get('ambientes');
    const respuestaI = await get('inventarios');
    const respuestaT = await get('tipos-elementos');

    document.querySelector('.cant-usuarios').textContent = respuestaU.success ? respuestaU.data.length : 0;
    document.querySelector('.cant-ambientes').textContent = respuestaA.success ? respuestaA.data.length : 0;
    document.querySelector('.cant-inventarios').textContent = respuestaI.success ? respuestaI.data.length : 0;
    document.querySelector('.cant-tipos').textContent = respuestaT.success ? respuestaT.data.length : 0;
}