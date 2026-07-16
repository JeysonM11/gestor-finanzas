const prisma = require('../lib/prisma');
const { construirSnapshot } = require('../services/asesor-snapshot.service');
const { proyectarPlan } = require('../services/asesor-deudas.service');
const {
  asesorDisponible,
  generarConsejo,
  consejoFallback,
} = require('../services/gemini.service');
const { respuestaIASchema } = require('../validators/asesor.validator');
const { logger } = require('../utils/logger');

const DISCLAIMER =
  'Orientación educativa generada automáticamente; no constituye asesoría financiera profesional.';

const toPlanDto = (plan) => ({
  id: plan.id,
  estrategia: plan.estrategia,
  resumen: plan.resumen,
  generadoPorIA: plan.generadoPorIA,
  snapshot: plan.snapshotJson,
  plan: plan.planJson,
  createdAt: plan.createdAt,
  disclaimer: DISCLAIMER,
});

/**
 * POST /api/finanzas/asesor/generar
 * Genera diagnóstico + plan de pagos y lo persiste en el historial.
 */
exports.generarPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { estrategia, presupuestoExtra } = req.body;

    const { snapshot, deudasInternas } = await construirSnapshot(userId);

    if (deudasInternas.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'No tienes deudas activas registradas; agrega una deuda para generar un plan.',
        code: 'SIN_DEUDAS',
      });
    }

    const extra =
      presupuestoExtra != null
        ? Number(presupuestoExtra)
        : snapshot.capacidadExtraEstimada;
    const presupuestoMensual = snapshot.totales.pagoMinimoTotal + extra;

    const planNumerico = proyectarPlan(
      deudasInternas.map((d) => ({
        deudaId: d.deudaId,
        ref: d.ref,
        nombre: d.nombre,
        saldo: d.saldo,
        tasaMensual: d.tasaMensual,
        pagoMinimo: d.pagoMinimo,
      })),
      presupuestoMensual,
      estrategia
    );

    let consejo = null;
    let generadoPorIA = false;

    if (asesorDisponible()) {
      try {
        // A la IA solo van agregados anonimizados: snapshot sin nombres y
        // plan con refs D1..Dn (sin deudaId/nombre).
        const planAnonimo = {
          ...planNumerico,
          orden: planNumerico.orden.map(({ deudaId, nombre, ...d }) => d),
        };
        const bruto = await generarConsejo(snapshot, planAnonimo);
        const { error, value } = respuestaIASchema.validate(bruto, {
          stripUnknown: true,
        });
        if (error) {
          logger.warn('Respuesta de IA fuera de contrato; usando fallback', {
            error: error.message,
          });
        } else {
          consejo = value;
          generadoPorIA = true;
        }
      } catch {
        // Ya logueado en gemini.service; seguimos con fallback.
      }
    }

    if (!consejo) {
      consejo = consejoFallback(snapshot, planNumerico);
    }

    const planJson = {
      ...consejo,
      pagos: planNumerico,
      presupuestoExtraUsado: extra,
    };

    const resumen = `${planNumerico.estrategia} · ${snapshot.totales.cantidadDeudas} deuda(s) · ${
      planNumerico.totalMeses != null
        ? `${planNumerico.totalMeses} meses estimados`
        : 'sin proyección completa'
    } · riesgo ${consejo.diagnostico.nivelRiesgo}`;

    const guardado = await prisma.asesorPlan.create({
      data: {
        estrategia: planNumerico.estrategia,
        resumen,
        snapshotJson: snapshot,
        planJson,
        generadoPorIA,
        userId,
      },
    });

    res.status(201).json({
      message: generadoPorIA
        ? 'Plan generado con IA'
        : 'Plan generado sin IA (proveedor no disponible); diagnóstico basado en reglas.',
      plan: toPlanDto(guardado),
    });
  } catch (error) {
    console.error('Error al generar plan del asesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/** GET /api/finanzas/asesor/planes — historial del usuario. */
exports.listarPlanes = async (req, res) => {
  try {
    const planes = await prisma.asesorPlan.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        estrategia: true,
        resumen: true,
        generadoPorIA: true,
        createdAt: true,
      },
    });
    res.status(200).json({ planes });
  } catch (error) {
    console.error('Error al listar planes del asesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/** GET /api/finanzas/asesor/planes/:id — detalle con ownership. */
exports.obtenerPlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const plan = await prisma.asesorPlan.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!plan) {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }
    res.status(200).json({ plan: toPlanDto(plan) });
  } catch (error) {
    console.error('Error al obtener plan del asesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/** GET /api/finanzas/asesor/ultimo — último plan (atajo UI). */
exports.ultimoPlan = async (req, res) => {
  try {
    const plan = await prisma.asesorPlan.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({
      plan: plan ? toPlanDto(plan) : null,
      iaDisponible: asesorDisponible(),
    });
  } catch (error) {
    console.error('Error al obtener último plan del asesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
