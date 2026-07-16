const Joi = require('joi');
const { TIPOS_CATEGORIA_PERSONALIZADA } = require('../utils/categorias');

const createCategoriaSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  tipo: Joi.string()
    .valid(...TIPOS_CATEGORIA_PERSONALIZADA)
    .required(),
  color: Joi.string().trim().max(30).allow('', null).optional(),
  icono: Joi.string().trim().max(50).allow('', null).optional(),
  descripcion: Joi.string().trim().max(500).allow('', null).optional(),
});

const updateCategoriaSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).optional(),
  tipo: Joi.string()
    .valid(...TIPOS_CATEGORIA_PERSONALIZADA)
    .optional(),
  color: Joi.string().trim().max(30).allow('', null).optional(),
  icono: Joi.string().trim().max(50).allow('', null).optional(),
  descripcion: Joi.string().trim().max(500).allow('', null).optional(),
  activa: Joi.boolean().optional(),
}).min(1);

module.exports = {
  createCategoriaSchema,
  updateCategoriaSchema,
};
