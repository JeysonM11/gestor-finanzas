const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { parseDateOnly, startOfDayUTC, endOfDayUTC } = require('../utils/date');
const { notificarVencidos } = require('../services/recordatorios.service');

function parseFechaRecordatorio(value) {
  if (value == null || value === '') return null;
  const str = String(value).trim();
  // Solo día → mediodía UTC; con hora → Date normal
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return parseDateOnly(str);
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

exports.obtenerRecordatorios = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { soloPendientes, fechaInicio, fechaFin, tipo } = req.query;

  const where = { userId, activo: true };

  if (soloPendientes === 'true' || soloPendientes === '1') {
    where.completado = false;
  }

  if (tipo) {
    where.tipo = tipo;
  }

  if (fechaInicio || fechaFin) {
    where.fechaRecordatorio = {};
    if (fechaInicio) {
      where.fechaRecordatorio.gte = startOfDayUTC(fechaInicio);
    }
    if (fechaFin) {
      where.fechaRecordatorio.lte = endOfDayUTC(fechaFin);
    }
  }

  const recordatorios = await prisma.recordatorio.findMany({
    where,
    orderBy: [{ completado: 'asc' }, { fechaRecordatorio: 'asc' }],
  });

  const pendientes = recordatorios.filter((r) => !r.completado).length;

  res.status(200).json({
    success: true,
    recordatorios,
    resumen: {
      total: recordatorios.length,
      pendientes,
      completados: recordatorios.length - pendientes,
    },
  });
});

exports.obtenerRecordatorio = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const recordatorio = await prisma.recordatorio.findFirst({
    where: { id: parseInt(id, 10), userId, activo: true },
  });

  if (!recordatorio) {
    throw new NotFoundError('Recordatorio');
  }

  res.status(200).json({ success: true, recordatorio });
});

exports.crearRecordatorio = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const {
    titulo,
    descripcion,
    tipo = 'GENERAL',
    fechaRecordatorio,
    repetir = false,
    frecuencia,
    activo = true,
  } = req.body;

  const fecha = parseFechaRecordatorio(fechaRecordatorio);
  if (!fecha) {
    throw new ValidationError('fechaRecordatorio inválida');
  }

  if (repetir && !frecuencia) {
    throw new ValidationError('frecuencia es obligatoria si repetir es true');
  }

  const recordatorio = await prisma.recordatorio.create({
    data: {
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() || null,
      tipo,
      fechaRecordatorio: fecha,
      repetir: Boolean(repetir),
      frecuencia: repetir ? frecuencia : frecuencia || null,
      activo: Boolean(activo),
      userId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Recordatorio creado exitosamente',
    recordatorio,
  });
});

exports.actualizarRecordatorio = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    titulo,
    descripcion,
    tipo,
    fechaRecordatorio,
    repetir,
    frecuencia,
    completado,
    activo,
  } = req.body;

  const existente = await prisma.recordatorio.findFirst({
    where: { id: parseInt(id, 10), userId, activo: true },
  });

  if (!existente) {
    throw new NotFoundError('Recordatorio');
  }

  const data = {};
  if (titulo != null) data.titulo = titulo.trim();
  if (descripcion !== undefined) {
    data.descripcion = descripcion?.trim() || null;
  }
  if (tipo != null) data.tipo = tipo;
  if (fechaRecordatorio !== undefined) {
    const fecha = parseFechaRecordatorio(fechaRecordatorio);
    if (!fecha) throw new ValidationError('fechaRecordatorio inválida');
    data.fechaRecordatorio = fecha;
    // Si se cambia la fecha, permitir nueva notificación
    data.notificacionEnviada = false;
  }
  if (repetir !== undefined) data.repetir = Boolean(repetir);
  if (frecuencia !== undefined) {
    data.frecuencia = frecuencia || null;
  }
  if (completado !== undefined) data.completado = Boolean(completado);
  if (activo !== undefined) data.activo = Boolean(activo);

  const repetirFinal =
    data.repetir !== undefined ? data.repetir : existente.repetir;
  const frecuenciaFinal =
    data.frecuencia !== undefined ? data.frecuencia : existente.frecuencia;
  if (repetirFinal && !frecuenciaFinal) {
    throw new ValidationError('frecuencia es obligatoria si repetir es true');
  }

  const recordatorio = await prisma.recordatorio.update({
    where: { id: existente.id },
    data,
  });

  res.status(200).json({
    success: true,
    message: 'Recordatorio actualizado exitosamente',
    recordatorio,
  });
});

exports.completarRecordatorio = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existente = await prisma.recordatorio.findFirst({
    where: { id: parseInt(id, 10), userId, activo: true },
  });

  if (!existente) {
    throw new NotFoundError('Recordatorio');
  }

  const recordatorio = await prisma.recordatorio.update({
    where: { id: existente.id },
    data: { completado: true },
  });

  res.status(200).json({
    success: true,
    message: 'Recordatorio marcado como completado',
    recordatorio,
  });
});

exports.reactivarRecordatorio = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existente = await prisma.recordatorio.findFirst({
    where: { id: parseInt(id, 10), userId },
  });

  if (!existente) {
    throw new NotFoundError('Recordatorio');
  }

  const recordatorio = await prisma.recordatorio.update({
    where: { id: existente.id },
    data: {
      completado: false,
      activo: true,
      notificacionEnviada: false,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Recordatorio reactivado',
    recordatorio,
  });
});

/** Soft-delete */
exports.eliminarRecordatorio = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existente = await prisma.recordatorio.findFirst({
    where: { id: parseInt(id, 10), userId, activo: true },
  });

  if (!existente) {
    throw new NotFoundError('Recordatorio');
  }

  await prisma.recordatorio.update({
    where: { id: existente.id },
    data: { activo: false },
  });

  res.status(200).json({
    success: true,
    message: 'Recordatorio desactivado exitosamente',
  });
});

exports.ejecutarRecordatoriosUsuario = catchAsync(async (req, res) => {
  const resumen = await notificarVencidos({ userId: req.user.id });
  res.status(200).json({
    success: true,
    message: 'Recordatorios vencidos procesados',
    resumen,
  });
});

exports.ejecutarRecordatoriosInterno = catchAsync(async (req, res) => {
  const resumen = await notificarVencidos();
  res.status(200).json({
    success: true,
    message: 'Recordatorios vencidos procesados (interno)',
    resumen,
  });
});
