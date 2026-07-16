import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  EmptyState,
  PageSkeleton,
} from '../components/ui'
import { reporteService } from '../services/reporte.service'
import { useCurrency } from '../hooks/useCurrency'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../utils/cn'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Wallet,
  PiggyBank,
} from 'lucide-react'

const CHART_COLORS = [
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]

const PERIODOS = [
  { label: '3M', meses: 3 },
  { label: '6M', meses: 6 },
  { label: '12M', meses: 12 },
]

const formatAxisTick = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return new Intl.NumberFormat('es', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(n)
}

const ChartTooltip = ({ active, payload, label, formatMoney }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-control border border-line bg-surface px-3 py-2 shadow-dropdown text-xs">
      {label && <p className="mb-1 font-medium text-ink">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.dataKey || entry.name} className="text-ink-muted">
          <span
            className="inline-block h-2 w-2 rounded-full mr-1.5"
            style={{ background: entry.color || entry.payload?.fill }}
          />
          {entry.name}:{' '}
          <span className="font-semibold text-ink tabular-nums">
            {formatMoney ? formatMoney(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

const StatCard = ({ label, value, description, icon: Icon, tone }) => (
  <Card hover className="min-w-0">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
          {label}
        </p>
        <p
          className={cn(
            'text-xl sm:text-2xl font-semibold tabular-nums tracking-tight truncate',
            tone
          )}
        >
          {value}
        </p>
        {description && (
          <p className="text-xs text-ink-muted line-clamp-2">{description}</p>
        )}
      </div>
      {Icon && (
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            tone === 'text-emerald-600' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
            tone === 'text-red-600' && 'bg-red-50 text-red-600 dark:bg-red-500/10',
            tone === 'text-primary-700' && 'bg-primary-50 text-primary-600 dark:bg-primary-500/10',
            !tone && 'bg-slate-100 text-slate-600 dark:bg-slate-800'
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
    </div>
  </Card>
)

const Reportes = () => {
  const { formatMoney } = useCurrency()
  const toast = useToast()
  const { isDark } = useTheme()
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [evolucionMensual, setEvolucionMensual] = useState([])
  const [comparacionAnual, setComparacionAnual] = useState([])
  const [meses, setMeses] = useState(6)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)

  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? '#334155' : '#e2e8f0'

  useEffect(() => {
    let cancelado = false

    const cargar = async () => {
      setRefreshing(true)
      try {
        const data = await reporteService.getAgregados({ meses })
        if (cancelado) return
        setGastosPorCategoria(data.gastosPorCategoria || [])
        setEvolucionMensual(data.evolucionMensual || [])
        setComparacionAnual(data.comparacionAnual || [])
      } catch (error) {
        if (!cancelado) {
          toast.error(error.response?.data?.message || 'Error al cargar reportes')
        }
      } finally {
        if (!cancelado) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [meses])

  const resumen = useMemo(() => {
    const ingresos =
      comparacionAnual.find((i) => i.name === 'Ingresos')?.value || 0
    const gastos = comparacionAnual.find((i) => i.name === 'Gastos')?.value || 0
    const balance = ingresos - gastos
    const tasaAhorro = ingresos > 0 ? (balance / ingresos) * 100 : null
    return { ingresos, gastos, balance, tasaAhorro }
  }, [comparacionAnual])

  const totalGastos = useMemo(
    () => gastosPorCategoria.reduce((sum, cat) => sum + cat.value, 0),
    [gastosPorCategoria]
  )

  const handleExportar = async () => {
    setExporting(true)
    try {
      const blob = await reporteService.exportarCSV()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transacciones-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Datos exportados correctamente')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al exportar datos')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <PageSkeleton />
  }

  const anioActual = new Date().getFullYear()

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Análisis detallado de tus finanzas</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-control border border-line bg-surface p-0.5"
            role="group"
            aria-label="Período de análisis"
          >
            {PERIODOS.map((p) => (
              <button
                key={p.meses}
                type="button"
                onClick={() => setMeses(p.meses)}
                disabled={refreshing}
                aria-pressed={meses === p.meses}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  meses === p.meses
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-muted'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportar}
            loading={exporting}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <section aria-label="Resumen anual" className="stat-grid">
        <StatCard
          label={`Ingresos ${anioActual}`}
          value={formatMoney(resumen.ingresos)}
          description="Total del año en curso"
          icon={TrendingUp}
          tone="text-emerald-600"
        />
        <StatCard
          label={`Gastos ${anioActual}`}
          value={formatMoney(resumen.gastos)}
          description="Total del año en curso"
          icon={TrendingDown}
          tone="text-red-600"
        />
        <StatCard
          label="Balance anual"
          value={formatMoney(resumen.balance)}
          description="Ingresos menos gastos"
          icon={Wallet}
          tone={resumen.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}
        />
        <StatCard
          label="Tasa de ahorro"
          value={
            resumen.tasaAhorro != null
              ? `${resumen.tasaAhorro.toFixed(1)}%`
              : '—'
          }
          description={
            resumen.tasaAhorro != null
              ? 'Porcentaje de ingresos que conservas'
              : 'Sin ingresos registrados este año'
          }
          icon={PiggyBank}
          tone="text-primary-700"
        />
      </section>

      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 transition-opacity',
          refreshing && 'opacity-60 pointer-events-none'
        )}
      >
        <Card className="min-w-0">
          <CardHeader>
            <div className="flex items-start gap-2 min-w-0">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                <PieChartIcon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <CardTitle>Gastos por categoría</CardTitle>
                <CardDescription>Últimos {meses} meses</CardDescription>
              </div>
            </div>
          </CardHeader>

          {gastosPorCategoria.length > 0 ? (
            <>
              <div className="relative w-full min-w-0 h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={gastosPorCategoria}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={2}
                    >
                      {gastosPorCategoria.map((entry, index) => (
                        <Cell
                          key={`cat-${entry.name}-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatMoney={formatMoney} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] uppercase tracking-wide text-ink-subtle">
                    Total
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-ink tabular-nums">
                    {formatMoney(totalGastos)}
                  </span>
                </div>
              </div>

              <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {gastosPorCategoria.slice(0, 6).map((item, index) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-2 text-xs min-w-0"
                  >
                    <span className="flex items-center gap-2 min-w-0 text-ink-muted">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="font-medium text-ink tabular-nums shrink-0">
                      {formatMoney(item.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <EmptyState
              icon={<PieChartIcon />}
              title="Sin gastos en el período"
              description="Registra transacciones de gasto para ver su distribución por categoría."
            />
          )}
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <div className="flex items-start gap-2 min-w-0">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <CardTitle>Top categorías</CardTitle>
                <CardDescription>Las 5 con mayor gasto</CardDescription>
              </div>
            </div>
          </CardHeader>

          {gastosPorCategoria.length > 0 ? (
            <div className="w-full min-w-0 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={gastosPorCategoria.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatAxisTick}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    content={<ChartTooltip formatMoney={formatMoney} />}
                    cursor={{ fill: isDark ? '#33415533' : '#e2e8f066' }}
                  />
                  <Bar dataKey="value" name="Gasto" radius={[0, 6, 6, 0]} barSize={22}>
                    {gastosPorCategoria.slice(0, 5).map((entry, index) => (
                      <Cell
                        key={`bar-${entry.name}-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<BarChart3 />}
              title="Sin datos disponibles"
              description="Cuando registres gastos, verás aquí tus categorías principales."
            />
          )}
        </Card>
      </div>

      <Card
        className={cn(
          'min-w-0 transition-opacity',
          refreshing && 'opacity-60 pointer-events-none'
        )}
      >
        <CardHeader>
          <div className="flex items-start gap-2 min-w-0">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
              <Calendar className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <CardTitle>Evolución mensual</CardTitle>
              <CardDescription>
                Ingresos vs gastos · últimos {meses} meses
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {evolucionMensual.length > 0 ? (
          <div className="w-full min-w-0 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={evolucionMensual}
                margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="repIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="repGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={formatAxisTick}
                  domain={[0, 'auto']}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip formatMoney={formatMoney} />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingBottom: 4, color: axisColor }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  name="Ingresos"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#repIngresos)"
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="gastos"
                  name="Gastos"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#repGastos)"
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            icon={<Calendar />}
            title="Sin movimientos en el período"
            description="Aún no hay transacciones para mostrar la evolución mensual."
          />
        )}
      </Card>

      {gastosPorCategoria.length > 0 && (
        <Card
          className={cn(
            'min-w-0 transition-opacity',
            refreshing && 'opacity-60 pointer-events-none'
          )}
        >
          <CardHeader>
            <div className="min-w-0">
              <CardTitle>Resumen por categoría</CardTitle>
              <CardDescription>
                Detalle de gastos · últimos {meses} meses
              </CardDescription>
            </div>
          </CardHeader>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="text-right">Total gastado</th>
                  <th className="w-[40%]">Participación</th>
                  <th className="text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {gastosPorCategoria.map((item, index) => {
                  const porcentaje =
                    totalGastos > 0 ? (item.value / totalGastos) * 100 : 0
                  const color = CHART_COLORS[index % CHART_COLORS.length]

                  return (
                    <tr key={item.name}>
                      <td>
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium truncate">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-right tabular-nums">
                        {formatMoney(item.value)}
                      </td>
                      <td>
                        <div
                          className="h-2 w-full rounded-full bg-surface-muted overflow-hidden"
                          role="presentation"
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(porcentaje, 2)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </td>
                      <td className="text-right text-ink-muted tabular-nums">
                        {porcentaje.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="px-3 py-3 font-semibold text-ink">Total</td>
                  <td className="px-3 py-3 text-right font-semibold text-ink tabular-nums">
                    {formatMoney(totalGastos)}
                  </td>
                  <td />
                  <td className="px-3 py-3 text-right font-semibold text-ink tabular-nums">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Reportes
