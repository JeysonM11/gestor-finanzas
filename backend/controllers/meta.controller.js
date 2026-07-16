const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { parseDateOnly } = require('../utils/date');
const { crearMovimientoEnTx } = require('../services/movimiento.service');
const { sincronizarPorTransaccion } = require('../utils/presupuesto');

function calcProgreso(montoActual, montoObjetivo) {
  if (!montoObjetivo || montoObjetivo <= 0) return 0;
  return Math.min(100, Number(((montoActual / montoObjetivo) * 100).toFixed(2)));
}

function aplicarCompletada(data, montoActual, montoObjetivo) {
  const progreso = calcProgreso(montoActual, montoObjetivo);
  data.progreso = progreso;
  if (progreso >= 100 && !data.completada) {
    data.completada = true;
    data.fechaCompletada = new Date();
  }
  return data;
}

exports.obtenerMetas = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { completada, tipo } = req.query;

  const where = { userId };
  if (completada === 'true') where.completada = true;
  if (completada === 'false') where.completada = false;
  if (tipo) where.tipo = tipo;

  const metas = await prisma.meta.findMany({
    where,
    orderBy: [{ completada: 'asc' }, { fechaLimite: 'asc' }],
  });

  const activas = metas.filter((m) => !m.completada);
  const resumen = {
    total: metas.length,
    activas: activas.length,
    completadas: metas.length - activas.length,
    montoObjetivoTotal: activas.reduce((s, m) => s + m.montoObjetivo, 0),
    montoActualTotal: activas.reduce((s, m) => s + m.montoActual, 0),
  };

  res.status(200).json({ success: true, metas, resumen });
});

exports.obtenerMetaPorId = catchAsync(async (req, res) => {
  const meta = await prisma.meta.findFirst({
    where: { id: parseInt(req.params.id), userId: req.user.id },
  });
  if (!meta) throw new NotFoundError('Meta');
  res.json({ success: true, meta });
});

exports.crearMeta = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const {
    titulo,
    descripcion,
    tipo,
    montoObjetivo,
    montoActual,
    fechaInicio,
    fechaLimite,
    categoria,
    prioridad,
    recordatorios,
    publica,
    cuentaOrigenId,
  } = req.body;

  if (!titulo || !montoObjetivo || !fechaLimite) {
    throw new ValidationError('titulo, montoObjetivo y fechaLimite son obligatorios');
  }

  if (cuentaOrigenId) {
    const cuenta = await prisma.cuenta.findFirst({
      where: { id: Number(cuentaOrigenId), userId, activa: true },
    });
    if (!cuenta) throw new ValidationError('Cuenta de origen no encontrada');
  }

  const actual = Number(montoActual) || 0;
  const objetivo = Number(montoObjetivo);
  const data = aplicarCompletada(
    {
      titulo,
      descripcion,
      tipo: tipo || 'AHORRO',
      montoObjetivo: objetivo,
      montoActual: actual,
      fechaInicio: fechaInicio ? parseDateOnly(fechaInicio) : new Date(),
      fechaLimite: parseDateOnly(fechaLimite),
      categoria,
      prioridad: prioridad || 'MEDIA',
      recordatorios: recordatorios !== undefined ? Boolean(recordatorios) : true,
      publica: Boolean(publica),
      cuentaOrigenId: cuentaOrigenId ? Number(cuentaOrigenId) : null,
      userId,
    },
    actual,
    objetivo
  );

  const meta = await prisma.meta.create({ data });
  try {
    const { verificarLogrosAsync } = require('../services/gamificacion.service');
    verificarLogrosAsync(userId);
  } catch (_) {
    /* no bloquear */
  }
  res.status(201).json({
    success: true,
    message: 'Meta creada exitosamente',
    meta,
  });
});

exports.actualizarMeta = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existente = await prisma.meta.findFirst({
    where: { id: parseInt(id), userId },
  });
  if (!existente) throw new NotFoundError('Meta');

  const {
    titulo,
    descripcion,
    tipo,
    montoObjetivo,
    montoActual,
    fechaInicio,
    fechaLimite,
    categoria,
    prioridad,
    recordatorios,
    publica,
    completada,
    cuentaOrigenId,
  } = req.body;

  const updateData = {};
  if (titulo != null) updateData.titulo = titulo;
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (tipo != null) updateData.tipo = tipo;
  if (montoObjetivo != null) updateData.montoObjetivo = Number(montoObjetivo);
  if (montoActual != null) updateData.montoActual = Number(montoActual);
  if (fechaInicio) updateData.fechaInicio = parseDateOnly(fechaInicio);
  if (fechaLimite) updateData.fechaLimite = parseDateOnly(fechaLimite);
  if (categoria !== undefined) updateData.categoria = categoria;
  if (prioridad != null) updateData.prioridad = prioridad;
  if (recordatorios !== undefined) updateData.recordatorios = Boolean(recordatorios);
  if (publica !== undefined) updateData.publica = Boolean(publica);
  if (cuentaOrigenId !== undefined) {
    if (cuentaOrigenId) {
      const cuenta = await prisma.cuenta.findFirst({
        where: { id: Number(cuentaOrigenId), userId, activa: true },
      });
      if (!cuenta) throw new ValidationError('Cuenta de origen no encontrada');
    }
    updateData.cuentaOrigenId = cuentaOrigenId ? Number(cuentaOrigenId) : null;
  }

  const nuevoActual =
    updateData.montoActual != null ? updateData.montoActual : existente.montoActual;
  const nuevoObjetivo =
    updateData.montoObjetivo != null ? updateData.montoObjetivo : existente.montoObjetivo;

  if (completada === false) {
    updateData.completada = false;
    updateData.fechaCompletada = null;
    updateData.progreso = calcProgreso(nuevoActual, nuevoObjetivo);
  } else if (completada === true) {
    updateData.completada = true;
    updateData.fechaCompletada = new Date();
    updateData.progreso = 100;
  } else {
    aplicarCompletada(updateData, nuevoActual, nuevoObjetivo);
  }

  const meta = await prisma.meta.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  res.json({ success: true, message: 'Meta actualizada', meta });
});

exports.aportarMeta = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const monto = Number(req.body.monto);
  const cuentaOrigenId =
    req.body.cuentaOrigenId != null
      ? Number(req.body.cuentaOrigenId)
      : null;
  const categoria = req.body.categoria || null;

  if (!monto || monto <= 0) {
    throw new ValidationError('monto debe ser un número positivo');
  }

  const existente = await prisma.meta.findFirst({
    where: { id: parseInt(id), userId },
  });
  if (!existente) throw new NotFoundError('Meta');

  const cuentaId = cuentaOrigenId || existente.cuentaOrigenId || null;

  let meta;
  let transaccion = null;

  if (cuentaId) {
    const result = await prisma.$transaction(async (tx) => {
      const movimiento = await crearMovimientoEnTx(tx, userId, {
        tipo: 'GASTO',
        monto,
        cuentaOrigenId: cuentaId,
        categoria: categoria || existente.categoria || 'Ahorro',
        descripcion: `Aporte a meta: ${existente.titulo}`,
      });

      const montoActual = existente.montoActual + monto;
      const updateData = aplicarCompletada(
        { montoActual },
        montoActual,
        existente.montoObjetivo
      );

      const metaActualizada = await tx.meta.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      return { meta: metaActualizada, transaccion: movimiento };
    });

    meta = result.meta;
    transaccion = result.transaccion;
    await sincronizarPorTransaccion(userId, transaccion).catch(() => {});
  } else {
    const montoActual = existente.montoActual + monto;
    const updateData = aplicarCompletada(
      { montoActual },
      montoActual,
      existente.montoObjetivo
    );

    meta = await prisma.meta.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  try {
    const { verificarLogrosAsync } = require('../services/gamificacion.service');
    verificarLogrosAsync(userId);
  } catch (_) {
    /* no bloquear */
  }

  res.json({
    success: true,
    message: 'Aporte registrado',
    meta,
    aporte: monto,
    transaccion,
  });
});

exports.eliminarMeta = catchAsync(async (req, res) => {
  const resultado = await prisma.meta.deleteMany({
    where: { id: parseInt(req.params.id), userId: req.user.id },
  });
  if (resultado.count === 0) throw new NotFoundError('Meta');
  res.json({ success: true, message: 'Meta eliminada exitosamente' });
});
