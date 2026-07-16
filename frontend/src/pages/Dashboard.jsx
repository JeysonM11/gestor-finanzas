import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeftRight,
  PlusCircle,
  BarChart3,
  CreditCard,
  Target,
} from 'lucide-react'
import { PageSkeleton } from '../components/ui'
import {
  DashboardHeader,
  KpiCard,
  QuickActions,
  RecentActivity,
  DashboardCharts,
  SummaryWidgets,
  FinancialWidgets,
} from '../components/dashboard'
import { transaccionService } from '../services/transaccion.service'
import { reporteService } from '../services/reporte.service'
import { notificacionService } from '../services/notificacion.service'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../hooks/useCurrency'

/** Calcula variación % entre mes actual y anterior (presentación). */
function calcChange(current, previous) {
  if (previous == null || !Number.isFinite(previous) || previous === 0) {
    return null
  }
  if (!Number.isFinite(current)) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

const QUICK_ACTIONS = [
  {
    label: 'Nueva transacción',
    description: 'Registrar ingreso o gasto',
    to: '/transacciones',
    icon: PlusCircle,
    tone: 'bg-primary-50 text-primary-600',
  },
  {
    label: 'Ver reportes',
    description: 'Estadísticas y exportar',
    to: '/reportes',
    icon: BarChart3,
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Mis cuentas',
    description: 'Saldos y productos',
    to: '/cuentas',
    icon: CreditCard,
    tone: 'bg-sky-50 text-sky-600',
  },
  {
    label: 'Metas de ahorro',
    description: 'Seguimiento de objetivos',
    to: '/metas',
    icon: Target,
    tone: 'bg-amber-50 text-amber-700',
  },
]

const Dashboard = () => {
  const { isAdmin } = useAuth()
  const { formatMoney } = useCurrency()
  const [resumen, setResumen] = useState(null)
  const [transacciones, setTransacciones] = useState([])
  const [totalMovimientos, setTotalMovimientos] = useState(0)
  const [evolucionMensual, setEvolucionMensual] = useState([])
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [systemOk, setSystemOk] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resumenResult, transaccionesResult, evolucion, categorias, notifs, healthResult] =
        await Promise.all([
          transaccionService.getResumen(),
          transaccionService.getAll({ limit: 5 }),
          reporteService.getEvolucionMensual(6).catch(() => []),
          reporteService.getGastosPorCategoria().catch(() => []),
          notificacionService.getNoLeidas().catch(() => null),
          api.get('/health').then(() => true).catch(() => false),
        ])

      setResumen(resumenResult)
      setTransacciones(
        transaccionesResult.transacciones || transaccionesResult || []
      )
      setTotalMovimientos(
        resumenResult?.cantidadTransacciones ??
          transaccionesResult?.pagination?.total ??
          0
      )
      setEvolucionMensual(Array.isArray(evolucion) ? evolucion : [])
      setGastosPorCategoria(Array.isArray(categorias) ? categorias : [])

      const listaNotifs =
        notifs?.notificaciones || (Array.isArray(notifs) ? notifs : [])
      setUnreadCount(notifs?.contadores?.noLeidas ?? listaNotifs.length)
      setSystemOk(healthResult === true)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      try {
        await api.get('/health')
        setSystemOk(true)
      } catch {
        setSystemOk(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const changes = useMemo(() => {
    if (!Array.isArray(evolucionMensual) || evolucionMensual.length < 2) {
      return { ingresos: null, gastos: null, balance: null }
    }
    const prev = evolucionMensual[evolucionMensual.length - 2]
    const curr = evolucionMensual[evolucionMensual.length - 1]
    const prevBalance = (prev.ingresos || 0) - (prev.gastos || 0)
    const currBalance = (curr.ingresos || 0) - (curr.gastos || 0)
    return {
      ingresos: calcChange(curr.ingresos, prev.ingresos),
      gastos: calcChange(curr.gastos, prev.gastos),
      balance: calcChange(currBalance, prevBalance),
    }
  }, [evolucionMensual])

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  )

  if (loading) {
    return <PageSkeleton />
  }

  const totalIngresos = resumen?.totalIngresos || 0
  const totalGastos = resumen?.totalGastos || 0
  const balance = resumen?.balance || 0

  return (
    <div className="page-shell">
      <DashboardHeader
        title="Dashboard"
        description="Panel de control de tus finanzas: KPIs, tendencias y actividad reciente."
        dateLabel={dateLabel}
        isAdmin={isAdmin}
      />

      <section aria-label="Indicadores clave" className="stat-grid">
        <KpiCard
          label="Total ingresos"
          value={formatMoney(totalIngresos)}
          description="Suma de ingresos registrados"
          icon={TrendingUp}
          tone="emerald"
          change={changes.ingresos}
        />
        <KpiCard
          label="Total gastos"
          value={formatMoney(totalGastos)}
          description="Suma de gastos registrados"
          icon={TrendingDown}
          tone="red"
          change={changes.gastos}
          invertTrend
        />
        <KpiCard
          label="Balance"
          value={formatMoney(balance)}
          description="Ingresos menos gastos"
          icon={Wallet}
          tone={balance >= 0 ? 'emerald' : 'red'}
          change={changes.balance}
        />
        <KpiCard
          label="Movimientos"
          value={String(totalMovimientos)}
          description="Total de transacciones"
          icon={ArrowLeftRight}
          tone="primary"
          change={null}
        />
      </section>

      <section aria-label="Gráficas">
        <DashboardCharts
          evolucionMensual={evolucionMensual}
          gastosPorCategoria={gastosPorCategoria}
          formatMoney={formatMoney}
        />
      </section>

      <section
        aria-label="Actividad y acciones"
        className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4"
      >
        <div className="xl:col-span-2 min-w-0">
          <RecentActivity
            transacciones={transacciones}
            formatMoney={formatMoney}
          />
        </div>
        <div className="min-w-0">
          <QuickActions actions={QUICK_ACTIONS} />
        </div>
      </section>

      <section aria-label="Resumen financiero">
        <FinancialWidgets
          gastosPorCategoria={gastosPorCategoria}
          formatMoney={formatMoney}
        />
      </section>

      <section aria-label="Resumen adicional">
        <SummaryWidgets
          systemOk={systemOk}
          unreadCount={unreadCount}
          balance={balance}
          totalMovimientos={totalMovimientos}
          formatMoney={formatMoney}
        />
      </section>
    </div>
  )
}

export default Dashboard
