const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { NotFoundError } = require('../utils/errors');
const { toSessionDto } = require('../utils/sessions');

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
  const { id } = req.params;
  const sessionId = parseInt(id, 10);

  const resultado = await prisma.sesionUsuario.updateMany({
    where: { id: sessionId, userId, activa: true },
    data: { activa: false },
  });

  if (resultado.count === 0) {
    throw new NotFoundError('Sesión');
  }

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
    data: { activa: false },
  });

  res.status(200).json({
    success: true,
    message: 'Otras sesiones cerradas',
    cerradas: resultado.count,
  });
});

exports.logout = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const currentSessionId = req.sessionId;

  if (currentSessionId) {
    await prisma.sesionUsuario.updateMany({
      where: { id: currentSessionId, userId },
      data: { activa: false },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Sesión cerrada',
  });
});
