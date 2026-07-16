/**
 * Reglas de impacto en saldo de cuentas:
 * - INGRESO: +monto en cuentaOrigenId (cuenta afectada)
 * - GASTO: -monto en cuentaOrigenId
 * - TRANSFERENCIA: -monto en cuentaOrigenId, +monto en cuentaDestinoId
 * - PAGO_DEUDA: -monto en cuentaOrigenId (como un gasto)
 */

async function assertCuentaDelUsuario(tx, cuentaId, userId) {
  if (!cuentaId) return null;
  const cuenta = await tx.cuenta.findFirst({
    where: { id: cuentaId, userId },
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

  if (tipo === 'GASTO' || tipo === 'PAGO_DEUDA') {
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

  if (data.tipo === 'PAGO_DEUDA' && !data.cuentaOrigenId) {
    const err = new Error('El pago de deuda requiere una cuenta de origen');
    err.statusCode = 400;
    throw err;
  }

  if (
    (data.tipo === 'INGRESO' || data.tipo === 'GASTO') &&
    !data.cuentaOrigenId &&
    !data.cuentaDestinoId
  ) {
    const err = new Error('Debes seleccionar una cuenta');
    err.statusCode = 400;
    throw err;
  }
}

/**
 * Valida y obtiene una deuda pagable (activa con saldo pendiente).
 * @param {number} [saldoExtraPermitido] - al editar, el monto del pago actual ya descontado
 */
async function validarDeudaParaPago(tx, userId, deudaId, monto, saldoExtraPermitido = 0) {
  if (!deudaId) {
    const err = new Error('Debes seleccionar una deuda');
    err.statusCode = 400;
    throw err;
  }

  const deuda = await tx.deuda.findFirst({
    where: { id: Number(deudaId), userId },
  });

  if (!deuda) {
    const err = new Error('Deuda no encontrada o no pertenece al usuario');
    err.statusCode = 400;
    throw err;
  }

  const saldoDisponible = Number(deuda.montoActual) + Number(saldoExtraPermitido || 0);

  if (deuda.pagada && saldoDisponible <= 0) {
    const err = new Error('La deuda ya está pagada');
    err.statusCode = 400;
    throw err;
  }

  if (saldoDisponible <= 0) {
    const err = new Error('La deuda no tiene saldo pendiente');
    err.statusCode = 400;
    throw err;
  }

  const montoPago = Number(monto);
  if (!(montoPago > 0)) {
    const err = new Error('El monto a pagar debe ser positivo');
    err.statusCode = 400;
    throw err;
  }

  if (montoPago > saldoDisponible + 0.001) {
    const err = new Error(
      `No puedes pagar más del saldo pendiente ($${saldoDisponible.toFixed(2)})`
    );
    err.statusCode = 400;
    throw err;
  }

  return deuda;
}

/**
 * Aplica o revierte el efecto de un pago sobre el saldo de la deuda.
 * factor +1 = aplicar pago (reduce deuda), -1 = revertir pago.
 */
async function aplicarEfectoDeuda(tx, deudaId, monto, factor = 1) {
  if (!deudaId || !monto) return null;

  const deuda = await tx.deuda.findUnique({ where: { id: Number(deudaId) } });
  if (!deuda) return null;

  const delta = -Number(monto) * factor;
  const nuevoMonto = Math.max(0, Number(deuda.montoActual) + delta);

  return tx.deuda.update({
    where: { id: Number(deudaId) },
    data: {
      montoActual: nuevoMonto,
      pagada: nuevoMonto === 0,
    },
  });
}

/**
 * Calcula el delta neto esperado de una cuenta a partir de movimientos
 * (util para tests unitarios sin DB).
 */
function deltaSaldoPorTipo(tipo, monto, rol = 'origen') {
  const m = Number(monto) || 0;
  if (tipo === 'INGRESO') return m;
  if (tipo === 'GASTO' || tipo === 'PAGO_DEUDA') return rol === 'origen' ? -m : 0;
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
  validarDeudaParaPago,
  aplicarEfectoDeuda,
  deltaSaldoPorTipo,
};
