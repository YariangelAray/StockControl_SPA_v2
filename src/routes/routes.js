import inicio from '../views/auth/inicio/controlador';
import registro from '../views/auth/registro/controlador';
import inventarios from '../views/inventarios/controlador';
import ambientes from '../views/inventarios/ambientes/controlador';
import detalles from '../views/inventarios/detalles/controlador';
import elementos from '../views/inventarios/elementos/controlador';
import tiposelementos from '../views/inventarios/elementos/tipos-elementos/controlador';
import reportes from '../views/inventarios/reportes/controlador';
import perfil from '../views/perfil-usuario/controlador';

export const routes = {
    inicio:{
        path: 'auth/inicio/index.html',
        controller: inicio,
        public: true,
        nolayout: true
    },
    registro:{
        path: 'auth/registro/index.html',
        controller: registro,
        public: true,
        nolayout: true
    },
    inventarios: {
        "/": {
            path: 'inventarios/index.html',
            controller: inventarios,
        },
        ambientes: {
            path: 'inventarios/ambientes/index.html',
            controller: ambientes,
        },
        detalles: {
            path: 'inventarios/detalles/index.html',
            controller: detalles,
        },
        elementos: {
            "/": {
                path: 'inventarios/elementos/index.html',
                controller: elementos,
            },
            "tipos-elementos": {
                path: 'inventarios/elementos/tipos-elementos/index.html',
                controller: tiposelementos,
            }
        },
        reportes: {
            path: 'inventarios/reportes/index.html',
            controller: reportes,
        },
    },
    "perfil-usuario": {
        path: 'perfil-usuario/index.html',
        controller: perfil,
    }
};