const {
  aplicarEfectoSaldo,
  validarCuentasTransaccion,
  validarDeudaParaPago,
  aplicarEfectoDeuda,
} = require('../utils/saldo');
const { sincronizarPorTransaccion } = require('../utils/presupuesto');
const { parseDateOnly } = require('../utils/date');

const TRANSACCION_FIELDS = [
  'tipo',
  'monto',
  'descripcion',
  'categoria',
  'subcategoria',
  'fecha',
  'ubicacion',
  'notas',
  'etiquetas',
  'montoOriginal',
  'monedaOriginal',
  'tasaCambio',
  'comprobante',
  'metodoPago',
  'cuentaOrigenId',
  'cuentaDestinoId',
  'deudaId',
  'transaccionRecurrenteId',
  'ocurrenciaRecurrente',
  'verificada',
];

function pickTransaccionData(body = {}) {
  const data = {};
  for (const key of TRANSACCION_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
}

function normalizarPayloadPorTipo(data) {
  const next = { ...data };

  if (next.tipo === 'TRANSFERENCIA') {
    next.metodoPago = next.metodoPago || 'TRANSFERENCIA';
    next.categoria = null;
    next.deudaId = null;
    if (!next.descripcion) next.descripcion = 'Transferencia entre cuentas';
  } else if (next.tipo === 'PAGO_DEUDA') {
    next.metodoPago = null;
    next.categoria = null;
    next.cuentaDestinoId = null;
    if (!next.descripcion) next.descripcion = 'Pago de deuda';
  } else if (next.tipo === 'INGRESO') {
    next.cuentaDestinoId = null;
    next.deudaId = null;
  } else if (next.tipo === 'GASTO') {
    next.cuentaDestinoId = null;
    next.deudaId = null;
  }

  return next;
}

async function sincronizarPagoDeuda(tx, transaccion, { crear = true } = {}) {
  if (transaccion.tipo !== 'PAGO_DEUDA' || !transaccion.deudaId) return;

  const existente = await tx.pagoDeuda.findFirst({
    where: { transaccionId: transaccion.id },
  });

  if (!crear) {
    if (existente) {
      await tx.pagoDeuda.delete({ where: { id: existente.id } });
    }
    return;
  }

  const payload = {
    monto: Number(transaccion.monto),
    capital: Number(transaccion.monto),
    interes: 0,
    fecha: transaccion.fecha,
    notas: transaccion.notas || null,
    deudaId: Number(transaccion.deudaId),
    transaccionId: transaccion.id,
  };

  if (existente) {
    await tx.pagoDeuda.update({
      where: { id: existente.id },
      data: payload,
    });
  } else {
    await tx.pagoDeuda.create({ data: payload });
  }
}

/**
 * Crea un movimiento financiero dentro de una transacción Prisma ya abierta.
 * Aplica saldos, deuda y registro de PagoDeuda.
 */
async function crearMovimientoEnTx(tx, userId, payload) {
  const body = normalizarPayloadPorTipo(pickTransaccionData(payload));

  await validarCuentasTransaccion(tx, userId, body);

  if (body.tipo === 'PAGO_DEUDA') {
    const deuda = await validarDeudaParaPago(tx, userId, body.deudaId, body.monto);
    if (!body.descripcion || body.descripcion === 'Pago de deuda') {
      body.descripcion = `Pago de deuda: ${deuda.nombre}`;
    }
  }

  const creada = await tx.transaccion.create({
    data: {
      ...body,
      userId,
      fecha: body.fecha ? parseDateOnly(body.fecha) : undefined,
      esTransferencia: body.tipo === 'TRANSFERENCIA',
    },
  });

  await aplicarEfectoSaldo(tx, creada, 1);

  if (creada.tipo === 'PAGO_DEUDA') {
    await aplicarEfectoDeuda(tx, creada.deudaId, creada.monto, 1);
    await sincronizarPagoDeuda(tx, creada, { crear: true });
  }

  return creada;
}

/**
 * Crea un movimiento financiero completo (transacción Prisma + sync presupuestos).
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function crearMovimientoFinanciero(prisma, userId, payload) {
  const transaccion = await prisma.$transaction(async (tx) =>
    crearMovimientoEnTx(tx, userId, payload)
  );

  await sincronizarPorTransaccion(userId, transaccion).catch(() => {});

  try {
    const { verificarLogrosAsync } = require('./gamificacion.service');
    verificarLogrosAsync(userId);
  } catch (_) {
    /* no bloquear */
  }

  return transaccion;
}

module.exports = {
  TRANSACCION_FIELDS,
  pickTransaccionData,
  normalizarPayloadPorTipo,
  sincronizarPagoDeuda,
  crearMovimientoEnTx,
  crearMovimientoFinanciero,
};
