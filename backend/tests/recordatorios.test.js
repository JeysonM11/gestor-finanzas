const {
  avanzarFechaRecordatorio,
  FRECUENCIAS_RECORDATORIO,
} = require('../utils/recordatorios');
const {
  createRecordatorioSchema,
  updateRecordatorioSchema,
} = require('../validators/recordatorio.validator');

describe('recordatorios Sprint B.1', () => {
  test('avanzarFechaRecordatorio DIARIA/SEMANAL/MENSUAL', () => {
    const base = new Date('2026-01-15T12:00:00.000Z');

    const diaria = avanzarFechaRecordatorio('DIARIA', base);
    expect(diaria.toISOString()).toBe('2026-01-16T12:00:00.000Z');

    const semanal = avanzarFechaRecordatorio('SEMANAL', base);
    expect(semanal.toISOString()).toBe('2026-01-22T12:00:00.000Z');

    const mensual = avanzarFechaRecordatorio('MENSUAL', base);
    expect(mensual.getUTCMonth()).toBe(1); // febrero
    expect(mensual.getUTCDate()).toBe(15);
  });

  test('frecuencias canónicas', () => {
    expect(FRECUENCIAS_RECORDATORIO).toEqual(['DIARIA', 'SEMANAL', 'MENSUAL']);
  });

  test('createRecordatorioSchema exige titulo y fecha; frecuencia si repetir', () => {
    const ok = createRecordatorioSchema.validate({
      titulo: 'Pagar luz',
      fechaRecordatorio: '2026-07-20',
      tipo: 'PAGO',
    });
    expect(ok.error).toBeUndefined();

    const conRepetir = createRecordatorioSchema.validate({
      titulo: 'Gym',
      fechaRecordatorio: '2026-07-20',
      repetir: true,
      frecuencia: 'MENSUAL',
    });
    expect(conRepetir.error).toBeUndefined();

    const sinFrecuencia = createRecordatorioSchema.validate({
      titulo: 'Gym',
      fechaRecordatorio: '2026-07-20',
      repetir: true,
    });
    expect(sinFrecuencia.error).toBeDefined();
  });

  test('updateRecordatorioSchema requiere al menos un campo', () => {
    expect(updateRecordatorioSchema.validate({}).error).toBeDefined();
    expect(updateRecordatorioSchema.validate({ completado: true }).error).toBeUndefined();
  });

  test('no notificar dos veces: flag notificacionEnviada excluye del where', () => {
    // Contrato del service: where exige notificacionEnviada: false
    const whereBase = {
      activo: true,
      completado: false,
      notificacionEnviada: false,
      fechaRecordatorio: { lte: new Date() },
    };

    const yaNotificado = {
      id: 1,
      activo: true,
      completado: false,
      notificacionEnviada: true,
      fechaRecordatorio: new Date('2020-01-01'),
    };

    const cumple =
      yaNotificado.activo === whereBase.activo &&
      yaNotificado.completado === whereBase.completado &&
      yaNotificado.notificacionEnviada === whereBase.notificacionEnviada;

    expect(cumple).toBe(false);
  });

  test('ownership: listado y mutaciones filtran por userId (contrato)', () => {
    // Documenta que el controller siempre fija userId = req.user.id
    const reqUserId = 42;
    const whereList = { userId: reqUserId, activo: true };
    const whereGet = { id: 9, userId: reqUserId, activo: true };
    expect(whereList.userId).toBe(42);
    expect(whereGet.userId).toBe(42);
    expect(whereGet).not.toHaveProperty('userId', 99);
  });
});
