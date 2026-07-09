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
} = require('../validators/finanzas.validator');

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

// ============= RUTAS DE GAMIFICACION =============
router.get('/logros', authenticateToken, finanzasAvanzadasController.obtenerLogrosUsuario);
router.get('/logros/resumen', authenticateToken, finanzasAvanzadasController.obtenerResumenLogros);
router.get('/logros/historial', authenticateToken, finanzasAvanzadasController.obtenerHistorialPuntos);
router.post('/logros/verificar', authenticateToken, finanzasAvanzadasController.verificarLogros);

module.exports = router;
