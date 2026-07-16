const prisma = require('../lib/prisma');
const { getClientIp, parseDevice } = require('../utils/sessions');
const { logger } = require('../utils/logger');

/**
 * Persiste evento de AuditoriaAcceso. Fail-open: no rompe el flujo principal.
 */
async function registrarAuditoria(req, {
  userId = null,
  accion,
  exitoso = true,
  detalles = null,
} = {}) {
  try {
    const userAgent = req?.get?.('User-Agent') || null;
    await prisma.auditoriaAcceso.create({
      data: {
        userId: userId || null,
        accion,
        exitoso: Boolean(exitoso),
        ip: req ? getClientIp(req) : null,
        dispositivo: parseDevice(userAgent),
        userAgent,
        detalles: detalles || undefined,
      },
    });
  } catch (error) {
    logger.warn('No se pudo registrar auditoria', {
      accion,
      message: error.message,
    });
  }
}

module.exports = { registrarAuditoria };
