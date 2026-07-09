const Joi = require('joi');

const createCuentaSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  tipo: Joi.string()
    .valid(
      'EFECTIVO',
      'BANCO_CORRIENTE',
      'BANCO_AHORROS',
      'TARJETA_CREDITO',
      'TARJETA_DEBITO',
      'INVERSION',
      'CRYPTO',
      'OTRO',
      // aliases UI
      'AHORRO',
      'CORRIENTE',
      'CREDITO'
    )
    .required(),
  tipoCuenta: Joi.string().optional(),
  banco: Joi.string().trim().max(100).allow('', null).optional(),
  numeroCuenta: Joi.string().trim().max(50).allow('', null).optional(),
  saldoInicial: Joi.number().optional(),
  saldoActual: Joi.number().optional(),
  moneda: Joi.string().length(3).uppercase().optional(),
  color: Joi.string().trim().max(20).optional(),
  icono: Joi.string().trim().max(50).allow('', null).optional(),
  descripcion: Joi.string().trim().max(500).allow('', null).optional(),
  fechaApertura: Joi.date().optional(),
});

const updateSaldoSchema = Joi.object({
  nuevoSaldo: Joi.number().optional(),
  saldoActual: Joi.number().optional(),
  motivo: Joi.string().trim().max(200).allow('', null).optional(),
}).or('nuevoSaldo', 'saldoActual');

const createInversionSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  tipo: Joi.string().required(),
  simbolo: Joi.string().trim().max(20).allow('', null).optional(),
  montoInvertido: Joi.number().positive().optional(),
  montoInicial: Joi.number().positive().optional(),
  valorActual: Joi.number().min(0).optional(),
  montoActual: Joi.number().min(0).optional(),
  cantidad: Joi.number().min(0).allow(null).optional(),
  cantidadUnidades: Joi.number().min(0).allow(null).optional(),
  fechaCompra: Joi.date().required(),
  broker: Joi.string().trim().max(100).allow('', null).optional(),
  comisiones: Joi.number().min(0).optional(),
  notas: Joi.string().trim().max(1000).allow('', null).optional(),
}).or('montoInvertido', 'montoInicial');

const createDeudaSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  tipo: Joi.string().required(),
  montoInicial: Joi.number().positive().optional(),
  montoTotal: Joi.number().positive().optional(),
  montoActual: Joi.number().min(0).optional(),
  montoPagado: Joi.number().min(0).optional(),
  tasaInteres: Joi.number().min(0).max(100).allow(null).optional(),
  fechaInicio: Joi.date().required(),
  fechaVencimiento: Joi.date().allow(null, '').optional(),
  pagoMinimo: Joi.number().min(0).allow(null).optional(),
  acreedor: Joi.string().trim().max(100).allow('', null).optional(),
  notas: Joi.string().trim().max(1000).allow('', null).optional(),
}).or('montoInicial', 'montoTotal');

const createRecurrenteSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  descripcion: Joi.string().trim().max(500).allow('', null).optional(),
  tipo: Joi.string().valid('INGRESO', 'GASTO', 'TRANSFERENCIA').required(),
  monto: Joi.number().positive().required(),
  categoria: Joi.string().trim().max(100).allow('', null).optional(),
  frecuencia: Joi.string()
    .valid(
      'DIARIA',
      'SEMANAL',
      'QUINCENAL',
      'MENSUAL',
      'BIMESTRAL',
      'TRIMESTRAL',
      'SEMESTRAL',
      'ANUAL'
    )
    .required(),
  diaEjecucion: Joi.number().integer().min(1).max(31).allow(null).optional(),
  diaSemana: Joi.number().integer().min(0).max(6).allow(null).optional(),
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().allow(null, '').optional(),
  activa: Joi.boolean().optional(),
});

module.exports = {
  createCuentaSchema,
  updateSaldoSchema,
  createInversionSchema,
  createDeudaSchema,
  createRecurrenteSchema,
};
