/**
 * Reglas de impacto en saldo de cuentas:
 * - INGRESO: +monto en cuentaOrigenId (cuenta afectada)
 * - GASTO: -monto en cuentaOrigenId
 * - TRANSFERENCIA: -monto en cuentaOrigenId, +monto en cuentaDestinoId
 */

async function assertCuentaDelUsuario(tx, cuentaId, userId) {
  if (!cuentaId) return null;
  const cuenta = await tx.cuenta.findFirst({
    where: { id: cuentaId, userId, activa: true },
  });
  if (!cuenta) {
    const err = new Error('Cuenta no encontrada o no pertenece al usuario');
    err.statusCode = 400;
    throw err;
  }
  return cuenta;
}

async function ajustarSaldo(tx, cuentaId, delta) {
  if (!cuentaId || !delta) return;
  await tx.cuenta.update({
    where: { id: cuentaId },
    data: { saldoActual: { increment: delta } },
  });
}

/**
 * Aplica el efecto de una transaccion sobre saldos (factor +1 aplicar, -1 revertir).
 */
async function aplicarEfectoSaldo(tx, transaccion, factor = 1) {
  const monto = Number(transaccion.monto) || 0;
  if (monto <= 0) return;

  const tipo = transaccion.tipo;
  const origenId = transaccion.cuentaOrigenId || null;
  const destinoId = transaccion.cuentaDestinoId || null;

  if (tipo === 'INGRESO') {
    const cuentaId = origenId || destinoId;
    await ajustarSaldo(tx, cuentaId, monto * factor);
    return;
  }

  if (tipo === 'GASTO') {
    await ajustarSaldo(tx, origenId, -monto * factor);
    return;
  }

  if (tipo === 'TRANSFERENCIA') {
    await ajustarSaldo(tx, origenId, -monto * factor);
    await ajustarSaldo(tx, destinoId, monto * factor);
  }
}

async function validarCuentasTransaccion(tx, userId, data) {
  if (data.cuentaOrigenId) {
    await assertCuentaDelUsuario(tx, Number(data.cuentaOrigenId), userId);
  }
  if (data.cuentaDestinoId) {
    await assertCuentaDelUsuario(tx, Number(data.cuentaDestinoId), userId);
  }

  if (data.tipo === 'TRANSFERENCIA') {
    if (!data.cuentaOrigenId || !data.cuentaDestinoId) {
      const err = new Error(
        'Las transferencias requieren cuentaOrigenId y cuentaDestinoId'
      );
      err.statusCode = 400;
      throw err;
    }
    if (Number(data.cuentaOrigenId) === Number(data.cuentaDestinoId)) {
      const err = new Error('Origen y destino deben ser cuentas distintas');
      err.statusCode = 400;
      throw err;
    }
  }
}

/**
 * Calcula el delta neto esperado de una cuenta a partir de movimientos
 * (util para tests unitarios sin DB).
 */
function deltaSaldoPorTipo(tipo, monto, rol = 'origen') {
  const m = Number(monto) || 0;
  if (tipo === 'INGRESO') return m;
  if (tipo === 'GASTO') return rol === 'origen' ? -m : 0;
  if (tipo === 'TRANSFERENCIA') {
    if (rol === 'origen') return -m;
    if (rol === 'destino') return m;
  }
  return 0;
}

module.exports = {
  assertCuentaDelUsuario,
  aplicarEfectoSaldo,
  validarCuentasTransaccion,
  deltaSaldoPorTipo,
};
