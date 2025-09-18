const { AppError } = require('../utils/errors');
const { logError } = require('../utils/logger');

/**
 * Maneja errores de Prisma
 */
const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      return new AppError(
        `Ya existe un registro con ese ${error.meta?.target || 'valor'}`,
        409,
        'DUPLICATE_ENTRY'
      );
    
    case 'P2025':
      return new AppError('Registro no encontrado', 404, 'RECORD_NOT_FOUND');
    
    case 'P2003':
      return new AppError('Error de referencia: el registro relacionado no existe', 400, 'FOREIGN_KEY_CONSTRAINT');
    
    case 'P2014':
      return new AppError('Los datos enviados violan las restricciones de la base de datos', 400, 'INVALID_DATA');
    
    default:
      console.error('Error de Prisma no manejado:', error);
      return new AppError('Error interno del servidor', 500, 'DATABASE_ERROR');
  }
};

/**
 * Maneja errores de JWT
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Token inválido', 401, 'INVALID_TOKEN');
  }
  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expirado', 401, 'EXPIRED_TOKEN');
  }
  return new AppError('Error de autenticación', 401, 'AUTH_ERROR');
};

/**
 * Envía respuesta de error para desarrollo
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    code: err.code,
    stack: err.stack,
    timestamp: err.timestamp || new Date().toISOString()
  });
};

/**
 * Envía respuesta de error para producción
 */
const sendErrorProd = (err, res) => {
  // Error operacional: enviar mensaje al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      code: err.code,
      timestamp: err.timestamp || new Date().toISOString()
    });
  } else {
    // Error de programación: no filtrar detalles al cliente
    logError(err, null, { 
      type: 'UnhandledError',
      environment: process.env.NODE_ENV 
    });
    console.error('ERROR:', err);
    
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Algo salió mal en el servidor',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Middleware global de manejo de errores
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log del error
  logError(err, req, {
    type: 'HandledError',
    environment: process.env.NODE_ENV
  });

  let error = { ...err };
  error.message = err.message;

  // Manejar errores específicos
  if (err.code && err.code.startsWith('P')) {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.name === 'ValidationError') {
    error = new AppError('Error de validación', 400, 'VALIDATION_ERROR');
  } else if (err.name === 'CastError') {
    error = new AppError('ID inválido', 400, 'INVALID_ID');
  }

  // Enviar respuesta basada en el ambiente
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `No se pudo encontrar ${req.originalUrl} en este servidor`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(err);
};

/**
 * Wrapper para funciones async que automáticamente captura errores
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  catchAsync
};