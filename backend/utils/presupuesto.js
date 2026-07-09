const prisma = require('../lib/prisma');
const { logger } = require('./logger');

function mesAnioDeFecha(fecha) {
  const d = fecha ? new Date(fecha) : new Date();
  return { mes: d.getMonth() + 1, anio: d.getFullYear() };
}

/**
 * Recalcula `gastado` de un presupuesto a partir de transacciones GASTO del mes.
 * Emite notificación si se cruza el umbral de alerta.
 */
async function sincronizarPresupuesto(userId, categoria, mes, anio) {
  if (!categoria) return null;

  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 0, 23, 59, 59, 999);

  const agg = await prisma.transaccion.aggregate({
    where: {
      userId,
      tipo: 'GASTO',
      categoria,
      fecha: { gte: inicio, lte: fin },
    },
    _sum: { monto: true },
  });

  const gastado = agg._sum.monto || 0;

  const presupuesto = await prisma.presupuesto.findFirst({
    where: {
      userId,
      categoria,
      mes,
      año: anio,
      activo: true,
    },
  });

  if (!presupuesto) return null;

  const actualizado = await prisma.presupuesto.update({
    where: { id: presupuesto.id },
    data: { gastado },
  });

  await evaluarAlertaPresupuesto(actualizado);
  return actualizado;
}

async function evaluarAlertaPresupuesto(presupuesto) {
  if (!presupuesto.alertaEn || presupuesto.notificacionEnviada) return;
  if (!presupuesto.limite || presupuesto.limite <= 0) return;

  const porcentaje = (presupuesto.gastado / presupuesto.limite) * 100;
  if (porcentaje < presupuesto.alertaEn) return;

  try {
    await prisma.notificacion.create({
      data: {
        titulo: 'Alerta de presupuesto',
        mensaje: `Has alcanzado el ${porcentaje.toFixed(0)}% del presupuesto de "${presupuesto.categoria}" (${presupuesto.mes}/${presupuesto.año}).`,
        tipo: 'ALERTA',
        datos: {
          presupuestoId: presupuesto.id,
          categoria: presupuesto.categoria,
          porcentaje,
        },
        userId: presupuesto.userId,
      },
    });

    await prisma.presupuesto.update({
      where: { id: presupuesto.id },
      data: { notificacionEnviada: true },
    });
  } catch (error) {
    logger.error('Error al crear alerta de presupuesto', {
      presupuestoId: presupuesto.id,
      message: error.message,
    });
  }
}

/**
 * Tras crear/editar/eliminar un gasto, sincroniza el presupuesto de esa categoría/mes.
 */
async function sincronizarPorTransaccion(userId, transaccion) {
  if (!transaccion || transaccion.tipo !== 'GASTO' || !transaccion.categoria) {
    return null;
  }
  const { mes, anio } = mesAnioDeFecha(transaccion.fecha);
  return sincronizarPresupuesto(userId, transaccion.categoria, mes, anio);
}

/**
 * Recalcula todos los presupuestos activos del usuario (mes/año opcional).
 */
async function sincronizarTodos(userId, mes, anio) {
  const where = { userId, activo: true };
  if (mes != null) where.mes = Number(mes);
  if (anio != null) where.año = Number(anio);

  const presupuestos = await prisma.presupuesto.findMany({ where });
  const resultados = [];

  for (const p of presupuestos) {
    const actualizado = await sincronizarPresupuesto(
      userId,
      p.categoria,
      p.mes,
      p.año
    );
    if (actualizado) resultados.push(actualizado);
  }

  return resultados;
}

function toPresupuestoDto(p) {
  if (!p) return p;
  const porcentaje =
    p.limite > 0 ? Math.min(100, (p.gastado / p.limite) * 100) : 0;
  return {
    ...p,
    anio: p.año,
    porcentajeUsado: Number(porcentaje.toFixed(1)),
    restante: Math.max(0, p.limite - p.gastado),
    excedido: p.gastado > p.limite,
  };
}

module.exports = {
  mesAnioDeFecha,
  sincronizarPresupuesto,
  sincronizarPorTransaccion,
  sincronizarTodos,
  evaluarAlertaPresupuesto,
  toPresupuestoDto,
};
