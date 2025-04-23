const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccion.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// Rutas de transacciones
router.get('/', authenticateToken, transaccionController.obtenerTransacciones); // /api/transacciones
router.post('/', authenticateToken, transaccionController.crearTransaccion);      // /api/transacciones
router.get('/:id', authenticateToken, transaccionController.obtenerTransaccionPorId); // /api/transacciones/:id
router.put('/:id', authenticateToken, transaccionController.actualizarTransaccion);   // /api/transacciones/:id
router.delete('/:id', authenticateToken, transaccionController.eliminarTransaccion); // /api/transacciones/:id

module.exports = router;
