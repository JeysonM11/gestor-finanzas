/**
 * Catálogo canónico de categorías predefinidas (alineado con frontend).
 * tipo: INGRESO | GASTO | AMBOS (AMBOS solo en predefinidas; personalizadas usan INGRESO|GASTO).
 */
const CATEGORIAS_PREDEFINIDAS = [
  { nombre: 'Alimentación', tipo: 'GASTO' },
  { nombre: 'Transporte', tipo: 'GASTO' },
  { nombre: 'Vivienda', tipo: 'GASTO' },
  { nombre: 'Entretenimiento', tipo: 'GASTO' },
  { nombre: 'Salud', tipo: 'GASTO' },
  { nombre: 'Educación', tipo: 'GASTO' },
  { nombre: 'Servicios', tipo: 'GASTO' },
  { nombre: 'Compras', tipo: 'GASTO' },
  { nombre: 'Viajes', tipo: 'GASTO' },
  { nombre: 'Hogar', tipo: 'GASTO' },
  { nombre: 'Salario', tipo: 'INGRESO' },
  { nombre: 'Freelance', tipo: 'INGRESO' },
  { nombre: 'Inversiones', tipo: 'INGRESO' },
  { nombre: 'Otros', tipo: 'AMBOS' },
];

const TIPOS_CATEGORIA_PERSONALIZADA = ['INGRESO', 'GASTO'];

/**
 * Une personalizadas activas, uso en transacciones y predefinidas.
 * Las personalizadas conservan id/tipo aunque también existan en transacciones.
 */
function buildCatalogoCategorias({ personalizadas = [], usoTransacciones = [] } = {}) {
  const byNombre = new Map();

  for (const p of personalizadas) {
    byNombre.set(p.nombre, {
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      color: p.color,
      icono: p.icono,
      descripcion: p.descripcion ?? null,
      count: 0,
      total: 0,
      origen: 'personalizada',
    });
  }

  for (const u of usoTransacciones) {
    if (!u.categoria) continue;
    const existente = byNombre.get(u.categoria);
    const count = u._count?.categoria ?? u.count ?? 0;
    const total = u._sum?.monto ?? u.total ?? 0;
    if (existente) {
      existente.count = count;
      existente.total = total;
    } else {
      byNombre.set(u.categoria, {
        nombre: u.categoria,
        count,
        total,
        origen: 'transaccion',
      });
    }
  }

  for (const pred of CATEGORIAS_PREDEFINIDAS) {
    if (byNombre.has(pred.nombre)) continue;
    byNombre.set(pred.nombre, {
      nombre: pred.nombre,
      tipo: pred.tipo,
      count: 0,
      total: 0,
      origen: 'predefinida',
    });
  }

  return Array.from(byNombre.values());
}

function categoriasParaTipo(catalogo, tipo) {
  if (!tipo) return catalogo;
  return catalogo.filter(
    (c) => !c.tipo || c.tipo === tipo || c.tipo === 'AMBOS'
  );
}

module.exports = {
  CATEGORIAS_PREDEFINIDAS,
  TIPOS_CATEGORIA_PERSONALIZADA,
  buildCatalogoCategorias,
  categoriasParaTipo,
};
