const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const { hashToken, validateUserSession } = require('../utils/sessions');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Formato de token inválido. Debe ser "Bearer <token>"',
      code: 'TOKEN_MISSING',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado',
      code: 'TOKEN_MISSING',
    });
  }

  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET no está definido');
    return res.status(500).json({
      success: false,
      message: 'Error de servidor, JWT_SECRET no está definido',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.sid) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida. Inicia sesión de nuevo.',
        code: 'LEGACY_TOKEN',
      });
    }

    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Tipo de token inválido',
        code: 'TOKEN_TYPE_INVALID',
      });
    }

    const sessionValid = await validateUserSession(decoded, token);
    if (!sessionValid) {
      return res.status(401).json({
        success: false,
        message: 'Sesión cerrada o expirada. Inicia sesión de nuevo.',
        code: 'SESSION_REVOKED',
      });
    }

    req.user = decoded;
    req.sessionId = decoded.sid ?? null;
    req.tokenHash = hashToken(token);
    next();
  } catch (error) {
    logger.warn('Error al verificar token', { reason: error.name });
    const code =
      error.name === 'TokenExpiredError' ? 'ACCESS_TOKEN_EXPIRED' : 'TOKEN_INVALID';
    return res.status(401).json({
      success: false,
      message:
        code === 'ACCESS_TOKEN_EXPIRED'
          ? 'Access token expirado'
          : 'Token inválido',
      code,
    });
  }
};

const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
      });
    }

    next();
  };
};

module.exports = { authMiddleware, requireRole };
