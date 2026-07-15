const { calcularProximaEjecucion } = require('../services/recurrentes.service');

describe('recurrentes service Sprint 4', () => {
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
});
