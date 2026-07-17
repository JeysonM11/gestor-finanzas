const {
  deltaSaldoPorTipo,
  aplicarEfectoSaldo,
  validarCuentasTransaccion,
  validarDeudaParaPago,
  aplicarEfectoDeuda,
  assertCuentaDelUsuario,
} = require('../utils/saldo');

function mockTx({ cuenta, deuda } = {}) {
  return {
    cuenta: {
      findFirst: jest.fn(async () => cuenta ?? null),
      update: jest.fn(async ({ data }) => ({ ...cuenta, ...data })),
    },
    deuda: {
      findFirst: jest.fn(async () => deuda ?? null),
      findUnique: jest.fn(async () => deuda ?? null),
      update: jest.fn(async ({ data }) => ({ ...deuda, ...data })),
    },
  };
}

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

  test('deltaSaldoPorTipo ignora tipos desconocidos', () => {
    expect(deltaSaldoPorTipo('OTRO', 10)).toBe(0);
  });
});

describe('aplicarEfectoSaldo', () => {
  test('INGRESO incrementa origen', async () => {
    const tx = mockTx({ cuenta: { id: 1, saldoActual: 0 } });
    await aplicarEfectoSaldo(tx, {
      tipo: 'INGRESO',
      monto: 40,
      cuentaOrigenId: 1,
    });
    expect(tx.cuenta.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { saldoActual: { increment: 40 } },
    });
  });

  test('GASTO y PAGO_DEUDA decrementan origen', async () => {
    const tx = mockTx();
    await aplicarEfectoSaldo(tx, {
      tipo: 'GASTO',
      monto: 15,
      cuentaOrigenId: 2,
    });
    expect(tx.cuenta.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { saldoActual: { increment: -15 } },
    });

    tx.cuenta.update.mockClear();
    await aplicarEfectoSaldo(tx, {
      tipo: 'PAGO_DEUDA',
      monto: 10,
      cuentaOrigenId: 2,
    });
    expect(tx.cuenta.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { saldoActual: { increment: -10 } },
    });
  });

  test('TRANSFERENCIA mueve entre cuentas', async () => {
    const tx = mockTx();
    await aplicarEfectoSaldo(tx, {
      tipo: 'TRANSFERENCIA',
      monto: 25,
      cuentaOrigenId: 1,
      cuentaDestinoId: 2,
    });
    expect(tx.cuenta.update).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      data: { saldoActual: { increment: -25 } },
    });
    expect(tx.cuenta.update).toHaveBeenNthCalledWith(2, {
      where: { id: 2 },
      data: { saldoActual: { increment: 25 } },
    });
  });

  test('monto no positivo no altera saldos', async () => {
    const tx = mockTx();
    await aplicarEfectoSaldo(tx, { tipo: 'INGRESO', monto: 0, cuentaOrigenId: 1 });
    expect(tx.cuenta.update).not.toHaveBeenCalled();
  });
});

describe('validarCuentasTransaccion', () => {
  test('exige origen y destino distintos en TRANSFERENCIA', async () => {
    const tx = mockTx({ cuenta: { id: 1 } });
    await expect(
      validarCuentasTransaccion(tx, 1, {
        tipo: 'TRANSFERENCIA',
        cuentaOrigenId: 1,
        cuentaDestinoId: 1,
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('PAGO_DEUDA requiere cuentaOrigenId', async () => {
    const tx = mockTx();
    await expect(
      validarCuentasTransaccion(tx, 1, { tipo: 'PAGO_DEUDA' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('INGRESO/GASTO requieren alguna cuenta', async () => {
    const tx = mockTx();
    await expect(
      validarCuentasTransaccion(tx, 1, { tipo: 'GASTO' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('acepta cuentas del usuario', async () => {
    const tx = mockTx({ cuenta: { id: 3, userId: 1 } });
    await expect(
      validarCuentasTransaccion(tx, 1, {
        tipo: 'INGRESO',
        cuentaOrigenId: 3,
      })
    ).resolves.toBeUndefined();
  });
});

describe('deuda helpers', () => {
  test('validarDeudaParaPago rechaza exceso', async () => {
    const tx = mockTx({
      deuda: { id: 1, userId: 1, montoActual: 50, pagada: false },
    });
    await expect(
      validarDeudaParaPago(tx, 1, 1, 80)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('validarDeudaParaPago acepta monto válido', async () => {
    const deuda = { id: 1, userId: 1, montoActual: 50, pagada: false };
    const tx = mockTx({ deuda });
    await expect(validarDeudaParaPago(tx, 1, 1, 20)).resolves.toEqual(deuda);
  });

  test('aplicarEfectoDeuda marca pagada al llegar a cero', async () => {
    const deuda = { id: 1, montoActual: 30, pagada: false };
    const tx = mockTx({ deuda });
    await aplicarEfectoDeuda(tx, 1, 30, 1);
    expect(tx.deuda.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { montoActual: 0, pagada: true },
    });
  });

  test('assertCuentaDelUsuario falla si no existe', async () => {
    const tx = mockTx({ cuenta: null });
    await expect(assertCuentaDelUsuario(tx, 99, 1)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
