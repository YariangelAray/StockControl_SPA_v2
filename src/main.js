import { router } from './routes/router';
import './style.css';
import './helpers/style.js';
import 'remixicon/fonts/remixicon.css';
import { initModales } from './modals/modalsController.js';
import { marcarItem } from './helpers/marcarItem.js';

// initModales([
//   'modalCodigoAcceso',
//   'modalConfigurarCodigo',
//   'modalConfirmacion',
//   'modalElemento',
//   'modalEliminarCuenta',
//   'modalGenerarReporte',
//   'modalPedirCodigoAcceso',
//   'modalReporte',
//   'modalTipoElemento'
// ]);

window.addEventListener('hashchange', async (e) => {
  router();
  marcarItem();
})

window.addEventListener('DOMContentLoaded', async () => {
  router();
  marcarItem();
})

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (e) => e.preventDefault());
});