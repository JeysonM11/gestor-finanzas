const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear una nueva transacción
exports.crearTransaccion = async (req, res) => {
  try {
    const { descripcion, monto, tipo, categoria } = req.body; // Añadí "categoria" como ejemplo
    const userId = req.user.id; // Obtiene el ID del usuario desde el token JWT

    // Validación básica
    if (!descripcion || !monto || !tipo) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const transaccion = await prisma.transaccion.create({
      data: {
        descripcion,
        monto,
        tipo,
        categoria, 
        userId,
      },
    });

    res.status(201).json({
      message: 'Transacción creada',
      transaccion
    });

  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todas las transacciones del usuario
exports.obtenerTransacciones = async (req, res) => {
  try {
    const userId = req.user.id; // ID del usuario desde el token

    // Opcional: filtros por query params (ej: /transacciones?tipo=ingreso)
    const { tipo, categoria, desde, hasta } = req.query;

    const transacciones = await prisma.transaccion.findMany({
      where: {
        userId,
        ...(tipo && { tipo }), // Filtro por tipo si existe
        ...(categoria && { categoria }), // Filtro por categoría si existe
        ...(desde && hasta && { // Filtro por rango de fechas
          fecha: {
            gte: new Date(desde),
            lte: new Date(hasta)
          }
        })
      },
      orderBy: {
        fecha: 'desc' // Ordena por fecha descendente
      },
      select: { // Selecciona campos específicos (opcional)
        id: true,
        descripcion: true,
        monto: true,
        tipo: true,
        categoria: true,
        fecha: true
      }
    });

    // Estadísticas adicionales (opcional)
    const totalIngresos = transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const totalGastos = transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    res.status(200).json({
      transacciones,
      balance: totalIngresos - totalGastos,
      totalIngresos,
      totalGastos
    });

  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};