import inicio from '../views/auth/inicio/controlador.js';
import registro from '../views/auth/registro/controlador.js';

import inventarios from '../views/inventarios/controlador.js';
import ambientes from '../views/inventarios/ambientes/controlador.js';
import mapa from '../views/compartidas/mapas/controlador.js';
import detalles from '../views/inventarios/detalles/controlador.js';
import elementos from '../views/inventarios/elementos/controlador.js';
import elemento from '../views/inventarios/elementos/elemento.js';
import reportes from '../views/inventarios/reportes/controlador.js';
import reporteDetalles from '../views/inventarios/reportes/reporte.js';

import tiposElementos from '../views/compartidas/tipos-elementos/controlador.js';
import tipoElemento from '../views/compartidas/tipos-elementos/tipos-elementos.js';
import perfil from '../views/perfil-usuario/controlador.js';

import superAdmin from '../views/super-admin/controlador.js';
import gestionUsuarios from '../views/super-admin/usuariosGestion/controlador.js';
import usuario from '../views/super-admin/usuariosGestion/usuario.js';
import gestionInventarios from '../views/super-admin/inventariosGestion/controlador.js';
import inventario from '../views/super-admin/inventariosGestion/inventario.js';
import gestionAmbientes from '../views/super-admin/ambientesGestion/controlador.js';
import ambiente from '../views/super-admin/ambientesGestion/ambiente.js';

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
        path: 'modalElemento',
        controller: elemento.crear,
        meta: { can: 'elemento.create-inventory-own', requiresInventory: true, modal: true }
      },
      detalles: {
        path: 'modalElemento',
        controller: elemento.detalles,
        meta: { can: 'elemento.view-inventory-own', requiresInventory: true, modal: true, sameModal: true }
      },
      editar: {
        path: 'modalElemento',
        controller: elemento.editar,
        meta: { can: 'elemento.update-inventory-own', requiresInventory: true, modal: true, sameModal: true }
      },
      reportar: {
        path: 'modalGenerarReporte',
        controller: elemento.reportar,
        meta: { can: 'reporte.create', requiresInventory: true, modal: true }
      },
      "tipos-elementos": {
        "/": {
          path: 'compartidas/tipos-elementos/index.html',
          controller: tiposElementos,
          meta: { can: 'tipo-elemento.view-inventory-own', requiresInventory: true }
        },
        crear: {
          path: 'modalTipoElemento',
          controller: tipoElemento.crear,
          meta: { can: 'tipo-elemento.create', requiresInventory: true, modal: true }
        },
        detalles: {
          path: 'modalTipoElemento',
          controller: tipoElemento.detalles,
          meta: { can: 'tipo-elemento.view-inventory-own', requiresInventory: true, modal: true, sameModal: true }
        },
        editar: {
          path: 'modalTipoElemento',
          controller: tipoElemento.editar,
          meta: { can: 'tipo-elemento.update', requiresInventory: true, modal: true, sameModal: true }
        },
      }
    },
    reportes: {
      "/": {
        path: 'inventarios/reportes/index.html',
        controller: reportes,
        meta: { can: 'reporte.view-inventory-own', requiresInventory: true }
      },
      detalles: {
        path: 'modalReporte',
        controller: reporteDetalles,
        meta: { can: 'reporte.view-inventory-own', requiresInventory: true, modal: true }
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
        path: 'modalUsuario',
        controller: usuario.crear,
        meta: { can: 'usuario.create', modal: true }
      },
      detalles: {
        path: 'modalUsuario',
        controller: usuario.detalles,
        meta: { can: 'usuario.view', modal: true, sameModal: true }
      },
      editar: {
        path: 'modalUsuario',
        controller: usuario.editar,
        meta: { can: 'usuario.update', modal: true, sameModal: true }
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
        path: 'modalInventario',
        controller: inventario.crear,
        meta: { can: 'inventario.create', modal: true },
      },
      detalles: {
        path: 'modalInventario',
        controller: inventario.detalles,
        meta: { can: 'inventario.view', modal: true, sameModal: true },
      },
      editar: {
        path: 'modalInventario',
        controller: inventario.editar,
        meta: { can: 'inventario.update', modal: true, sameModal: true },
      },
    },
    "tipos-elementos": {
      "/": {
        path: 'compartidas/tipos-elementos/index.html',
        controller: tiposElementos,
        meta: { can: 'tipo-elemento.view' }
      },
      crear: {
        path: 'modalTipoElemento',
        controller: tipoElemento.crear,
        meta: { can: 'tipo-elemento.create', modal: true }
      },
      detalles: {
        path: 'modalTipoElemento',
        controller: tipoElemento.detalles,
        meta: { can: 'tipo-elemento.view', modal: true, sameModal: true }
      },
      editar: {
        path: 'modalTipoElemento',
        controller: tipoElemento.editar,
        meta: { can: 'tipo-elemento.update', modal: true, sameModal: true }
      },
    }
  }
};
