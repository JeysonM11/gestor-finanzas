const {
  CATEGORIAS_PREDEFINIDAS,
  buildCatalogoCategorias,
  categoriasParaTipo,
} = require('../utils/categorias');
const {
  createCategoriaSchema,
  updateCategoriaSchema,
} = require('../validators/categoria.validator');

describe('categorias Sprint A', () => {
  test('predefinidas incluyen gastos e ingresos con acentos', () => {
    const nombres = CATEGORIAS_PREDEFINIDAS.map((c) => c.nombre);
    expect(nombres).toContain('Alimentación');
    expect(nombres).toContain('Salario');
    expect(nombres).not.toContain('Alimentacion');
  });

  test('buildCatalogoCategorias prioriza personalizada y suma uso', () => {
    const catalogo = buildCatalogoCategorias({
      personalizadas: [
        {
          id: 7,
          nombre: 'Mascotas',
          tipo: 'GASTO',
          color: '#111',
          icono: null,
        },
      ],
      usoTransacciones: [
        {
          categoria: 'Mascotas',
          _count: { categoria: 3 },
          _sum: { monto: 150 },
        },
        {
          categoria: 'Huérfana',
          _count: { categoria: 1 },
          _sum: { monto: 20 },
        },
      ],
    });

    const mascotas = catalogo.find((c) => c.nombre === 'Mascotas');
    expect(mascotas).toMatchObject({
      id: 7,
      origen: 'personalizada',
      tipo: 'GASTO',
      count: 3,
      total: 150,
    });

    const huerfana = catalogo.find((c) => c.nombre === 'Huérfana');
    expect(huerfana).toMatchObject({ origen: 'transaccion', count: 1 });

    const alimentacion = catalogo.find((c) => c.nombre === 'Alimentación');
    expect(alimentacion).toMatchObject({ origen: 'predefinida', tipo: 'GASTO' });
  });

  test('categoriasParaTipo filtra INGRESO/GASTO/AMBOS', () => {
    const catalogo = buildCatalogoCategorias({ personalizadas: [], usoTransacciones: [] });
    const gastos = categoriasParaTipo(catalogo, 'GASTO');
    const ingresos = categoriasParaTipo(catalogo, 'INGRESO');

    expect(gastos.every((c) => c.tipo === 'GASTO' || c.tipo === 'AMBOS')).toBe(true);
    expect(ingresos.every((c) => c.tipo === 'INGRESO' || c.tipo === 'AMBOS')).toBe(true);
    expect(gastos.some((c) => c.nombre === 'Otros')).toBe(true);
    expect(ingresos.some((c) => c.nombre === 'Otros')).toBe(true);
  });

  test('createCategoriaSchema exige nombre y tipo INGRESO|GASTO', () => {
    const ok = createCategoriaSchema.validate({
      nombre: 'Gym',
      tipo: 'GASTO',
    });
    expect(ok.error).toBeUndefined();

    const badTipo = createCategoriaSchema.validate({
      nombre: 'X',
      tipo: 'TRANSFERENCIA',
    });
    expect(badTipo.error).toBeDefined();

    const missing = createCategoriaSchema.validate({ tipo: 'GASTO' });
    expect(missing.error).toBeDefined();
  });

  test('updateCategoriaSchema requiere al menos un campo', () => {
    const empty = updateCategoriaSchema.validate({});
    expect(empty.error).toBeDefined();

    const ok = updateCategoriaSchema.validate({ activa: false });
    expect(ok.error).toBeUndefined();
  });
});
