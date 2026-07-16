const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { AppError, NotFoundError } = require('../utils/errors');
const {
  aplicarEfectoSaldo,
  validarCuentasTransaccion,
  validarDeudaParaPago,
  aplicarEfectoDeuda,
} = require('../utils/saldo');
const { sincronizarPorTransaccion } = require('../utils/presupuesto');
const { parseDateOnly, startOfDayUTC, endOfDayUTC } = require('../utils/date');

const TRANSACCION_FIELDS = [
  'tipo',
  'monto',
  'descripcion',
  'categoria',
  'subcategoria',
  'fecha',
  'ubicacion',
  'notas',
  'etiquetas',
  'montoOriginal',
  'monedaOriginal',
  'tasaCambio',
  'comprobante',
  'metodoPago',
  'cuentaOrigenId',
  'cuentaDestinoId',
  'deudaId',
  'transaccionRecurrenteId',
  'verificada',
];

function pickTransaccionData(body = {}) {
  const data = {};
  for (const key of TRANSACCION_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

function normalizarPayloadPorTipo(data) {
  const next = { ...data };

  if (next.tipo === 'TRANSFERENCIA') {
    next.metodoPago = next.metodoPago || 'TRANSFERENCIA';
    next.categoria = null;
    next.deudaId = null;
    if (!next.descripcion) next.descripcion = 'Transferencia entre cuentas';
  } else if (next.tipo === 'PAGO_DEUDA') {
    next.metodoPago = null;
    next.categoria = null;
    next.cuentaDestinoId = null;
    if (!next.descripcion) next.descripcion = 'Pago de deuda';
  } else if (next.tipo === 'INGRESO') {
    next.cuentaDestinoId = null;
    next.deudaId = null;
  } else if (next.tipo === 'GASTO') {
    next.cuentaDestinoId = null;
    next.deudaId = null;
  }

  return next;
}

async function calcularResumen(where) {
  const [ingresos, gastos] = await Promise.all([
    prisma.transaccion.aggregate({
      where: { ...where, tipo: 'INGRESO' },
      _sum: { monto: true },
      _count: true,
    }),
    prisma.transaccion.aggregate({
      where: { ...where, tipo: { in: ['GASTO', 'PAGO_DEUDA'] } },
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
    if (fechaInicio) where.fecha.gte = startOfDayUTC(fechaInicio);
    if (fechaFin) where.fecha.lte = endOfDayUTC(fechaFin);
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

async function sincronizarPagoDeuda(tx, transaccion, { crear = true } = {}) {
  if (transaccion.tipo !== 'PAGO_DEUDA' || !transaccion.deudaId) return;

  const existente = await tx.pagoDeuda.findFirst({
    where: { transaccionId: transaccion.id },
  });

  if (!crear) {
    if (existente) {
      await tx.pagoDeuda.delete({ where: { id: existente.id } });
    }
    return;
  }

  const payload = {
    monto: Number(transaccion.monto),
    capital: Number(transaccion.monto),
    interes: 0,
    fecha: transaccion.fecha,
    notas: transaccion.notas || null,
    deudaId: Number(transaccion.deudaId),
    transaccionId: transaccion.id,
  };

  if (existente) {
    await tx.pagoDeuda.update({
      where: { id: existente.id },
      data: payload,
    });
  } else {
    await tx.pagoDeuda.create({ data: payload });
  }
}

exports.crearTransaccion = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const body = normalizarPayloadPorTipo(pickTransaccionData(req.body));

  try {
    const transaccion = await prisma.$transaction(async (tx) => {
      await validarCuentasTransaccion(tx, userId, body);

      if (body.tipo === 'PAGO_DEUDA') {
        const deuda = await validarDeudaParaPago(tx, userId, body.deudaId, body.monto);
        if (!body.descripcion || body.descripcion === 'Pago de deuda') {
          body.descripcion = `Pago de deuda: ${deuda.nombre}`;
        }
      }

      const creada = await tx.transaccion.create({
        data: {
          ...body,
          userId,
          fecha: body.fecha ? parseDateOnly(body.fecha) : undefined,
          esTransferencia: body.tipo === 'TRANSFERENCIA',
        },
      });

      await aplicarEfectoSaldo(tx, creada, 1);

      if (creada.tipo === 'PAGO_DEUDA') {
        await aplicarEfectoDeuda(tx, creada.deudaId, creada.monto, 1);
        await sincronizarPagoDeuda(tx, creada, { crear: true });
      }

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
        deudaId: true,
        cuentaOrigen: { select: { id: true, nombre: true } },
        cuentaDestino: { select: { id: true, nombre: true } },
        deuda: { select: { id: true, nombre: true, acreedor: true } },
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
    include: {
      deuda: {
        select: {
          id: true,
          nombre: true,
          acreedor: true,
          montoInicial: true,
          montoActual: true,
          pagada: true,
        },
      },
      cuentaOrigen: { select: { id: true, nombre: true, saldoActual: true, activa: true } },
      cuentaDestino: { select: { id: true, nombre: true, saldoActual: true, activa: true } },
    },
  });

  if (!transaccion) {
    throw new NotFoundError('Transaccion');
  }

  res.json({ success: true, transaccion });
});

exports.actualizarTransaccion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const data = normalizarPayloadPorTipo(pickTransaccionData(req.body));

  try {
    const transaccion = await prisma.$transaction(async (tx) => {
      const existente = await tx.transaccion.findFirst({
        where: { id: parseInt(id), userId },
      });
      if (!existente) {
        throw new NotFoundError('Transaccion');
      }

      const merged = {
        ...existente,
        ...data,
        tipo: data.tipo || existente.tipo,
        monto: data.monto != null ? data.monto : existente.monto,
        cuentaOrigenId:
          data.cuentaOrigenId !== undefined
            ? data.cuentaOrigenId
            : existente.cuentaOrigenId,
        cuentaDestinoId:
          data.cuentaDestinoId !== undefined
            ? data.cuentaDestinoId
            : existente.cuentaDestinoId,
        deudaId: data.deudaId !== undefined ? data.deudaId : existente.deudaId,
      };

      await validarCuentasTransaccion(tx, userId, merged);

      if (merged.tipo === 'PAGO_DEUDA') {
        const saldoExtra =
          existente.tipo === 'PAGO_DEUDA' &&
          Number(existente.deudaId) === Number(merged.deudaId)
            ? Number(existente.monto)
            : 0;
        await validarDeudaParaPago(
          tx,
          userId,
          merged.deudaId,
          merged.monto,
          saldoExtra
        );
      }

      // Revertir efectos previos
      await aplicarEfectoSaldo(tx, existente, -1);
      if (existente.tipo === 'PAGO_DEUDA' && existente.deudaId) {
        await aplicarEfectoDeuda(tx, existente.deudaId, existente.monto, -1);
        await sincronizarPagoDeuda(tx, existente, { crear: false });
      }

      const actualizada = await tx.transaccion.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          ...(data.fecha ? { fecha: parseDateOnly(data.fecha) } : {}),
          esTransferencia: merged.tipo === 'TRANSFERENCIA',
        },
      });

      await aplicarEfectoSaldo(tx, actualizada, 1);

      if (actualizada.tipo === 'PAGO_DEUDA') {
        await aplicarEfectoDeuda(tx, actualizada.deudaId, actualizada.monto, 1);
        await sincronizarPagoDeuda(tx, actualizada, { crear: true });
      }

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

      if (existente.tipo === 'PAGO_DEUDA' && existente.deudaId) {
        await aplicarEfectoDeuda(tx, existente.deudaId, existente.monto, -1);
        await sincronizarPagoDeuda(tx, existente, { crear: false });
      }

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
