/**
 * Middleware de validación usando Joi
 * @param {Object} schema - Esquema de validación de Joi
 * @param {string} property - Propiedad del request a validar (body, query, params)
 * @returns {Function} Middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Devuelve todos los errores, no solo el primero
      allowUnknown: false, // No permite campos desconocidos
      stripUnknown: true // Elimina campos desconocidos del objeto
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errorDetails,
        timestamp: new Date().toISOString()
      });
    }

    // Reemplaza los datos originales con los datos validados y limpios
    req[property] = value;
    next();
  };
};

/**
 * Middleware para validar parámetros de la URL
 * @param {Object} schema - Esquema de validación de Joi
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * Middleware para validar query parameters
 * @param {Object} schema - Esquema de validación de Joi
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Middleware para validar el body del request
 * @param {Object} schema - Esquema de validación de Joi
 */
const validateBody = (schema) => validate(schema, 'body');

module.exports = {
  validate,
  validateParams,
  validateQuery,
  validateBody
};