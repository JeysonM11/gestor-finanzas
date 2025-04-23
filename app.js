const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes'); // 👈 esta línea es clave
const transaccionesRoutes = require('./routes/transaccion.routes');


dotenv.config(); // Carga las variables del archivo .env

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/transacciones', transaccionesRoutes); 

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡API de Gestor de Finanzas funcionando! 💰');
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

