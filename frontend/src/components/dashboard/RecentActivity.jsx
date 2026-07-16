import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar } from 'lucide-react'
import {
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  EmptyState,
} from '../ui'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/date'

const tipoMeta = {
  INGRESO: {
    badge: 'green',
    Icon: ArrowUpRight,
    sign: '+',
    amount: 'text-emerald-600',
    iconWrap: 'bg-emerald-50 text-emerald-600',
  },
  GASTO: {
    badge: 'red',
    Icon: ArrowDownLeft,
    sign: '-',
    amount: 'text-red-600',
    iconWrap: 'bg-red-50 text-red-600',
  },
  TRANSFERENCIA: {
    badge: 'blue',
    Icon: ArrowLeftRight,
    sign: '',
    amount: 'text-primary-700',
    iconWrap: 'bg-primary-50 text-primary-600',
  },
}

/**
 * Lista de movimientos recientes (datos ya cargados por el contenedor).
 */
const RecentActivity = ({
  transacciones = [],
  formatMoney,
  viewAllTo = '/transacciones',
  className = '',
}) => {
  return (
    <Card className={cn('animate-fade-in', className)}>
      <CardHeader>
        <div>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>Últimos movimientos registrados</CardDescription>
        </div>
        <Link
          to={viewAllTo}
          className="inline-flex shrink-0 items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-control border border-line bg-surface text-ink transition-colors hover:bg-surface-muted hover:border-line-strong"
        >
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          Ver todas
        </Link>
      </CardHeader>

      {transacciones.length === 0 ? (
        <EmptyState
          icon={<Calendar />}
          title="Sin movimientos recientes"
          description="Cuando registres transacciones, aparecerán aquí."
          action={
            <Link
              to="/transacciones"
              className="inline-flex items-center justify-center gap-2 h-8 px-3 text-xs font-medium rounded-control bg-primary-600 text-white shadow-sm hover:bg-primary-700 transition-colors"
            >
              Nueva transacción
            </Link>
          }
          className="py-8"
        />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="table-shell hidden md:block">
            <table className="data-table min-w-[520px]">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th className="text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((tx) => {
                  const meta = tipoMeta[tx.tipo] || tipoMeta.GASTO
                  return (
                    <tr key={tx.id}>
                      <td>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                              meta.iconWrap
                            )}
                          >
                            <meta.Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-ink truncate">
                              {tx.descripcion || 'Sin descripción'}
                            </p>
                            <Badge variant={meta.badge} className="mt-0.5">
                              {tx.tipo}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="text-ink-muted">{tx.categoria || 'Sin categoría'}</td>
                      <td className="text-ink-muted whitespace-nowrap">
                        {formatDate(tx.fecha)}
                      </td>
                      <td
                        className={cn(
                          'text-right font-semibold tabular-nums whitespace-nowrap',
                          meta.amount
                        )}
                      >
                        {meta.sign}
                        {formatMoney(tx.monto)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {transacciones.map((tx) => {
              const meta = tipoMeta[tx.tipo] || tipoMeta.GASTO
              return (
                <div
                  key={tx.id}
                  className="flex items-start justify-between gap-3 rounded-control border border-line bg-surface-muted/40 px-3.5 py-3 transition-colors hover:bg-surface-muted"
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span
                      className={cn(
                        'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        meta.iconWrap
                      )}
                    >
                      <meta.Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">
                        {tx.descripcion || 'Sin descripción'}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {formatDate(tx.fecha)} · {tx.categoria || 'Sin categoría'}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      'text-sm font-semibold tabular-nums shrink-0',
                      meta.amount
                    )}
                  >
                    {meta.sign}
                    {formatMoney(tx.monto)}
                  </p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}

export default RecentActivity
