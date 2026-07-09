const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const transaccionesRoutes = require('./routes/transaccion.routes');
const finanzasAvanzadasRoutes = require('./routes/finanzas-avanzadas.routes');
const sistemaRoutes = require('./routes/sistema.routes');

// Middlewares de error y logging
const { globalErrorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const { logger, morganStream } = require('./utils/logger');

dotenv.config(); // Carga las variables del archivo .env

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: morganStream }));
}

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/transacciones', transaccionesRoutes);

// Nuevas rutas avanzadas
app.use('/api/finanzas', finanzasAvanzadasRoutes);
app.use('/api/sistema', sistemaRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: '🏦 API de Gestor de Finanzas Avanzado',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      transacciones: '/api/transacciones',
      cuentas: '/api/finanzas/cuentas',
      inversiones: '/api/finanzas/inversiones',
      deudas: '/api/finanzas/deudas',
      gamificacion: '/api/finanzas/logros',
      recurrentes: '/api/sistema/recurrentes',
      notificaciones: '/api/sistema/notificaciones'
    },
    status: 'Funcionando correctamente ✅'
  });
});

// Middleware para rutas no encontradas (debe ir antes del error handler)
app.use(notFoundHandler);

// Middleware global de manejo de errores (debe ir al final)
app.use(globalErrorHandler);

// Servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info('Servidor iniciado', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Cerrando servidor...', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });
  console.log('UNCAUGHT EXCEPTION! 💥 Cerrando servidor...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Cerrando servidor...', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });
  console.log('UNHANDLED REJECTION! 💥 Cerrando servidor...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

