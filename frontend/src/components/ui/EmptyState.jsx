import { cn } from '../../utils/cn'

const EmptyState = ({
  icon,
  title,
  description,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={cn('text-center py-10 sm:py-14 px-4', className)}>
      {icon && (
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-ink-subtle border border-line">
          <div className="[&>svg]:h-7 [&>svg]:w-7">{icon}</div>
        </div>
      )}
      {title && (
        <h3 className="text-base sm:text-lg font-semibold text-ink mb-1.5">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-ink-muted max-w-sm mx-auto mb-6">{description}</p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
      {children}
    </div>
  )
}

export default EmptyState
