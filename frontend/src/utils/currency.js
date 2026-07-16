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

/** Fallback documentado cuando falta o es inválida la preferencia. */
export const MONEDA_DEFAULT = 'USD'

const CODIGOS_SOPORTADOS = new Set(MONEDAS.map((m) => m.code))

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
 * Normaliza un código ISO de moneda.
 * Códigos vacíos o no soportados → MONEDA_DEFAULT (USD).
 * @param {string|null|undefined} currency
 * @returns {string}
 */
export function resolveCurrencyCode(currency) {
  if (currency == null || currency === '') return MONEDA_DEFAULT
  const code = String(currency).trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) return MONEDA_DEFAULT
  // Preferir lista de la app; códigos ISO válidos fuera de la lista se intentan con Intl
  if (CODIGOS_SOPORTADOS.has(code)) return code
  // ISO-like pero no en catálogo: aún intentar Intl; si falla, formatMoney usará fallback
  return code
}

/**
 * Formatea un monto según el código ISO de moneda.
 * Usa currencyDisplay: 'code' para no confundir monedas con el mismo símbolo "$".
 * @param {number|string|null|undefined} amount
 * @param {string} [currency=MONEDA_DEFAULT]
 * @param {{ signed?: boolean, maximumFractionDigits?: number, minimumFractionDigits?: number }} [options]
 */
export function formatMoney(amount, currency = MONEDA_DEFAULT, options = {}) {
  const code = resolveCurrencyCode(currency)
  const locale = LOCALE_BY_CURRENCY[code] || 'en-US'
  const value = Number(amount)
  const safe = Number.isFinite(value) ? value : 0

  const formatOptions = {
    style: 'currency',
    currency: code,
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
    // Código inválido para Intl → fallback USD documentado
    if (code !== MONEDA_DEFAULT) {
      return formatMoney(safe, MONEDA_DEFAULT, options)
    }
    const fallback = safe.toFixed(2)
    if (!options.signed) return `${MONEDA_DEFAULT} ${fallback}`
    if (safe > 0) return `+${MONEDA_DEFAULT} ${fallback}`
    if (safe < 0) return `-${MONEDA_DEFAULT} ${Math.abs(safe).toFixed(2)}`
    return `${MONEDA_DEFAULT} ${fallback}`
  }
}
