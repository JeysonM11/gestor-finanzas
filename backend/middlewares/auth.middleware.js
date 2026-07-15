const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Validar si el encabezado de autorización tiene el formato adecuado
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Formato de token inválido. Debe ser "Bearer <token>"'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  // Asegurarse de que el JWT_SECRET esté definido
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET no está definido');
    return res.status(500).json({
      success: false,
      message: 'Error de servidor, JWT_SECRET no está definido'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar el usuario decodificado al objeto de la solicitud
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Error al verificar token', { reason: error.name });
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * @param {...String} rolesPermitidos - Roles que pueden acceder a la ruta
 * @returns middleware function
 */
const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    // Verificar si existe el usuario en la request (debe pasar primero por authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    // Verificar si el usuario tiene uno de los roles permitidos
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = { authMiddleware, requireRole };
