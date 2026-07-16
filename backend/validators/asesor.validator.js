const Joi = require('joi');
const { ESTRATEGIAS } = require('../services/asesor-deudas.service');

/**
 * Body de POST /asesor/generar.
 * presupuestoExtra: aporte mensual adicional (editable por el usuario)
 * por encima de los pagos mínimos. Si se omite, se usa la estimación
 * del snapshot (capacidadExtraEstimada).
 */
const generarPlanSchema = Joi.object({
  estrategia: Joi.string()
    .valid(...ESTRATEGIAS)
    .default('AVALANCHE'),
  presupuestoExtra: Joi.number().min(0).max(1e9).optional(),
});

/**
 * Respuesta del proveedor de IA. Se valida ANTES de persistir:
 * si el modelo devuelve algo fuera de contrato, se descarta y se usa fallback.
 */
const respuestaIASchema = Joi.object({
  diagnostico: Joi.object({
    nivelRiesgo: Joi.string().valid('BAJO', 'MEDIO', 'ALTO').required(),
    resumen: Joi.string().trim().min(1).max(2000).required(),
    alertas: Joi.array().items(Joi.string().trim().max(500)).max(10).required(),
  }).required(),
  tips: Joi.array()
    .items(
      Joi.object({
        titulo: Joi.string().trim().min(1).max(200).required(),
        detalle: Joi.string().trim().min(1).max(1000).required(),
        prioridad: Joi.string().valid('ALTA', 'MEDIA', 'BAJA').required(),
      })
    )
    .min(1)
    .max(6)
    .required(),
  pasos: Joi.array().items(Joi.string().trim().max(500)).max(10).required(),
  motivacion: Joi.string().trim().max(1000).required(),
});

module.exports = { generarPlanSchema, respuestaIASchema };
