// Importación de controladores de autenticación
import inicio from '../views/auth/inicio/controlador.js';
import registro from '../views/auth/registro/controlador.js';

// Importación de controladores de inventarios
import inventarios from '../views/inventarios/controlador.js';
import ambientes from '../views/inventarios/ambientes/controlador.js';
import mapa from '../views/compartidas/mapas/controlador.js';
import detalles from '../views/inventarios/detalles/controlador.js';
import elementos from '../views/inventarios/elementos/controlador.js';
import elemento from '../views/inventarios/elementos/elemento.js';
import reportes from '../views/inventarios/reportes/controlador.js';
import reporteDetalles from '../views/inventarios/reportes/reporte.js';

// Importación de controladores compartidos
import tiposElementos from '../views/compartidas/tipos-elementos/controlador.js';
import tipoElemento from '../views/compartidas/tipos-elementos/tipos-elementos.js';
import perfil from '../views/perfil-usuario/controlador.js';

// Importación de controladores de super admin
import superAdmin from '../views/super-admin/controlador.js';
import gestionUsuarios from '../views/super-admin/usuariosGestion/controlador.js';
import usuario from '../views/super-admin/usuariosGestion/usuario.js';
import gestionInventarios from '../views/super-admin/inventariosGestion/controlador.js';
import inventario from '../views/super-admin/inventariosGestion/inventario.js';
import gestionAmbientes from '../views/super-admin/ambientesGestion/controlador.js';
import ambiente from '../views/super-admin/ambientesGestion/ambiente.js';

/**
 * Objeto de configuración de rutas de la aplicación
 * Estructura jerárquica que define rutas, controladores y metadatos
 */
export const routes = {
  // === RUTAS DE AUTENTICACIÓN ===
  // Página de inicio de sesión
  inicio: {
    path: 'auth/inicio/index.html', // Ruta del archivo HTML
    controller: inicio, // Controlador asociado
    meta: { public: true, noLayout: true } // Ruta pública sin layout
  },
  // Página de registro de usuarios
  registro: {
    path: 'auth/registro/index.html',
    controller: registro,
    meta: { public: true, noLayout: true }
  },

  // === MÓDULO DE INVENTARIOS ===
  inventarios: {
    // Página principal de inventarios
    "/": {
      path: 'inventarios/index.html',
      controller: inventarios,
      // Permisos: ver inventarios propios o con acceso
      meta: { can: ['inventario.view-own', 'inventario.view-access-own'] }
    },

    // === SUBMÓDULO DE AMBIENTES ===
    ambientes: {
      // Lista de ambientes
      "/": {
        path: 'inventarios/ambientes/index.html',
        controller: ambientes,
        meta: { can: 'ambiente.view-card', requiresInventory: true }
      },
      // Mapa de ambientes
      mapa: {
        path: 'compartidas/mapas/index.html',
        controller: mapa,
        meta: { can: 'ambiente.view-card', requiresInventory: true }
      }
    },

    // Detalles del inventario seleccionado
    detalles: {
      path: 'inventarios/detalles/index.html',
      controller: detalles,
      meta: { can: 'inventario.view-own', requiresInventory: true }
    },

    // === SUBMÓDULO DE ELEMENTOS ===
    elementos: {
      // Lista de elementos del inventario
      "/": {
        path: 'inventarios/elementos/index.html',
        controller: elementos,
        meta: { can: ['elemento.view-inventory-own', 'elemento.view-inventory-access'], requiresInventory: true }
      },
      // Modal para crear elemento
      crear: {
        path: 'modalElemento',
        controller: elemento.crear,
        meta: { can: 'elemento.create-inventory-own', requiresInventory: true, modal: true }
      },
      // Modal para ver detalles del elemento
      detalles: {
        path: 'modalElemento',
        controller: elemento.detalles,
        meta: { can: ['elemento.view-inventory-own', 'elemento.view-inventory-access'], requiresInventory: true, modal: true, sameModal: true }
      },
      // Modal para editar elemento
      editar: {
        path: 'modalElemento',
        controller: elemento.editar,
        meta: { can: ['elemento.update-inventory-own', 'elemento.update-inventory-access'], requiresInventory: true, modal: true, sameModal: true }
      },
      // Modal para generar reporte de elemento
      reportar: {
        path: 'modalGenerarReporte',
        controller: elemento.reportar,
        meta: { can: ['reporte.create', 'reporte.create-inventory-access'], requiresInventory: true, modal: true }
      },

      // === SUBMÓDULO DE TIPOS DE ELEMENTOS ===
      "tipos-elementos": {
        // Lista de tipos de elementos
        "/": {
          path: 'compartidas/tipos-elementos/index.html',
          controller: tiposElementos,
          meta: { can: 'tipo-elemento.view-inventory-own', requiresInventory: true }
        },
        // Modal para crear tipo de elemento
        crear: {
          path: 'modalTipoElemento',
          controller: tipoElemento.crear,
          meta: { can: 'tipo-elemento.create', requiresInventory: true, modal: true }
        },
        // Modal para ver detalles del tipo de elemento
        detalles: {
          path: 'modalTipoElemento',
          controller: tipoElemento.detalles,
          meta: { can: 'tipo-elemento.view-inventory-own', requiresInventory: true, modal: true, sameModal: true }
        },
        // Modal para editar tipo de elemento
        editar: {
          path: 'modalTipoElemento',
          controller: tipoElemento.editar,
          meta: { can: 'tipo-elemento.update', requiresInventory: true, modal: true, sameModal: true }
        },
      }
    },

    // === SUBMÓDULO DE REPORTES ===
    reportes: {
      // Lista de reportes del inventario
      "/": {
        path: 'inventarios/reportes/index.html',
        controller: reportes,
        meta: { can: 'reporte.view-inventory-own', requiresInventory: true }
      },
      // Modal para ver detalles del reporte
      detalles: {
        path: 'modalReporte',
        controller: reporteDetalles,
        meta: { can: 'reporte.view-inventory-own', requiresInventory: true, modal: true }
      },
    }
  },

  // === PERFIL DE USUARIO ===
  "perfil-usuario": {
    path: 'perfil-usuario/index.html',
    controller: perfil,
    meta: { can: 'usuario.view-own' } // Solo puede ver su propio perfil
  },

  // === MÓDULO SUPER ADMIN ===
  "super-admin": {
    // Dashboard principal del super admin
    "/": {
      path: 'super-admin/index.html',
      controller: superAdmin,
      meta: { can: 'superadmin.access-home' }
    },

    // === GESTIÓN DE USUARIOS ===
    usuarios: {
      // Lista de usuarios del sistema
      "/": {
        path: 'super-admin/usuariosGestion/index.html',
        controller: gestionUsuarios,
        meta: { can: 'usuario.view' }
      },
      // Modal para crear usuario
      crear: {
        path: 'modalUsuario',
        controller: usuario.crear,
        meta: { can: 'usuario.create', modal: true }
      },
      // Modal para ver detalles del usuario
      detalles: {
        path: 'modalUsuario',
        controller: usuario.detalles,
        meta: { can: 'usuario.view', modal: true, sameModal: true }
      },
      // Modal para editar usuario
      editar: {
        path: 'modalUsuario',
        controller: usuario.editar,
        meta: { can: 'usuario.update', modal: true, sameModal: true }
      },
    },

    // === GESTIÓN DE AMBIENTES ===
    ambientes: {
      // Lista de ambientes del sistema
      "/": {
        path: 'super-admin/ambientesGestion/index.html',
        controller: gestionAmbientes,
        meta: { can: 'ambiente.view' }
      },
      // Modal para crear ambiente
      crear: {
        path: 'modalAmbiente',
        controller: ambiente.crear,
        meta: { can: 'ambiente.create', modal: true }
      },
      // Modal para ver detalles del ambiente
      detalles: {
        path: 'modalAmbiente',
        controller: ambiente.detalles,
        meta: { can: 'ambiente.view', modal: true, sameModal: true }
      },
      // Modal para editar ambiente
      editar: {
        path: 'modalAmbiente',
        controller: ambiente.editar,
        meta: { can: 'ambiente.update', modal: true, sameModal: true }
      },
      // Mapa de ambientes (vista general)
      mapa: {
        path: 'compartidas/mapas/index.html',
        controller: mapa,
        meta: { can: 'ambiente.view' }
      }
    },

    // === GESTIÓN DE INVENTARIOS ===
    inventarios: {
      // Lista de inventarios del sistema
      "/": {
        path: 'super-admin/inventariosGestion/index.html',
        controller: gestionInventarios,
        meta: { can: 'inventario.view' },
      },
      // Modal para crear inventario
      crear: {
        path: 'modalInventario',
        controller: inventario.crear,
        meta: { can: 'inventario.create', modal: true },
      },
      // Modal para ver detalles del inventario
      detalles: {
        path: 'modalInventario',
        controller: inventario.detalles,
        meta: { can: 'inventario.view', modal: true, sameModal: true },
      },
      // Modal para editar inventario
      editar: {
        path: 'modalInventario',
        controller: inventario.editar,
        meta: { can: 'inventario.update', modal: true, sameModal: true },
      },
    },

    // === GESTIÓN DE TIPOS DE ELEMENTOS (SUPER ADMIN) ===
    "tipos-elementos": {
      // Lista global de tipos de elementos
      "/": {
        path: 'compartidas/tipos-elementos/index.html',
        controller: tiposElementos,
        meta: { can: 'tipo-elemento.view' }
      },
      // Modal para crear tipo de elemento global
      crear: {
        path: 'modalTipoElemento',
        controller: tipoElemento.crear,
        meta: { can: 'tipo-elemento.create', modal: true }
      },
      // Modal para ver detalles del tipo de elemento
      detalles: {
        path: 'modalTipoElemento',
        controller: tipoElemento.detalles,
        meta: { can: 'tipo-elemento.view', modal: true, sameModal: true }
      },
      // Modal para editar tipo de elemento
      editar: {
        path: 'modalTipoElemento',
        controller: tipoElemento.editar,
        meta: { can: 'tipo-elemento.update', modal: true, sameModal: true }
      },
    }
  }
};