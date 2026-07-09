const {
  mapTipoCuenta,
  mapTipoDeuda,
  normalizeDeudaInput,
  toDeudaDto,
} = require('../utils/mappers');

describe('mappers Sprint 1', () => {
  test('mapTipoCuenta convierte aliases UI a Prisma', () => {
    expect(mapTipoCuenta('AHORRO')).toBe('BANCO_AHORROS');
    expect(mapTipoCuenta('CORRIENTE')).toBe('BANCO_CORRIENTE');
    expect(mapTipoCuenta('CREDITO')).toBe('TARJETA_CREDITO');
    expect(mapTipoCuenta('BANCO_AHORROS')).toBe('BANCO_AHORROS');
  });

  test('mapTipoDeuda convierte aliases UI a Prisma', () => {
    expect(mapTipoDeuda('PRESTAMO')).toBe('PRESTAMO_PERSONAL');
    expect(mapTipoDeuda('OTROS')).toBe('OTRO');
    expect(mapTipoDeuda('HIPOTECA')).toBe('HIPOTECA');
  });

  test('normalizeDeudaInput acepta montoTotal/montoPagado', () => {
    const data = normalizeDeudaInput({
      nombre: 'Prestamo',
      tipo: 'PRESTAMO',
      montoTotal: 1000,
      montoPagado: 200,
      fechaInicio: '2026-01-01',
      acreedor: 'Banco',
    });

    expect(data.tipo).toBe('PRESTAMO_PERSONAL');
    expect(data.montoInicial).toBe(1000);
    expect(data.montoActual).toBe(800);
  });

  test('toDeudaDto expone montoTotal y montoPagado', () => {
    const dto = toDeudaDto({
      id: 1,
      montoInicial: 500,
      montoActual: 150,
      nombre: 'X',
    });

    expect(dto.montoTotal).toBe(500);
    expect(dto.montoPagado).toBe(350);
  });
});
