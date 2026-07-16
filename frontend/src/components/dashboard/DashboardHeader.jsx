import { CalendarDays, ChevronRight, Home, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui'
import { cn } from '../../utils/cn'

/**
 * Encabezado del dashboard: breadcrumb, título, descripción y fecha.
 */
const DashboardHeader = ({
  title = 'Dashboard',
  description = 'Resumen de tus finanzas personales',
  dateLabel,
  isAdmin = false,
  className = '',
}) => {
  return (
    <header className={cn('page-header animate-fade-in', className)}>
      <div className="min-w-0 space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-ink-subtle">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 rounded-control px-1 py-0.5 transition-colors hover:text-ink"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="font-medium text-ink-muted">{title}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="page-title">{title}</h1>
          {isAdmin && (
            <Badge variant="primary">
              <Shield className="h-3 w-3" aria-hidden="true" />
              Administrador
            </Badge>
          )}
        </div>
        <p className="page-subtitle !mt-0">{description}</p>
      </div>

      {dateLabel && (
        <div className="inline-flex items-center gap-2 self-start rounded-card border border-line bg-surface px-3 py-2 text-sm text-ink-muted shadow-card">
          <CalendarDays className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />
          <time dateTime={dateLabel}>{dateLabel}</time>
        </div>
      )}
    </header>
  )
}

export default DashboardHeader
