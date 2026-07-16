const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { mapTipoNotificacion, toNotificacionDto } = require('../utils/mappers');
const {
  calcularProximaEjecucion,
  ejecutarPendientes,
} = require('../services/recurrentes.service');
const { logger } = require('../utils/logger');
const { parseDateOnly } = require('../utils/date');

// ============= CONTROLADOR DE TRANSACCIONES RECURRENTES =============

exports.obtenerTransaccionesRecurrentes = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const transaccionesRecurrentes = await prisma.transaccionRecurrente.findMany({
    where: { userId },
    include: {
      transacciones: {
        orderBy: { fecha: 'desc' },
        take: 5,
      },
    },
    orderBy: { proximaEjecucion: 'asc' },
  });

  const estadisticas = {
    total: transaccionesRecurrentes.length,
    activas: transaccionesRecurrentes.filter((tr) => tr.activa).length,
    inactivas: transaccionesRecurrentes.filter((tr) => !tr.activa).length,
    proximasEjecuciones: transaccionesRecurrentes
      .filter((tr) => tr.activa && tr.proximaEjecucion > new Date())
      .slice(0, 5),
  };

  res.status(200).json({
    success: true,
    transaccionesRecurrentes,
    estadisticas,
  });
});

exports.crearTransaccionRecurrente = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const {
    nombre,
    descripcion,
    tipo,
    monto,
    categoria,
    frecuencia,
    diaEjecucion,
    diaSemana,
    fechaInicio,
    fechaFin,
    activa,
  } = req.body;

  if (!nombre || !tipo || !monto || !frecuencia) {
    throw new ValidationError('Nombre, tipo, monto y frecuencia son obligatorios');
  }

  const proximaEjecucion = calcularProximaEjecucion(
    frecuencia,
    fechaInicio,
    diaEjecucion,
    diaSemana
  );

  const transaccionRecurrente = await prisma.transaccionRecurrente.create({
    data: {
      nombre,
      descripcion,
      tipo,
      monto,
      categoria,
      frecuencia,
      diaEjecucion,
      diaSemana,
      fechaInicio: parseDateOnly(fechaInicio),
      fechaFin: fechaFin ? parseDateOnly(fechaFin) : null,
      proximaEjecucion,
      activa: activa !== undefined ? Boolean(activa) : true,
      userId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Transaccion recurrente creada exitosamente',
    transaccionRecurrente,
  });
});

exports.actualizarTransaccionRecurrente = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    tipo,
    monto,
    categoria,
    frecuencia,
    diaEjecucion,
    diaSemana,
    fechaInicio,
    fechaFin,
    activa,
  } = req.body;

  const existente = await prisma.transaccionRecurrente.findFirst({
    where: { id: parseInt(id), userId },
  });

  if (!existente) {
    throw new NotFoundError('Transaccion recurrente');
  }

  const updateData = {};
  if (nombre != null) updateData.nombre = nombre;
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (tipo != null) updateData.tipo = tipo;
  if (monto != null) updateData.monto = Number(monto);
  if (categoria !== undefined) updateData.categoria = categoria;
  if (frecuencia != null) updateData.frecuencia = frecuencia;
  if (diaEjecucion !== undefined) {
    updateData.diaEjecucion = diaEjecucion != null ? Number(diaEjecucion) : null;
  }
  if (diaSemana !== undefined) {
    updateData.diaSemana = diaSemana != null ? Number(diaSemana) : null;
  }
  if (fechaInicio) updateData.fechaInicio = parseDateOnly(fechaInicio);
  if (fechaFin !== undefined) {
    updateData.fechaFin = fechaFin ? parseDateOnly(fechaFin) : null;
  }
  if (activa !== undefined) updateData.activa = Boolean(activa);

  if (frecuencia || fechaInicio || diaEjecucion !== undefined || diaSemana !== undefined) {
    updateData.proximaEjecucion = calcularProximaEjecucion(
      frecuencia || existente.frecuencia,
      fechaInicio || existente.fechaInicio,
      diaEjecucion !== undefined ? diaEjecucion : existente.diaEjecucion,
      diaSemana !== undefined ? diaSemana : existente.diaSemana
    );
  }

  const transaccionRecurrente = await prisma.transaccionRecurrente.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Transaccion recurrente actualizada exitosamente',
    transaccionRecurrente,
  });
});

exports.eliminarTransaccionRecurrente = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const resultado = await prisma.transaccionRecurrente.deleteMany({
    where: { id: parseInt(id), userId },
  });

  if (resultado.count === 0) {
    throw new NotFoundError('Transaccion recurrente');
  }

  res.status(200).json({
    success: true,
    message: 'Transaccion recurrente eliminada exitosamente',
  });
});

exports.toggleTransaccionRecurrente = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { activa } = req.body;

  const existente = await prisma.transaccionRecurrente.findFirst({
    where: { id: parseInt(id), userId },
  });

  if (!existente) {
    throw new NotFoundError('Transaccion recurrente');
  }

  const nuevoEstado = activa !== undefined ? Boolean(activa) : !existente.activa;

  const transaccionRecurrente = await prisma.transaccionRecurrente.update({
    where: { id: parseInt(id) },
    data: { activa: nuevoEstado },
  });

  res.status(200).json({
    success: true,
    message: 'Estado actualizado exitosamente',
    transaccionRecurrente,
  });
});

/** Forzar ahora: solo recurrentes del usuario autenticado */
exports.ejecutarTransaccionesRecurrentes = catchAsync(async (req, res) => {
  const resumen = await ejecutarPendientes({ userId: req.user.id });

  res.status(200).json({
    success: true,
    message: `Procesadas ${resumen.pendientes} transacciones recurrentes`,
    resultados: resumen.resultados,
    procesadas: resumen.procesadas,
    errores: resumen.errores,
  });
});

/** Endpoint interno (cron / worker) protegido con CRON_SECRET */
exports.ejecutarRecurrentesInterno = catchAsync(async (req, res) => {
  logger.info('Ejecuci?n interna de recurrentes solicitada');
  const resumen = await ejecutarPendientes();

  res.status(200).json({
    success: true,
    message: `Procesadas ${resumen.pendientes} recurrentes (global)`,
    pendientes: resumen.pendientes,
    procesadas: resumen.procesadas,
    errores: resumen.errores,
  });
});

// ============= CONTROLADOR DE NOTIFICACIONES =============

exports.obtenerNotificaciones = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { limit = 20, offset = 0, soloNoLeidas = false, leida } = req.query;

  const filtros = { userId };
  if (soloNoLeidas === 'true' || leida === 'false') {
    filtros.leida = false;
  } else if (leida === 'true') {
    filtros.leida = true;
  }

  const notificaciones = await prisma.notificacion.findMany({
    where: filtros,
    orderBy: { fechaEnvio: 'desc' },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  const contadores = await prisma.notificacion.groupBy({
    by: ['leida'],
    where: { userId },
    _count: { leida: true },
  });

  const noLeidas = contadores.find((c) => !c.leida)?._count?.leida || 0;
  const leidas = contadores.find((c) => c.leida)?._count?.leida || 0;

  res.status(200).json({
    success: true,
    notificaciones: notificaciones.map(toNotificacionDto),
    contadores: {
      noLeidas,
      leidas,
      total: noLeidas + leidas,
    },
  });
});

exports.crearNotificacion = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { titulo, mensaje, tipo, datos } = req.body;

  if (!titulo || !mensaje || !tipo) {
    throw new ValidationError('Titulo, mensaje y tipo son obligatorios');
  }

  const tipoNormalizado = mapTipoNotificacion(tipo);

  const notificacion = await prisma.notificacion.create({
    data: {
      titulo,
      mensaje,
      tipo: tipoNormalizado,
      datos,
      userId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Notificacion creada exitosamente',
    notificacion: toNotificacionDto(notificacion),
  });
});

exports.marcarComoLeida = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const notificacion = await prisma.notificacion.updateMany({
    where: { id: parseInt(id), userId },
    data: { leida: true, fechaLeida: new Date() },
  });

  if (notificacion.count === 0) {
    throw new NotFoundError('Notificacion');
  }

  res.status(200).json({
    success: true,
    message: 'Notificacion marcada como leida',
  });
});

exports.marcarTodasLeidas = catchAsync(async (req, res) => {
  const userId = req.user.id;

  await prisma.notificacion.updateMany({
    where: { userId, leida: false },
    data: { leida: true, fechaLeida: new Date() },
  });

  res.status(200).json({
    success: true,
    message: 'Todas las notificaciones marcadas como leidas',
  });
});

exports.eliminarNotificacion = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const resultado = await prisma.notificacion.deleteMany({
    where: { id: parseInt(id), userId },
  });

  if (resultado.count === 0) {
    throw new NotFoundError('Notificacion');
  }

  res.status(200).json({
    success: true,
    message: 'Notificacion eliminada exitosamente',
  });
});
