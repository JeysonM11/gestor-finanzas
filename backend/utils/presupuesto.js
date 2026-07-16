const prisma = require('../lib/prisma');
const { logger } = require('./logger');
const { mesAnioUTC } = require('./date');

function mesAnioDeFecha(fecha) {
  return mesAnioUTC(fecha);
}

/**
 * Recalcula el monto real de un presupuesto a partir de transacciones del mes.
 * Para mantener compatibilidad con el esquema histórico, el valor se persiste
 * en `gastado`: GASTO = consumido e INGRESO = recibido.
 * Emite notificación si se cruza el umbral de alerta.
 */
async function sincronizarPresupuesto(
  userId,
  categoria,
  mes,
  anio,
  tipo = 'GASTO'
) {
  if (!categoria) return null;

  const inicio = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0, 0));
  const fin = new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999));

  const agg = await prisma.transaccion.aggregate({
    where: {
      userId,
      tipo,
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
      tipo,
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
  if (presupuesto.tipo === 'INGRESO') return;
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
 * Tras crear/editar/eliminar un ingreso o gasto, sincroniza su presupuesto.
 */
async function sincronizarPorTransaccion(userId, transaccion) {
  if (
    !transaccion ||
    !['INGRESO', 'GASTO'].includes(transaccion.tipo) ||
    !transaccion.categoria
  ) {
    return null;
  }
  const { mes, anio } = mesAnioDeFecha(transaccion.fecha);
  return sincronizarPresupuesto(
    userId,
    transaccion.categoria,
    mes,
    anio,
    transaccion.tipo
  );
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
      p.año,
      p.tipo
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
    montoReal: p.gastado,
    porcentajeUsado: Number(porcentaje.toFixed(1)),
    restante: Math.max(0, p.limite - p.gastado),
    excedido: p.tipo !== 'INGRESO' && p.gastado > p.limite,
    cumplido: p.tipo === 'INGRESO' && p.gastado >= p.limite,
  };
}

function calcularResumenMensual(presupuestos, transacciones, mes, anio) {
  const ingresos = presupuestos.filter((p) => p.tipo === 'INGRESO');
  const gastos = presupuestos.filter((p) => p.tipo !== 'INGRESO');
  const sumar = (items, campo) =>
    items.reduce((total, item) => total + (Number(item[campo]) || 0), 0);
  const sumarTransacciones = (tipos) =>
    transacciones
      .filter((t) => tipos.includes(t.tipo))
      .reduce((total, t) => total + (Number(t.monto) || 0), 0);

  const ingresoEsperado = sumar(ingresos, 'limite');
  const ingresosReales = sumarTransacciones(['INGRESO']);
  const egresosReales = sumarTransacciones(['GASTO', 'PAGO_DEUDA']);
  const totalLimite = sumar(gastos, 'limite');

  return {
    mes,
    anio,
    totalLimite,
    totalGastado: sumar(gastos, 'gastado'),
    excedidos: gastos.filter((p) => p.excedido).length,
    cantidad: presupuestos.length,
    ingresoEsperado,
    ingresosReales,
    diferenciaIngresos: ingresosReales - ingresoEsperado,
    egresosReales,
    saldoDisponible: ingresosReales - egresosReales,
    saldoPlanificado: ingresoEsperado - totalLimite,
  };
}

module.exports = {
  mesAnioDeFecha,
  sincronizarPresupuesto,
  sincronizarPorTransaccion,
  sincronizarTodos,
  evaluarAlertaPresupuesto,
  toPresupuestoDto,
  calcularResumenMensual,
};
