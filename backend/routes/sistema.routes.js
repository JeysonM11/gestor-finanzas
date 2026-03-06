const express = require('express');
const router = express.Router();
const transaccionesRecurrentesController = require('../controllers/transacciones-recurrentes.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');

// ============= RUTAS DE TRANSACCIONES RECURRENTES =============
router.get('/recurrentes', authenticateToken, transaccionesRecurrentesController.obtenerTransaccionesRecurrentes);
router.post('/recurrentes', authenticateToken, transaccionesRecurrentesController.crearTransaccionRecurrente);
router.post('/recurrentes/ejecutar', authenticateToken, transaccionesRecurrentesController.ejecutarTransaccionesRecurrentes);

// ============= RUTAS DE NOTIFICACIONES =============
router.get('/notificaciones', authenticateToken, transaccionesRecurrentesController.obtenerNotificaciones);
router.post('/notificaciones', authenticateToken, transaccionesRecurrentesController.crearNotificacion);
router.put('/notificaciones/:id/leida', authenticateToken, transaccionesRecurrentesController.marcarComoLeida);
router.put('/notificaciones/todas-leidas', authenticateToken, transaccionesRecurrentesController.marcarTodasLeidas);

module.exports = router;
