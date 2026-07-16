const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const ACCESS_TTL_SECONDS = parseInt(
  process.env.JWT_ACCESS_TTL_SECONDS || '900',
  10
);
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10);
const SESSION_TTL_MS = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'gf_refresh';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || null;
}

function parseDevice(userAgent) {
  if (!userAgent) return 'Dispositivo desconocido';
  const ua = userAgent.toLowerCase();
  let browser = 'Navegador';
  if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome/') && !ua.includes('edg/')) browser = 'Chrome';
  else if (ua.includes('firefox/')) browser = 'Firefox';
  else if (ua.includes('safari/') && !ua.includes('chrome/')) browser = 'Safari';

  let os = 'Desconocido';
  if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os') || ua.includes('macintosh')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';

  return `${browser} en ${os}`;
}

function sessionExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function buildAccessToken(user, sessionId) {
  return jwt.sign(
    {
      id: user.id,
      rol: user.rol,
      sid: sessionId,
      type: 'access',
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL_SECONDS }
  );
}

function buildRefreshToken(sessionId) {
  const secret = crypto.randomBytes(32).toString('hex');
  return `${sessionId}.${secret}`;
}

function refreshCookieOptions() {
  const secure =
    process.env.COOKIE_SECURE === 'true' ||
    process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAME_SITE || (secure ? 'none' : 'lax');
  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: SESSION_TTL_MS,
    path: '/api/auth',
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}

/**
 * Crea sesión con access JWT corto + refresh opaco rotatorio.
 */
async function createUserSession(user, req) {
  const fechaExpiracion = sessionExpiryDate();
  const userAgent = req.get('User-Agent') || null;

  const session = await prisma.sesionUsuario.create({
    data: {
      token: crypto.randomBytes(32).toString('hex'),
      dispositivo: parseDevice(userAgent),
      ip: getClientIp(req),
      userAgent,
      fechaExpiracion,
      activa: true,
      userId: user.id,
      lastUsedAt: new Date(),
    },
  });

  const accessToken = buildAccessToken(user, session.id);
  const refreshToken = buildRefreshToken(session.id);

  await prisma.sesionUsuario.update({
    where: { id: session.id },
    data: {
      token: hashToken(accessToken),
      refreshTokenHash: hashToken(refreshToken),
    },
  });

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TTL_SECONDS,
    sessionId: session.id,
  };
}

/**
 * Valida access JWT: exige sid + type=access + sesión activa + usuario activo.
 * Rechaza tokens legacy sin sid (v1.4 force re-login).
 */
async function validateUserSession(decoded, rawToken) {
  if (!decoded?.sid) return false;
  if (decoded.type && decoded.type !== 'access') return false;

  const session = await prisma.sesionUsuario.findFirst({
    where: {
      id: decoded.sid,
      userId: decoded.id,
      activa: true,
      token: hashToken(rawToken),
      fechaExpiracion: { gt: new Date() },
    },
    include: { user: { select: { activo: true } } },
  });

  if (!session) return false;
  if (session.user && session.user.activo === false) return false;
  return true;
}

/**
 * Rota refresh token. Si se reutiliza un refresh viejo, revoca la sesión.
 */
async function rotateRefreshToken(refreshToken) {
  if (!refreshToken || typeof refreshToken !== 'string') {
    const err = new Error('Refresh token requerido');
    err.statusCode = 401;
    err.code = 'REFRESH_MISSING';
    throw err;
  }

  const [sidRaw] = refreshToken.split('.');
  const sessionId = parseInt(sidRaw, 10);
  if (!Number.isFinite(sessionId)) {
    const err = new Error('Refresh token inválido');
    err.statusCode = 401;
    err.code = 'REFRESH_INVALID';
    throw err;
  }

  const session = await prisma.sesionUsuario.findFirst({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || !session.activa || session.fechaExpiracion <= new Date()) {
    const err = new Error('Sesión expirada o inválida');
    err.statusCode = 401;
    err.code = 'SESSION_REVOKED';
    throw err;
  }

  if (!session.user?.activo) {
    const err = new Error('Cuenta desactivada');
    err.statusCode = 401;
    err.code = 'ACCOUNT_INACTIVE';
    throw err;
  }

  const incomingHash = hashToken(refreshToken);
  if (session.refreshTokenHash !== incomingHash) {
    await prisma.sesionUsuario.update({
      where: { id: session.id },
      data: { activa: false, revokedAt: new Date(), refreshTokenHash: null },
    });
    const err = new Error('Refresh token reutilizado; sesión revocada');
    err.statusCode = 401;
    err.code = 'REFRESH_REUSED';
    throw err;
  }

  const accessToken = buildAccessToken(session.user, session.id);
  const newRefresh = buildRefreshToken(session.id);

  await prisma.sesionUsuario.update({
    where: { id: session.id },
    data: {
      token: hashToken(accessToken),
      refreshTokenHash: hashToken(newRefresh),
      lastUsedAt: new Date(),
    },
  });

  return {
    token: accessToken,
    accessToken,
    refreshToken: newRefresh,
    expiresIn: ACCESS_TTL_SECONDS,
    sessionId: session.id,
    user: session.user,
  };
}

async function revokeSession(sessionId, userId) {
  if (!sessionId) return;
  await prisma.sesionUsuario.updateMany({
    where: { id: sessionId, ...(userId ? { userId } : {}) },
    data: {
      activa: false,
      revokedAt: new Date(),
      refreshTokenHash: null,
    },
  });
}

async function revokeAllSessions(userId, exceptSessionId = null) {
  await prisma.sesionUsuario.updateMany({
    where: {
      userId,
      activa: true,
      ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
    },
    data: {
      activa: false,
      revokedAt: new Date(),
      refreshTokenHash: null,
    },
  });
}

function toSessionDto(session, currentSessionId) {
  return {
    id: session.id,
    dispositivo: session.dispositivo,
    ip: session.ip,
    activa: session.activa,
    createdAt: session.createdAt,
    fechaExpiracion: session.fechaExpiracion,
    actual: currentSessionId != null && session.id === currentSessionId,
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...refreshCookieOptions(),
    maxAge: 0,
  });
}

function readRefreshFromRequest(req) {
  return (
    req.cookies?.[REFRESH_COOKIE_NAME] ||
    req.body?.refreshToken ||
    null
  );
}

module.exports = {
  SESSION_TTL_MS,
  ACCESS_TTL_SECONDS,
  REFRESH_COOKIE_NAME,
  hashToken,
  getClientIp,
  parseDevice,
  sessionExpiryDate,
  createUserSession,
  validateUserSession,
  rotateRefreshToken,
  revokeSession,
  revokeAllSessions,
  toSessionDto,
  setRefreshCookie,
  clearRefreshCookie,
  readRefreshFromRequest,
};
