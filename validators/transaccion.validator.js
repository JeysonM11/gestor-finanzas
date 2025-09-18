const Joi = require('joi');

// Esquema para crear transacción
const createTransaccionSchema = Joi.object({
  tipo: Joi.string()
    .valid('INGRESO', 'GASTO', 'TRANSFERENCIA')
    .required()
    .messages({
      'any.only': 'El tipo debe ser INGRESO, GASTO o TRANSFERENCIA',
      'any.required': 'El tipo de transacción es requerido'
    }),

  monto: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'El monto debe ser un número positivo',
      'any.required': 'El monto es requerido'
    }),

  descripcion: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    }),

  categoria: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'La categoría no puede exceder 100 caracteres'
    }),

  subcategoria: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'La subcategoría no puede exceder 100 caracteres'
    }),

  fecha: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'La fecha no puede ser futura'
    }),

  ubicacion: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'La ubicación no puede exceder 200 caracteres'
    }),

  notas: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Las notas no pueden exceder 1000 caracteres'
    }),

  etiquetas: Joi.array()
    .items(Joi.string().trim().max(50))
    .max(10)
    .optional()
    .messages({
      'array.max': 'No puedes agregar más de 10 etiquetas',
      'string.max': 'Cada etiqueta no puede exceder 50 caracteres'
    }),

  metodoPago: Joi.string()
    .valid('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'CHEQUE', 'DIGITAL', 'CRIPTOMONEDA')
    .optional()
    .messages({
      'any.only': 'Método de pago no válido'
    }),

  cuentaOrigenId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.positive': 'El ID de cuenta origen debe ser positivo'
    }),

  cuentaDestinoId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.positive': 'El ID de cuenta destino debe ser positivo'
    }),

  montoOriginal: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.positive': 'El monto original debe ser positivo'
    }),

  monedaOriginal: Joi.string()
    .length(3)
    .uppercase()
    .optional()
    .messages({
      'string.length': 'La moneda debe tener 3 caracteres (ej: USD)'
    }),

  tasaCambio: Joi.number()
    .positive()
    .precision(6)
    .optional()
    .messages({
      'number.positive': 'La tasa de cambio debe ser positiva'
    })
});

// Esquema para actualizar transacción
const updateTransaccionSchema = createTransaccionSchema.fork(
  ['tipo', 'monto'], 
  (schema) => schema.optional()
);

// Esquema para filtros de búsqueda
const getTransaccionesSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional(),

  tipo: Joi.string()
    .valid('INGRESO', 'GASTO', 'TRANSFERENCIA')
    .optional(),

  categoria: Joi.string()
    .trim()
    .optional(),

  fechaInicio: Joi.date()
    .optional(),

  fechaFin: Joi.date()
    .min(Joi.ref('fechaInicio'))
    .optional()
    .messages({
      'date.min': 'La fecha fin debe ser posterior a la fecha inicio'
    }),

  montoMin: Joi.number()
    .positive()
    .optional(),

  montoMax: Joi.number()
    .positive()
    .min(Joi.ref('montoMin'))
    .optional()
    .messages({
      'number.min': 'El monto máximo debe ser mayor al monto mínimo'
    }),

  search: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.max': 'El término de búsqueda no puede exceder 100 caracteres'
    })
});

module.exports = {
  createTransaccionSchema,
  updateTransaccionSchema,
  getTransaccionesSchema
};