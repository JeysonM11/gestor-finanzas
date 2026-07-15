import { cn } from '../../utils/cn'

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.hover]
 * @param {boolean} [props.padding=true]
 */
const Card = ({ children, className = '', hover = false, padding = true }) => {
  return (
    <div
      className={cn(
        'bg-surface border border-line rounded-card shadow-card text-ink',
        padding && 'p-4 sm:p-5',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '' }) => (
  <div
    className={cn(
      'flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4',
      className
    )}
  >
    {children}
  </div>
)

export const CardTitle = ({ children, className = '' }) => (
  <h2 className={cn('text-base sm:text-lg font-semibold text-ink tracking-tight', className)}>
    {children}
  </h2>
)

export const CardDescription = ({ children, className = '' }) => (
  <p className={cn('text-sm text-ink-muted', className)}>{children}</p>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={cn(className)}>{children}</div>
)

export const CardFooter = ({ children, className = '' }) => (
  <div
    className={cn(
      'mt-4 pt-4 border-t border-line flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end',
      className
    )}
  >
    {children}
  </div>
)

export default Card
