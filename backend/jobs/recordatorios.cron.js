const cron = require('node-cron');
const { notificarVencidos } = require('../services/recordatorios.service');
const { logger } = require('../utils/logger');

let task = null;

/**
 * Arranca el job de recordatorios vencidos.
 * Por defecto cada hora en el minuto 5. Desactivar con CRON_RECORDATORIOS=false.
 */
function startRecordatoriosCron() {
  if (process.env.CRON_RECORDATORIOS === 'false') {
    logger.info('Cron de recordatorios desactivado (CRON_RECORDATORIOS=false)');
    return null;
  }

  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const schedule = process.env.CRON_RECORDATORIOS_SCHEDULE || '5 * * * *';

  if (!cron.validate(schedule)) {
    logger.error('CRON_RECORDATORIOS_SCHEDULE inválido', { schedule });
    return null;
  }

  task = cron.schedule(schedule, async () => {
    try {
      logger.info('Cron recordatorios: iniciando ejecución');
      const resumen = await notificarVencidos();
      logger.info('Cron recordatorios: finalizado', {
        pendientes: resumen.pendientes,
        notificados: resumen.notificados,
        errores: resumen.errores,
      });
    } catch (error) {
      logger.error('Cron recordatorios: fallo', { message: error.message });
    }
  });

  logger.info('Cron de recordatorios iniciado', { schedule });
  return task;
}

function stopRecordatoriosCron() {
  if (task) {
    task.stop();
    task = null;
  }
}

module.exports = { startRecordatoriosCron, stopRecordatoriosCron };
