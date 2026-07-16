import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui'
import { cn } from '../../utils/cn'

/**
 * Acciones rápidas hacia rutas existentes de la app.
 *
 * @param {object} props
 * @param {{ label: string, description?: string, to: string, icon: import('lucide-react').LucideIcon, tone?: string }[]} props.actions
 */
const QuickActions = ({ actions = [], className = '' }) => {
  if (!actions.length) return null

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div>
          <CardTitle>Acciones rápidas</CardTitle>
          <CardDescription>Atajos a las funciones que ya usas</CardDescription>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to + action.label}
              to={action.to}
              className={cn(
                'group flex items-center gap-3 rounded-control border border-line bg-surface-muted/40 px-3 py-3',
                'transition-all duration-200 hover:border-primary-200 hover:bg-primary-50/60 hover:shadow-card'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
                  action.tone || 'bg-primary-50 text-primary-600'
                )}
              >
                {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">{action.label}</span>
                {action.description && (
                  <span className="block text-xs text-ink-muted truncate">
                    {action.description}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}

export default QuickActions
