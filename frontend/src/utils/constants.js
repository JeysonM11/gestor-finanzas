export const CATEGORIAS_DEFAULT = [
  { nombre: 'Alimentación', tipo: 'GASTO' },
  { nombre: 'Transporte', tipo: 'GASTO' },
  { nombre: 'Vivienda', tipo: 'GASTO' },
  { nombre: 'Entretenimiento', tipo: 'GASTO' },
  { nombre: 'Salud', tipo: 'GASTO' },
  { nombre: 'Educación', tipo: 'GASTO' },
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

export function categoriasParaTipo(tipo) {
  return CATEGORIAS_DEFAULT.filter(
    (c) => c.tipo === tipo || c.tipo === 'AMBOS'
  )
}
