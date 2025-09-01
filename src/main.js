import { router } from './routes/router.js';
import './style.css';
import './helpers/style.js';
import 'remixicon/fonts/remixicon.css';


window.addEventListener('hashchange', async (e) => {
  router();  
})

window.addEventListener('DOMContentLoaded', async () => {
  router();
})