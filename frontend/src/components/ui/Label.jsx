import { cn } from '../../utils/cn'

const Label = ({ children, className = '', ...props }) => {
  return (
    <label
      className={cn('block text-sm font-medium text-ink', className)}
      {...props}
    >
      {children}
    </label>
  )
}

export default Label
