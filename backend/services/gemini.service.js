/**
 * Cliente Gemini para el Asesor IA (v1.3).
 *
 * - Salida JSON estructurada (responseMimeType + responseJsonSchema).
 * - El modelo NO calcula cifras: recibe snapshot agregado anonimizado +
 *   plan numérico del motor local, y solo redacta diagnóstico/tips.
 * - Sin GEMINI_API_KEY => asesorDisponible() = false y el controller usa
 *   el fallback de plantilla (nunca éxito simulado de IA).
 */

const { logger } = require('../utils/logger');

// Alias estable de Google: apunta al modelo flash vigente. Los modelos con
// versión fija (p. ej. gemini-2.5-flash) dejan de estar disponibles para
// cuentas nuevas y devuelven 404.
const DEFAULT_MODEL = 'gemini-flash-latest';
const DEFAULT_TIMEOUT_MS = 20000;

function asesorDisponible() {
  return Boolean(process.env.GEMINI_API_KEY);
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    diagnostico: {
      type: 'object',
      properties: {
        nivelRiesgo: { type: 'string', enum: ['BAJO', 'MEDIO', 'ALTO'] },
        resumen: { type: 'string' },
        alertas: { type: 'array', items: { type: 'string' } },
      },
      required: ['nivelRiesgo', 'resumen', 'alertas'],
    },
    tips: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          detalle: { type: 'string' },
          prioridad: { type: 'string', enum: ['ALTA', 'MEDIA', 'BAJA'] },
        },
        required: ['titulo', 'detalle', 'prioridad'],
      },
    },
    pasos: { type: 'array', items: { type: 'string' } },
    motivacion: { type: 'string' },
  },
  required: ['diagnostico', 'tips', 'pasos', 'motivacion'],
};

function construirPrompt(snapshot, plan) {
  return [
    'Eres un asesor financiero educativo en español. Analiza la situación de deudas de un usuario anónimo.',
    'REGLAS ESTRICTAS:',
    '- NO inventes ni recalcules cifras: usa exactamente las del snapshot y el plan.',
    '- Las deudas se identifican como D1, D2, ... (no inventes nombres).',
    `- Todos los montos están en ${snapshot.moneda}.`,
    '- Si flujoMensual.fuenteIngresos es ESPERADO, aclara que el ingreso es el presupuesto mensual esperado y no un promedio histórico confirmado.',
    '- Tono claro y motivador, sin prometer resultados garantizados.',
    '- Es orientación educativa, no asesoría financiera profesional.',
    '',
    'SNAPSHOT FINANCIERO (agregados, sin datos personales):',
    JSON.stringify(snapshot),
    '',
    'PLAN DE PAGOS CALCULADO LOCALMENTE (no lo modifiques):',
    JSON.stringify(plan),
    '',
    'Devuelve: diagnóstico (nivel de riesgo + resumen + alertas concretas), 3-6 tips accionables priorizados, pasos ordenados para el primer mes, y un mensaje breve de motivación.',
  ].join('\n');
}

/**
 * Genera diagnóstico y tips. Lanza error si el proveedor falla o excede el
 * timeout; el caller decide el fallback.
 */
async function generarConsejo(snapshot, plan) {
  if (!asesorDisponible()) {
    throw new Error('GEMINI_API_KEY no configurada');
  }

  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  const llamada = ai.models.generateContent({
    model,
    contents: construirPrompt(snapshot, plan),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: RESPONSE_SCHEMA,
      temperature: 0.4,
    },
  });

  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Gemini timeout tras ${timeoutMs}ms`)),
      timeoutMs
    );
  });

  try {
    const response = await Promise.race([llamada, timeout]);
    return JSON.parse(response.text);
  } catch (error) {
    // No loguear el prompt: contiene cifras del usuario.
    logger.warn('Fallo del proveedor de IA (asesor)', {
      model,
      error: error.message,
    });
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fallback sin IA: tips de plantilla basados en el snapshot/plan calculados.
 * Se marca generadoPorIA=false; la UI lo muestra como plan sin texto de IA.
 */
function consejoFallback(snapshot, plan) {
  const alertas = [];
  if (snapshot.totales.deudasVencidas > 0) {
    alertas.push(
      `Tienes ${snapshot.totales.deudasVencidas} deuda(s) vencida(s): priorízalas para evitar recargos.`
    );
  }
  if (snapshot.capacidadExtraEstimada <= 0) {
    alertas.push(
      'Tu flujo mensual estimado no deja margen extra; revisa gastos o ajusta la capacidad manualmente.'
    );
  }
  if (plan.advertencias?.length) {
    alertas.push(...plan.advertencias);
  }

  const nivelRiesgo =
    snapshot.totales.deudasVencidas > 0 ||
    snapshot.capacidadExtraEstimada <= 0
      ? 'ALTO'
      : snapshot.totales.deudaTotal > snapshot.flujoMensual.ingresos * 6
        ? 'MEDIO'
        : 'BAJO';

  return {
    diagnostico: {
      nivelRiesgo,
      resumen: `Deuda total de ${snapshot.totales.deudaTotal} ${snapshot.moneda} en ${snapshot.totales.cantidadDeudas} deuda(s). Plan ${plan.estrategia} con presupuesto mensual de ${plan.presupuestoMensual} ${snapshot.moneda}.`,
      alertas,
    },
    tips: [
      {
        titulo: 'Sigue el orden del plan',
        detalle:
          plan.estrategia === 'AVALANCHE'
            ? 'Ataca primero la deuda con mayor tasa: es la que más interés te cuesta cada mes.'
            : 'Liquida primero la deuda más pequeña: cada deuda cerrada libera pago mínimo y motivación.',
        prioridad: 'ALTA',
      },
      {
        titulo: 'Cubre siempre los pagos mínimos',
        detalle:
          'Antes de abonar extra, asegúrate de cubrir el mínimo de todas las deudas para evitar mora.',
        prioridad: 'ALTA',
      },
      {
        titulo: 'Evita deuda nueva',
        detalle:
          'Mientras ejecutas el plan, no financies consumo nuevo con crédito; usa presupuestos por categoría.',
        prioridad: 'MEDIA',
      },
    ],
    pasos: [
      'Registra el pago mínimo de cada deuda en la app (mejora la precisión del plan).',
      'Configura recordatorios de pago desde la sección Deudas.',
      'Revisa el plan cada mes y regenera el diagnóstico tras cada pago.',
    ],
    motivacion:
      'Un plan constante vence a la deuda: cada pago te acerca a tu libertad financiera.',
  };
}

module.exports = {
  asesorDisponible,
  generarConsejo,
  consejoFallback,
  RESPONSE_SCHEMA,
};
