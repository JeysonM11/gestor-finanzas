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
  moneda: Joi.string().length(3).uppercase().optional(),
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
  tasa: Joi.number().min(0).max(100).allow(null).optional(),
  tipoTasa: Joi.string().valid('MENSUAL', 'ANUAL').allow(null, '').optional(),
  tipoTasaInteres: Joi.string().valid('MENSUAL', 'ANUAL').allow(null, '').optional(),
  plazoMeses: Joi.number().integer().min(1).max(600).allow(null).optional(),
  fechaInicio: Joi.date().required(),
  fechaVencimiento: Joi.date().allow(null, '').optional(),
  pagoMinimo: Joi.number().min(0).allow(null).optional(),
  acreedor: Joi.string().trim().max(100).allow('', null).optional(),
  notas: Joi.string().trim().max(1000).allow('', null).optional(),
}).or('montoInicial', 'montoTotal');

const frecuenciaRecurrente = Joi.string().valid(
  'DIARIA',
  'SEMANAL',
  'QUINCENAL',
  'MENSUAL',
  'BIMESTRAL',
  'TRIMESTRAL',
  'SEMESTRAL',
  'ANUAL'
);

const createRecurrenteSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  descripcion: Joi.string().trim().max(500).allow('', null).optional(),
  tipo: Joi.string()
    .valid('INGRESO', 'GASTO', 'TRANSFERENCIA', 'PAGO_DEUDA')
    .required(),
  monto: Joi.number().positive().required(),
  categoria: Joi.string().trim().max(100).allow('', null).optional(),
  frecuencia: frecuenciaRecurrente.required(),
  diaEjecucion: Joi.number().integer().min(1).max(31).allow(null).optional(),
  diaSemana: Joi.number().integer().min(0).max(6).allow(null).optional(),
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().allow(null, '').optional(),
  activa: Joi.boolean().optional(),
  cuentaOrigenId: Joi.number().integer().positive().required(),
  cuentaDestinoId: Joi.number().integer().positive().allow(null).optional(),
  deudaId: Joi.number().integer().positive().allow(null).optional(),
}).custom((value, helpers) => {
  if (value.tipo === 'TRANSFERENCIA' && !value.cuentaDestinoId) {
    return helpers.error('any.custom', {
      message: 'Las transferencias requieren cuentaDestinoId',
    });
  }
  if (value.tipo === 'PAGO_DEUDA' && !value.deudaId) {
    return helpers.error('any.custom', {
      message: 'El pago de deuda requiere deudaId',
    });
  }
  return value;
});

const updateRecurrenteSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).optional(),
  descripcion: Joi.string().trim().max(500).allow('', null).optional(),
  tipo: Joi.string()
    .valid('INGRESO', 'GASTO', 'TRANSFERENCIA', 'PAGO_DEUDA')
    .optional(),
  monto: Joi.number().positive().optional(),
  categoria: Joi.string().trim().max(100).allow('', null).optional(),
  frecuencia: frecuenciaRecurrente.optional(),
  diaEjecucion: Joi.number().integer().min(1).max(31).allow(null).optional(),
  diaSemana: Joi.number().integer().min(0).max(6).allow(null).optional(),
  fechaInicio: Joi.date().optional(),
  fechaFin: Joi.date().allow(null, '').optional(),
  activa: Joi.boolean().optional(),
  cuentaOrigenId: Joi.number().integer().positive().optional(),
  cuentaDestinoId: Joi.number().integer().positive().allow(null).optional(),
  deudaId: Joi.number().integer().positive().allow(null).optional(),
}).min(1);

const updateCuentaSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).optional(),
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
      'AHORRO',
      'CORRIENTE',
      'CREDITO'
    )
    .optional(),
  banco: Joi.string().trim().max(100).allow('', null).optional(),
  numeroCuenta: Joi.string().trim().max(50).allow('', null).optional(),
  moneda: Joi.string().length(3).uppercase().optional(),
  color: Joi.string().trim().max(20).optional(),
  icono: Joi.string().trim().max(50).allow('', null).optional(),
  descripcion: Joi.string().trim().max(500).allow('', null).optional(),
  fechaApertura: Joi.date().allow(null).optional(),
  incluirEnBalance: Joi.boolean().optional(),
  activa: Joi.boolean().optional(),
}).min(1);

const createMetaSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(150).required(),
  descripcion: Joi.string().trim().max(500).allow('', null).optional(),
  tipo: Joi.string()
    .valid('AHORRO', 'GASTO', 'INVERSION', 'DEUDA', 'EMERGENCIA')
    .optional(),
  montoObjetivo: Joi.number().positive().required(),
  montoActual: Joi.number().min(0).optional(),
  fechaInicio: Joi.date().optional(),
  fechaLimite: Joi.date().required(),
  categoria: Joi.string().trim().max(100).allow('', null).optional(),
  prioridad: Joi.string().valid('BAJA', 'MEDIA', 'ALTA', 'CRITICA').optional(),
  recordatorios: Joi.boolean().optional(),
  publica: Joi.boolean().optional(),
  cuentaOrigenId: Joi.number().integer().positive().allow(null).optional(),
});

const aporteMetaSchema = Joi.object({
  monto: Joi.number().positive().required(),
  cuentaOrigenId: Joi.number().integer().positive().allow(null).optional(),
  categoria: Joi.string().trim().max(100).allow('', null).optional(),
});

const registrarPagoDeudaSchema = Joi.object({
  monto: Joi.number().positive().required(),
  fecha: Joi.date().optional(),
  cuentaOrigenId: Joi.number().integer().positive().required(),
  notas: Joi.string().trim().max(1000).allow('', null).optional(),
});

const createPresupuestoSchema = Joi.object({
  categoria: Joi.string().trim().min(1).max(100).required(),
  tipo: Joi.string().valid('INGRESO', 'GASTO').default('GASTO'),
  limite: Joi.number().positive().required(),
  mes: Joi.number().integer().min(1).max(12).optional(),
  anio: Joi.number().integer().min(2000).max(2100).optional(),
  año: Joi.number().integer().min(2000).max(2100).optional(),
  alertaEn: Joi.number().min(1).max(100).allow(null).optional(),
  activo: Joi.boolean().optional(),
});

module.exports = {
  createCuentaSchema,
  updateSaldoSchema,
  createInversionSchema,
  createDeudaSchema,
  createRecurrenteSchema,
  updateRecurrenteSchema,
  createMetaSchema,
  aporteMetaSchema,
  createPresupuestoSchema,
  updateCuentaSchema,
  registrarPagoDeudaSchema,
};
