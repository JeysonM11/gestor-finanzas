const {
  tasaMensualEquivalente,
  ordenarDeudas,
  proyectarPlan,
} = require('../services/asesor-deudas.service');
const {
  resolverIngresosMensuales,
} = require('../services/asesor-snapshot.service');
const { generarPlanSchema, respuestaIASchema } = require('../validators/asesor.validator');
const { consejoFallback } = require('../services/gemini.service');

describe('asesor v1.3 — motor de deudas', () => {
  const deudas = [
    { deudaId: 1, ref: 'D1', nombre: 'Tarjeta', saldo: 500, tasaMensual: 3, pagoMinimo: 50 },
    { deudaId: 2, ref: 'D2', nombre: 'Préstamo', saldo: 2000, tasaMensual: 1.5, pagoMinimo: 100 },
    { deudaId: 3, ref: 'D3', nombre: 'Auto', saldo: 300, tasaMensual: 2, pagoMinimo: 30 },
  ];

  test('tasaMensualEquivalente convierte ANUAL a mensual', () => {
    expect(tasaMensualEquivalente(24, 'ANUAL')).toBe(2);
    expect(tasaMensualEquivalente(3, 'MENSUAL')).toBe(3);
    expect(tasaMensualEquivalente(null, 'MENSUAL')).toBe(0);
  });

  test('AVALANCHE ordena por tasa descendente', () => {
    const orden = ordenarDeudas(deudas, 'AVALANCHE').map((d) => d.ref);
    expect(orden).toEqual(['D1', 'D3', 'D2']);
  });

  test('SNOWBALL ordena por saldo ascendente', () => {
    const orden = ordenarDeudas(deudas, 'SNOWBALL').map((d) => d.ref);
    expect(orden).toEqual(['D3', 'D1', 'D2']);
  });

  test('proyectarPlan liquida todas las deudas con presupuesto suficiente', () => {
    const plan = proyectarPlan(deudas, 500, 'AVALANCHE');
    expect(plan.completable).toBe(true);
    expect(plan.totalMeses).toBeGreaterThan(0);
    // Total pagado = suma de saldos (modelo sin acumulación extra de interés)
    expect(plan.totalPagado).toBe(2800);
    // Todas quedan con mes de liquidación
    expect(plan.orden.every((d) => d.mesLiquidacion != null)).toBe(true);
  });

  test('proyectarPlan sin presupuesto no es completable', () => {
    const plan = proyectarPlan(deudas, 0, 'AVALANCHE');
    expect(plan.completable).toBe(false);
    expect(plan.totalMeses).toBeNull();
    expect(plan.advertencias.length).toBeGreaterThan(0);
  });

  test('proyectarPlan advierte si el presupuesto no cubre mínimos', () => {
    const plan = proyectarPlan(deudas, 100, 'SNOWBALL');
    expect(
      plan.advertencias.some((a) => a.includes('no cubre'))
    ).toBe(true);
  });

  test('proyectarPlan sin deudas activas devuelve plan vacío', () => {
    const plan = proyectarPlan([], 500, 'AVALANCHE');
    expect(plan.totalMeses).toBe(0);
    expect(plan.orden).toEqual([]);
  });
});

describe('asesor v1.3 — validadores', () => {
  test('generarPlanSchema aplica default AVALANCHE y rechaza estrategia inválida', () => {
    const ok = generarPlanSchema.validate({});
    expect(ok.error).toBeUndefined();
    expect(ok.value.estrategia).toBe('AVALANCHE');

    const bad = generarPlanSchema.validate({ estrategia: 'YOLO' });
    expect(bad.error).toBeDefined();
  });

  test('respuestaIASchema rechaza respuesta sin diagnóstico', () => {
    const { error } = respuestaIASchema.validate({
      tips: [],
      pasos: [],
      motivacion: 'ánimo',
    });
    expect(error).toBeDefined();
  });

  test('respuestaIASchema acepta respuesta válida', () => {
    const { error } = respuestaIASchema.validate({
      diagnostico: { nivelRiesgo: 'MEDIO', resumen: 'ok', alertas: [] },
      tips: [{ titulo: 't', detalle: 'd', prioridad: 'ALTA' }],
      pasos: ['paso 1'],
      motivacion: 'vamos',
    });
    expect(error).toBeUndefined();
  });
});

describe('asesor v1.3 — fuente de ingresos', () => {
  test('usa ingreso esperado cuando el historial es insuficiente', () => {
    const flujo = resolverIngresosMensuales(
      [
        {
          tipo: 'INGRESO',
          monto: 900000,
          fecha: new Date('2026-07-05T12:00:00Z'),
        },
      ],
      3200000
    );

    expect(flujo.ingresos).toBe(3200000);
    expect(flujo.ingresosRealesPromedio).toBe(900000);
    expect(flujo.fuenteIngresos).toBe('ESPERADO');
  });

  test('prefiere promedio real con ingresos en al menos dos meses', () => {
    const flujo = resolverIngresosMensuales(
      [
        {
          tipo: 'INGRESO',
          monto: 3000000,
          fecha: new Date('2026-06-05T12:00:00Z'),
        },
        {
          tipo: 'INGRESO',
          monto: 3200000,
          fecha: new Date('2026-07-05T12:00:00Z'),
        },
      ],
      3500000
    );

    expect(flujo.ingresos).toBe(3100000);
    expect(flujo.fuenteIngresos).toBe('REAL');
    expect(flujo.historialIngresosSuficiente).toBe(true);
  });
});

describe('asesor v1.3 — fallback sin IA', () => {
  const snapshot = {
    moneda: 'COP',
    flujoMensual: { ingresos: 3000, gastos: 2000, pagosDeuda: 200 },
    totales: {
      deudaTotal: 2800,
      pagoMinimoTotal: 180,
      cantidadDeudas: 3,
      deudasVencidas: 1,
    },
    capacidadExtraEstimada: 0,
  };
  const plan = {
    estrategia: 'AVALANCHE',
    presupuestoMensual: 180,
    advertencias: [],
  };

  test('fallback cumple el contrato de respuestaIASchema', () => {
    const consejo = consejoFallback(snapshot, plan);
    const { error } = respuestaIASchema.validate(consejo);
    expect(error).toBeUndefined();
  });

  test('fallback marca riesgo ALTO con deudas vencidas', () => {
    const consejo = consejoFallback(snapshot, plan);
    expect(consejo.diagnostico.nivelRiesgo).toBe('ALTO');
    expect(consejo.diagnostico.alertas.length).toBeGreaterThan(0);
  });
});
