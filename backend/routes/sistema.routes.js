const express = require('express');
const router = express.Router();
const transaccionesRecurrentesController = require('../controllers/transacciones-recurrentes.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');

// ============= RUTAS DE TRANSACCIONES RECURRENTES =============
router.get('/recurrentes', authenticateToken, transaccionesRecurrentesController.obtenerTransaccionesRecurrentes);
router.post('/recurrentes', authenticateToken, transaccionesRecurrentesController.crearTransaccionRecurrente);
router.put('/recurrentes/:id', authenticateToken, transaccionesRecurrentesController.actualizarTransaccionRecurrente);
router.delete('/recurrentes/:id', authenticateToken, transaccionesRecurrentesController.eliminarTransaccionRecurrente);
router.put('/recurrentes/:id/toggle', authenticateToken, transaccionesRecurrentesController.toggleTransaccionRecurrente);
router.post('/recurrentes/ejecutar', authenticateToken, transaccionesRecurrentesController.ejecutarTransaccionesRecurrentes);

// ============= RUTAS DE NOTIFICACIONES =============
router.get('/notificaciones', authenticateToken, transaccionesRecurrentesController.obtenerNotificaciones);
router.post('/notificaciones', authenticateToken, transaccionesRecurrentesController.crearNotificacion);
router.put('/notificaciones/todas-leidas', authenticateToken, transaccionesRecurrentesController.marcarTodasLeidas);
router.put('/notificaciones/:id/leida', authenticateToken, transaccionesRecurrentesController.marcarComoLeida);
router.delete('/notificaciones/:id', authenticateToken, transaccionesRecurrentesController.eliminarNotificacion);

module.exports = router;
