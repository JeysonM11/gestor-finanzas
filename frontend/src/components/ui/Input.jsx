import { cn } from '../../utils/cn'
import Label from './Label'

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
        <Label htmlFor={inputId} className="mb-1.5">
          {label}
        </Label>
      )}
      <input
        id={inputId}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={cn(
          'input-field',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          inputClassName
        )}
        {...props}
      />
      {error && (
        <p id={inputId ? `${inputId}-error` : undefined} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
