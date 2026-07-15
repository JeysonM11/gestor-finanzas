import { cn } from '../../utils/cn'
import Label from './Label'

/**
 * Select nativo con el mismo look que `.input-field`.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {import('react').ReactNode} props.children - `<option>` elements
 * @param {string} [props.className]
 * @param {string} [props.selectClassName]
 * @param {string} [props.id]
 */
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
        <Label htmlFor={selectId} className="mb-2">
          {label}
        </Label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full input-field',
          error && 'border-red-500',
          selectClassName
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default Select
