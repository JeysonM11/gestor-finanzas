const {
  toPresupuestoDto,
  mesAnioDeFecha,
  calcularResumenMensual,
} = require('../utils/presupuesto');

describe('presupuesto utils Sprint 5', () => {
  test('mesAnioDeFecha extrae mes y año', () => {
    const { mes, anio } = mesAnioDeFecha(new Date('2026-07-15T12:00:00'));
    expect(mes).toBe(7);
    expect(anio).toBe(2026);
  });

  test('toPresupuestoDto calcula porcentaje y restante', () => {
    const dto = toPresupuestoDto({
      id: 1,
      categoria: 'Alimentación',
      limite: 1000,
      gastado: 250,
      mes: 7,
      año: 2026,
      alertaEn: 80,
    });
    expect(dto.anio).toBe(2026);
    expect(dto.porcentajeUsado).toBe(25);
    expect(dto.restante).toBe(750);
    expect(dto.excedido).toBe(false);
  });

  test('toPresupuestoDto marca excedido', () => {
    const dto = toPresupuestoDto({
      limite: 100,
      gastado: 150,
      año: 2026,
    });
    expect(dto.excedido).toBe(true);
    expect(dto.porcentajeUsado).toBe(100);
    expect(dto.restante).toBe(0);
  });

  test('ingreso esperado se confirma con ingresos y calcula saldo real', () => {
    const presupuestos = [
      toPresupuestoDto({
        tipo: 'INGRESO',
        limite: 3200000,
        gastado: 3000000,
        año: 2026,
      }),
      toPresupuestoDto({
        tipo: 'GASTO',
        limite: 1000000,
        gastado: 400000,
        año: 2026,
      }),
    ];
    const resumen = calcularResumenMensual(
      presupuestos,
      [
        { tipo: 'INGRESO', monto: 3000000 },
        { tipo: 'GASTO', monto: 400000 },
        { tipo: 'PAGO_DEUDA', monto: 300000 },
      ],
      7,
      2026
    );

    expect(resumen.ingresoEsperado).toBe(3200000);
    expect(resumen.ingresosReales).toBe(3000000);
    expect(resumen.egresosReales).toBe(700000);
    expect(resumen.saldoDisponible).toBe(2300000);
    expect(resumen.saldoPlanificado).toBe(2200000);
  });
});
