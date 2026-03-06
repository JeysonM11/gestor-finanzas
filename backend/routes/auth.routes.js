const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// Registro y login
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);

// Obtener usuario actual (protegido)
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
