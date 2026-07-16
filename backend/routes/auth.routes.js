const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const sessionController = require('../controllers/session.controller');
const { authMiddleware: authenticateToken } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
} = require('../validators/auth.validator');

// Registro y login (rate limit anti fuerza bruta)
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

// Sesiones y logout: requieren JWT; usan apiLimiter global (no authLimiter).
// authLimiter solo aplica a credenciales sin autenticar (register/login).

// Obtener usuario actual (protegido)
router.get('/me', authenticateToken, authController.getCurrentUser);

// Sesiones activas (Sprint D)
router.get('/sessions', authenticateToken, sessionController.listarSesiones);
router.delete('/sessions/others', authenticateToken, sessionController.revocarOtrasSesiones);
router.delete('/sessions/:id', authenticateToken, sessionController.revocarSesion);
router.post('/logout', authenticateToken, sessionController.logout);

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
