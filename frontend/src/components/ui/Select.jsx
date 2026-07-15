import { cn } from '../../utils/cn'
import Label from './Label'

const Select = ({
  label,
  error,
  children,
  className = '',
  selectClassName = '',
  id,
  ...props
}) => {
  const selectId = id || props.name

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={selectId} className="mb-1.5">
          {label}
        </Label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'input-field appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          selectClassName
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2494a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Select
