import { cn } from '../../utils/cn'

/**
 * Botón alineado al estilo actual (`common/Button`).
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.children]
 * @param {'primary'|'secondary'|'danger'|'outline'} [props.variant='primary']
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {import('react').MouseEventHandler<HTMLButtonElement>} [props.onClick]
 */
const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(baseStyles, variants[variant] || variants.primary, className)}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
