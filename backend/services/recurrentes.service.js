const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');
const { crearMovimientoEnTx } = require('./movimiento.service');
const { sincronizarPorTransaccion } = require('../utils/presupuesto');

function getLastDayOfMonth(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
}

function calcularProximaEjecucion(frecuencia, fechaBase, diaEjecucion, diaSemana) {
  const fecha = new Date(fechaBase);

  switch (frecuencia) {
    case 'DIARIA':
      fecha.setDate(fecha.getDate() + 1);
      break;
    case 'SEMANAL': {
      if (diaSemana != null && diaSemana >= 0 && diaSemana <= 6) {
        const actual = fecha.getDay();
        let delta = (Number(diaSemana) - actual + 7) % 7;
        if (delta === 0) delta = 7;
        fecha.setDate(fecha.getDate() + delta);
      } else {
        fecha.setDate(fecha.getDate() + 7);
      }
      break;
    }
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

function requiereConfiguracion(tr) {
  if (!tr.cuentaOrigenId) return true;
  if (tr.tipo === 'TRANSFERENCIA' && !tr.cuentaDestinoId) return true;
  if (tr.tipo === 'PAGO_DEUDA' && !tr.deudaId) return true;
  return false;
}

/**
 * Ejecuta recurrentes pendientes.
 * Una ocurrencia por tick; claim atómico evita duplicados.
 * @param {{ userId?: number }} options
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
    if (requiereConfiguracion(tr)) {
      // Avanzar agenda para no reintentar eternamente la misma ocurrencia
      const siguienteEjecucion = calcularProximaEjecucion(
        tr.frecuencia,
        tr.proximaEjecucion,
        tr.diaEjecucion,
        tr.diaSemana
      );
      await prisma.transaccionRecurrente.updateMany({
        where: {
          id: tr.id,
          activa: true,
          proximaEjecucion: tr.proximaEjecucion,
        },
        data: { proximaEjecucion: siguienteEjecucion },
      });
      logger.warn('Recurrente omitida: requiere configuración', {
        recurrenteId: tr.id,
        userId: tr.userId,
      });
      resultados.push({
        id: tr.id,
        userId: tr.userId,
        transaccionRecurrente: tr.nombre,
        error: 'Requiere configuracion de cuenta',
        omitida: true,
        siguienteEjecucion,
      });
      continue;
    }

    try {
      const ocurrencia = new Date(tr.proximaEjecucion);
      const siguienteEjecucion = calcularProximaEjecucion(
        tr.frecuencia,
        tr.proximaEjecucion,
        tr.diaEjecucion,
        tr.diaSemana
      );

      const resultado = await prisma.$transaction(async (tx) => {
        // Claim atómico: solo un worker avanza la fila
        const claimed = await tx.transaccionRecurrente.updateMany({
          where: {
            id: tr.id,
            activa: true,
            proximaEjecucion: tr.proximaEjecucion,
          },
          data: {
            proximaEjecucion: siguienteEjecucion,
            ejecutadas: { increment: 1 },
          },
        });

        if (claimed.count === 0) {
          return { skipped: true };
        }

        const payload = {
          tipo: tr.tipo,
          monto: tr.monto,
          descripcion: tr.descripcion || `${tr.nombre} (Automatica)`,
          categoria: tr.categoria,
          cuentaOrigenId: tr.cuentaOrigenId,
          cuentaDestinoId: tr.cuentaDestinoId,
          deudaId: tr.deudaId,
          transaccionRecurrenteId: tr.id,
          ocurrenciaRecurrente: ocurrencia,
          fecha: ocurrencia,
        };

        const nuevaTransaccion = await crearMovimientoEnTx(tx, tr.userId, payload);
        return { nuevaTransaccion, siguienteEjecucion };
      });

      if (resultado.skipped) {
        resultados.push({
          id: tr.id,
          userId: tr.userId,
          transaccionRecurrente: tr.nombre,
          skipped: true,
        });
        continue;
      }

      await sincronizarPorTransaccion(tr.userId, resultado.nuevaTransaccion).catch(
        () => {}
      );

      resultados.push({
        id: tr.id,
        userId: tr.userId,
        transaccionRecurrente: tr.nombre,
        transaccionCreada: resultado.nuevaTransaccion.id,
        monto: tr.monto,
        siguienteEjecucion: resultado.siguienteEjecucion,
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
        error: error.message || 'Error al crear transaccion',
      });
    }
  }

  return {
    pendientes: pendientes.length,
    procesadas: resultados.filter((r) => !r.error && !r.skipped && !r.omitida).length,
    errores: resultados.filter((r) => r.error).length,
    omitidas: resultados.filter((r) => r.omitida || r.skipped).length,
    resultados,
  };
}

module.exports = {
  calcularProximaEjecucion,
  ejecutarPendientes,
  requiereConfiguracion,
};
