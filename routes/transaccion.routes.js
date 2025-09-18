const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccion.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { validateBody, validateQuery } = require('../middlewares/validation.middleware');
const { 
  createTransaccionSchema, 
  updateTransaccionSchema, 
  getTransaccionesSchema 
} = require('../validators/transaccion.validator');

// Rutas de transacciones
router.get('/', authenticateToken, validateQuery(getTransaccionesSchema), transaccionController.obtenerTransacciones); // /api/transacciones
router.post('/', authenticateToken, validateBody(createTransaccionSchema), transaccionController.crearTransaccion);      // /api/transacciones
router.get('/:id', authenticateToken, transaccionController.obtenerTransaccionPorId); // /api/transacciones/:id
router.put('/:id', authenticateToken, validateBody(updateTransaccionSchema), transaccionController.actualizarTransaccion);   // /api/transacciones/:id
router.delete('/:id', authenticateToken, transaccionController.eliminarTransaccion); // /api/transacciones/:id

module.exports = router;
