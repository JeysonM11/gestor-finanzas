export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  return dayjs(date).format(format)
}

export const getMonthName = (monthNumber) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return months[monthNumber - 1]
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
