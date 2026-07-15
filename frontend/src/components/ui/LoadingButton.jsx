import { cn } from '../../utils/cn'
import Button from './Button'

/**
 * Botón con estado de carga (deshabilitado + texto/spinner).
 * Visualmente igual a `Button` cuando no está loading.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {boolean} [props.loading=false]
 * @param {import('react').ReactNode} [props.loadingText] - Texto mientras carga
 * @param {'primary'|'secondary'|'danger'|'outline'} [props.variant='primary']
 * @param {string} [props.className]
 * @param {boolean} [props.disabled]
 */
const LoadingButton = ({
  children,
  loading = false,
  loadingText,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center gap-2', className)}
      {...props}
    >
      {loading && (
        <span
          className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
          aria-hidden="true"
        />
      )}
      {loading ? loadingText || children : children}
    </Button>
  )
}

export default LoadingButton
