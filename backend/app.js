require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no está definido. Configúralo en backend/.env');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const transaccionesRoutes = require('./routes/transaccion.routes');
const finanzasAvanzadasRoutes = require('./routes/finanzas-avanzadas.routes');
const sistemaRoutes = require('./routes/sistema.routes');
const reporteRoutes = require('./routes/reporte.routes');
const categoriaRoutes = require('./routes/categoria.routes');

// Middlewares de error y logging
const { globalErrorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');
const { logger, morganStream } = require('./utils/logger');
const { startRecurrentesCron } = require('./jobs/recurrentes.cron');
const { startRecordatoriosCron } = require('./jobs/recordatorios.cron');
const prisma = require('./lib/prisma');

const app = express();

// Detrás del proxy de Render/reverse proxies: confiar en el primer salto para
// que express-rate-limit identifique la IP real del cliente (X-Forwarded-For).
app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
const corsOptions =
  process.env.NODE_ENV === 'production'
    ? {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
      }
    : { origin: true, credentials: true };
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: morganStream }));
}

if (process.env.NODE_ENV !== 'test') {
  app.use('/api', apiLimiter);
}

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/transacciones', transaccionesRoutes);

// Nuevas rutas avanzadas
app.use('/api/finanzas', finanzasAvanzadasRoutes);
app.use('/api/sistema', sistemaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/categorias', categoriaRoutes);

// Health check real (API + BD)
app.get('/api/health', async (req, res) => {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      database: 'up',
      version: '1.4.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - started,
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      database: 'down',
      version: '1.4.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: 'Base de datos no disponible',
    });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestor de Finanzas Avanzado',
    version: '1.4.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
      transacciones: '/api/transacciones',
      cuentas: '/api/finanzas/cuentas',
      inversiones: '/api/finanzas/inversiones',
      deudas: '/api/finanzas/deudas',
      metas: '/api/finanzas/metas',
      presupuestos: '/api/finanzas/presupuestos',
      gamificacion: '/api/finanzas/logros',
      asesor: '/api/finanzas/asesor',
      recurrentes: '/api/sistema/recurrentes',
      recordatorios: '/api/sistema/recordatorios',
      notificaciones: '/api/sistema/notificaciones',
      reportes: '/api/reportes',
      categorias: '/api/categorias'
    },
    status: 'Funcionando correctamente'
  });
});

// Middleware para rutas no encontradas (debe ir antes del error handler)
app.use(notFoundHandler);

// Middleware global de manejo de errores (debe ir al final)
app.use(globalErrorHandler);

// Servidor (no arrancar en tests)
let server;
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    logger.info('Servidor iniciado', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    startRecurrentesCron();
    startRecordatoriosCron();
  });

  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Cerrando servidor...', {
      error: { name: err.name, message: err.message, stack: err.stack },
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Cerrando servidor...', {
      error: { name: err.name, message: err.message, stack: err.stack },
    });
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });
}

module.exports = app;
