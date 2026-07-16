export const CATEGORIAS_DEFAULT = [
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
]

export const METODOS_PAGO = [
  'EFECTIVO',
  'TARJETA_DEBITO',
  'TARJETA_CREDITO',
  'TRANSFERENCIA',
  'CHEQUE',
  'CRYPTO',
  'OTRO',
]

/** @param {string} tipo
 *  @param {Array<{nombre: string, tipo?: string}>} [lista]
 */
export function categoriasParaTipo(tipo, lista = CATEGORIAS_DEFAULT) {
  return lista.filter(
    (c) => !c.tipo || c.tipo === tipo || c.tipo === 'AMBOS'
  )
}
