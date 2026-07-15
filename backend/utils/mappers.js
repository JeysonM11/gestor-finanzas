/**
 * Mapeos UI legacy <-> Prisma (Sprint 1)
 * Fuente de verdad: docs/CONTRATOS-API.md y schema.prisma
 */

const TIPO_CUENTA_UI_A_PRISMA = {
  AHORRO: 'BANCO_AHORROS',
  CORRIENTE: 'BANCO_CORRIENTE',
  CREDITO: 'TARJETA_CREDITO',
  EFECTIVO: 'EFECTIVO',
  INVERSION: 'INVERSION',
  CRYPTO: 'CRYPTO',
  OTRO: 'OTRO',
  // Ya en formato Prisma
  BANCO_AHORROS: 'BANCO_AHORROS',
  BANCO_CORRIENTE: 'BANCO_CORRIENTE',
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
};

const TIPO_DEUDA_UI_A_PRISMA = {
  PRESTAMO: 'PRESTAMO_PERSONAL',
  PRESTAMO_PERSONAL: 'PRESTAMO_PERSONAL',
  HIPOTECA: 'HIPOTECA',
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  PRESTAMO_ESTUDIANTIL: 'PRESTAMO_ESTUDIANTIL',
  PRESTAMO_AUTO: 'PRESTAMO_AUTO',
  LINEA_CREDITO: 'LINEA_CREDITO',
  OTROS: 'OTRO',
  OTRO: 'OTRO',
};

const TIPO_INVERSION_UI_A_PRISMA = {
  ACCIONES: 'ACCIONES',
  BONOS: 'BONOS',
  FONDOS: 'FONDOS_MUTUOS',
  FONDOS_MUTUOS: 'FONDOS_MUTUOS',
  ETF: 'ETF',
  CRIPTOMONEDAS: 'CRIPTOMONEDAS',
  BIENES_RAICES: 'BIENES_RAICES',
  COMMODITIES: 'COMMODITIES',
  OTROS: 'OTRO',
  OTRO: 'OTRO',
};

const TIPO_NOTIFICACION_UI_A_PRISMA = {
  EXITO: 'INFO',
  ADVERTENCIA: 'ALERTA',
  ERROR: 'ALERTA',
  INFO: 'INFO',
  ALERTA: 'ALERTA',
  RECORDATORIO: 'RECORDATORIO',
  LOGRO: 'LOGRO',
  SISTEMA: 'SISTEMA',
  PROMOCION: 'PROMOCION',
};

function mapTipoCuenta(tipo) {
  if (!tipo) return null;
  return TIPO_CUENTA_UI_A_PRISMA[tipo] || tipo;
}

function mapTipoDeuda(tipo) {
  if (!tipo) return null;
  return TIPO_DEUDA_UI_A_PRISMA[tipo] || tipo;
}

function mapTipoInversion(tipo) {
  if (!tipo) return null;
  return TIPO_INVERSION_UI_A_PRISMA[tipo] || tipo;
}

function mapTipoNotificacion(tipo) {
  if (!tipo) return null;
  return TIPO_NOTIFICACION_UI_A_PRISMA[tipo] || tipo;
}

/**
 * Normaliza body de inversion desde UI legacy a Prisma.
 */
function normalizeInversionInput(body = {}) {
  const montoInvertido =
    body.montoInvertido != null
      ? Number(body.montoInvertido)
      : body.montoInicial != null
        ? Number(body.montoInicial)
        : null;

  const valorActual =
    body.valorActual != null
      ? Number(body.valorActual)
      : body.montoActual != null
        ? Number(body.montoActual)
        : montoInvertido;

  const cantidad =
    body.cantidad != null
      ? Number(body.cantidad)
      : body.cantidadUnidades != null
        ? Number(body.cantidadUnidades)
        : null;

  return {
    nombre: body.nombre,
    tipo: mapTipoInversion(body.tipo),
    simbolo: body.simbolo || null,
    montoInvertido,
    valorActual,
    cantidad,
    fechaCompra: body.fechaCompra,
    broker: body.broker || null,
    comisiones: body.comisiones != null ? Number(body.comisiones) : 0,
    notas: body.notas || null,
  };
}

/**
 * DTO de inversion para el frontend (incluye aliases legacy).
 */
function toInversionDto(inversion) {
  if (!inversion) return null;
  return {
    ...inversion,
    montoInicial: inversion.montoInvertido,
    montoActual: inversion.valorActual ?? inversion.montoInvertido,
    cantidadUnidades: inversion.cantidad,
  };
}

/**
 * DTO de notificacion (alias createdAt = fechaEnvio).
 */
function toNotificacionDto(notificacion) {
  if (!notificacion) return null;
  return {
    ...notificacion,
    createdAt: notificacion.fechaEnvio,
  };
}

/**
 * Normaliza body de deuda desde UI (montoTotal/montoPagado) a Prisma.
 */
function normalizeDeudaInput(body = {}) {
  const montoInicial =
    body.montoInicial != null
      ? Number(body.montoInicial)
      : body.montoTotal != null
        ? Number(body.montoTotal)
        : null;

  let montoActual = body.montoActual != null ? Number(body.montoActual) : null;

  if (montoActual == null && montoInicial != null) {
    const montoPagado = body.montoPagado != null ? Number(body.montoPagado) : 0;
    montoActual = Math.max(0, montoInicial - montoPagado);
  }

  return {
    nombre: body.nombre,
    tipo: mapTipoDeuda(body.tipo),
    montoInicial,
    montoActual,
    tasaInteres: body.tasaInteres != null ? Number(body.tasaInteres) : null,
    fechaInicio: body.fechaInicio,
    fechaVencimiento: body.fechaVencimiento || null,
    pagoMinimo: body.pagoMinimo != null ? Number(body.pagoMinimo) : null,
    acreedor: body.acreedor || 'Sin especificar',
    notas: body.notas || null,
  };
}

/**
 * DTO de deuda para el frontend (incluye campos derivados).
 */
function toDeudaDto(deuda) {
  if (!deuda) return null;
  const montoInicial = deuda.montoInicial;
  const montoActual = deuda.montoActual;
  const montoPagado = Math.max(0, montoInicial - montoActual);

  return {
    ...deuda,
    montoTotal: montoInicial,
    montoPagado,
  };
}

module.exports = {
  mapTipoCuenta,
  mapTipoDeuda,
  mapTipoInversion,
  mapTipoNotificacion,
  normalizeDeudaInput,
  normalizeInversionInput,
  toDeudaDto,
  toInversionDto,
  toNotificacionDto,
  TIPO_CUENTA_UI_A_PRISMA,
  TIPO_DEUDA_UI_A_PRISMA,
  TIPO_INVERSION_UI_A_PRISMA,
  TIPO_NOTIFICACION_UI_A_PRISMA,
};
