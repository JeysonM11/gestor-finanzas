import { cn } from '../../utils/cn'
import Label from './Label'

/**
 * Textarea con el mismo look que `.input-field`.
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {number|string} [props.rows=3]
 * @param {string} [props.className]
 * @param {string} [props.textareaClassName]
 * @param {string} [props.id]
 */
const Textarea = ({
  label,
  error,
  rows = 3,
  className = '',
  textareaClassName = '',
  id,
  ...props
}) => {
  const textareaId = id || props.name

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={textareaId} className="mb-2">
          {label}
        </Label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          'w-full input-field resize-none',
          error && 'border-red-500',
          textareaClassName
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default Textarea
