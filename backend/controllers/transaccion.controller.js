const prisma = require('../lib/prisma');
const {
  aplicarEfectoSaldo,
  validarCuentasTransaccion,
} = require('../utils/saldo');

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

// Crear una nueva transaccion (con sync de saldos)
exports.crearTransaccion = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = { ...req.body };

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

    res.status(201).json({
      success: true,
      message: 'Transaccion creada exitosamente',
      transaccion,
    });
  } catch (error) {
    console.error('Error al crear transaccion:', error);
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error al crear transaccion',
    });
  }
};

// Obtener todas las transacciones del usuario
exports.obtenerTransacciones = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

exports.obtenerTransaccionPorId = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const transaccion = await prisma.transaccion.findFirst({
      where: { id: parseInt(id), userId },
    });
    if (!transaccion) {
      return res.status(404).json({
        success: false,
        message: 'Transaccion no encontrada',
      });
    }
    return res.json({ success: true, transaccion });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener la transaccion',
      error: error.message,
    });
  }
};

exports.actualizarTransaccion = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = req.body;
  try {
    const transaccion = await prisma.$transaction(async (tx) => {
      const existente = await tx.transaccion.findFirst({
        where: { id: parseInt(id), userId },
      });
      if (!existente) {
        const err = new Error('Transaccion no encontrada');
        err.statusCode = 404;
        throw err;
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

      // Revertir efecto anterior y aplicar el nuevo
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
      return actualizada;
    });

    return res.json({ success: true, transaccion });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Error al actualizar la transaccion',
    });
  }
};

exports.eliminarTransaccion = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    await prisma.$transaction(async (tx) => {
      const existente = await tx.transaccion.findFirst({
        where: { id: parseInt(id), userId },
      });
      if (!existente) {
        const err = new Error('Transaccion no encontrada');
        err.statusCode = 404;
        throw err;
      }

      await aplicarEfectoSaldo(tx, existente, -1);
      await tx.transaccion.delete({ where: { id: parseInt(id) } });
    });

    return res.json({
      success: true,
      message: 'Transaccion eliminada correctamente',
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Error al eliminar la transaccion',
    });
  }
};

exports.obtenerResumen = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen',
      error: error.message,
    });
  }
};
