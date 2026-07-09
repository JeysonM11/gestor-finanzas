const prisma = require('../lib/prisma');

// Obtener todas las categorías del usuario
exports.obtenerCategorias = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener categorías únicas de las transacciones del usuario
    const categorias = await prisma.transaccion.groupBy({
      by: ['categoria'],
      where: {
        userId,
        categoria: { not: null }
      },
      _count: {
        categoria: true
      },
      _sum: {
        monto: true
      }
    });

    // Agregar categorías predefinidas si no existen
    const categoriasPredefinilas = [
      'Alimentación', 'Transporte', 'Entretenimiento', 'Salud',
      'Educación', 'Servicios', 'Compras', 'Viajes', 'Otros'
    ];

    const categoriasExistentes = categorias.map(c => c.categoria);
    const categoriasCompletas = [
      ...categorias.map(c => ({
        nombre: c.categoria,
        count: c._count.categoria,
        total: c._sum.monto || 0
      })),
      ...categoriasPredefinilas
        .filter(cat => !categoriasExistentes.includes(cat))
        .map(cat => ({
          nombre: cat,
          count: 0,
          total: 0
        }))
    ];

    res.status(200).json({
      categorias: categoriasCompletas,
      total: categorias.length
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener estadísticas por categoría
exports.obtenerEstadisticasPorCategoria = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    const filtroFecha = {};
    if (fechaInicio && fechaFin) {
      filtroFecha.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    }

    const estadisticas = await prisma.transaccion.groupBy({
      by: ['categoria', 'tipo'],
      where: {
        userId,
        categoria: { not: null },
        ...filtroFecha
      },
      _count: {
        categoria: true
      },
      _sum: {
        monto: true
      }
    });

    // Procesar datos para mejor visualización
    const datosProcessados = {};
    estadisticas.forEach(stat => {
      if (!datosProcessados[stat.categoria]) {
        datosProcessados[stat.categoria] = {
          categoria: stat.categoria,
          ingresos: 0,
          gastos: 0,
          transacciones: 0
        };
      }

      const monto = stat._sum.monto || 0;
      const cantidad = stat._count.categoria || 0;

      if (stat.tipo === 'ingreso') {
        datosProcessados[stat.categoria].ingresos += monto;
      } else {
        datosProcessados[stat.categoria].gastos += monto;
      }
      datosProcessados[stat.categoria].transacciones += cantidad;
    });

    res.status(200).json({
      estadisticas: Object.values(datosProcessados),
      resumen: {
        totalCategorias: Object.keys(datosProcessados).length,
        fechaInicio,
        fechaFin
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
