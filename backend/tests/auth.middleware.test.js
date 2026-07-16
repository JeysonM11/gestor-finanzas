const jwt = require('jsonwebtoken');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('auth middleware Sprint 4 + D', () => {
  test('rechaza sin Bearer token', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('acepta token legacy sin sid (compatibilidad)', async () => {
    const token = jwt.sign({ id: 7, rol: 'USUARIO' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();
    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(7);
    expect(req.user.rol).toBe('USUARIO');
  });

  test('requireRole bloquea rol incorrecto', () => {
    const req = { user: { id: 1, rol: 'USUARIO' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('ADMIN')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('requireRole permite ADMIN', () => {
    const req = { user: { id: 1, rol: 'ADMIN' } };
    const res = mockRes();
    const next = jest.fn();
    requireRole('ADMIN')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
