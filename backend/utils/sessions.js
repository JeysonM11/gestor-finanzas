const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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

/**
 * Etiqueta legible a partir del User-Agent.
 */
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

/**
 * Crea sesión en BD y devuelve JWT con claim `sid`.
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
    },
  });

  const token = jwt.sign(
    { id: user.id, rol: user.rol, sid: session.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  await prisma.sesionUsuario.update({
    where: { id: session.id },
    data: { token: hashToken(token) },
  });

  return { token, sessionId: session.id };
}

/**
 * Valida que la sesión del JWT siga activa.
 * Tokens legacy sin `sid` se aceptan (compatibilidad hasta re-login).
 */
async function validateUserSession(decoded, rawToken) {
  if (!decoded?.sid) return true;

  const session = await prisma.sesionUsuario.findFirst({
    where: {
      id: decoded.sid,
      userId: decoded.id,
      activa: true,
      token: hashToken(rawToken),
      fechaExpiracion: { gt: new Date() },
    },
  });

  return Boolean(session);
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

module.exports = {
  SESSION_TTL_MS,
  hashToken,
  getClientIp,
  parseDevice,
  sessionExpiryDate,
  createUserSession,
  validateUserSession,
  toSessionDto,
};
