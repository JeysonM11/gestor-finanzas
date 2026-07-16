/**
 * Utilidades para fechas de calendario (solo día, sin hora de evento).
 *
 * Problema: `new Date('YYYY-MM-DD')` es medianoche UTC. En zonas detrás de UTC
 * (p. ej. America/Bogota) al formatear en hora local el día baja uno.
 *
 * Convención: fechas de calendario se normalizan a mediodía UTC del día elegido.
 */

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Extrae año/mes/día de calendario desde string YYYY-MM-DD, Date o ISO.
 * @param {string|Date|number|null|undefined} value
 * @returns {{ y: number, m: number, d: number } | null}
 */
function calendarParts(value) {
  if (value == null || value === '') return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return {
      y: value.getUTCFullYear(),
      m: value.getUTCMonth() + 1,
      d: value.getUTCDate(),
    };
  }

  const str = String(value).trim();
  const match = str.match(DATE_ONLY_RE);
  if (match) {
    return {
      y: Number(match[1]),
      m: Number(match[2]),
      d: Number(match[3]),
    };
  }

  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    y: parsed.getUTCFullYear(),
    m: parsed.getUTCMonth() + 1,
    d: parsed.getUTCDate(),
  };
}

/**
 * Parsea una fecha de calendario a Date en mediodía UTC.
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null}
 */
function parseDateOnly(value) {
  const parts = calendarParts(value);
  if (!parts) return null;
  return new Date(Date.UTC(parts.y, parts.m - 1, parts.d, 12, 0, 0, 0));
}

/**
 * Inicio del día (00:00:00.000 UTC) para filtros inclusive.
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null}
 */
function startOfDayUTC(value) {
  const parts = calendarParts(value);
  if (!parts) return null;
  return new Date(Date.UTC(parts.y, parts.m - 1, parts.d, 0, 0, 0, 0));
}

/**
 * Fin del día (23:59:59.999 UTC) para filtros inclusive.
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null}
 */
function endOfDayUTC(value) {
  const parts = calendarParts(value);
  if (!parts) return null;
  return new Date(Date.UTC(parts.y, parts.m - 1, parts.d, 23, 59, 59, 999));
}

/**
 * Mes/año UTC a partir de una fecha (para presupuestos por mes).
 * @param {string|Date|number|null|undefined} fecha
 * @returns {{ mes: number, anio: number }}
 */
function mesAnioUTC(fecha) {
  const d = fecha ? new Date(fecha) : new Date();
  return { mes: d.getUTCMonth() + 1, anio: d.getUTCFullYear() };
}

module.exports = {
  calendarParts,
  parseDateOnly,
  startOfDayUTC,
  endOfDayUTC,
  mesAnioUTC,
};
