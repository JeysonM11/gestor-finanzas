const { toPresupuestoDto, mesAnioDeFecha } = require('../utils/presupuesto');

describe('presupuesto utils Sprint 5', () => {
  test('mesAnioDeFecha extrae mes y año', () => {
    const { mes, anio } = mesAnioDeFecha(new Date('2026-07-15T12:00:00'));
    expect(mes).toBe(7);
    expect(anio).toBe(2026);
  });

  test('toPresupuestoDto calcula porcentaje y restante', () => {
    const dto = toPresupuestoDto({
      id: 1,
      categoria: 'Alimentación',
      limite: 1000,
      gastado: 250,
      mes: 7,
      año: 2026,
      alertaEn: 80,
    });
    expect(dto.anio).toBe(2026);
    expect(dto.porcentajeUsado).toBe(25);
    expect(dto.restante).toBe(750);
    expect(dto.excedido).toBe(false);
  });

  test('toPresupuestoDto marca excedido', () => {
    const dto = toPresupuestoDto({
      limite: 100,
      gastado: 150,
      año: 2026,
    });
    expect(dto.excedido).toBe(true);
    expect(dto.porcentajeUsado).toBe(100);
    expect(dto.restante).toBe(0);
  });
});
