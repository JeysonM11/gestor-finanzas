export const TIPOS_TRANSACCION = {
  INGRESO: 'INGRESO',
  GASTO: 'GASTO'
}

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
  { nombre: 'Otros', tipo: 'AMBOS' }
]

export const PERIODOS = {
  MENSUAL: 'MENSUAL',
  TRIMESTRAL: 'TRIMESTRAL',
  ANUAL: 'ANUAL'
}
