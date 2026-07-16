const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { AppError, NotFoundError } = require('../utils/errors');
const {
  aplicarEfectoSaldo,
  validarCuentasTransaccion,
} = require('../utils/saldo');
const { sincronizarPorTransaccion } = require('../utils/presupuesto');

async function calcularResumen(where) {
  const [ingresos, gastos] = await Promise.all([
    prisma.transaccion.aggregate({
      where: { ...where, tipo: 'INGRESO' },
      _sum: { monto: true },
      _count: true,
    }),
    prisma.transaccion.aggregate({
      where: { ...where, tipo: 'GASTO' },
      _sum: { monto: true },
      _count: true,
    }),
  ]);

  const totalIngresos = ingresos._sum.monto || 0;
  const totalGastos = gastos._sum.monto || 0;

  return {
    totalIngresos,
    totalGastos,
    balance: totalIngresos - totalGastos,
    cantidadIngresos: ingresos._count || 0,
    cantidadGastos: gastos._count || 0,
  };
}

function buildWhere(userId, query = {}) {
  const { tipo, categoria, fechaInicio, fechaFin, search } = query;
  const where = {
    userId,
    ...(tipo && { tipo }),
    ...(categoria && { categoria }),
  };

  if (fechaInicio || fechaFin) {
    where.fecha = {};
    if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
    if (fechaFin) where.fecha.lte = new Date(fechaFin);
  }

  if (search) {
    where.OR = [
      { descripcion: { contains: search, mode: 'insensitive' } },
      { notas: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}

function toAppError(error) {
  if (error instanceof AppError) return error;
  if (error.statusCode) {
    return new AppError(error.message, error.statusCode);
  }
  return error;
}

exports.crearTransaccion = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const body = { ...req.body };

  try {
    const transaccion = await prisma.$transaction(async (tx) => {
      await validarCuentasTransaccion(tx, userId, body);

      const creada = await tx.transaccion.create({
        data: {
          ...body,
          userId,
          fecha: body.fecha ? new Date(body.fecha) : undefined,
          esTransferencia: body.tipo === 'TRANSFERENCIA',
        },
      });

      await aplicarEfectoSaldo(tx, creada, 1);
      return creada;
    });

    await sincronizarPorTransaccion(userId, transaccion).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Transaccion creada exitosamente',
      transaccion,
    });
  } catch (error) {
    throw toAppError(error);
  }
});

exports.obtenerTransacciones = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const where = buildWhere(userId, req.query);

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const [total, transacciones, resumen] = await Promise.all([
    prisma.transaccion.count({ where }),
    prisma.transaccion.findMany({
      where,
      orderBy: { fecha: 'desc' },
      skip,
      take,
      select: {
        id: true,
        descripcion: true,
        monto: true,
        tipo: true,
        categoria: true,
        subcategoria: true,
        fecha: true,
        metodoPago: true,
        notas: true,
        etiquetas: true,
        cuentaOrigenId: true,
        cuentaDestinoId: true,
        cuentaOrigen: { select: { id: true, nombre: true } },
        cuentaDestino: { select: { id: true, nombre: true } },
      },
    }),
    calcularResumen(where),
  ]);

  res.status(200).json({
    success: true,
    transacciones,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
    resumen: {
      balance: resumen.balance,
      totalIngresos: resumen.totalIngresos,
      totalGastos: resumen.totalGastos,
    },
  });
});

exports.obtenerTransaccionPorId = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const transaccion = await prisma.transaccion.findFirst({
    where: { id: parseInt(id), userId },
  });

  if (!transaccion) {
    throw new NotFoundError('Transaccion');
  }

  res.json({ success: true, transaccion });
});

exports.actualizarTransaccion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;

  try {
    const transaccion = await prisma.$transaction(async (tx) => {
      const existente = await tx.transaccion.findFirst({
        where: { id: parseInt(id), userId },
      });
      if (!existente) {
        throw new NotFoundError('Transaccion');
      }

      const { userId: _u, id: _i, ...safeData } = data;
      const merged = {
        ...existente,
        ...safeData,
        tipo: safeData.tipo || existente.tipo,
        monto: safeData.monto != null ? safeData.monto : existente.monto,
        cuentaOrigenId:
          safeData.cuentaOrigenId !== undefined
            ? safeData.cuentaOrigenId
            : existente.cuentaOrigenId,
        cuentaDestinoId:
          safeData.cuentaDestinoId !== undefined
            ? safeData.cuentaDestinoId
            : existente.cuentaDestinoId,
      };

      await validarCuentasTransaccion(tx, userId, merged);
      await aplicarEfectoSaldo(tx, existente, -1);

      const actualizada = await tx.transaccion.update({
        where: { id: parseInt(id) },
        data: {
          ...safeData,
          ...(safeData.fecha ? { fecha: new Date(safeData.fecha) } : {}),
          esTransferencia: merged.tipo === 'TRANSFERENCIA',
        },
      });

      await aplicarEfectoSaldo(tx, actualizada, 1);
      return { existente, actualizada };
    });

    await sincronizarPorTransaccion(userId, transaccion.existente).catch(() => {});
    await sincronizarPorTransaccion(userId, transaccion.actualizada).catch(() => {});

    res.json({ success: true, transaccion: transaccion.actualizada });
  } catch (error) {
    throw toAppError(error);
  }
});

exports.eliminarTransaccion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const eliminada = await prisma.$transaction(async (tx) => {
      const existente = await tx.transaccion.findFirst({
        where: { id: parseInt(id), userId },
      });
      if (!existente) {
        throw new NotFoundError('Transaccion');
      }

      await aplicarEfectoSaldo(tx, existente, -1);
      await tx.transaccion.delete({ where: { id: parseInt(id) } });
      return existente;
    });

    await sincronizarPorTransaccion(userId, eliminada).catch(() => {});

    res.json({
      success: true,
      message: 'Transaccion eliminada correctamente',
    });
  } catch (error) {
    throw toAppError(error);
  }
});

exports.obtenerResumen = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const where = buildWhere(userId, req.query);
  const resumen = await calcularResumen(where);
  const total = await prisma.transaccion.count({ where });

  res.status(200).json({
    success: true,
    totalIngresos: resumen.totalIngresos,
    totalGastos: resumen.totalGastos,
    balance: resumen.balance,
    cantidadTransacciones: total,
  });
});
