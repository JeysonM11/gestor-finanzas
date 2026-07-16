const prisma = require('../lib/prisma');
const { startOfDayUTC, endOfDayUTC } = require('../utils/date');

const CATEGORIAS_PREDEFINIDAS = [
  'Alimentacion',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educacion',
  'Servicios',
  'Compras',
  'Viajes',
  'Hogar',
  'Trabajo',
  'Inversion',
  'Otros',
];

// Obtener categorias del usuario (usadas + predefinidas)
exports.obtenerCategorias = async (req, res) => {
  try {
    const userId = req.user.id;

    const categorias = await prisma.transaccion.groupBy({
      by: ['categoria'],
      where: {
        userId,
        categoria: { not: null },
      },
      _count: { categoria: true },
      _sum: { monto: true },
    });

    const personalizadas = await prisma.categoriaPersonalizada.findMany({
      where: { userId, activa: true },
      orderBy: { orden: 'asc' },
    });

    const categoriasExistentes = new Set(
      categorias.map((c) => c.categoria).filter(Boolean)
    );
    personalizadas.forEach((c) => categoriasExistentes.add(c.nombre));

    const categoriasCompletas = [
      ...categorias
        .filter((c) => c.categoria)
        .map((c) => ({
          nombre: c.categoria,
          count: c._count.categoria,
          total: c._sum.monto || 0,
          origen: 'transaccion',
        })),
      ...personalizadas
        .filter((c) => !categorias.some((x) => x.categoria === c.nombre))
        .map((c) => ({
          nombre: c.nombre,
          count: 0,
          total: 0,
          origen: 'personalizada',
          id: c.id,
          tipo: c.tipo,
          color: c.color,
          icono: c.icono,
        })),
      ...CATEGORIAS_PREDEFINIDAS.filter((cat) => !categoriasExistentes.has(cat)).map(
        (cat) => ({
          nombre: cat,
          count: 0,
          total: 0,
          origen: 'predefinida',
        })
      ),
    ];

    res.status(200).json({
      categorias: categoriasCompletas,
      total: categoriasCompletas.length,
    });
  } catch (error) {
    console.error('Error al obtener categorias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.crearCategoria = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, tipo, color, icono, descripcion } = req.body;

    if (!nombre || !tipo) {
      return res.status(400).json({
        message: 'Nombre y tipo son obligatorios',
      });
    }

    const categoria = await prisma.categoriaPersonalizada.create({
      data: {
        nombre: nombre.trim(),
        tipo,
        color: color || '#6B7280',
        icono,
        descripcion,
        userId,
      },
    });

    res.status(201).json({
      message: 'Categoria creada exitosamente',
      categoria,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Ya existe una categoria con ese nombre' });
    }
    console.error('Error al crear categoria:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.actualizarCategoria = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { nombre, tipo, color, icono, descripcion, activa } = req.body;

    const existente = await prisma.categoriaPersonalizada.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!existente) {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }

    const categoria = await prisma.categoriaPersonalizada.update({
      where: { id: parseInt(id) },
      data: {
        ...(nombre != null && { nombre: nombre.trim() }),
        ...(tipo != null && { tipo }),
        ...(color != null && { color }),
        ...(icono !== undefined && { icono }),
        ...(descripcion !== undefined && { descripcion }),
        ...(activa !== undefined && { activa: Boolean(activa) }),
      },
    });

    res.status(200).json({
      message: 'Categoria actualizada exitosamente',
      categoria,
    });
  } catch (error) {
    console.error('Error al actualizar categoria:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.eliminarCategoria = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const resultado = await prisma.categoriaPersonalizada.deleteMany({
      where: { id: parseInt(id), userId },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ message: 'Categoria no encontrada' });
    }

    res.status(200).json({ message: 'Categoria eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar categoria:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.obtenerEstadisticasPorCategoria = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    const filtroFecha = {};
    if (fechaInicio && fechaFin) {
      filtroFecha.fecha = {
        gte: startOfDayUTC(fechaInicio),
        lte: endOfDayUTC(fechaFin),
      };
    }

    const estadisticas = await prisma.transaccion.groupBy({
      by: ['categoria', 'tipo'],
      where: {
        userId,
        categoria: { not: null },
        ...filtroFecha,
      },
      _count: { categoria: true },
      _sum: { monto: true },
    });

    const datosProcessados = {};
    estadisticas.forEach((stat) => {
      if (!datosProcessados[stat.categoria]) {
        datosProcessados[stat.categoria] = {
          categoria: stat.categoria,
          ingresos: 0,
          gastos: 0,
          transacciones: 0,
        };
      }

      const monto = stat._sum.monto || 0;
      const cantidad = stat._count.categoria || 0;

      if (stat.tipo === 'INGRESO') {
        datosProcessados[stat.categoria].ingresos += monto;
      } else if (stat.tipo === 'GASTO') {
        datosProcessados[stat.categoria].gastos += monto;
      }
      datosProcessados[stat.categoria].transacciones += cantidad;
    });

    res.status(200).json({
      estadisticas: Object.values(datosProcessados),
      resumen: {
        totalCategorias: Object.keys(datosProcessados).length,
        fechaInicio,
        fechaFin,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadisticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
