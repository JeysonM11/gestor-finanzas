import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "¿Estás seguro?", 
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger" // 'danger' | 'warning' | 'info'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className={`h-6 w-6 ${
            type === 'danger' ? 'text-red-600' : 
            type === 'warning' ? 'text-yellow-600' : 
            'text-blue-600'
          }`} />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>
        
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
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
