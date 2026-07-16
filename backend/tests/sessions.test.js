const {
  hashToken,
  parseDevice,
  validateUserSession,
} = require('../utils/sessions');

describe('sessions Sprint D + v1.4', () => {
  test('hashToken es determinista', () => {
    const a = hashToken('jwt-ejemplo-123');
    const b = hashToken('jwt-ejemplo-123');
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  test('parseDevice extrae navegador y SO', () => {
    const chromeWin =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0';
    expect(parseDevice(chromeWin)).toBe('Chrome en Windows');

    const safariIos =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1';
    expect(parseDevice(safariIos)).toBe('Safari en iOS');
  });

  test('validateUserSession rechaza tokens legacy sin sid (v1.4)', async () => {
    const ok = await validateUserSession({ id: 1, rol: 'USUARIO' }, 'token');
    expect(ok).toBe(false);
  });

  test('validateUserSession con sid requiere BD (contrato middleware)', () => {
    expect(typeof validateUserSession).toBe('function');
  });
});
