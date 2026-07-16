const FRECUENCIAS_RECORDATORIO = ['DIARIA', 'SEMANAL', 'MENSUAL'];
const TIPOS_RECORDATORIO = [
  'PAGO',
  'META',
  'PRESUPUESTO',
  'INVERSION',
  'DEUDA',
  'GENERAL',
];

/**
 * Calcula la siguiente fecha de recordatorio según frecuencia.
 * @param {string} frecuencia
 * @param {Date} fechaBase
 * @returns {Date}
 */
function avanzarFechaRecordatorio(frecuencia, fechaBase) {
  const fecha = new Date(fechaBase);

  switch (frecuencia) {
    case 'DIARIA':
      fecha.setUTCDate(fecha.getUTCDate() + 1);
      break;
    case 'SEMANAL':
      fecha.setUTCDate(fecha.getUTCDate() + 7);
      break;
    case 'MENSUAL': {
      const dia = fecha.getUTCDate();
      fecha.setUTCMonth(fecha.getUTCMonth() + 1);
      // Ajuste fin de mes (p.ej. 31 ene → feb)
      if (fecha.getUTCDate() < dia) {
        fecha.setUTCDate(0);
      }
      break;
    }
    default:
      fecha.setUTCDate(fecha.getUTCDate() + 1);
  }

  return fecha;
}

module.exports = {
  FRECUENCIAS_RECORDATORIO,
  TIPOS_RECORDATORIO,
  avanzarFechaRecordatorio,
};
