import inicio from '../views/auth/inicio/controlador.js';
import registro from '../views/auth/registro/controlador.js';

import inventarios from '../views/inventarios/controlador.js';
import ambientes from '../views/inventarios/ambientes/controlador.js';
import mapa from '../views/compartidas/mapas/controlador.js';
import detalles from '../views/inventarios/detalles/controlador.js';
import elementos from '../views/inventarios/elementos/controlador.js';
import reportes from '../views/inventarios/reportes/controlador.js';
import reporteDetalles from '../views/inventarios/reportes/reporte.js';

import tiposelementos from '../views/compartidas/tipos-elementos/controlador.js';
import perfil from '../views/perfil-usuario/controlador.js';

import superAdmin from '../views/super-admin/controlador.js';
import ambiente from '../views/super-admin/ambientesGestion/ambiente.js';
import gestionUsuarios from '../views/super-admin/usuariosGestion/controlador.js';
import gestionInventarios from '../views/super-admin/inventariosGestion/controlador.js';
import gestionAmbientes from '../views/super-admin/ambientesGestion/controlador.js';

export const routes = {
  inicio: {
    path: 'auth/inicio/index.html',
    controller: inicio,
    meta: { public: true, noLayout: true }
  },
  registro: {
    path: 'auth/registro/index.html',
    controller: registro,
    meta: { public: true, noLayout: true }
  },
  inventarios: {
    "/": {
      path: 'inventarios/index.html',
      controller: inventarios,
      meta: { can: ['inventario.view-own', 'inventarios.index'] }
    },
    ambientes: {
      "/": {
        path: 'inventarios/ambientes/index.html',
        controller: ambientes,
        meta: { can: 'ambiente.view-card', requiresInventory: true }
      },
      mapa: {
        path: 'compartidas/mapas/index.html',
        controller: mapa,
        meta: { can: 'ambiente.view', requiresInventory: true }
      }
    },
    detalles: {
      path: 'inventarios/detalles/index.html',
      controller: detalles,
      meta: { can: 'inventario.view-own', requiresInventory: true }
    },
    elementos: {
      "/": {
        path: 'inventarios/elementos/index.html',
        controller: elementos,
        meta: { can: 'elemento.view-inventory-own', requiresInventory: true }
      },
      crear: {
        path: 'inventarios/elementos/index.html',
        controller: elementos,
        meta: { can: 'elemento.create-inventory-own', requiresInventory: true, modal: true}
      },
      detalles: {
        path: 'inventarios/elementos/index.html',
        controller: elementos,
        meta: { can: 'elemento.view-inventory-own', requiresInventory: true, modal: true }
      },
      editar: {
        path: 'inventarios/elementos/index.html',
        controller: elementos,
        meta: { can: 'elemento.update-inventory-own', requiresInventory: true, modal: true }
      },
      reportar: {
        path: 'inventarios/elementos/index.html',
        controller: elementos,
        meta: { can: 'reporte.create', requiresInventory: true, modal: true }
      },
      "tipos-elementos": {
        "/": {
          path: 'compartidas/tipos-elementos/index.html',
          controller: tiposelementos,
          meta: { can: 'tipo-elemento.view-inventory-own', requiresInventory: true }
        },
        crear: {
          path: 'compartidas/tipos-elementos/index.html',
          controller: tiposelementos,
          meta: { can: 'tipo-elemento.create', requiresInventory: true, modal: true }
        },
        detalles: {
          path: 'compartidas/tipos-elementos/index.html',
          controller: tiposelementos,
          meta: { can: 'tipo-elemento.view-inventory-own', requiresInventory: true, modal: true }
        },
        editar: {
          path: 'compartidas/tipos-elementos/index.html',
          controller: tiposelementos,
          meta: { can: 'tipo-elemento.update', requiresInventory: true, modal: true }
        },
      }
    },
    reportes: {
      "/": {
        path: 'inventarios/reportes/index.html',
        controller: reportes,
        meta: { can: 'reporte.view-inventory-own', requiresInventory: true}
      },
      detalles: {
        path: 'modalReporte',
        controller: reporteDetalles,
        meta: { can: 'reporte.view-inventory-own', requiresInventory: true, modal: true}
      },
    }
  },
  "perfil-usuario": {
    path: 'perfil-usuario/index.html',
    controller: perfil,
    meta: { can: 'usuario.view-own' }
  },
  "super-admin": {
    "/": {
      path: 'super-admin/index.html',
      controller: superAdmin,
      meta: { can: 'superadmin.access-home' }
    },
    usuarios: {
      "/": {
        path: 'super-admin/usuariosGestion/index.html',
        controller: gestionUsuarios,
        meta: { can: 'usuario.view' }
      },
      crear: {
        path: 'super-admin/usuariosGestion/index.html',
        controller: gestionUsuarios,
        meta: { can: 'usuario.create', modal: true }
      },
      detalles: {
        path: 'super-admin/usuariosGestion/index.html',
        controller: gestionUsuarios,
        meta: { can: 'usuario.view', modal: true }
      },
      editar: {
        path: 'super-admin/usuariosGestion/index.html',
        controller: gestionUsuarios,
        meta: { can: 'usuario.update', modal: true }
      },
    },
    ambientes: {
      "/": {
        path: 'super-admin/ambientesGestion/index.html',
        controller: gestionAmbientes,
        meta: { can: 'ambiente.view' }
      },
      crear: {
        path: 'modalAmbiente',
        controller: ambiente.crear,
        meta: { can: 'ambiente.create', modal: true }
      },
      detalles: {
        path: 'modalAmbiente',
        controller: ambiente.detalles,
        meta: { can: 'ambiente.view', modal: true, sameModal: true }
      },
      editar: {
        path: 'modalAmbiente',
        controller: ambiente.editar,
        meta: { can: 'ambiente.update', modal: true, sameModal: true }
      },
      mapa: {
        path: 'compartidas/mapas/index.html',
        controller: mapa,
        meta: { can: 'ambiente.view' }
      }
    },
    inventarios: {
      "/": {
        path: 'super-admin/inventariosGestion/index.html',
        controller: gestionInventarios,
        meta: { can: 'inventario.view' },
      },
      crear: {
        path: 'super-admin/inventariosGestion/index.html',
        controller: gestionInventarios,
        meta: { can: 'inventario.create', modal: true },
      },
      detalles: {
        path: 'super-admin/inventariosGestion/index.html',
        controller: gestionInventarios,
        meta: { can: 'inventario.view', modal: true },
      },
      editar: {
        path: 'super-admin/inventariosGestion/index.html',
        controller: gestionInventarios,
        meta: { can: 'inventario.update', modal: true },
      },
    },
    "tipos-elementos": {
      "/": {
        path: 'compartidas/tipos-elementos/index.html',
        controller: tiposelementos,
        meta: { can: 'tipo-elemento.view' }
      },
      crear: {
        path: 'compartidas/tipos-elementos/index.html',
        controller: tiposelementos,
        meta: { can: 'tipo-elemento.create', modal: true }
      },
      detalles: {
        path: 'compartidas/tipos-elementos/index.html',
        controller: tiposelementos,
        meta: { can: 'tipo-elemento.view', modal: true }
      },
      detalles: {
        path: 'compartidas/tipos-elementos/index.html',
        controller: tiposelementos,
        meta: { can: 'tipo-elemento.update', modal: true }
      },
    }
  }
};
