import inicio from '../views/auth/inicio/controlador';
import registro from '../views/auth/registro/controlador';

import inventarios from '../views/inventarios/controlador';
import ambientes from '../views/inventarios/ambientes/controlador';
import { initMapaView } from '../views/inventarios/ambientes/mapaController.js';
import detalles from '../views/inventarios/detalles/controlador';
import elementos from '../views/inventarios/elementos/controlador';
import reportes from '../views/inventarios/reportes/controlador';

import tiposelementos from '../views/compartidas/tipos-elementos/controlador.js';
import perfil from '../views/perfil-usuario/controlador';

import superAdmin from '../views/super-admin/controlador.js';
import gestionUsuarios from '../views/super-admin/usuariosGestion/controlador.js';
import gestionInventarios from '../views/super-admin/inventariosGestion/controlador.js';
import gestionAmbientes from '../views/super-admin/ambientesGestion/controlador.js';

export const routes = {
  inicio: {
    path: 'auth/inicio/index.html',
    controller: inicio,
    meta: { public: true, nolayout: true }
  },
  registro: {
    path: 'auth/registro/index.html',
    controller: registro,
    meta: { public: true, nolayout: true }
  },
  inventarios: {
    "/": {
      path: 'inventarios/index.html',
      controller: inventarios,
      meta: { rolesPermitidos: [2, 3] }
    },
    ambientes: {
      "/": {
        path: 'inventarios/ambientes/index.html',
        controller: ambientes,
        meta: { rolesPermitidos: [2, 3] }
      },
      mapa: {
        path: 'inventarios/ambientes/mapa.html',
        controller: initMapaView
      }
    },
    detalles: {
      path: 'inventarios/detalles/index.html',
      controller: detalles,
      meta: { rolesPermitidos: [2] }
    },
    elementos: {
      "/": {
        path: 'inventarios/elementos/index.html',
        controller: elementos,
        meta: { rolesPermitidos: [2, 3] }        
      },
      "tipos-elementos": {
        path: 'compartidas/tipos-elementos/index.html',
        controller: tiposelementos,
        meta: { rolesPermitidos: [2] }
      }
    },
    reportes: {
      path: 'inventarios/reportes/index.html',
      controller: reportes,
      meta: { rolesPermitidos: [2] }
    }
  },
  "perfil-usuario": {
    path: 'perfil-usuario/index.html',
    controller: perfil,
    meta: { rolesPermitidos: [1, 2, 3] }
  },
  "super-admin": {
    "/": {
      path: 'super-admin/index.html',
      controller: superAdmin,
      meta: { rolesPermitidos: [1] }
    },
    usuarios: {
      path: 'super-admin/usuariosGestion/index.html',
      controller: gestionUsuarios,
      meta: { rolesPermitidos: [1] }
    },
    ambientes: {
      path: 'super-admin/ambientesGestion/index.html',
      controller: gestionAmbientes,
      meta: { rolesPermitidos: [1] }
    },
    inventarios: {
      path: 'super-admin/inventariosGestion/index.html',
      controller: gestionInventarios,
      meta: { rolesPermitidos: [1] },
    },
    "tipos-elementos": {
      path: 'compartidas/tipos-elementos/index.html',
      controller: tiposelementos,
      meta: { rolesPermitidos: [1] }
    }
  }
};
