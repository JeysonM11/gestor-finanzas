const express = require('express');
const router = express.Router();
const transaccionesRecurrentesController = require('../controllers/transacciones-recurrentes.controller');
const recordatorioController = require('../controllers/recordatorio.controller');
const { authMiddleware: authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { cronAuthMiddleware } = require('../middlewares/cronAuth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const {
  createRecurrenteSchema,
  updateRecurrenteSchema,
} = require('../validators/finanzas.validator');
const {
  createRecordatorioSchema,
  updateRecordatorioSchema,
} = require('../validators/recordatorio.validator');

// ============= RUTAS DE TRANSACCIONES RECURRENTES =============
router.get('/recurrentes', authenticateToken, transaccionesRecurrentesController.obtenerTransaccionesRecurrentes);
router.post(
  '/recurrentes',
  authenticateToken,
  validateBody(createRecurrenteSchema),
  transaccionesRecurrentesController.crearTransaccionRecurrente
);
router.put(
  '/recurrentes/:id',
  authenticateToken,
  validateBody(updateRecurrenteSchema),
  transaccionesRecurrentesController.actualizarTransaccionRecurrente
);
router.delete('/recurrentes/:id', authenticateToken, transaccionesRecurrentesController.eliminarTransaccionRecurrente);
router.put('/recurrentes/:id/toggle', authenticateToken, transaccionesRecurrentesController.toggleTransaccionRecurrente);
router.post('/recurrentes/ejecutar', authenticateToken, transaccionesRecurrentesController.ejecutarTransaccionesRecurrentes);
router.post(
  '/recurrentes/ejecutar-interno',
  cronAuthMiddleware,
  transaccionesRecurrentesController.ejecutarRecurrentesInterno
);
router.get(
  '/admin/health',
  authenticateToken,
  requireRole('ADMIN'),
  (req, res) => {
    res.json({ success: true, message: 'OK admin', userId: req.user.id });
  }
);

// ============= RUTAS DE RECORDATORIOS =============
// ejecutar antes de /:id para no capturar "ejecutar" como id
router.post(
  '/recordatorios/ejecutar',
  authenticateToken,
  recordatorioController.ejecutarRecordatoriosUsuario
);
router.post(
  '/recordatorios/ejecutar-interno',
  cronAuthMiddleware,
  recordatorioController.ejecutarRecordatoriosInterno
);
router.get('/recordatorios', authenticateToken, recordatorioController.obtenerRecordatorios);
router.get('/recordatorios/:id', authenticateToken, recordatorioController.obtenerRecordatorio);
router.post(
  '/recordatorios',
  authenticateToken,
  validateBody(createRecordatorioSchema),
  recordatorioController.crearRecordatorio
);
router.put(
  '/recordatorios/:id/completar',
  authenticateToken,
  recordatorioController.completarRecordatorio
);
router.put(
  '/recordatorios/:id/reactivar',
  authenticateToken,
  recordatorioController.reactivarRecordatorio
);
router.put(
  '/recordatorios/:id',
  authenticateToken,
  validateBody(updateRecordatorioSchema),
  recordatorioController.actualizarRecordatorio
);
router.delete('/recordatorios/:id', authenticateToken, recordatorioController.eliminarRecordatorio);

// ============= RUTAS DE NOTIFICACIONES =============
router.get('/notificaciones', authenticateToken, transaccionesRecurrentesController.obtenerNotificaciones);
router.post('/notificaciones', authenticateToken, transaccionesRecurrentesController.crearNotificacion);
router.put('/notificaciones/todas-leidas', authenticateToken, transaccionesRecurrentesController.marcarTodasLeidas);
router.put('/notificaciones/:id/leida', authenticateToken, transaccionesRecurrentesController.marcarComoLeida);
router.delete('/notificaciones/:id', authenticateToken, transaccionesRecurrentesController.eliminarNotificacion);

module.exports = router;
