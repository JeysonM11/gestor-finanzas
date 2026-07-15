import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, Badge, PageSkeleton } from '../components/ui'
import { transaccionService } from '../services/transaccion.service'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, TrendingDown, Wallet, Calendar, Shield } from 'lucide-react'
import dayjs from 'dayjs'

const Dashboard = () => {
  const { isAdmin } = useAuth()
  const [resumen, setResumen] = useState(null)
  const [transacciones, setTransacciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resumenData, transaccionesData] = await Promise.all([
        transaccionService.getResumen(),
        transaccionService.getAll({ limit: 5 }),
      ])
      setResumen(resumenData)
      setTransacciones(transaccionesData.transacciones || transaccionesData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <PageSkeleton />
  }

  const stats = [
    {
      label: 'Total Ingresos',
      value: resumen?.totalIngresos?.toFixed(2) || '0.00',
      icon: TrendingUp,
      tone: 'text-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Total Gastos',
      value: resumen?.totalGastos?.toFixed(2) || '0.00',
      icon: TrendingDown,
      tone: 'text-red-600',
      iconBg: 'bg-red-50 text-red-600',
    },
    {
      label: 'Balance',
      value: resumen?.balance?.toFixed(2) || '0.00',
      icon: Wallet,
      tone: (resumen?.balance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600',
      iconBg: 'bg-primary-50 text-primary-600',
    },
    {
      label: 'Movimientos',
      value: String(transacciones?.length ?? 0),
      icon: Calendar,
      tone: 'text-ink',
      iconBg: 'bg-slate-100 text-slate-600',
      prefix: '',
    },
  ]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-title">Dashboard</h1>
            {isAdmin && (
              <Badge variant="purple">
                <Shield className="h-3 w-3" />
                Administrador
              </Badge>
            )}
          </div>
          <p className="page-subtitle">Resumen de tus finanzas</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <Card key={stat.label} hover className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
                  {stat.label}
                </p>
                <p className={`mt-2 text-xl sm:text-2xl font-semibold tabular-nums truncate ${stat.tone}`}>
                  {stat.prefix === '' ? stat.value : `$${stat.value}`}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                <stat.icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Transacciones recientes</CardTitle>
            <p className="text-sm text-ink-muted mt-0.5">Últimos movimientos registrados</p>
          </div>
          <Calendar className="h-4 w-4 text-ink-subtle shrink-0 hidden sm:block" aria-hidden="true" />
        </CardHeader>

        <div className="space-y-2">
          {transacciones.length > 0 ? (
            transacciones.map((transaccion) => (
              <div
                key={transaccion.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-control border border-line bg-surface-muted/40 px-3.5 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink truncate">{transaccion.descripcion}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {dayjs(transaccion.fecha).format('DD/MM/YYYY')} ·{' '}
                    {transaccion.categoria || 'Sin categoría'}
                  </p>
                </div>
                <p
                  className={`text-base font-semibold tabular-nums shrink-0 ${
                    transaccion.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {transaccion.tipo === 'INGRESO' ? '+' : '-'}$
                  {Number(transaccion.monto).toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-ink-muted py-10 text-sm">
              No hay transacciones recientes
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
