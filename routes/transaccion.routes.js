const express = require('express');
const router = express.Router();
const transaccionController = require('../controllers/transaccion.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.get('/transacciones', authenticateToken, transaccionController.obtenerTransacciones);
router.post('/crear', authenticateToken, transaccionController.crearTransaccion);

module.exports = router;