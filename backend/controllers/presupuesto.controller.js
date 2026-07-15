const prisma = require('../lib/prisma');
const { catchAsync } = require('../middlewares/error.middleware');
const { NotFoundError, ValidationError } = require('../utils/errors');
const {
  mesAnioDeFecha,
  sincronizarPresupuesto,
  sincronizarTodos,
  toPresupuestoDto,
} = require('../utils/presupuesto');

function resolverMesAnio(body = {}) {
  const ahora = mesAnioDeFecha();
  const mes = body.mes != null ? Number(body.mes) : ahora.mes;
  const anio =
    body.anio != null
      ? Number(body.anio)
      : body.año != null
        ? Number(body.año)
        : ahora.anio;
  return { mes, anio };
}

exports.obtenerPresupuestos = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { mes, anio, año, activo } = req.query;
  const ref = mesAnioDeFecha();

  const where = {
    userId,
    mes: mes != null ? Number(mes) : ref.mes,
    año: anio != null ? Number(anio) : año != null ? Number(año) : ref.anio,
  };
  if (activo === 'true') where.activo = true;
  if (activo === 'false') where.activo = false;

  const presupuestos = await prisma.presupuesto.findMany({
    where,
    orderBy: { categoria: 'asc' },
  });

  const dtos = presupuestos.map(toPresupuestoDto);
  const resumen = {
    mes: where.mes,
    anio: where.año,
    totalLimite: dtos.reduce((s, p) => s + p.limite, 0),
    totalGastado: dtos.reduce((s, p) => s + p.gastado, 0),
    excedidos: dtos.filter((p) => p.excedido).length,
    cantidad: dtos.length,
  };

  res.status(200).json({
    success: true,
    presupuestos: dtos,
    resumen,
  });
});

exports.crearPresupuesto = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { categoria, limite, alertaEn, activo } = req.body;
  const { mes, anio } = resolverMesAnio(req.body);

  if (!categoria || limite == null) {
    throw new ValidationError('categoria y limite son obligatorios');
  }
  if (mes < 1 || mes > 12) {
    throw new ValidationError('mes debe estar entre 1 y 12');
  }

  const creado = await prisma.presupuesto.create({
    data: {
      categoria,
      limite: Number(limite),
      mes,
      año: anio,
      alertaEn: alertaEn != null ? Number(alertaEn) : 80,
      activo: activo !== undefined ? Boolean(activo) : true,
      userId,
    },
  });

  const sincronizado = await sincronizarPresupuesto(
    userId,
    categoria,
    mes,
    anio
  );

  res.status(201).json({
    success: true,
    message: 'Presupuesto creado exitosamente',
    presupuesto: toPresupuestoDto(sincronizado || creado),
  });
});

exports.actualizarPresupuesto = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existente = await prisma.presupuesto.findFirst({
    where: { id: parseInt(id), userId },
  });
  if (!existente) throw new NotFoundError('Presupuesto');

  const { categoria, limite, alertaEn, activo, mes, anio, año } = req.body;
  const updateData = {};
  if (categoria != null) updateData.categoria = categoria;
  if (limite != null) updateData.limite = Number(limite);
  if (alertaEn !== undefined) {
    updateData.alertaEn = alertaEn != null ? Number(alertaEn) : null;
    updateData.notificacionEnviada = false;
  }
  if (activo !== undefined) updateData.activo = Boolean(activo);
  if (mes != null) updateData.mes = Number(mes);
  if (anio != null || año != null) {
    updateData.año = Number(anio != null ? anio : año);
  }

  await prisma.presupuesto.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  const sincronizado = await sincronizarPresupuesto(
    userId,
    updateData.categoria || existente.categoria,
    updateData.mes || existente.mes,
    updateData.año || existente.año
  );

  res.json({
    success: true,
    message: 'Presupuesto actualizado',
    presupuesto: toPresupuestoDto(sincronizado),
  });
});

exports.eliminarPresupuesto = catchAsync(async (req, res) => {
  const resultado = await prisma.presupuesto.deleteMany({
    where: { id: parseInt(req.params.id), userId: req.user.id },
  });
  if (resultado.count === 0) throw new NotFoundError('Presupuesto');
  res.json({ success: true, message: 'Presupuesto eliminado exitosamente' });
});

exports.sincronizarPresupuestos = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { mes, anio, año } = { ...req.query, ...req.body };
  const ref = mesAnioDeFecha();

  const resultados = await sincronizarTodos(
    userId,
    mes != null ? Number(mes) : ref.mes,
    anio != null ? Number(anio) : año != null ? Number(año) : ref.anio
  );

  res.json({
    success: true,
    message: `Sincronizados ${resultados.length} presupuestos`,
    presupuestos: resultados.map(toPresupuestoDto),
  });
});
