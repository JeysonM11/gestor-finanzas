const express = require('express');
const router = express.Router();
const finanzasAvanzadasController = require('../controllers/finanzas-avanzadas.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const {
  createCuentaSchema,
  updateSaldoSchema,
  createInversionSchema,
  createDeudaSchema,
  createMetaSchema,
  aporteMetaSchema,
  createPresupuestoSchema,
} = require('../validators/finanzas.validator');
const metaController = require('../controllers/meta.controller');
const presupuestoController = require('../controllers/presupuesto.controller');
const asesorController = require('../controllers/asesor.controller');
const { generarPlanSchema } = require('../validators/asesor.validator');
const { asesorLimiter } = require('../middlewares/rateLimit.middleware');

// ============= RUTAS DE CUENTAS =============
router.get('/cuentas', authenticateToken, finanzasAvanzadasController.obtenerCuentas);
router.post(
  '/cuentas',
  authenticateToken,
  validateBody(createCuentaSchema),
  finanzasAvanzadasController.crearCuenta
);
router.put(
  '/cuentas/:id/saldo',
  authenticateToken,
  validateBody(updateSaldoSchema),
  finanzasAvanzadasController.actualizarSaldo
);
router.delete('/cuentas/:id', authenticateToken, finanzasAvanzadasController.eliminarCuenta);

// ============= RUTAS DE INVERSIONES =============
router.get('/inversiones', authenticateToken, finanzasAvanzadasController.obtenerInversiones);
router.post(
  '/inversiones',
  authenticateToken,
  validateBody(createInversionSchema),
  finanzasAvanzadasController.crearInversion
);
router.put('/inversiones/:id', authenticateToken, finanzasAvanzadasController.actualizarInversion);
router.delete('/inversiones/:id', authenticateToken, finanzasAvanzadasController.eliminarInversion);

// ============= RUTAS DE DEUDAS =============
router.get('/deudas', authenticateToken, finanzasAvanzadasController.obtenerDeudas);
router.post(
  '/deudas',
  authenticateToken,
  validateBody(createDeudaSchema),
  finanzasAvanzadasController.crearDeuda
);
router.put('/deudas/:id', authenticateToken, finanzasAvanzadasController.actualizarDeuda);
router.delete('/deudas/:id', authenticateToken, finanzasAvanzadasController.eliminarDeuda);
router.post('/deudas/:deudaId/pagos', authenticateToken, finanzasAvanzadasController.registrarPagoDeuda);

// ============= RUTAS DE METAS =============
router.get('/metas', authenticateToken, metaController.obtenerMetas);
router.get('/metas/:id', authenticateToken, metaController.obtenerMetaPorId);
router.post(
  '/metas',
  authenticateToken,
  validateBody(createMetaSchema),
  metaController.crearMeta
);
router.put('/metas/:id', authenticateToken, metaController.actualizarMeta);
router.post(
  '/metas/:id/aportar',
  authenticateToken,
  validateBody(aporteMetaSchema),
  metaController.aportarMeta
);
router.delete('/metas/:id', authenticateToken, metaController.eliminarMeta);

// ============= RUTAS DE PRESUPUESTOS =============
router.get('/presupuestos', authenticateToken, presupuestoController.obtenerPresupuestos);
router.post(
  '/presupuestos/sincronizar',
  authenticateToken,
  presupuestoController.sincronizarPresupuestos
);
router.post(
  '/presupuestos',
  authenticateToken,
  validateBody(createPresupuestoSchema),
  presupuestoController.crearPresupuesto
);
router.put('/presupuestos/:id', authenticateToken, presupuestoController.actualizarPresupuesto);
router.delete('/presupuestos/:id', authenticateToken, presupuestoController.eliminarPresupuesto);

// ============= RUTAS DEL ASESOR IA (v1.3) =============
router.post(
  '/asesor/generar',
  authenticateToken,
  asesorLimiter,
  validateBody(generarPlanSchema),
  asesorController.generarPlan
);
router.get('/asesor/planes', authenticateToken, asesorController.listarPlanes);
router.get('/asesor/planes/:id', authenticateToken, asesorController.obtenerPlan);
router.get('/asesor/ultimo', authenticateToken, asesorController.ultimoPlan);

// ============= RUTAS DE GAMIFICACION =============
router.get('/logros', authenticateToken, finanzasAvanzadasController.obtenerLogrosUsuario);
router.get('/logros/resumen', authenticateToken, finanzasAvanzadasController.obtenerResumenLogros);
router.get('/logros/historial', authenticateToken, finanzasAvanzadasController.obtenerHistorialPuntos);
router.post('/logros/verificar', authenticateToken, finanzasAvanzadasController.verificarLogros);

module.exports = router;
