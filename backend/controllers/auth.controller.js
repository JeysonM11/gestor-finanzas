const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { ConflictError, AuthenticationError, ValidationError } = require('../utils/errors');
const { logUserAction, logSecurityEvent } = require('../utils/logger');
const { parseDateOnly } = require('../utils/date');
const {
  createUserSession,
  setRefreshCookie,
  clearRefreshCookie,
  readRefreshFromRequest,
  rotateRefreshToken,
  revokeAllSessions,
  ACCESS_TTL_SECONDS,
} = require('../utils/sessions');
const { registrarAuditoria } = require('../services/auditoria-acceso.service');

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function authResponse(res, payload, message, statusCode = 200) {
  setRefreshCookie(res, payload.refreshToken);
  res.status(statusCode).json({
    success: true,
    message,
    token: payload.accessToken,
    accessToken: payload.accessToken,
    expiresIn: payload.expiresIn || ACCESS_TTL_SECONDS,
    user: payload.user,
  });
}

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, telefono, fechaNacimiento, ocupacion, salarioMensual } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return next(new ConflictError('Ya existe un usuario con este email'));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      telefono,
      fechaNacimiento: fechaNacimiento ? parseDateOnly(fechaNacimiento) : null,
      ocupacion: ocupacion?.trim() || null,
      salarioMensual: salarioMensual || null,
    },
  });

  const session = await createUserSession(user, req);
  await registrarAuditoria(req, {
    userId: user.id,
    accion: 'LOGIN_SUCCESS',
    exitoso: true,
    detalles: { via: 'register' },
  });

  logUserAction('USER_REGISTERED', user.id, {
    email: user.email,
    name: user.name,
    ip: req.ip,
  });

  authResponse(
    res,
    {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        rol: user.rol,
        telefono: user.telefono,
        ocupacion: user.ocupacion,
        salarioMensual: user.salarioMensual,
        monedaPrincipal: user.monedaPrincipal,
        createdAt: user.createdAt,
      },
    },
    'Usuario registrado exitosamente',
    201
  );
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      rol: true,
      activo: true,
      ultimoAcceso: true,
      telefono: true,
      ocupacion: true,
      salarioMensual: true,
      monedaPrincipal: true,
      puntosAcumulados: true,
      nivel: true,
    },
  });

  if (!user) {
    await registrarAuditoria(req, {
      accion: 'LOGIN_FAILURE',
      exitoso: false,
      detalles: { email: email.toLowerCase().trim() },
    });
    logSecurityEvent('LOGIN_ATTEMPT_INVALID_EMAIL', { email, ip: req.ip });
    return next(new AuthenticationError('Email o contraseña incorrectos'));
  }

  if (!user.activo) {
    await registrarAuditoria(req, {
      userId: user.id,
      accion: 'LOGIN_FAILURE',
      exitoso: false,
      detalles: { reason: 'inactive' },
    });
    return next(new AuthenticationError('Tu cuenta ha sido desactivada. Contacta al soporte.'));
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    await registrarAuditoria(req, {
      userId: user.id,
      accion: 'LOGIN_FAILURE',
      exitoso: false,
      detalles: { reason: 'bad_password' },
    });
    logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
    });
    return next(new AuthenticationError('Email o contraseña incorrectos'));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { ultimoAcceso: new Date() },
  });

  const session = await createUserSession(user, req);
  await registrarAuditoria(req, {
    userId: user.id,
    accion: 'LOGIN_SUCCESS',
    exitoso: true,
  });

  logUserAction('USER_LOGIN', user.id, { email: user.email, ip: req.ip });

  authResponse(res, {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: session.expiresIn,
    user: publicUser(user),
  }, 'Login exitoso');
});

exports.refresh = catchAsync(async (req, res, next) => {
  const refreshToken = readRefreshFromRequest(req);

  // Sin cookie o sesión no usable → 204 (visitante / cookie stale).
  // Evita 401 rojo en consola al abrir /login.
  const noSession = () => {
    clearRefreshCookie(res);
    return res.status(204).send();
  };

  if (!refreshToken) {
    return noSession();
  }

  try {
    const rotated = await rotateRefreshToken(refreshToken);
    const { password, ...userWithoutPassword } = rotated.user;

    setRefreshCookie(res, rotated.refreshToken);
    res.status(200).json({
      success: true,
      message: 'Token renovado',
      token: rotated.accessToken,
      accessToken: rotated.accessToken,
      expiresIn: rotated.expiresIn,
      user: userWithoutPassword,
    });
  } catch (error) {
    // Cookie inválida/expirada/reutilizada: ya se revocó si aplica; limpiar y callar.
    return noSession();
  }
});

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
      telefono: true,
      ocupacion: true,
      salarioMensual: true,
      monedaPrincipal: true,
      puntosAcumulados: true,
      nivel: true,
      activo: true,
      fechaNacimiento: true,
      configuracion: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || !user.activo) {
    return next(new AuthenticationError('Usuario no encontrado'));
  }

  res.status(200).json({ success: true, user });
});

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  rol: true,
  telefono: true,
  ocupacion: true,
  salarioMensual: true,
  monedaPrincipal: true,
  puntosAcumulados: true,
  nivel: true,
  activo: true,
  fechaNacimiento: true,
  configuracion: true,
  createdAt: true,
  updatedAt: true,
};

exports.updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { name, telefono, fechaNacimiento, ocupacion, salarioMensual, monedaPrincipal } = req.body;
  const fields = Object.keys(req.body);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name != null && { name: name.trim() }),
      ...(telefono !== undefined && { telefono: telefono || null }),
      ...(fechaNacimiento !== undefined && {
        fechaNacimiento: fechaNacimiento ? parseDateOnly(fechaNacimiento) : null,
      }),
      ...(ocupacion !== undefined && { ocupacion: ocupacion || null }),
      ...(salarioMensual !== undefined && { salarioMensual }),
      ...(monedaPrincipal != null && { monedaPrincipal }),
    },
    select: userPublicSelect,
  });

  await registrarAuditoria(req, {
    userId,
    accion: 'PROFILE_UPDATE',
    exitoso: true,
    detalles: { fields },
  });

  logUserAction('USER_PROFILE_UPDATED', userId, { fields });

  res.status(200).json({
    success: true,
    message: 'Perfil actualizado exitosamente',
    user,
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    return next(new AuthenticationError('Usuario no encontrado'));
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    await registrarAuditoria(req, {
      userId,
      accion: 'PASSWORD_CHANGE_FAILURE',
      exitoso: false,
    });
    return next(new AuthenticationError('La contraseña actual es incorrecta'));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await revokeAllSessions(userId, req.sessionId);

  await registrarAuditoria(req, {
    userId,
    accion: 'PASSWORD_CHANGE_SUCCESS',
    exitoso: true,
  });

  logUserAction('USER_PASSWORD_CHANGED', userId, { ip: req.ip });

  res.status(200).json({
    success: true,
    message: 'Contraseña actualizada exitosamente',
  });
});

exports.updatePreferences = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { monedaPrincipal, ...preferencias } = req.body;

  const actual = await prisma.user.findUnique({
    where: { id: userId },
    select: { configuracion: true },
  });

  const configuracionActual =
    actual?.configuracion && typeof actual.configuracion === 'object'
      ? actual.configuracion
      : {};

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(monedaPrincipal != null && { monedaPrincipal }),
      configuracion: {
        ...configuracionActual,
        ...preferencias,
      },
    },
    select: userPublicSelect,
  });

  res.status(200).json({
    success: true,
    message: 'Preferencias guardadas exitosamente',
    user,
  });
});

/**
 * Borrado lógico: activo=false + revocar todas las sesiones.
 */
exports.deleteAccount = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return next(new ValidationError('La contraseña es requerida'));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true, activo: true },
  });

  if (!user || !user.activo) {
    return next(new AuthenticationError('Usuario no encontrado'));
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    await registrarAuditoria(req, {
      userId,
      accion: 'ACCOUNT_DELETE',
      exitoso: false,
      detalles: { reason: 'bad_password' },
    });
    return next(new AuthenticationError('Contraseña incorrecta'));
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { activo: false },
    });
    await tx.sesionUsuario.updateMany({
      where: { userId, activa: true },
      data: {
        activa: false,
        revokedAt: new Date(),
        refreshTokenHash: null,
      },
    });
  });

  await registrarAuditoria(req, {
    userId,
    accion: 'ACCOUNT_DELETE',
    exitoso: true,
  });

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: 'Cuenta desactivada correctamente',
  });
});
