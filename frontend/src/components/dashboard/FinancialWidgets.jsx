import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  Target,
  BellRing,
  PieChart,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui'
import { deudaService } from '../../services/deuda.service'
import { metaService } from '../../services/meta.service'
import { recordatorioService } from '../../services/recordatorio.service'
import { formatDate } from '../../utils/date'
import { cn } from '../../utils/cn'

function sortByDateAsc(a, b, key) {
  const da = a[key] ? new Date(a[key]).getTime() : Infinity
  const db = b[key] ? new Date(b[key]).getTime() : Infinity
  return da - db
}

/**
 * Widgets financieros: próximas deudas, metas, recordatorios y top categorías.
 * Usa APIs existentes; gastosPorCategoria se recibe del Dashboard.
 */
const FinancialWidgets = ({
  gastosPorCategoria = [],
  formatMoney,
  className = '',
}) => {
  const [deudas, setDeudas] = useState([])
  const [metas, setMetas] = useState([])
  const [recordatorios, setRecordatorios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const cargar = async () => {
      try {
        const [deudasRes, metasRes, recRes] = await Promise.all([
          deudaService.getAll().catch(() => ({ deudas: [] })),
          metaService.getAll().catch(() => ({ metas: [] })),
          recordatorioService.getAll({ soloPendientes: true }).catch(() => ({
            recordatorios: [],
          })),
        ])
        if (cancelled) return
        setDeudas(deudasRes.deudas || [])
        setMetas(metasRes.metas || [])
        setRecordatorios(recRes.recordatorios || [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    cargar()
    return () => {
      cancelled = true
    }
  }, [])

  const proximasDeudas = useMemo(() => {
    return [...deudas]
      .filter((d) => !d.pagada)
      .sort((a, b) => sortByDateAsc(a, b, 'fechaVencimiento'))
      .slice(0, 3)
  }, [deudas])

  const proximasMetas = useMemo(() => {
    return [...metas]
      .filter((m) => !m.completada)
      .sort((a, b) => sortByDateAsc(a, b, 'fechaLimite'))
      .slice(0, 3)
  }, [metas])

  const proximosRecordatorios = useMemo(() => {
    return [...recordatorios]
      .sort((a, b) => sortByDateAsc(a, b, 'fechaRecordatorio'))
      .slice(0, 3)
  }, [recordatorios])

  const topCategorias = useMemo(() => {
    return (Array.isArray(gastosPorCategoria) ? gastosPorCategoria : [])
      .slice(0, 4)
  }, [gastosPorCategoria])

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4', className)}>
      <Card className="min-w-0">
        <CardHeader className="mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base">Próximas deudas</CardTitle>
              <CardDescription className="text-xs">Por fecha de vencimiento</CardDescription>
            </div>
          </div>
        </CardHeader>
        {loading ? (
          <p className="text-xs text-ink-subtle">Cargando…</p>
        ) : proximasDeudas.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin deudas pendientes</p>
        ) : (
          <ul className="space-y-2">
            {proximasDeudas.map((d) => (
              <li key={d.id} className="flex items-start justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{d.nombre}</p>
                  <p className="text-xs text-ink-subtle">
                    {d.fechaVencimiento ? formatDate(d.fechaVencimiento) : 'Sin fecha'}
                  </p>
                </div>
                <span className="tabular-nums text-ink-muted shrink-0">
                  {formatMoney?.(d.montoActual ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/deudas"
          className="mt-3 inline-flex text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Ver deudas →
        </Link>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Target className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base">Metas activas</CardTitle>
              <CardDescription className="text-xs">Próximas por límite</CardDescription>
            </div>
          </div>
        </CardHeader>
        {loading ? (
          <p className="text-xs text-ink-subtle">Cargando…</p>
        ) : proximasMetas.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin metas activas</p>
        ) : (
          <ul className="space-y-2">
            {proximasMetas.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{m.nombre}</p>
                  <p className="text-xs text-ink-subtle">
                    {m.fechaLimite ? formatDate(m.fechaLimite) : 'Sin límite'}
                  </p>
                </div>
                <span className="tabular-nums text-ink-muted shrink-0 text-xs">
                  {formatMoney?.(m.montoActual ?? 0)} / {formatMoney?.(m.montoObjetivo ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/metas"
          className="mt-3 inline-flex text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Ver metas →
        </Link>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <BellRing className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base">Recordatorios</CardTitle>
              <CardDescription className="text-xs">Pendientes próximos</CardDescription>
            </div>
          </div>
        </CardHeader>
        {loading ? (
          <p className="text-xs text-ink-subtle">Cargando…</p>
        ) : proximosRecordatorios.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin recordatorios pendientes</p>
        ) : (
          <ul className="space-y-2">
            {proximosRecordatorios.map((r) => (
              <li key={r.id} className="text-sm min-w-0">
                <p className="font-medium text-ink truncate">{r.titulo}</p>
                <p className="text-xs text-ink-subtle">
                  {r.fechaRecordatorio ? formatDate(r.fechaRecordatorio) : '—'}
                  {r.tipo ? ` · ${r.tipo}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/recordatorios"
          className="mt-3 inline-flex text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Ver recordatorios →
        </Link>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <PieChart className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base">Top categorías</CardTitle>
              <CardDescription className="text-xs">Gastos recientes</CardDescription>
            </div>
          </div>
        </CardHeader>
        {topCategorias.length === 0 ? (
          <p className="text-sm text-ink-muted">Sin gastos por categoría</p>
        ) : (
          <ul className="space-y-2">
            {topCategorias.map((cat) => (
              <li
                key={cat.name}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate text-ink">{cat.name}</span>
                <span className="tabular-nums text-ink-muted shrink-0">
                  {formatMoney?.(cat.value ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/reportes"
          className="mt-3 inline-flex text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Ver reportes →
        </Link>
      </Card>
    </div>
  )
}

export default FinancialWidgets
