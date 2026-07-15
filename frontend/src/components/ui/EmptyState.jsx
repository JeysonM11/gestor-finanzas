import { cn } from '../../utils/cn'

/**
 * Estado vacío centrado (títulos/descripciones de listas sin datos).
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.icon]
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {import('react').ReactNode} [props.action]
 * @param {import('react').ReactNode} [props.children]
 * @param {string} [props.className]
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && <div className="mb-4 flex justify-center text-gray-300">{icon}</div>}
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      )}
      {description && <p className="text-gray-500 mb-6">{description}</p>}
      {action}
      {children}
    </div>
  )
}

export default EmptyState
