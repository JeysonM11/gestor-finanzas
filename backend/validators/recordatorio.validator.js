const Joi = require('joi');
const {
  FRECUENCIAS_RECORDATORIO,
  TIPOS_RECORDATORIO,
} = require('../utils/recordatorios');

const createRecordatorioSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(150).required(),
  descripcion: Joi.string().trim().max(1000).allow('', null).optional(),
  tipo: Joi.string()
    .valid(...TIPOS_RECORDATORIO)
    .default('GENERAL'),
  fechaRecordatorio: Joi.date().required(),
  repetir: Joi.boolean().optional(),
  frecuencia: Joi.when('repetir', {
    is: true,
    then: Joi.string()
      .valid(...FRECUENCIAS_RECORDATORIO)
      .required(),
    otherwise: Joi.string()
      .valid(...FRECUENCIAS_RECORDATORIO)
      .allow(null, '')
      .optional(),
  }),
  activo: Joi.boolean().optional(),
});

const updateRecordatorioSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(150).optional(),
  descripcion: Joi.string().trim().max(1000).allow('', null).optional(),
  tipo: Joi.string()
    .valid(...TIPOS_RECORDATORIO)
    .optional(),
  fechaRecordatorio: Joi.date().optional(),
  repetir: Joi.boolean().optional(),
  frecuencia: Joi.string()
    .valid(...FRECUENCIAS_RECORDATORIO)
    .allow(null, '')
    .optional(),
  completado: Joi.boolean().optional(),
  activo: Joi.boolean().optional(),
}).min(1);

module.exports = {
  createRecordatorioSchema,
  updateRecordatorioSchema,
};
