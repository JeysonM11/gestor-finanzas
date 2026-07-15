import { cn } from '../../utils/cn'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

const variants = {
  error: {
    box: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200',
    icon: AlertCircle,
  },
  success: {
    box: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200',
    icon: CheckCircle2,
  },
  info: {
    box: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-200',
    icon: Info,
  },
  warning: {
    box: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-100',
    icon: AlertTriangle,
  },
}

const Alert = ({ children, variant = 'error', className = '', showIcon = true }) => {
  const config = variants[variant] || variants.error
  const Icon = config.icon

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 border px-3.5 py-3 rounded-card text-sm',
        config.box,
        className
      )}
    >
      {showIcon && <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export default Alert
