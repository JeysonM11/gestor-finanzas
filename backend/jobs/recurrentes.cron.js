const cron = require('node-cron');
const { ejecutarPendientes } = require('../services/recurrentes.service');
const { logger } = require('../utils/logger');

let task = null;

/**
 * Arranca el job de recurrentes.
 * Por defecto cada hora en el minuto 0. Desactivar con CRON_RECURRENTES=false.
 */
function startRecurrentesCron() {
  if (process.env.CRON_RECURRENTES === 'false') {
    logger.info('Cron de recurrentes desactivado (CRON_RECURRENTES=false)');
    return null;
  }

  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const schedule = process.env.CRON_RECURRENTES_SCHEDULE || '0 * * * *';

  if (!cron.validate(schedule)) {
    logger.error('CRON_RECURRENTES_SCHEDULE inválido', { schedule });
    return null;
  }

  task = cron.schedule(schedule, async () => {
    try {
      logger.info('Cron recurrentes: iniciando ejecución');
      const resumen = await ejecutarPendientes();
      logger.info('Cron recurrentes: finalizado', {
        pendientes: resumen.pendientes,
        procesadas: resumen.procesadas,
        errores: resumen.errores,
      });
    } catch (error) {
      logger.error('Cron recurrentes: fallo', { message: error.message });
    }
  });

  logger.info('Cron de recurrentes iniciado', { schedule });
  return task;
}

function stopRecurrentesCron() {
  if (task) {
    task.stop();
    task = null;
  }
}

module.exports = { startRecurrentesCron, stopRecurrentesCron };
