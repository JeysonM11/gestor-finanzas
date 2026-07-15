const { cronAuthMiddleware } = require('../middlewares/cronAuth.middleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('cronAuth middleware Sprint 4', () => {
  const original = process.env.CRON_SECRET;

  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  });

  test('503 si CRON_SECRET no está configurado', () => {
    delete process.env.CRON_SECRET;
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    cronAuthMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(503);
  });

  test('401 si el secret no coincide', () => {
    process.env.CRON_SECRET = 'secreto-correcto';
    const req = { headers: { 'x-cron-secret': 'malo' } };
    const res = mockRes();
    const next = jest.fn();
    cronAuthMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('pasa si el secret coincide', () => {
    process.env.CRON_SECRET = 'secreto-correcto';
    const req = { headers: { 'x-cron-secret': 'secreto-correcto' } };
    const res = mockRes();
    const next = jest.fn();
    cronAuthMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
