const express = require('express');
const router = express.Router();
const finanzasAvanzadasController = require('../controllers/finanzas-avanzadas.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');

// ============= RUTAS DE CUENTAS =============
router.get('/cuentas', authenticateToken, finanzasAvanzadasController.obtenerCuentas);
router.post('/cuentas', authenticateToken, finanzasAvanzadasController.crearCuenta);
router.put('/cuentas/:id/saldo', authenticateToken, finanzasAvanzadasController.actualizarSaldo);

// ============= RUTAS DE INVERSIONES =============
router.get('/inversiones', authenticateToken, finanzasAvanzadasController.obtenerInversiones);
router.post('/inversiones', authenticateToken, finanzasAvanzadasController.crearInversion);

// ============= RUTAS DE DEUDAS =============
router.get('/deudas', authenticateToken, finanzasAvanzadasController.obtenerDeudas);
router.post('/deudas/:deudaId/pagos', authenticateToken, finanzasAvanzadasController.registrarPagoDeuda);

// ============= RUTAS DE GAMIFICACIÓN =============
router.get('/logros', authenticateToken, finanzasAvanzadasController.obtenerLogrosUsuario);
router.post('/logros/verificar', authenticateToken, finanzasAvanzadasController.verificarLogros);

module.exports = router;
