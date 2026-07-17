const { buildWhere } = require('../utils/transaccion-filtros');

describe('transaccion filtros v1.4', () => {
  test('aplica montoMin y montoMax', () => {
    const where = buildWhere(1, { montoMin: 10, montoMax: 100 });
    expect(where.monto).toEqual({ gte: 10, lte: 100 });
  });

  test('aplica solo montoMin', () => {
    const where = buildWhere(1, { montoMin: '5' });
    expect(where.monto).toEqual({ gte: 5 });
  });

  test('ignora montos vacíos', () => {
    const where = buildWhere(1, { montoMin: '', montoMax: '' });
    expect(where.monto).toBeUndefined();
  });

  test('ignora montos no numéricos', () => {
    const where = buildWhere(1, { montoMin: 'abc', montoMax: 'xyz' });
    expect(where.monto).toBeUndefined();
  });

  test('incluye userId y tipo', () => {
    const where = buildWhere(9, { tipo: 'GASTO' });
    expect(where).toMatchObject({ userId: 9, tipo: 'GASTO' });
  });

  test('aplica rango de fechas UTC', () => {
    const where = buildWhere(1, {
      fechaInicio: '2026-01-01',
      fechaFin: '2026-01-31',
    });
    expect(where.fecha.gte).toBeInstanceOf(Date);
    expect(where.fecha.lte).toBeInstanceOf(Date);
    expect(where.fecha.gte.toISOString()).toContain('2026-01-01');
    expect(where.fecha.lte.toISOString()).toContain('2026-01-31');
  });

  test('aplica búsqueda en descripción y notas', () => {
    const where = buildWhere(1, { search: 'comida' });
    expect(where.OR).toHaveLength(2);
    expect(where.OR[0].descripcion.contains).toBe('comida');
  });

  test('aplica categoría', () => {
    const where = buildWhere(1, { categoria: 'Ahorro' });
    expect(where.categoria).toBe('Ahorro');
  });
});
