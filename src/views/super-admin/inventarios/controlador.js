import { initComponentes } from "../../../helpers/initComponentes";

export default async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    initComponentes(usuario);
}