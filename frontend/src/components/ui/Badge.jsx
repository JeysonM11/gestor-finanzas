import { cn } from '../../utils/cn'

const variants = {
  gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10',
  yellow: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/15',
  purple: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10',
  primary: 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-600/15',
  // Semánticos de dominio
  activo: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10',
  pendiente: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/15',
  pagado: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10',
  cancelado: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10',
  vencido: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
}

const Badge = ({ children, variant = 'gray', className = '' }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md whitespace-nowrap',
        variants[variant] || variants.gray,
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge
