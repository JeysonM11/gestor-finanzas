/**
 * @jest-environment node
 */
const {
  calendarParts,
  parseDateOnly,
  startOfDayUTC,
  endOfDayUTC,
  mesAnioUTC,
} = require('../utils/date');

describe('date utils (fechas de calendario)', () => {
  test('parseDateOnly normaliza YYYY-MM-DD a mediodía UTC', () => {
    const d = parseDateOnly('2026-01-15');
    expect(d.toISOString()).toBe('2026-01-15T12:00:00.000Z');
  });

  test('parseDateOnly conserva el día de calendario con Date de Joi (medianoche UTC)', () => {
    const fromJoi = new Date('2026-01-15T00:00:00.000Z');
    const d = parseDateOnly(fromJoi);
    expect(d.toISOString()).toBe('2026-01-15T12:00:00.000Z');
  });

  test('mediodía UTC evita cruce de medianoche en zonas UTC- West', () => {
    const midnight = new Date('2026-01-15T00:00:00.000Z');
    const noon = parseDateOnly('2026-01-15');
    // Offset típico Bogotá (-5h): medianoche UTC cae el día 14 local; mediodía no.
    expect(midnight.getTime() - 5 * 60 * 60 * 1000).toBeLessThan(
      Date.UTC(2026, 0, 15, 0, 0, 0, 0)
    );
    expect(noon.getUTCHours()).toBe(12);
    expect(noon.getUTCDate()).toBe(15);
  });

  test('startOfDayUTC y endOfDayUTC cubren el día completo', () => {
    expect(startOfDayUTC('2026-01-15').toISOString()).toBe('2026-01-15T00:00:00.000Z');
    expect(endOfDayUTC('2026-01-15').toISOString()).toBe('2026-01-15T23:59:59.999Z');
  });

  test('calendarParts lee prefijo ISO', () => {
    expect(calendarParts('2026-01-15T00:00:00.000Z')).toEqual({ y: 2026, m: 1, d: 15 });
  });

  test('mesAnioUTC usa componentes UTC', () => {
    // Medianoche UTC del 1 de febrero sería 31 ene en Bogotá si se usara hora local
    const edge = new Date('2026-02-01T00:00:00.000Z');
    expect(mesAnioUTC(edge)).toEqual({ mes: 2, anio: 2026 });
  });

  test('parseDateOnly con null/invalid devuelve null', () => {
    expect(parseDateOnly(null)).toBeNull();
    expect(parseDateOnly('')).toBeNull();
    expect(parseDateOnly('no-es-fecha')).toBeNull();
  });
});
