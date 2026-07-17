const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');

/**
 * Evalúa y otorga logros de forma idempotente.
 * Solo notifica/suma puntos cuando el UserLogro se crea por primera vez.
 */
async function verificarYOtorgarLogros(userId) {
  const otorgados = [];

  const [transacciones, inversiones, deudasPagadas, deudasTotales, ingresos, gastos] =
    await Promise.all([
      prisma.transaccion.count({ where: { userId } }),
      prisma.inversion.count({ where: { userId, activa: true } }),
      prisma.deuda.count({ where: { userId, pagada: true } }),
      prisma.deuda.count({ where: { userId } }),
      prisma.transaccion.aggregate({
        where: { userId, tipo: 'INGRESO' },
        _sum: { monto: true },
      }),
      prisma.transaccion.aggregate({
        where: { userId, tipo: { in: ['GASTO', 'PAGO_DEUDA'] } },
        _sum: { monto: true },
      }),
    ]);

  const ahorroTotal = (ingresos._sum.monto || 0) - (gastos._sum.monto || 0);

  const reglas = [
    { nombre: 'Primera Transacción', ok: transacciones >= 1 },
    { nombre: 'Inversionista', ok: inversiones >= 1 },
    {
      nombre: 'Libre de Deudas',
      ok: deudasTotales > 0 && deudasPagadas === deudasTotales,
    },
    { nombre: 'Ahorrador Principiante', ok: ahorroTotal >= 1000 },
  ];

  for (const regla of reglas) {
    if (!regla.ok) continue;

    const logro = await prisma.logro.findFirst({
      where: { nombre: regla.nombre, activo: true },
    });
    if (!logro) continue;

    try {
      await prisma.userLogro.create({
        data: { userId, logroId: logro.id },
      });
      otorgados.push(logro);

      await prisma.notificacion.create({
        data: {
          titulo: 'Nuevo logro',
          mensaje: `Has desbloqueado: ${logro.nombre}`,
          tipo: 'LOGRO',
          userId,
          datos: { logroId: logro.id, variant: 'success' },
        },
      }).catch(() => {});
    } catch (error) {
      // P2002 = unique violation → ya existía (idempotente)
      if (error.code !== 'P2002') {
        logger.warn('Error al otorgar logro', {
          userId,
          logro: regla.nombre,
          message: error.message,
        });
      }
    }
  }

  const logrosObtenidos = await prisma.userLogro.findMany({
    where: { userId },
    include: { logro: true },
  });
  const puntosTotal = logrosObtenidos.reduce(
    (sum, ul) => sum + ul.logro.puntos,
    0
  );
  const nivel = Math.floor(puntosTotal / 1000) + 1;

  await prisma.user.update({
    where: { id: userId },
    data: { puntosAcumulados: puntosTotal, nivel },
  });

  return {
    otorgados: otorgados.map((l) => l.nombre),
    puntosTotal,
    nivel,
  };
}

/** Fire-and-forget seguro: nunca lanza al caller. */
function verificarLogrosAsync(userId) {
  if (!userId) return;
  setImmediate(() => {
    verificarYOtorgarLogros(userId).catch((err) => {
      logger.warn('Gamificacion async falló', {
        userId,
        message: err.message,
      });
    });
  });
}

module.exports = {
  verificarYOtorgarLogros,
  verificarLogrosAsync,
};
