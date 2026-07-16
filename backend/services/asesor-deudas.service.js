/**
 * Motor determinista de plan de pagos de deudas (v1.3).
 * Calcula orden de ataque y proyección mensual. La IA no recalcula nada:
 * recibe este resultado y solo redacta diagnóstico/tips.
 *
 * Modelo de saldo: `montoActual` ya incluye el interés simple del sistema
 * (ver calcularTotalConInteres en utils/mappers.js), por lo que la proyección
 * no acumula interés adicional. Es una estimación educativa, no una tabla
 * de amortización bancaria.
 */

const MAX_MESES = 600;

const ESTRATEGIAS = ['AVALANCHE', 'SNOWBALL'];

function tasaMensualEquivalente(tasaInteres, tipoTasa) {
  const tasa = Number(tasaInteres) || 0;
  if (tasa <= 0) return 0;
  return String(tipoTasa || 'MENSUAL').toUpperCase() === 'ANUAL'
    ? tasa / 12
    : tasa;
}

/**
 * Ordena deudas según estrategia.
 * AVALANCHE: mayor tasa mensual equivalente primero (menos interés total).
 * SNOWBALL: menor saldo primero (victorias rápidas / motivación).
 */
function ordenarDeudas(deudas, estrategia = 'AVALANCHE') {
  const lista = [...deudas];
  if (estrategia === 'SNOWBALL') {
    lista.sort(
      (a, b) => a.saldo - b.saldo || b.tasaMensual - a.tasaMensual
    );
  } else {
    lista.sort(
      (a, b) => b.tasaMensual - a.tasaMensual || a.saldo - b.saldo
    );
  }
  return lista;
}

/**
 * Proyección mes a mes con rollover: se pagan mínimos de todas las deudas
 * y el excedente ataca la primera deuda pendiente según el orden.
 *
 * @param {{ deudaId: number, ref: string, nombre: string, saldo: number, tasaMensual: number, pagoMinimo: number }[]} deudas
 * @param {number} presupuestoMensual total disponible por mes (mínimos + extra)
 * @param {'AVALANCHE'|'SNOWBALL'} estrategia
 */
function proyectarPlan(deudas, presupuestoMensual, estrategia = 'AVALANCHE') {
  const advertencias = [];
  const activas = deudas.filter((d) => d.saldo > 0);

  if (activas.length === 0) {
    return {
      estrategia,
      presupuestoMensual: 0,
      orden: [],
      totalMeses: 0,
      totalPagado: 0,
      completable: true,
      advertencias: ['No hay deudas activas.'],
    };
  }

  const pagoMinimoTotal = activas.reduce(
    (sum, d) => sum + (d.pagoMinimo || 0),
    0
  );
  const presupuesto = Math.max(0, Number(presupuestoMensual) || 0);

  if (presupuesto <= 0) {
    return {
      estrategia,
      presupuestoMensual: 0,
      orden: ordenarDeudas(activas, estrategia).map((d, i) => ({
        ...d,
        posicion: i + 1,
        mesLiquidacion: null,
      })),
      totalMeses: null,
      totalPagado: 0,
      completable: false,
      advertencias: [
        'Sin presupuesto mensual disponible no es posible proyectar la liquidación.',
      ],
    };
  }

  if (pagoMinimoTotal > presupuesto) {
    advertencias.push(
      'El presupuesto mensual no cubre la suma de pagos mínimos; la proyección asigna todo el presupuesto por orden de prioridad.'
    );
  }

  const sinMinimo = activas.filter((d) => !d.pagoMinimo);
  if (sinMinimo.length > 0) {
    advertencias.push(
      `${sinMinimo.length} deuda(s) sin pago mínimo registrado; se asume 0 y se atacan por orden.`
    );
  }

  const orden = ordenarDeudas(activas, estrategia).map((d, i) => ({
    ...d,
    posicion: i + 1,
    restante: d.saldo,
    mesLiquidacion: null,
  }));

  const cubreMinimos = pagoMinimoTotal <= presupuesto;
  let mes = 0;
  let totalPagado = 0;

  while (orden.some((d) => d.restante > 0) && mes < MAX_MESES) {
    mes += 1;
    let disponible = presupuesto;

    if (cubreMinimos) {
      for (const d of orden) {
        if (d.restante <= 0) continue;
        const pago = Math.min(d.pagoMinimo || 0, d.restante, disponible);
        d.restante -= pago;
        disponible -= pago;
        totalPagado += pago;
        if (d.restante <= 0) d.mesLiquidacion = mes;
      }
    }

    for (const d of orden) {
      if (disponible <= 0) break;
      if (d.restante <= 0) continue;
      const pago = Math.min(d.restante, disponible);
      d.restante -= pago;
      disponible -= pago;
      totalPagado += pago;
      if (d.restante <= 0) d.mesLiquidacion = mes;
    }
  }

  const completable = orden.every((d) => d.restante <= 0);
  if (!completable) {
    advertencias.push(
      `La proyección supera ${MAX_MESES} meses; revisa presupuesto y pagos mínimos.`
    );
  }

  return {
    estrategia,
    presupuestoMensual: presupuesto,
    orden: orden.map(({ restante, ...d }) => d),
    totalMeses: completable ? mes : null,
    totalPagado: Math.round(totalPagado * 100) / 100,
    completable,
    advertencias,
  };
}

module.exports = {
  ESTRATEGIAS,
  MAX_MESES,
  tasaMensualEquivalente,
  ordenarDeudas,
  proyectarPlan,
};
