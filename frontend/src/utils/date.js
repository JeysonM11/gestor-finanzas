/**
 * Fechas de calendario sin desfase por zona horaria.
 *
 * Las fechas llegan del API como ISO en UTC (p. ej. 2026-01-15T12:00:00.000Z).
 * Formatear en hora local haría que en America/Bogota se muestre el día anterior.
 * Siempre usamos los componentes UTC / el prefijo YYYY-MM-DD del ISO.
 */

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})/

/**
 * @param {string|Date|number|null|undefined} value
 * @returns {{ y: string, m: string, d: string } | null}
 */
function calendarParts(value) {
  if (value == null || value === '') return null

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return {
      y: String(value.getUTCFullYear()),
      m: String(value.getUTCMonth() + 1).padStart(2, '0'),
      d: String(value.getUTCDate()).padStart(2, '0'),
    }
  }

  const str = String(value).trim()
  const match = str.match(DATE_ONLY_RE)
  if (match) {
    return { y: match[1], m: match[2], d: match[3] }
  }

  const parsed = new Date(str)
  if (Number.isNaN(parsed.getTime())) return null
  return {
    y: String(parsed.getUTCFullYear()),
    m: String(parsed.getUTCMonth() + 1).padStart(2, '0'),
    d: String(parsed.getUTCDate()).padStart(2, '0'),
  }
}

/**
 * Formato de visualización DD/MM/YYYY según el día de calendario guardado.
 * @param {string|Date|number|null|undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  const parts = calendarParts(value)
  if (!parts) return ''
  return `${parts.d}/${parts.m}/${parts.y}`
}

/**
 * Valor para <input type="date"> (YYYY-MM-DD).
 * @param {string|Date|number|null|undefined} value
 * @returns {string}
 */
export function toDateInputValue(value) {
  const parts = calendarParts(value)
  if (!parts) return ''
  return `${parts.y}-${parts.m}-${parts.d}`
}

/**
 * Hoy en calendario local del usuario (para defaults de formularios).
 * @returns {string} YYYY-MM-DD
 */
export function todayDateInput() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
