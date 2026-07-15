/**
 * Protege endpoints internos de cron con CRON_SECRET.
 * Header: X-Cron-Secret: <valor>
 */
function cronAuthMiddleware(req, res, next) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return res.status(503).json({
      success: false,
      message: 'CRON_SECRET no configurado en el servidor',
      code: 'CRON_NOT_CONFIGURED',
    });
  }

  const provided = req.headers['x-cron-secret'];
  if (!provided || provided !== expected) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado',
      code: 'CRON_UNAUTHORIZED',
    });
  }

  next();
}

module.exports = { cronAuthMiddleware };
