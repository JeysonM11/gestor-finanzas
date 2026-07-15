import { cn } from '../../utils/cn'

/**
 * Etiqueta de formulario (estilo actual: text-sm font-medium text-gray-700).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.htmlFor]
 * @param {boolean} [props.required]
 * @param {string} [props.className]
 */
const Label = ({ children, htmlFor, required = false, className = '' }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-gray-700', className)}
    >
      {children}
      {required && <span className="text-red-600 ml-0.5">*</span>}
    </label>
  )
}

export default Label
