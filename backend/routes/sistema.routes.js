const express = require('express');
const router = express.Router();
const transaccionesRecurrentesController = require('../controllers/transacciones-recurrentes.controller');
const { authMiddleware: authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { cronAuthMiddleware } = require('../middlewares/cronAuth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { createRecurrenteSchema } = require('../validators/finanzas.validator');

// ============= RUTAS DE TRANSACCIONES RECURRENTES =============
router.get('/recurrentes', authenticateToken, transaccionesRecurrentesController.obtenerTransaccionesRecurrentes);
router.post(
  '/recurrentes',
  authenticateToken,
  validateBody(createRecurrenteSchema),
  transaccionesRecurrentesController.crearTransaccionRecurrente
);
router.put('/recurrentes/:id', authenticateToken, transaccionesRecurrentesController.actualizarTransaccionRecurrente);
router.delete('/recurrentes/:id', authenticateToken, transaccionesRecurrentesController.eliminarTransaccionRecurrente);
router.put('/recurrentes/:id/toggle', authenticateToken, transaccionesRecurrentesController.toggleTransaccionRecurrente);
// Forzar ahora (usuario autenticado, solo sus recurrentes)
router.post('/recurrentes/ejecutar', authenticateToken, transaccionesRecurrentesController.ejecutarTransaccionesRecurrentes);
// Ejecución global (cron/worker) — header X-Cron-Secret
router.post(
  '/recurrentes/ejecutar-interno',
  cronAuthMiddleware,
  transaccionesRecurrentesController.ejecutarRecurrentesInterno
);
// Ejemplo de ruta admin (rol informativo + enforcement)
router.get(
  '/admin/health',
  authenticateToken,
  requireRole('ADMIN'),
  (req, res) => {
    res.json({ success: true, message: 'OK admin', userId: req.user.id });
  }
);

// ============= RUTAS DE NOTIFICACIONES =============
router.get('/notificaciones', authenticateToken, transaccionesRecurrentesController.obtenerNotificaciones);
router.post('/notificaciones', authenticateToken, transaccionesRecurrentesController.crearNotificacion);
router.put('/notificaciones/todas-leidas', authenticateToken, transaccionesRecurrentesController.marcarTodasLeidas);
router.put('/notificaciones/:id/leida', authenticateToken, transaccionesRecurrentesController.marcarComoLeida);
router.delete('/notificaciones/:id', authenticateToken, transaccionesRecurrentesController.eliminarNotificacion);

module.exports = router;
