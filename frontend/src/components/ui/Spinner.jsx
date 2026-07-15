import { cn } from '../../utils/cn'

const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-9 w-9 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

const Spinner = ({ size = 'md', className = '', fullPage = false }) => {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-primary-600/25 border-t-primary-600',
        sizeMap[size] || sizeMap.md,
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[16rem] w-full">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default Spinner
