import { cn } from '../../utils/cn'

/**
 * Mensaje de alerta (banner rojo/verde/azul usado en formularios).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {'error'|'success'|'info'|'warning'} [props.variant='error']
 * @param {string} [props.className]
 */
const variants = {
  error: 'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
}

const Alert = ({ children, variant = 'error', className = '' }) => {
  return (
    <div
      role="alert"
      className={cn(
        'border px-4 py-3 rounded-lg',
        variants[variant] || variants.error,
        className
      )}
    >
      {children}
    </div>
  )
}

export default Alert
