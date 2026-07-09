const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');

function getLastDayOfMonth(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
}

function calcularProximaEjecucion(frecuencia, fechaBase, diaEjecucion, diaSemana) {
  const fecha = new Date(fechaBase);

  switch (frecuencia) {
    case 'DIARIA':
      fecha.setDate(fecha.getDate() + 1);
      break;
    case 'SEMANAL':
      fecha.setDate(fecha.getDate() + 7);
      break;
    case 'QUINCENAL':
      fecha.setDate(fecha.getDate() + 15);
      break;
    case 'MENSUAL':
      if (diaEjecucion) {
        fecha.setMonth(fecha.getMonth() + 1);
        fecha.setDate(Math.min(diaEjecucion, getLastDayOfMonth(fecha)));
      } else {
        fecha.setMonth(fecha.getMonth() + 1);
      }
      break;
    case 'BIMESTRAL':
      fecha.setMonth(fecha.getMonth() + 2);
      break;
    case 'TRIMESTRAL':
      fecha.setMonth(fecha.getMonth() + 3);
      break;
    case 'SEMESTRAL':
      fecha.setMonth(fecha.getMonth() + 6);
      break;
    case 'ANUAL':
      fecha.setFullYear(fecha.getFullYear() + 1);
      break;
    default:
      fecha.setDate(fecha.getDate() + 1);
  }

  return fecha;
}

/**
 * Ejecuta recurrentes pendientes.
 * @param {{ userId?: number }} options - Si se pasa userId, solo ese usuario (botón UI).
 */
async function ejecutarPendientes({ userId } = {}) {
  const ahora = new Date();
  const where = {
    activa: true,
    proximaEjecucion: { lte: ahora },
    OR: [{ fechaFin: null }, { fechaFin: { gte: ahora } }],
  };
  if (userId != null) {
    where.userId = userId;
  }

  const pendientes = await prisma.transaccionRecurrente.findMany({ where });
  const resultados = [];

  for (const tr of pendientes) {
    try {
      const nuevaTransaccion = await prisma.transaccion.create({
        data: {
          tipo: tr.tipo,
          monto: tr.monto,
          descripcion: tr.descripcion || `${tr.nombre} (Automatica)`,
          categoria: tr.categoria,
          userId: tr.userId,
          transaccionRecurrenteId: tr.id,
        },
      });

      const siguienteEjecucion = calcularProximaEjecucion(
        tr.frecuencia,
        tr.proximaEjecucion,
        tr.diaEjecucion,
        tr.diaSemana
      );

      await prisma.transaccionRecurrente.update({
        where: { id: tr.id },
        data: {
          proximaEjecucion: siguienteEjecucion,
          ejecutadas: tr.ejecutadas + 1,
        },
      });

      resultados.push({
        id: tr.id,
        userId: tr.userId,
        transaccionRecurrente: tr.nombre,
        transaccionCreada: nuevaTransaccion.id,
        monto: tr.monto,
        siguienteEjecucion,
      });
    } catch (error) {
      logger.error('Error al ejecutar recurrente', {
        recurrenteId: tr.id,
        userId: tr.userId,
        message: error.message,
      });
      resultados.push({
        id: tr.id,
        userId: tr.userId,
        transaccionRecurrente: tr.nombre,
        error: 'Error al crear transaccion',
      });
    }
  }

  return {
    pendientes: pendientes.length,
    procesadas: resultados.filter((r) => !r.error).length,
    errores: resultados.filter((r) => r.error).length,
    resultados,
  };
}

module.exports = {
  calcularProximaEjecucion,
  ejecutarPendientes,
};
