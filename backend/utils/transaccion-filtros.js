const { startOfDayUTC, endOfDayUTC } = require('./date');

/**
 * Construye el where Prisma compartido para listados/resumen/reportes.
 */
function buildWhere(userId, query = {}) {
  const { tipo, categoria, fechaInicio, fechaFin, search, montoMin, montoMax } =
    query;
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

  if (montoMin != null || montoMax != null) {
    where.monto = {};
    if (montoMin != null && montoMin !== '') {
      const min = Number(montoMin);
      if (Number.isFinite(min)) where.monto.gte = min;
    }
    if (montoMax != null && montoMax !== '') {
      const max = Number(montoMax);
      if (Number.isFinite(max)) where.monto.lte = max;
    }
    if (Object.keys(where.monto).length === 0) delete where.monto;
  }

  if (search) {
    where.OR = [
      { descripcion: { contains: search, mode: 'insensitive' } },
      { notas: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}

module.exports = { buildWhere };
