import dayjs from 'dayjs'

export const formatCurrency = (amount, currency = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(Number(amount) || 0)
}

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  return dayjs(date).format(format)
}

export const getMonthName = (monthNumber) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return months[monthNumber - 1]
}

/** Une clases CSS, omitiendo valores falsy (reemplazo ligero de clsx). */
export const cn = (...classes) => classes.filter(Boolean).join(' ')
