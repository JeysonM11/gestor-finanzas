import { cn } from '../../utils/cn'
import Button from './Button'

const LoadingButton = ({
  children,
  loading = false,
  loadingText,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      loading={loading}
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading ? loadingText || children : children}
    </Button>
  )
}

export default LoadingButton
