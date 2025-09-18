const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Configuración de niveles de log personalizados
const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

// Agregar colores a winston
winston.addColors(logLevels.colors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Formato para consola (desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ` ${JSON.stringify(meta)}`;
    }
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Configuración de transportes
const transports = [];

// Transporte para consola (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    })
  );
}

// Transporte para archivos con rotación diaria
const fileRotationOptions = {
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
};

// Logs de errores
transports.push(
  new DailyRotateFile({
    ...fileRotationOptions,
    filename: path.join('logs', 'error-%DATE%.log'),
    level: 'error',
  })
);

// Logs combinados (todos los niveles)
transports.push(
  new DailyRotateFile({
    ...fileRotationOptions,
    filename: path.join('logs', 'combined-%DATE%.log'),
    level: 'debug',
  })
);

// Logs de HTTP requests
transports.push(
  new DailyRotateFile({
    ...fileRotationOptions,
    filename: path.join('logs', 'http-%DATE%.log'),
    level: 'http',
  })
);

// Crear logger
const logger = winston.createLogger({
  levels: logLevels.levels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports,
  // Evitar que el proceso se cierre por errores no capturados
  exitOnError: false,
});

// Funciones de utilidad para logging
const logWithMetadata = (level, message, metadata = {}) => {
  const logData = {
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    ...metadata,
  };
  
  logger.log(level, logData);
};

// Funciones específicas para diferentes tipos de logs
const logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || null,
  };

  logger.http('HTTP Request', logData);
};

const logError = (error, req = null, additionalData = {}) => {
  const logData = {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
    },
    ...additionalData,
  };

  if (req) {
    logData.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || null,
    };
  }

  logger.error('Application Error', logData);
};

const logUserAction = (action, userId, details = {}) => {
  const logData = {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  };

  logger.info('User Action', logData);
};

const logDatabaseQuery = (query, duration, result = null) => {
  const logData = {
    query: query.substring(0, 500), // Limitar longitud
    duration: `${duration}ms`,
    resultCount: result?.length || null,
  };

  logger.debug('Database Query', logData);
};

const logSecurityEvent = (event, details = {}) => {
  const logData = {
    securityEvent: event,
    timestamp: new Date().toISOString(),
    ...details,
  };

  logger.warn('Security Event', logData);
};

// Stream para Morgan (logging de HTTP)
const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = {
  logger,
  logWithMetadata,
  logRequest,
  logError,
  logUserAction,
  logDatabaseQuery,
  logSecurityEvent,
  morganStream,
};