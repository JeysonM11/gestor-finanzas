const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { NotFoundError } = require('../utils/errors');
const {
  toSessionDto,
  revokeSession,
  clearRefreshCookie,
  readRefreshFromRequest,
} = require('../utils/sessions');
const { registrarAuditoria } = require('../services/auditoria-acceso.service');

exports.listarSesiones = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const currentSessionId = req.sessionId ?? null;

  const sesiones = await prisma.sesionUsuario.findMany({
    where: { userId, activa: true, fechaExpiracion: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    sesiones: sesiones.map((s) => toSessionDto(s, currentSessionId)),
    total: sesiones.length,
  });
});

exports.revocarSesion = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const sessionId = parseInt(req.params.id, 10);

  const resultado = await prisma.sesionUsuario.updateMany({
    where: { id: sessionId, userId, activa: true },
    data: {
      activa: false,
      revokedAt: new Date(),
      refreshTokenHash: null,
    },
  });

  if (resultado.count === 0) {
    throw new NotFoundError('Sesión');
  }

  await registrarAuditoria(req, {
    userId,
    accion: 'SESSION_REVOKED',
    exitoso: true,
    detalles: { sessionId },
  });

  res.status(200).json({
    success: true,
    message: 'Sesión cerrada',
    sesionActual: req.sessionId === sessionId,
  });
});

exports.revocarOtrasSesiones = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const currentSessionId = req.sessionId;

  if (!currentSessionId) {
    return res.status(200).json({
      success: true,
      message: 'No hay sesión actual identificada; inicia sesión de nuevo para usar esta función.',
      cerradas: 0,
    });
  }

  const resultado = await prisma.sesionUsuario.updateMany({
    where: {
      userId,
      activa: true,
      id: { not: currentSessionId },
    },
    data: {
      activa: false,
      revokedAt: new Date(),
      refreshTokenHash: null,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Otras sesiones cerradas',
    cerradas: resultado.count,
  });
});

exports.logout = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const currentSessionId = req.sessionId;

  if (currentSessionId) {
    await revokeSession(currentSessionId, userId);
  } else {
    // Permitir logout con refresh aunque el access haya expirado
    try {
      const refreshToken = readRefreshFromRequest(req);
      if (refreshToken) {
        const [sidRaw] = refreshToken.split('.');
        const sid = parseInt(sidRaw, 10);
        if (Number.isFinite(sid)) {
          await revokeSession(sid);
        }
      }
    } catch (_) {
      /* ignore */
    }
  }

  if (userId) {
    await registrarAuditoria(req, {
      userId,
      accion: 'LOGOUT',
      exitoso: true,
    });
  }

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: 'Sesión cerrada',
  });
});
