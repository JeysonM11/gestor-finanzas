import { cn } from '../../utils/cn'

const Divider = ({ className = '', label }) => {
  if (label) {
    return (
      <div className={cn('relative flex items-center gap-3 my-4', className)}>
        <div className="flex-1 border-t border-line" />
        <span className="text-xs font-medium text-ink-subtle uppercase tracking-wide">
          {label}
        </span>
        <div className="flex-1 border-t border-line" />
      </div>
    )
  }

  return <hr className={cn('border-0 border-t border-line my-4', className)} />
}

export default Divider
