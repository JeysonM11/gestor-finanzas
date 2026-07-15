const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, categoriaController.obtenerCategorias);
router.get('/estadisticas', authenticateToken, categoriaController.obtenerEstadisticasPorCategoria);
router.post('/', authenticateToken, categoriaController.crearCategoria);
router.put('/:id', authenticateToken, categoriaController.actualizarCategoria);
router.delete('/:id', authenticateToken, categoriaController.eliminarCategoria);

module.exports = router;
