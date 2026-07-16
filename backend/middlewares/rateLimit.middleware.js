const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

/**
 * Límite estricto para login/register (anti fuerza bruta).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Límite general de API (suave).
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta más tarde.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Límite de generación del Asesor IA, por usuario autenticado
 * (controla costo del proveedor). Corre después del auth middleware.
 */
const asesorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.ASESOR_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.user?.id != null ? `user:${req.user.id}` : ipKeyGenerator(req.ip),
  message: {
    success: false,
    message: 'Límite de planes por hora alcanzado. Intenta más tarde.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

module.exports = { authLimiter, apiLimiter, asesorLimiter };
