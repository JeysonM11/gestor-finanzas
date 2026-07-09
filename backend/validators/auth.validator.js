const Joi = require('joi');

// Esquema para registro de usuario
const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'string.empty': 'El email es requerido',
      'any.required': 'El email es requerido'
    }),
  
  password: Joi.string()
    .min(6)
    .max(100)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.max': 'La contraseña no puede exceder 100 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una minúscula, una mayúscula y un número',
      'string.empty': 'La contraseña es requerida',
      'any.required': 'La contraseña es requerida'
    }),

  telefono: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'El teléfono debe tener un formato válido'
    }),

  fechaNacimiento: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'La fecha de nacimiento no puede ser futura'
    }),

  ocupacion: Joi.string()
    .trim()
    .max(100)
    .optional(),

  salarioMensual: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.positive': 'El salario debe ser un número positivo'
    })
});

// Esquema para login
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'string.empty': 'El email es requerido',
      'any.required': 'El email es requerido'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'any.required': 'La contraseña es requerida'
    })
});

// Esquema para actualizar perfil
const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional(),
  
  telefono: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]{10,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'El teléfono debe tener un formato válido'
    }),

  fechaNacimiento: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'La fecha de nacimiento no puede ser futura'
    }),

  ocupacion: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),

  salarioMensual: Joi.number()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.positive': 'El salario debe ser un número positivo'
    }),

  monedaPrincipal: Joi.string()
    .valid('USD', 'EUR', 'COP', 'MXN', 'ARS', 'PEN', 'CLP', 'BOB')
    .optional()
    .messages({
      'any.only': 'La moneda debe ser una de las soportadas'
    })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'La contraseña actual es requerida',
  }),
  newPassword: Joi.string()
    .min(6)
    .max(100)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'string.pattern.base':
        'La nueva contraseña debe contener al menos una minúscula, una mayúscula y un número',
      'any.required': 'La nueva contraseña es requerida',
    }),
});

const updatePreferencesSchema = Joi.object({
  monedaPrincipal: Joi.string()
    .valid('USD', 'EUR', 'COP', 'MXN', 'ARS', 'PEN', 'CLP', 'BOB')
    .optional(),
  notificacionesEmail: Joi.boolean().optional(),
  notificacionesPush: Joi.boolean().optional(),
  notificacionesTransacciones: Joi.boolean().optional(),
  notificacionesRecurrentes: Joi.boolean().optional(),
}).unknown(true);

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  updatePreferencesSchema,
};