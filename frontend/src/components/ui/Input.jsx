import { cn } from '../../utils/cn'
import Label from './Label'

/**
 * Campo de texto alineado a `common/Input` + clase `.input-field`.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.className] - Clase del wrapper
 * @param {string} [props.inputClassName] - Clase del input
 * @param {string} [props.id]
 * @param {string} [props.type='text']
 */
const Input = ({
  label,
  error,
  className = '',
  inputClassName = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || props.name

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={inputId} className="mb-2">
          {label}
        </Label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error ? 'border-red-500' : 'border-gray-300',
          inputClassName
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default Input
