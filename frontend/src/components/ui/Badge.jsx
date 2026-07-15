import { cn } from '../../utils/cn'

/**
 * Badge / chip (mismo patrón `px-2 py-1 text-xs rounded-full`).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {'gray'|'green'|'red'|'blue'|'yellow'|'purple'|'primary'} [props.variant='gray']
 * @param {string} [props.className]
 */
const variants = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800',
  primary: 'bg-primary-100 text-primary-800',
}

const Badge = ({ children, variant = 'gray', className = '' }) => {
  return (
    <span
      className={cn(
        'px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center',
        variants[variant] || variants.gray,
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge
