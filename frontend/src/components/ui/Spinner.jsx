import { cn } from '../../utils/cn'

/**
 * Indicador de carga (mismo spinner usado en las páginas).
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 * @param {boolean} [props.fullPage=false] - Centrado en área tipo página
 */
const sizeMap = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

const Spinner = ({ size = 'md', className = '', fullPage = false }) => {
  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2 border-primary-600',
        sizeMap[size] || sizeMap.md,
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center h-64">{spinner}</div>
    )
  }

  return spinner
}

export default Spinner
