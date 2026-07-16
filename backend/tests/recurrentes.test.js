const {
  calcularProximaEjecucion,
  requiereConfiguracion,
} = require('../services/recurrentes.service');

describe('recurrentes service v1.4', () => {
  test('DIARIA suma un día', () => {
    const base = new Date('2026-01-10T12:00:00.000Z');
    const next = calcularProximaEjecucion('DIARIA', base);
    expect(next.getUTCDate()).toBe(11);
  });

  test('MENSUAL con diaEjecucion respeta el día', () => {
    const base = new Date('2026-01-15T12:00:00.000Z');
    const next = calcularProximaEjecucion('MENSUAL', base, 15);
    expect(next.getMonth()).toBe(1); // febrero
    expect(next.getDate()).toBe(15);
  });

  test('ANUAL avanza un año', () => {
    const base = new Date('2026-03-01T00:00:00.000Z');
    const next = calcularProximaEjecucion('ANUAL', base);
    expect(next.getFullYear()).toBe(2027);
  });

  test('requiereConfiguracion si falta cuenta', () => {
    expect(
      requiereConfiguracion({ tipo: 'GASTO', cuentaOrigenId: null })
    ).toBe(true);
    expect(
      requiereConfiguracion({ tipo: 'GASTO', cuentaOrigenId: 1 })
    ).toBe(false);
  });

  test('requiereConfiguracion PAGO_DEUDA exige deuda', () => {
    expect(
      requiereConfiguracion({
        tipo: 'PAGO_DEUDA',
        cuentaOrigenId: 1,
        deudaId: null,
      })
    ).toBe(true);
  });
});
