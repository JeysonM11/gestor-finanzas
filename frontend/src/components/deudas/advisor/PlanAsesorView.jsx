import { Alert, Badge } from '../../ui'
import { useCurrency } from '../../../hooks/useCurrency'
import { formatDate } from '../../../utils/date'
import { ShieldAlert, ListOrdered, Lightbulb, Footprints, Sparkles } from 'lucide-react'

const RIESGO_BADGE = { BAJO: 'green', MEDIO: 'yellow', ALTO: 'red' }
const PRIORIDAD_BADGE = { ALTA: 'red', MEDIA: 'yellow', BAJA: 'gray' }

/**
 * Vista de un plan del asesor (diagnóstico + orden de pagos + tips).
 * @param {{ plan: object, compact?: boolean }} props plan = PlanDto del backend
 */
const PlanAsesorView = ({ plan, compact = false }) => {
  const { formatMoney } = useCurrency()
  if (!plan?.plan) return null

  const { diagnostico, tips = [], pasos = [], motivacion, pagos } = plan.plan

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={RIESGO_BADGE[diagnostico?.nivelRiesgo] || 'gray'}>
          Riesgo {diagnostico?.nivelRiesgo?.toLowerCase() || '—'}
        </Badge>
        <Badge variant="primary">
          {plan.estrategia === 'SNOWBALL' ? 'Bola de nieve' : 'Avalancha'}
        </Badge>
        {!plan.generadoPorIA && (
          <Badge variant="gray">Sin IA (basado en reglas)</Badge>
        )}
        <span className="text-xs text-ink-subtle">
          {formatDate(plan.createdAt)}
        </span>
      </div>

      <div className="flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-ink-muted" aria-hidden="true" />
        <p className="text-sm text-ink">{diagnostico?.resumen}</p>
      </div>

      {diagnostico?.alertas?.length > 0 && (
        <Alert variant="warning">
          <ul className="list-disc pl-4 space-y-1">
            {diagnostico.alertas.map((alerta, i) => (
              <li key={i}>{alerta}</li>
            ))}
          </ul>
        </Alert>
      )}

      {pagos?.orden?.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
            <ListOrdered className="h-4 w-4" aria-hidden="true" />
            Orden de ataque
            {pagos.totalMeses != null && (
              <span className="font-normal text-ink-muted">
                · {pagos.totalMeses} {pagos.totalMeses === 1 ? 'mes' : 'meses'} estimados
              </span>
            )}
          </h3>
          <ol className="space-y-1.5">
            {pagos.orden.map((deuda) => (
              <li
                key={deuda.ref}
                className="flex items-center justify-between gap-3 rounded-control border border-line bg-surface-muted/40 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                    {deuda.posicion}
                  </span>
                  <span className="truncate text-ink">
                    {deuda.nombre || deuda.ref}
                  </span>
                </span>
                <span className="text-right shrink-0">
                  <span className="block font-medium text-ink">
                    {formatMoney(deuda.saldo)}
                  </span>
                  {deuda.mesLiquidacion != null && (
                    <span className="block text-xs text-ink-subtle">
                      liquidada en el mes {deuda.mesLiquidacion}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
          {pagos.presupuestoMensual > 0 && (
            <p className="mt-2 text-xs text-ink-muted">
              Presupuesto mensual del plan: {formatMoney(pagos.presupuestoMensual)}
            </p>
          )}
        </div>
      )}

      {tips.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            Tips
          </h3>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="rounded-control border border-line px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{tip.titulo}</span>
                  <Badge variant={PRIORIDAD_BADGE[tip.prioridad] || 'gray'}>
                    {tip.prioridad?.toLowerCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{tip.detalle}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!compact && pasos.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
            <Footprints className="h-4 w-4" aria-hidden="true" />
            Primeros pasos
          </h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-ink-muted">
            {pasos.map((paso, i) => (
              <li key={i}>{paso}</li>
            ))}
          </ol>
        </div>
      )}

      {!compact && motivacion && (
        <p className="flex items-start gap-2 text-sm italic text-ink-muted">
          <Sparkles className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
          {motivacion}
        </p>
      )}

      <p className="text-xs text-ink-subtle border-t border-line pt-3">
        {plan.disclaimer ||
          'Orientación educativa generada automáticamente; no constituye asesoría financiera profesional.'}
      </p>
    </div>
  )
}

export default PlanAsesorView
