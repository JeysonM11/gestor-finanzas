const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const {
  NotFoundError,
  ConflictError,
  ValidationError,
} = require('../utils/errors');
const { startOfDayUTC, endOfDayUTC } = require('../utils/date');
const { buildCatalogoCategorias } = require('../utils/categorias');

/** Catálogo para selects: personalizadas activas + uso en transacciones + predefinidas */
exports.obtenerCategorias = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const soloPersonalizadas =
    req.query.soloPersonalizadas === 'true' || req.query.soloPersonalizadas === '1';

  if (soloPersonalizadas) {
    const personalizadas = await prisma.categoriaPersonalizada.findMany({
      where: { userId, activa: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    });

    return res.status(200).json({
      success: true,
      categorias: personalizadas.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        tipo: c.tipo,
        color: c.color,
        icono: c.icono,
        orden: c.orden,
        descripcion: c.descripcion,
        activa: c.activa,
        origen: 'personalizada',
      })),
      total: personalizadas.length,
    });
  }

  const [usoTransacciones, personalizadas] = await Promise.all([
    prisma.transaccion.groupBy({
      by: ['categoria'],
      where: {
        userId,
        categoria: { not: null },
      },
      _count: { categoria: true },
      _sum: { monto: true },
    }),
    prisma.categoriaPersonalizada.findMany({
      where: { userId, activa: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    }),
  ]);

  const categorias = buildCatalogoCategorias({
    personalizadas,
    usoTransacciones,
  });

  res.status(200).json({
    success: true,
    categorias,
    total: categorias.length,
  });
});

exports.crearCategoria = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { nombre, tipo, color, icono, orden, descripcion } = req.body;
  const nombreNorm = nombre.trim();

  const existente = await prisma.categoriaPersonalizada.findFirst({
    where: { userId, nombre: nombreNorm },
  });

  if (existente?.activa) {
    throw new ConflictError('Ya existe una categoría con ese nombre');
  }

  if (existente && !existente.activa) {
    const reactivada = await prisma.categoriaPersonalizada.update({
      where: { id: existente.id },
      data: {
        tipo,
        color: color || existente.color || '#6B7280',
        icono: icono !== undefined ? icono : existente.icono,
        orden: orden !== undefined ? orden : existente.orden,
        descripcion: descripcion !== undefined ? descripcion : existente.descripcion,
        activa: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Categoría reactivada exitosamente',
      categoria: reactivada,
    });
  }

  try {
    const categoria = await prisma.categoriaPersonalizada.create({
      data: {
        nombre: nombreNorm,
        tipo,
        color: color || '#6B7280',
        icono: icono || null,
        orden: orden != null ? orden : null,
        descripcion: descripcion || null,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      categoria,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictError('Ya existe una categoría con ese nombre');
    }
    throw error;
  }
});

exports.actualizarCategoria = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { nombre, tipo, color, icono, orden, descripcion, activa } = req.body;

  const existente = await prisma.categoriaPersonalizada.findFirst({
    where: { id: parseInt(id, 10), userId },
  });

  if (!existente) {
    throw new NotFoundError('Categoría');
  }

  try {
    const categoria = await prisma.categoriaPersonalizada.update({
      where: { id: existente.id },
      data: {
        ...(nombre != null && { nombre: nombre.trim() }),
        ...(tipo != null && { tipo }),
        ...(color != null && { color }),
        ...(icono !== undefined && { icono }),
        ...(orden !== undefined && { orden }),
        ...(descripcion !== undefined && { descripcion }),
        ...(activa !== undefined && { activa: Boolean(activa) }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      categoria,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictError('Ya existe una categoría con ese nombre');
    }
    throw error;
  }
});

/** Soft-delete: marca activa=false (conserva históricos por string) */
exports.eliminarCategoria = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existente = await prisma.categoriaPersonalizada.findFirst({
    where: { id: parseInt(id, 10), userId, activa: true },
  });

  if (!existente) {
    throw new NotFoundError('Categoría');
  }

  await prisma.categoriaPersonalizada.update({
    where: { id: existente.id },
    data: { activa: false },
  });

  res.status(200).json({
    success: true,
    message: 'Categoría desactivada exitosamente',
  });
});

exports.obtenerEstadisticasPorCategoria = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { fechaInicio, fechaFin } = req.query;

  if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
    throw new ValidationError('fechaInicio y fechaFin deben enviarse juntas');
  }

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
    success: true,
    estadisticas: Object.values(datosProcessados),
    resumen: {
      totalCategorias: Object.keys(datosProcessados).length,
      fechaInicio: fechaInicio || null,
      fechaFin: fechaFin || null,
    },
  });
});
