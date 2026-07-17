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
  deleteAccountSchema,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);

router.get('/me', authenticateToken, authController.getCurrentUser);

router.get('/sessions', authenticateToken, sessionController.listarSesiones);
router.delete('/sessions/others', authenticateToken, sessionController.revocarOtrasSesiones);
router.delete('/sessions/:id', authenticateToken, sessionController.revocarSesion);
// Logout no exige access token: puede revocar con cookie refresh
router.post('/logout', sessionController.logout);

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
router.delete(
  '/account',
  authenticateToken,
  validateBody(deleteAccountSchema),
  authController.deleteAccount
);

module.exports = router;
