import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

/**
 * Dialogo de confirmación.
 * Acepta `type` o `variant` ('danger' | 'warning' | 'info').
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type,
  variant,
}) => {
  const resolvedType = variant || type || 'danger'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirmar'} size="sm">
      <div className="text-center sm:text-left">
        <div
          className={`mx-auto sm:mx-0 flex items-center justify-center h-11 w-11 rounded-xl mb-4 ${
            resolvedType === 'danger'
              ? 'bg-red-50 text-red-600'
              : resolvedType === 'warning'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-blue-50 text-blue-600'
          }`}
        >
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>

        <p className="text-sm text-ink-muted mb-6">{message}</p>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          <Button
            variant={resolvedType === 'danger' ? 'danger' : 'primary'}
            className="w-full sm:w-auto"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
