import { cn } from '../../utils/cn'
import Label from './Label'

const Textarea = ({
  label,
  error,
  className = '',
  textareaClassName = '',
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || props.name

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label htmlFor={textareaId} className="mb-1.5">
          {label}
        </Label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(
          'input-field min-h-[5rem] resize-y',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          textareaClassName
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Textarea
