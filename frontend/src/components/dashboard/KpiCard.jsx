import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card } from '../ui'
import { cn } from '../../utils/cn'

const toneMap = {
  emerald: {
    value: 'text-emerald-600',
    icon: 'bg-emerald-50 text-emerald-600',
    trendUp: 'text-emerald-700 bg-emerald-50',
    trendDown: 'text-red-700 bg-red-50',
  },
  red: {
    value: 'text-red-600',
    icon: 'bg-red-50 text-red-600',
    trendUp: 'text-red-700 bg-red-50',
    trendDown: 'text-emerald-700 bg-emerald-50',
  },
  primary: {
    value: 'text-primary-700',
    icon: 'bg-primary-50 text-primary-600',
    trendUp: 'text-emerald-700 bg-emerald-50',
    trendDown: 'text-red-700 bg-red-50',
  },
  slate: {
    value: 'text-ink',
    icon: 'bg-slate-100 text-slate-600',
    trendUp: 'text-emerald-700 bg-emerald-50',
    trendDown: 'text-red-700 bg-red-50',
  },
}

/**
 * Tarjeta KPI reutilizable con icono, valor, descripción e indicador de cambio.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string|number} props.value
 * @param {string} [props.description]
 * @param {import('lucide-react').LucideIcon} props.icon
 * @param {'emerald'|'red'|'primary'|'slate'} [props.tone]
 * @param {number|null} [props.change] — porcentaje (positivo = sube)
 * @param {boolean} [props.invertTrend] — true si subir es malo (p. ej. gastos)
 * @param {string} [props.className]
 */
const KpiCard = ({
  label,
  value,
  description,
  icon: Icon,
  tone = 'slate',
  change = null,
  invertTrend = false,
  className = '',
}) => {
  const colors = toneMap[tone] || toneMap.slate
  const hasChange = typeof change === 'number' && Number.isFinite(change)
  const isUp = hasChange && change > 0
  const isDown = hasChange && change < 0
  const isFlat = hasChange && change === 0

  const trendPositive = invertTrend ? isDown : isUp
  const trendNegative = invertTrend ? isUp : isDown

  return (
    <Card
      hover
      className={cn(
        'group min-w-0 transition-all duration-200 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            {label}
          </p>
          <p
            className={cn(
              'text-xl sm:text-2xl font-semibold tabular-nums tracking-tight truncate',
              colors.value
            )}
          >
            {value}
          </p>
          {description && (
            <p className="text-xs text-ink-muted line-clamp-2">{description}</p>
          )}
        </div>

        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
            colors.icon
          )}
        >
          {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {hasChange ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
              trendPositive && colors.trendUp,
              trendNegative && colors.trendDown,
              isFlat && 'bg-slate-100 text-slate-600'
            )}
          >
            {isUp && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
            {isDown && <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
            {isFlat && <Minus className="h-3.5 w-3.5" aria-hidden="true" />}
            {`${isUp ? '+' : ''}${change.toFixed(1)}%`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            Sin histórico
          </span>
        )}
        <span className="text-xs text-ink-subtle">vs. mes anterior</span>
      </div>
    </Card>
  )
}

export default KpiCard
