/** Monedas disponibles en la app (preferencia de usuario y cuentas). */
export const MONEDAS = [
  { code: 'USD', label: 'USD - Dólar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'MXN', label: 'MXN - Peso Mexicano' },
  { code: 'COP', label: 'COP - Peso Colombiano' },
  { code: 'ARS', label: 'ARS - Peso Argentino' },
  { code: 'PEN', label: 'PEN - Sol Peruano' },
  { code: 'CLP', label: 'CLP - Peso Chileno' },
  { code: 'BOB', label: 'BOB - Boliviano' },
]

export const MONEDA_DEFAULT = 'USD'

const LOCALE_BY_CURRENCY = {
  USD: 'en-US',
  EUR: 'es-ES',
  MXN: 'es-MX',
  COP: 'es-CO',
  ARS: 'es-AR',
  PEN: 'es-PE',
  CLP: 'es-CL',
  BOB: 'es-BO',
}

/**
 * Formatea un monto según el código ISO de moneda.
 * @param {number|string|null|undefined} amount
 * @param {string} [currency=MONEDA_DEFAULT]
 * @param {{ signed?: boolean, maximumFractionDigits?: number, minimumFractionDigits?: number }} [options]
 */
export function formatMoney(amount, currency = MONEDA_DEFAULT, options = {}) {
  const code = (currency || MONEDA_DEFAULT).toUpperCase()
  const locale = LOCALE_BY_CURRENCY[code] || 'en-US'
  const value = Number(amount)
  const safe = Number.isFinite(value) ? value : 0

  const formatOptions = {
    style: 'currency',
    currency: code,
    // Mostrar el código (COP, USD…) para que el cambio de preferencia sea evidente
    // y no se confundan monedas que comparten el símbolo "$".
    currencyDisplay: 'code',
    ...(options.minimumFractionDigits != null && {
      minimumFractionDigits: options.minimumFractionDigits,
    }),
    ...(options.maximumFractionDigits != null && {
      maximumFractionDigits: options.maximumFractionDigits,
    }),
  }

  try {
    const formatted = new Intl.NumberFormat(locale, formatOptions).format(
      options.signed ? Math.abs(safe) : safe
    )
    if (!options.signed) return formatted
    if (safe > 0) return `+${formatted}`
    if (safe < 0) return `-${formatted}`
    return formatted
  } catch {
    const fallback = safe.toFixed(2)
    if (!options.signed) return `${code} ${fallback}`
    if (safe > 0) return `+${code} ${fallback}`
    if (safe < 0) return `-${code} ${Math.abs(safe).toFixed(2)}`
    return `${code} ${fallback}`
  }
}
