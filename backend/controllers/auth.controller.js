const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { AppError, ConflictError, AuthenticationError } = require('../utils/errors');
const { logUserAction, logSecurityEvent } = require('../utils/logger');
const { parseDateOnly } = require('../utils/date');

// Registro de usuario
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, telefono, fechaNacimiento, ocupacion, salarioMensual } = req.body;

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return next(new ConflictError('Ya existe un usuario con este email'));
  }

  // Encriptar contraseña
  const hashedPassword = await bcrypt.hash(password, 12);

  // Crear usuario
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

  // Generar token
  const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Log de registro exitoso
  logUserAction('USER_REGISTERED', user.id, {
    email: user.email,
    name: user.name,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(201).json({
    success: true,
    message: "Usuario registrado exitosamente",
    token,
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
  });
});

// Login de usuario
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Buscar usuario por email
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
    }
  });

  if (!user) {
    logSecurityEvent('LOGIN_ATTEMPT_INVALID_EMAIL', {
      email: email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    return next(new AuthenticationError('Email o contraseña incorrectos'));
  }

  // Verificar si el usuario está activo
  if (!user.activo) {
    return next(new AuthenticationError('Tu cuenta ha sido desactivada. Contacta al soporte.'));
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    return next(new AuthenticationError('Email o contraseña incorrectos'));
  }

  // Actualizar último acceso
  await prisma.user.update({
    where: { id: user.id },
    data: { ultimoAcceso: new Date() }
  });

  // Generar token
  const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  // Remover password de la respuesta
  const { password: userPassword, ...userWithoutPassword } = user;

  // Log de login exitoso
  logUserAction('USER_LOGIN', user.id, {
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    lastAccess: user.ultimoAcceso,
  });

  res.status(200).json({
    success: true,
    message: 'Login exitoso',
    token,
    user: userWithoutPassword,
  });
});

// Obtener usuario actual
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  // req.user viene del middleware authenticateToken
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
    }
  });

  if (!user) {
    return next(new AuthenticationError('Usuario no encontrado'));
  }

  res.status(200).json({
    success: true,
    user,
  });
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

// Actualizar perfil
exports.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { name, telefono, fechaNacimiento, ocupacion, salarioMensual, monedaPrincipal } = req.body;

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

  logUserAction('USER_PROFILE_UPDATED', userId, { fields: Object.keys(req.body) });

  res.status(200).json({
    success: true,
    message: 'Perfil actualizado exitosamente',
    user,
  });
});

// Cambiar contraseña
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
    return next(new AuthenticationError('La contraseña actual es incorrecta'));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  logUserAction('USER_PASSWORD_CHANGED', userId, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(200).json({
    success: true,
    message: 'Contraseña actualizada exitosamente',
  });
});

// Actualizar preferencias
exports.updatePreferences = catchAsync(async (req, res, next) => {
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
