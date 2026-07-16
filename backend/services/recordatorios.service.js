const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');
const { avanzarFechaRecordatorio } = require('../utils/recordatorios');

/**
 * Notifica recordatorios vencidos (activo, no completado, fecha <= ahora, sin notificar).
 * Idempotente vía flag `notificacionEnviada`.
 * @param {{ userId?: number }} options
 */
async function notificarVencidos({ userId } = {}) {
  const ahora = new Date();
  const where = {
    activo: true,
    completado: false,
    notificacionEnviada: false,
    fechaRecordatorio: { lte: ahora },
  };
  if (userId != null) {
    where.userId = userId;
  }

  const pendientes = await prisma.recordatorio.findMany({ where });
  const resumen = {
    pendientes: pendientes.length,
    notificados: 0,
    errores: 0,
  };

  for (const r of pendientes) {
    try {
      await prisma.$transaction(async (tx) => {
        const locked = await tx.recordatorio.findFirst({
          where: {
            id: r.id,
            activo: true,
            completado: false,
            notificacionEnviada: false,
          },
        });
        if (!locked) return;

        await tx.notificacion.create({
          data: {
            titulo: locked.titulo,
            mensaje:
              locked.descripcion ||
              `Recordatorio: ${locked.titulo}`,
            tipo: 'RECORDATORIO',
            datos: {
              recordatorioId: locked.id,
              tipoRecordatorio: locked.tipo,
            },
            userId: locked.userId,
          },
        });

        if (locked.repetir && locked.frecuencia) {
          const siguiente = avanzarFechaRecordatorio(
            locked.frecuencia,
            locked.fechaRecordatorio
          );
          await tx.recordatorio.update({
            where: { id: locked.id },
            data: {
              fechaRecordatorio: siguiente,
              notificacionEnviada: false,
              completado: false,
            },
          });
        } else {
          await tx.recordatorio.update({
            where: { id: locked.id },
            data: { notificacionEnviada: true },
          });
        }

        resumen.notificados += 1;
      });
    } catch (error) {
      resumen.errores += 1;
      logger.error('Error al notificar recordatorio', {
        recordatorioId: r.id,
        message: error.message,
      });
    }
  }

  return resumen;
}

module.exports = {
  notificarVencidos,
};
