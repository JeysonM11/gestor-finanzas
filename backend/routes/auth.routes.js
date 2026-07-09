const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
} = require('../validators/auth.validator');

// Registro y login
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);

// Obtener usuario actual (protegido)
router.get('/me', authenticateToken, authController.getCurrentUser);

// Perfil y preferencias
router.put(
  '/profile',
  authenticateToken,
  validateBody(updateProfileSchema),
  authController.updateProfile
);
router.put(
  '/change-password',
  authenticateToken,
  validateBody(changePasswordSchema),
  authController.changePassword
);
router.put(
  '/preferences',
  authenticateToken,
  validateBody(updatePreferencesSchema),
  authController.updatePreferences
);

module.exports = router;
