import { cn } from '../../utils/cn'

/**
 * Contenedor de tarjeta (mismo look que `common/Card`).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
const Card = ({ children, className = '' }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6', className)}>
      {children}
    </div>
  )
}

export default Card
