const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const transaccionController = require('../controllers/transaccion.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// Registro y login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (ejemplo de transacciones)
router.get('/transacciones', authenticateToken, transaccionController.obtenerTransacciones);
router.post('/transacciones', authenticateToken, transaccionController.crearTransaccion);

module.exports = router;


