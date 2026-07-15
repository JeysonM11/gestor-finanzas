import { cn } from '../../utils/cn'

/**
 * Separador horizontal (mismo look que `border-t border-gray-200`).
 *
 * @param {object} props
 * @param {'full'|'subtle'} [props.variant='full']
 * @param {string} [props.className]
 */
const Divider = ({ variant = 'full', className = '' }) => {
  return (
    <hr
      className={cn(
        'border-0 border-t',
        variant === 'subtle' ? 'border-gray-100' : 'border-gray-200',
        className
      )}
    />
  )
}

export default Divider
