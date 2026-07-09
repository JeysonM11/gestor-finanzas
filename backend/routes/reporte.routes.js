const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');

router.get('/mensual', authenticateToken, reporteController.generarReporteMensual);
router.get('/agregados', authenticateToken, reporteController.obtenerAgregados);
router.get('/export', authenticateToken, reporteController.exportarCSV);

module.exports = router;
