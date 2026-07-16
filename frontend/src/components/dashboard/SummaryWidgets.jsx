import { Link } from 'react-router-dom'
import { Activity, Bell, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Badge, Card, CardHeader, CardTitle, CardDescription } from '../ui'
import { cn } from '../../utils/cn'

/**
 * Widgets compactos: estado del sistema, notificaciones y alertas útiles.
 */
const SummaryWidgets = ({
  systemOk = true,
  unreadCount = 0,
  balance = 0,
  totalMovimientos = 0,
  formatMoney,
  className = '',
}) => {
  const balanceAlert = balance < 0

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4', className)}>
      <Card className="min-w-0">
        <CardHeader className="mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base">Estado del sistema</CardTitle>
              <CardDescription className="text-xs">Conexión con la API</CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2">
          {systemOk ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <Badge variant="green">Operativo</Badge>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <Badge variant="yellow">Con incidencias</Badge>
            </>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          {systemOk
            ? 'Los datos del panel se cargaron correctamente.'
            : 'Algunos datos no pudieron cargarse. Intenta recargar.'}
        </p>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base">Notificaciones</CardTitle>
              <CardDescription className="text-xs">Pendientes de lectura</CardDescription>
            </div>
          </div>
        </CardHeader>
        <p className="text-2xl font-semibold tabular-nums text-ink">{unreadCount}</p>
        <Link
          to="/notificaciones"
          className="mt-2 inline-flex text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Ver bandeja →
        </Link>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="mb-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl',
                balanceAlert ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              )}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base">Alertas</CardTitle>
              <CardDescription className="text-xs">Información útil</CardDescription>
            </div>
          </div>
        </CardHeader>
        {balanceAlert ? (
          <div className="space-y-1">
            <Badge variant="red">Balance negativo</Badge>
            <p className="text-xs text-ink-muted">
              Tu balance es {formatMoney?.(balance)}. Revisa gastos recientes.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <Badge variant="green">Sin alertas críticas</Badge>
            <p className="text-xs text-ink-muted">
              {totalMovimientos} movimiento{totalMovimientos === 1 ? '' : 's'} en tu historial.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default SummaryWidgets
