const {
  mapTipoCuenta,
  mapTipoDeuda,
  mapTipoInversion,
  normalizeDeudaInput,
  normalizeInversionInput,
  toDeudaDto,
  toInversionDto,
  toNotificacionDto,
} = require('../utils/mappers');

describe('mappers Sprint 1-2', () => {
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

  test('mapTipoInversion y normalizeInversionInput', () => {
    expect(mapTipoInversion('FONDOS')).toBe('FONDOS_MUTUOS');
    expect(mapTipoInversion('OTROS')).toBe('OTRO');

    const data = normalizeInversionInput({
      nombre: 'AAPL',
      tipo: 'FONDOS',
      montoInicial: 1000,
      montoActual: 1200,
      cantidadUnidades: 10,
      fechaCompra: '2026-01-01',
    });

    expect(data.tipo).toBe('FONDOS_MUTUOS');
    expect(data.montoInvertido).toBe(1000);
    expect(data.valorActual).toBe(1200);
    expect(data.cantidad).toBe(10);
  });

  test('toInversionDto y toNotificacionDto exponen aliases', () => {
    const inv = toInversionDto({
      id: 1,
      montoInvertido: 100,
      valorActual: 110,
      cantidad: 2,
    });
    expect(inv.montoInicial).toBe(100);
    expect(inv.montoActual).toBe(110);
    expect(inv.cantidadUnidades).toBe(2);

    const notif = toNotificacionDto({
      id: 1,
      fechaEnvio: '2026-01-01T00:00:00.000Z',
      titulo: 'Hola',
    });
    expect(notif.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
