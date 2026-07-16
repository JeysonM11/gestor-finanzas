const { deltaSaldoPorTipo } = require('../utils/saldo');

describe('saldo utils Sprint 3', () => {
  test('INGRESO suma en la cuenta', () => {
    expect(deltaSaldoPorTipo('INGRESO', 100)).toBe(100);
  });

  test('GASTO resta en origen', () => {
    expect(deltaSaldoPorTipo('GASTO', 50, 'origen')).toBe(-50);
  });

  test('TRANSFERENCIA mueve entre origen y destino', () => {
    expect(deltaSaldoPorTipo('TRANSFERENCIA', 20, 'origen')).toBe(-20);
    expect(deltaSaldoPorTipo('TRANSFERENCIA', 20, 'destino')).toBe(20);
  });

  test('PAGO_DEUDA resta en origen como un gasto', () => {
    expect(deltaSaldoPorTipo('PAGO_DEUDA', 75, 'origen')).toBe(-75);
  });
});
