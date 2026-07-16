import {
  Area,
  AreaChart,
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
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, EmptyState } from '../ui'
import { cn } from '../../utils/cn'
import { useTheme } from '../../context/ThemeContext'

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#14b8a6']

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
            style={{ background: entry.color }}
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

/**
 * Sección de gráficas del dashboard.
 * Usa datos reales si existen; si no, muestra EmptyState.
 */
const DashboardCharts = ({
  evolucionMensual = [],
  gastosPorCategoria = [],
  formatMoney,
  className = '',
}) => {
  const { isDark } = useTheme()
  const hasEvolucion = evolucionMensual.some(
    (m) => Number(m.ingresos) > 0 || Number(m.gastos) > 0
  )
  const hasCategorias = gastosPorCategoria.length > 0
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const gridColor = isDark ? '#334155' : '#e2e8f0'

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4', className)}>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <div className="flex items-start gap-2 min-w-0">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <CardTitle>Tendencia mensual</CardTitle>
              <CardDescription>Ingresos vs gastos</CardDescription>
            </div>
          </div>
        </CardHeader>

        {hasEvolucion ? (
          <div className="w-full min-w-0 h-64 sm:h-72 -mx-1">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={evolucionMensual}
                margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="dashIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashGastos" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#dashIngresos)"
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
                  fill="url(#dashGastos)"
                  dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            icon={<BarChart3 />}
            title="Sin datos de tendencia"
            description="Registra ingresos y gastos para ver la evolución mensual."
            className="py-8 sm:py-10"
          />
        )}
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-start gap-2 min-w-0">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <PieChartIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <CardTitle>Gastos por categoría</CardTitle>
              <CardDescription>Distribución actual</CardDescription>
            </div>
          </div>
        </CardHeader>

        {hasCategorias ? (
          <>
            <div className="w-full min-w-0 h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={gastosPorCategoria}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
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
            </div>

            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {gastosPorCategoria.slice(0, 6).map((item, index) => (
                <li key={item.name} className="flex items-center gap-2 text-xs text-ink-muted min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            icon={<PieChartIcon />}
            title="Sin gastos por categoría"
            description="Cuando registres gastos, verás la distribución aquí."
            className="py-8 sm:py-10"
          />
        )}
      </Card>
    </div>
  )
}

export default DashboardCharts
