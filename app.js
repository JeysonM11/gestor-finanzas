const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const transaccionesRoutes = require('./routes/transaccion.routes');
const finanzasAvanzadasRoutes = require('./routes/finanzas-avanzadas.routes');
const sistemaRoutes = require('./routes/sistema.routes');

dotenv.config(); // Carga las variables del archivo .env

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

