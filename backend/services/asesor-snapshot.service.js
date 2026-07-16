/**
 * Snapshot financiero agregado para el Asesor IA (v1.3).
 *
 * Minimización de datos: lo que sale de aquí hacia el proveedor de IA
 * NO incluye PII (nombre, email, acreedor, banco, números de cuenta,
 * descripciones ni notas). Las deudas se anonimizan como D1, D2, ...
 * Los montos se redondean (Float de Prisma = estimación, no contabilidad).
 */

const prisma = require('../lib/prisma');
const { toDeudaDto } = require('../utils/mappers');
const { tasaMensualEquivalente } = require('./asesor-deudas.service');

const PERIODO_DIAS = 90;

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

function resolverIngresosMensuales(transacciones, ingresoEsperado) {
  const ingresos = transacciones.filter((t) => t.tipo === 'INGRESO');
  const mesesConIngresos = new Set(
    ingresos.map((t) => {
      const fecha = new Date(t.fecha);
      return `${fecha.getUTCFullYear()}-${fecha.getUTCMonth() + 1}`;
    })
  ).size;
  const totalReal = ingresos.reduce(
    (total, transaccion) => total + transaccion.monto,
    0
  );
  const promedioReal = round2(
    mesesConIngresos > 0 ? totalReal / mesesConIngresos : 0
  );
  const historialSuficiente = mesesConIngresos >= 2;
  const esperado = round2(ingresoEsperado);

  if (!historialSuficiente && esperado > 0) {
    return {
      ingresos: esperado,
      ingresosRealesPromedio: promedioReal,
      ingresosEsperados: esperado,
      fuenteIngresos: 'ESPERADO',
      historialIngresosSuficiente: false,
      mesesConIngresos,
    };
  }

  return {
    ingresos: promedioReal,
    ingresosRealesPromedio: promedioReal,
    ingresosEsperados: esperado || null,
    fuenteIngresos: historialSuficiente ? 'REAL' : 'REAL_PARCIAL',
    historialIngresosSuficiente: historialSuficiente,
    mesesConIngresos,
  };
}

function mesesHasta(fecha) {
  if (!fecha) return null;
  const diff = new Date(fecha).getTime() - Date.now();
  return Math.ceil(diff / (30 * 24 * 60 * 60 * 1000));
}

/**
 * Construye el snapshot del usuario.
 * @returns {{ snapshot: object, deudasInternas: object[] }}
 *  - snapshot: apto para persistir y (sin nombres) enviar al modelo
 *  - deudasInternas: incluye deudaId/nombre para el plan local (no se envía a la IA)
 */
async function construirSnapshot(userId) {
  const desde = new Date(Date.now() - PERIODO_DIAS * 24 * 60 * 60 * 1000);
  const ahora = new Date();

  const [usuario, deudas, transacciones, cuentas, presupuestos, metas] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { monedaPrincipal: true },
      }),
      prisma.deuda.findMany({
        where: { userId, pagada: false },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          montoInicial: true,
          montoActual: true,
          tasaInteres: true,
          tipoTasa: true,
          plazoMeses: true,
          pagoMinimo: true,
          fechaVencimiento: true,
        },
      }),
      prisma.transaccion.findMany({
        where: { userId, fecha: { gte: desde } },
        select: { tipo: true, monto: true, fecha: true },
      }),
      prisma.cuenta.findMany({
        where: { userId, activa: true, incluirEnBalance: true },
        select: { tipo: true, saldoActual: true, moneda: true },
      }),
      prisma.presupuesto.findMany({
        where: {
          userId,
          activo: true,
          mes: ahora.getUTCMonth() + 1,
          año: ahora.getUTCFullYear(),
        },
        select: { tipo: true, limite: true, gastado: true },
      }),
      prisma.meta.findMany({
        where: { userId, completada: false },
        select: { montoObjetivo: true, montoActual: true },
      }),
    ]);

  const meses = PERIODO_DIAS / 30;
  const sumaPorTipo = (tipo) =>
    transacciones
      .filter((t) => t.tipo === tipo)
      .reduce((sum, t) => sum + t.monto, 0);

  const ingresoEsperado = presupuestos
    .filter((p) => p.tipo === 'INGRESO')
    .reduce((total, p) => total + p.limite, 0);
  const flujoIngresos = resolverIngresosMensuales(
    transacciones,
    ingresoEsperado
  );
  const gastosMensuales = round2(sumaPorTipo('GASTO') / meses);
  const pagosDeudaMensuales = round2(sumaPorTipo('PAGO_DEUDA') / meses);

  const deudasInternas = deudas.map((deuda, i) => {
    const dto = toDeudaDto(deuda);
    return {
      ref: `D${i + 1}`,
      deudaId: deuda.id,
      nombre: deuda.nombre,
      tipo: deuda.tipo,
      saldo: round2(dto.montoActual),
      tasaInteres: deuda.tasaInteres ?? null,
      tipoTasa: deuda.tipoTasa ?? null,
      tasaMensual: round2(
        tasaMensualEquivalente(deuda.tasaInteres, deuda.tipoTasa)
      ),
      pagoMinimo: round2(deuda.pagoMinimo || 0),
      mesesParaVencimiento: mesesHasta(deuda.fechaVencimiento),
      vencida: Boolean(
        deuda.fechaVencimiento && new Date(deuda.fechaVencimiento) < ahora
      ),
    };
  });

  const deudaTotal = round2(
    deudasInternas.reduce((sum, d) => sum + d.saldo, 0)
  );
  const pagoMinimoTotal = round2(
    deudasInternas.reduce((sum, d) => sum + d.pagoMinimo, 0)
  );

  // Regla documentada (PLAN-1.3): estimación editable, no dato inventado.
  const capacidadExtraEstimada = round2(
    Math.max(0, flujoIngresos.ingresos - gastosMensuales - pagoMinimoTotal)
  );

  const presupuestosExcedidos = presupuestos.filter(
    (p) => p.tipo === 'GASTO' && p.gastado > p.limite
  ).length;
  const progresoMetas =
    metas.length > 0
      ? round2(
          (metas.reduce(
            (sum, m) =>
              sum + Math.min(1, m.montoActual / (m.montoObjetivo || 1)),
            0
          ) /
            metas.length) *
            100
        )
      : null;

  const snapshot = {
    version: 2,
    moneda: usuario?.monedaPrincipal || 'USD',
    periodoDias: PERIODO_DIAS,
    flujoMensual: {
      ...flujoIngresos,
      gastos: gastosMensuales,
      pagosDeuda: pagosDeudaMensuales,
    },
    liquidezTotal: round2(
      cuentas.reduce((sum, c) => sum + c.saldoActual, 0)
    ),
    deudas: deudasInternas.map(({ deudaId, nombre, ...anon }) => anon),
    totales: {
      deudaTotal,
      pagoMinimoTotal,
      cantidadDeudas: deudasInternas.length,
      deudasVencidas: deudasInternas.filter((d) => d.vencida).length,
    },
    presupuestos: {
      activos: presupuestos.length,
      excedidos: presupuestosExcedidos,
      ingresoEsperado: round2(ingresoEsperado),
    },
    metas: { activas: metas.length, progresoPromedio: progresoMetas },
    capacidadExtraEstimada,
  };

  return { snapshot, deudasInternas };
}

module.exports = {
  construirSnapshot,
  resolverIngresosMensuales,
  PERIODO_DIAS,
};
