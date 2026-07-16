const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const {
  createCategoriaSchema,
  updateCategoriaSchema,
} = require('../validators/categoria.validator');

router.get('/', authenticateToken, categoriaController.obtenerCategorias);
router.get(
  '/estadisticas',
  authenticateToken,
  categoriaController.obtenerEstadisticasPorCategoria
);
router.post(
  '/',
  authenticateToken,
  validateBody(createCategoriaSchema),
  categoriaController.crearCategoria
);
router.put(
  '/:id',
  authenticateToken,
  validateBody(updateCategoriaSchema),
  categoriaController.actualizarCategoria
);
router.delete('/:id', authenticateToken, categoriaController.eliminarCategoria);

module.exports = router;
