import { cn } from '../../utils/cn'

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-medium rounded-control transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none'

const variants = {
  primary:
    'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  outline:
    'border border-line bg-surface text-ink hover:bg-surface-muted hover:border-line-strong',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
  ghost:
    'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink',
  success:
    'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  icon: 'h-9 w-9 p-0',
  'icon-sm': 'h-8 w-8 p-0',
}

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.children]
 * @param {'primary'|'secondary'|'outline'|'danger'|'ghost'|'success'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'|'icon'|'icon-sm'} [props.size='md']
 * @param {boolean} [props.loading]
 * @param {boolean} [props.disabled]
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.className]
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        baseStyles,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading && (
        <span
          className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}

export default Button
